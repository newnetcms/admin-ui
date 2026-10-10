$(document).ready(function () {
    "use strict"; // Start of use strict

    // Chèn file chọn từ thư viện media (nút "Quản lý tệp" trên toolbar) vào đúng
    // vị trí con trỏ lúc bấm nút — modal làm editor mất focus nên phải lưu
    // bookmark trước rồi khôi phục lại. Theo loại file: ảnh → <img>, video/audio →
    // thẻ phát tương ứng, còn lại → link tới file.
    function insertMediaIntoEditor(editor, media, bookmark) {
        var dom = editor.dom;
        var linkAttrs = {href: media.url, target: '_blank', rel: 'noopener'};

        editor.focus();
        if (bookmark) {
            editor.selection.moveToBookmark(bookmark);
        }

        if (media.kind === 'image') {
            editor.insertContent(dom.createHTML('img', {src: media.url, alt: media.name}));
        } else if (media.kind === 'video' || media.kind === 'audio') {
            // Truyền html rỗng để ra thẻ đóng mở đủ (<video></video>), không bị self-close.
            editor.insertContent(dom.createHTML(media.kind, {src: media.url, controls: 'controls'}, ''));
        } else if (!editor.selection.isCollapsed()) {
            // Đang bôi đen chữ thì biến chính đoạn đó thành link, giữ nguyên định dạng.
            editor.execCommand('mceInsertLink', false, linkAttrs);
        } else {
            editor.insertContent(dom.createHTML('a', linkAttrs, dom.encode(media.name)));
        }
    }

    // Cấu hình do admin::form.editor gán (nhãn, URL upload, allowlist đuôi file,
    // thông báo theo ngôn ngữ admin) — rỗng khi không có module media.
    var mediaConfig = window.NewnetMediaConfig || {};
    var mediaMessages = mediaConfig.messages || {};

    function isFileDrag(e) {
        var types = e.dataTransfer && e.dataTransfer.types;
        return !!types && Array.prototype.indexOf.call(types, 'Files') !== -1;
    }

    function fileExtension(fileName) {
        var parts = (fileName || '').split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }

    // Đọc response của storeAjax/importUrl: {media: {id, url, name, kind, ...}} khi
    // thành công, JSON 422 kèm message khi lỗi.
    function handleMediaResponse(xhr, done) {
        var res = null;
        try {
            res = JSON.parse(xhr.responseText);
        } catch (err) {
        }

        if (xhr.status >= 200 && xhr.status < 300 && res && res.media) {
            done(null, res.media);
        } else {
            done((res && res.message) || mediaMessages.error);
        }
    }

    // Upload 1 file lên cùng endpoint với modal "Quản lý tệp" (storeAjax).
    function uploadMediaFile(file, onProgress, done) {
        var formData = new FormData();
        formData.append('image-upload[]', file);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', mediaConfig.uploadUrl, true);
        xhr.setRequestHeader('X-CSRF-TOKEN', $('meta[name="csrf-token"]').attr('content'));
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                onProgress(e.loaded);
            }
        };

        xhr.onload = function () {
            handleMediaResponse(xhr, done);
        };

        xhr.onerror = function () {
            done(mediaMessages.error);
        };

        xhr.send(formData);
    }

    function showUploadErrors(editor, errors) {
        if (errors.length) {
            // text của notification TinyMCE được render dạng HTML — tên file đã encode.
            editor.notificationManager.open({text: errors.join('<br>'), type: 'error', timeout: 6000});
        }
    }

    // Upload song song, 1 notification có progress bar chung cho cả lượt; xong hết
    // mới chèn — đúng thứ tự file đã thả, tại đúng vị trí thả (bookmark), không
    // theo thứ tự file nào upload xong trước. File lỗi không chặn file khác.
    function uploadDroppedFiles(editor, files, bookmark) {
        var dom = editor.dom;
        var errors = [];
        var allowed = mediaConfig.extensions || [];

        var accepted = files.filter(function (file) {
            if (allowed.indexOf(fileExtension(file.name)) === -1) {
                errors.push(dom.encode(file.name) + ': ' + dom.encode(mediaMessages.unsupportedType));
                return false;
            }
            return true;
        });

        if (!accepted.length) {
            showUploadErrors(editor, errors);
            return;
        }

        var label = accepted.length === 1
            ? (mediaMessages.uploading || '').replace(':name', accepted[0].name)
            : (mediaMessages.uploadingMany || '').replace(':count', accepted.length);
        var notification = editor.notificationManager.open({text: dom.encode(label), progressBar: true, closeButton: false});

        var totalBytes = accepted.reduce(function (sum, file) {
            return sum + (file.size || 0);
        }, 0) || 1;
        var loadedBytes = accepted.map(function () {
            return 0;
        });
        var results = [];
        var pending = accepted.length;

        accepted.forEach(function (file, index) {
            uploadMediaFile(file, function (loaded) {
                loadedBytes[index] = loaded;
                var sent = loadedBytes.reduce(function (sum, bytes) {
                    return sum + bytes;
                }, 0);
                notification.progressBar.value(Math.min(100, Math.round(sent / totalBytes * 100)));
            }, function (error, media) {
                if (error) {
                    errors.push(dom.encode(file.name) + ': ' + dom.encode(error));
                } else {
                    results[index] = media;
                }

                pending--;
                if (pending > 0) {
                    return;
                }

                notification.close();
                results.filter(Boolean).forEach(function (uploaded, order) {
                    // Chỉ khôi phục bookmark cho file đầu; các file sau chèn nối tiếp
                    // ngay sau file vừa chèn (insertContent đã dời con trỏ ra sau nó).
                    insertMediaIntoEditor(editor, uploaded, order === 0 ? bookmark : null);
                });
                showUploadErrors(editor, errors);
            });
        });
    }

    // Kéo-thả file từ máy vào vùng soạn thảo để upload thẳng vào thư viện media
    // rồi chèn tại vị trí thả. Chỉ bắt khi kéo FILE (dataTransfer.types có
    // "Files") — kéo ảnh/chữ sẵn có trong nội dung vẫn để TinyMCE xử lý như cũ.
    function setupMediaDropUpload(editor) {
        var dragDepth = 0;

        function setDragOver(active) {
            var container = editor.getContainer();
            if (!container) {
                return;
            }

            if (active) {
                // Đặt chữ/icon ở giữa phần editor đang thấy trên màn hình — editor
                // dùng autoresize nên có thể cao hơn hẳn viewport, căn giữa cả khối
                // thì lời nhắc nằm ngoài tầm nhìn.
                var rect = container.getBoundingClientRect();
                var visibleTop = Math.max(rect.top, 0);
                var visibleBottom = Math.min(rect.bottom, window.innerHeight);
                container.style.setProperty('--media-drop-center', Math.max(0, (visibleTop + visibleBottom) / 2 - rect.top) + 'px');
                container.setAttribute('data-media-drop-hint', mediaMessages.dropHint || '');
            }

            container.classList.toggle('media-drop-over', active);
        }

        editor.on('dragenter', function (e) {
            if (!isFileDrag(e)) {
                return;
            }
            dragDepth++;
            setDragOver(true);
        });

        editor.on('dragover', function (e) {
            if (!isFileDrag(e)) {
                return;
            }
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        editor.on('dragleave', function (e) {
            if (!isFileDrag(e)) {
                return;
            }
            dragDepth = Math.max(0, dragDepth - 1);
            if (dragDepth === 0) {
                setDragOver(false);
            }
        });

        editor.on('drop', function (e) {
            if (!isFileDrag(e)) {
                return;
            }

            dragDepth = 0;
            setDragOver(false);

            var files = Array.prototype.slice.call(e.dataTransfer.files || []);
            if (!files.length) {
                return;
            }

            // Chặn cả xử lý mặc định của trình duyệt (mở file) lẫn handler drop
            // của TinyMCE/plugin paste đăng ký sau — tránh chèn trùng hoặc bị chặn.
            e.preventDefault();
            e.stopImmediatePropagation();

            editor.selection.placeCaretAt(e.clientX, e.clientY);
            uploadDroppedFiles(editor, files, editor.selection.getBookmark(2, true));
        });
    }

    // ------------------------------------------------------------------
    // Dán nội dung copy từ website khác: ảnh của site ngoài tự tải về thư viện
    // media rồi thay src sang link của mình (tránh ảnh chết khi site gốc xoá/đổi
    // link hoặc chặn hotlink). Server tải hộ qua importUrl (có chặn SSRF).
    // ------------------------------------------------------------------
    var IMPORT_CONCURRENCY = 3;

    function absoluteHttpUrl(value) {
        value = (value || '').trim();
        if (/^\/\//.test(value)) {
            value = window.location.protocol + value;
        }
        return /^https?:\/\//i.test(value) ? value : '';
    }

    function urlHost(url) {
        try {
            return new URL(url).host.toLowerCase();
        } catch (err) {
            return '';
        }
    }

    function isOwnImage(url) {
        var host = urlHost(url);
        return !host || host === window.location.host.toLowerCase() || (mediaConfig.ownHosts || []).indexOf(host) !== -1;
    }

    // URL ảnh thật của 1 <img> vừa dán: nhiều site lazy-load để src là ảnh giữ chỗ
    // (data: URI 1px) còn ảnh thật nằm ở data-src / data-lazy-src / data-original.
    function pastedImageUrl(img) {
        var src = img.getAttribute('src') || '';
        if (!src || /^data:/i.test(src)) {
            src = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original') || src;
        }
        return absoluteHttpUrl(src);
    }

    function importImageUrl(url, done) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', mediaConfig.importUrl, true);
        xhr.setRequestHeader('X-CSRF-TOKEN', $('meta[name="csrf-token"]').attr('content'));
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function () {
            handleMediaResponse(xhr, done);
        };

        xhr.onerror = function () {
            done(mediaMessages.error);
        };

        xhr.send(JSON.stringify({url: url}));
    }

    // Chạy tối đa `limit` việc cùng lúc — bài dán vào có thể có vài chục ảnh,
    // không bắn hết 1 lượt lên server (mỗi request server phải tải 1 ảnh ngoài).
    function runWithConcurrency(items, limit, worker, onAllDone) {
        var nextIndex = 0;
        var finished = 0;

        function startNext() {
            if (nextIndex >= items.length) {
                return;
            }
            var item = items[nextIndex++];
            worker(item, function () {
                finished++;
                if (finished === items.length) {
                    onAllDone();
                } else {
                    startNext();
                }
            });
        }

        for (var i = 0; i < Math.min(limit, items.length); i++) {
            startNext();
        }
    }

    // Thay src mọi <img> đang trỏ tới URL gốc (cùng 1 ảnh có thể xuất hiện nhiều
    // lần). data-mce-src là bản TinyMCE dùng khi xuất nội dung, phải đổi cùng.
    function replaceImageSrc(editor, fromUrl, toUrl) {
        editor.dom.select('img').forEach(function (img) {
            if (img.getAttribute('src') === fromUrl || img.getAttribute('data-mce-src') === fromUrl) {
                editor.dom.setAttribs(img, {src: toUrl, 'data-mce-src': toUrl});
            }
        });
    }

    function importPastedImages(editor, urls) {
        var dom = editor.dom;
        var failed = [];
        var done = 0;
        var notification = editor.notificationManager.open({
            text: dom.encode((mediaMessages.importing || '').replace(':count', urls.length)),
            progressBar: true,
            closeButton: false
        });

        runWithConcurrency(urls, IMPORT_CONCURRENCY, function (url, next) {
            importImageUrl(url, function (error, media) {
                if (error) {
                    failed.push(url);
                } else {
                    // Thay dần theo từng ảnh về xong nhưng không tạo undo level cho
                    // mỗi lần thay — cả lượt chỉ thêm 1 level khi xong hết (bên dưới).
                    editor.undoManager.ignore(function () {
                        replaceImageSrc(editor, url, media.url);
                    });
                }

                done++;
                notification.progressBar.value(Math.round(done / urls.length * 100));
                next();
            });
        }, function () {
            notification.close();
            // Ghi nhận nội dung đã thay link: thêm undo level + đánh dấu thay đổi
            // để autosave/đồng bộ textarea nhận src mới.
            editor.undoManager.add();
            editor.setDirty(true);

            if (failed.length) {
                var shown = failed.slice(0, 5).map(function (url) {
                    return dom.encode(url);
                });
                if (failed.length > shown.length) {
                    shown.push('…');
                }
                editor.notificationManager.open({
                    text: dom.encode((mediaMessages.importFailed || '').replace(':count', failed.length)) + '<br>' + shown.join('<br>'),
                    type: 'warning',
                    timeout: 8000
                });
            }
        });
    }

    function setupPastedImageImport(editor) {
        // PastePostProcess chạy TRƯỚC khi TinyMCE chèn nội dung đã dán: chuẩn hoá
        // <img> (lấy ảnh thật từ lazy-load, bỏ srcset/<source> vẫn trỏ về site cũ
        // — trình duyệt sẽ ưu tiên chúng hơn src mới) và gom URL cần tải về.
        editor.on('PastePostProcess', function (e) {
            // Copy/paste ngay trong TinyMCE: ảnh đã được xử lý từ lần dán đầu tiên.
            if (e.internal || !e.node) {
                return;
            }

            var urls = [];
            Array.prototype.forEach.call(e.node.querySelectorAll('img'), function (img) {
                var url = pastedImageUrl(img);
                if (!url || isOwnImage(url)) {
                    return;
                }

                img.setAttribute('src', url);
                ['srcset', 'sizes', 'data-src', 'data-srcset', 'data-lazy-src', 'data-original'].forEach(function (attr) {
                    img.removeAttribute(attr);
                });

                var picture = img.parentNode;
                if (picture && picture.nodeName === 'PICTURE') {
                    Array.prototype.slice.call(picture.querySelectorAll('source')).forEach(function (source) {
                        source.parentNode.removeChild(source);
                    });
                }

                if (urls.indexOf(url) === -1) {
                    urls.push(url);
                }
            });

            if (urls.length) {
                // Đợi nội dung được chèn vào editor xong rồi mới bắt đầu tải.
                setTimeout(function () {
                    importPastedImages(editor, urls);
                }, 0);
            }
        });
    }

    tinymce.init({
        selector: '.tinymce-editor',
        min_height: 500,
        branding: false,
        menubar: false,
        entity_encoding: 'raw',
        hidden_input: false,
        language: window.locale || 'vi',
        plugins: 'autoresize preview paste importcss searchreplace autolink autosave save directionality codemirror visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
        toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | mediamanager insertfile image media template link anchor codesample | ltr rtl | code',
        toolbar_sticky: true,
        toolbar_mode: 'sliding',
        toolbar_sticky_offset: 58,
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        image_advtab: true,
        imagetools_toolbar: 'imageoptions',
        importcss_append: false,
        automatic_uploads: true,
        relative_urls: false,
        images_upload_url: window.adminPath + '/media/upload',
        images_upload_handler: function (blobInfo, success, failure, progress) {
            var xhr, formData;

            xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open('POST', window.adminPath + '/media/upload');

            xhr.setRequestHeader('X-CSRF-TOKEN', $('meta[name="csrf-token"]').attr('content'));

            xhr.upload.onprogress = function (e) {
                progress(e.loaded / e.total * 100);
            };

            xhr.onload = function() {
                var json;

                if (xhr.status < 200 || xhr.status >= 300) {
                    failure('HTTP Error: ' + xhr.status);
                    return;
                }

                json = JSON.parse(xhr.responseText);

                if (!json || typeof json.link != 'string') {
                    failure('Invalid JSON: ' + xhr.responseText);
                    return;
                }

                success(json.link);
            };

            xhr.onerror = function () {
                failure('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
            };

            formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());
            formData.append('response', 'tinymce');
            xhr.send(formData);
        },
        // Nút "Browse" trong dialog Chèn ảnh / Link / Media mở thư viện media
        // (modal "Quản lý tệp" do admin::form.editor nhúng sẵn 1 lần mỗi trang).
        // Không có module media thì không bật, tránh hiện nút Browse không làm gì.
        file_picker_types: 'file image media',
        file_picker_callback: window.NewnetMediaPickerAvailable ? function (callback, value, meta) {
            if (!window.NewnetMediaPicker) {
                return;
            }

            window.NewnetMediaPicker.open({
                filetype: meta.filetype,
                onSelect: function (media) {
                    if (meta.filetype === 'image') {
                        callback(media.url, {alt: media.name});
                    } else if (meta.filetype === 'media') {
                        callback(media.url);
                    } else {
                        callback(media.url, {text: media.name, title: media.name});
                    }
                }
            });
        } : undefined,
        template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
        template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
        image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_noneditable_class: 'mceNonEditable',
        contextmenu: 'link image table',
        extended_valid_elements:"style,script,link[href|rel]",
        custom_elements:"style,script,link,~link",
        fontsize_formats: '8px 9px 10px 11px 12px 13px 14px 15px 16px 17px 18px 19px 20px 21px 22px 23px 24px 25px 26px 27px 28px 29px 30px',
        // content_css: '/vendor/newnet-admin/css/tinymce.content.css',
        // content_css: 'writer,/vendor/newnet-admin/css/tinymce.content.css',
        content_style: 'img{max-width: 100%;height: auto;display: block;} figure figcaption{margin-top: 0;}',
        rel_list: [
            {title: 'Default', value: ''},
            {title: 'Dofollow', value: 'dofollow'},
            {title: 'Nofollow', value: 'nofollow'},
        ],
        codemirror: {
            indentOnInit: false,
            fullscreen: false,
            path: 'codemirror',
            config: {
                mode: 'application/x-httpd-php',
                lineNumbers: true
            },
            width: 800,
            height: 600,
            saveCursorPosition: true,
            jsFiles: [
                'mode/clike/clike.js',
                'mode/php/php.js'
            ]
        },
        setup: function(editor) {
            editor.on('paste', function(e) {
                console.log('Paste content');
            });

            if (window.NewnetMediaPickerAvailable && mediaConfig.uploadUrl) {
                setupMediaDropUpload(editor);
            }

            if (window.NewnetMediaPickerAvailable && mediaConfig.importUrl) {
                setupPastedImageImport(editor);
            }

            // Mở thẳng thư viện media từ toolbar, không cần qua dialog Chèn ảnh/
            // Link — chọn hoặc upload file nào cũng chèn được (filetype "any").
            if (window.NewnetMediaPickerAvailable) {
                editor.ui.registry.addButton('mediamanager', {
                    icon: 'gallery',
                    tooltip: mediaConfig.label || 'File manager',
                    onAction: function () {
                        if (!window.NewnetMediaPicker) {
                            return;
                        }

                        var bookmark = editor.selection.getBookmark(2, true);

                        window.NewnetMediaPicker.open({
                            filetype: 'any',
                            onSelect: function (media) {
                                insertMediaIntoEditor(editor, media, bookmark);
                            }
                        });
                    }
                });
            }
        },
        remove_empty: false,              // Không xóa thẻ trống
        verify_html: false,               // Không kiểm tra lại HTML
        valid_elements: '*[*]',           // Cho phép tất cả các thẻ và thuộc tính
        // extended_valid_elements: '*[*]',  // Bổ sung cho valid_elements
        forced_root_block: false,         // Không tự bọc <p> quanh nội dung
        forced_clean_up: false,           // Không dọn dẹp HTML khi paste
    });

    $('.fixed.enable-megamenu').removeClass('fixed');
});
