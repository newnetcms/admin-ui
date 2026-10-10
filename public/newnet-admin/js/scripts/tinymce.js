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

            // Mở thẳng thư viện media từ toolbar, không cần qua dialog Chèn ảnh/
            // Link — chọn hoặc upload file nào cũng chèn được (filetype "any").
            if (window.NewnetMediaPickerAvailable) {
                editor.ui.registry.addButton('mediamanager', {
                    icon: 'gallery',
                    tooltip: window.NewnetMediaPickerLabel || 'File manager',
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
