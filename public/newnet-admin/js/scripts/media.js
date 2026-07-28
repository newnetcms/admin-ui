$(document).ready(function () {
    "use strict"; // Start of use strict

    // Mirrors lib/media/resources/views/form/partials/file-type-icon.blade.php - keep the two in sync
    function fileIconClass(ext) {
        var map = {
            PDF: 'fa-file-pdf',
            DOC: 'fa-file-word', DOCX: 'fa-file-word',
            XLS: 'fa-file-excel', XLSX: 'fa-file-excel', CSV: 'fa-file-excel',
            PPT: 'fa-file-powerpoint', PPTX: 'fa-file-powerpoint',
            ZIP: 'fa-file-archive', RAR: 'fa-file-archive', '7Z': 'fa-file-archive', TAR: 'fa-file-archive', GZ: 'fa-file-archive',
            MP3: 'fa-file-audio', WAV: 'fa-file-audio', OGG: 'fa-file-audio',
            MP4: 'fa-file-video', MOV: 'fa-file-video', AVI: 'fa-file-video', WMV: 'fa-file-video', MKV: 'fa-file-video',
            TXT: 'fa-file-alt'
        };
        return map[(ext || '').toUpperCase()] || 'fa-file';
    }

    function fileTypePreviewHtml(ext) {
        return '<div class="media-file-type-preview"><i class="fas ' + fileIconClass(ext) + '"></i><span class="media-file-ext">' + (ext || '') + '</span></div>';
    }

    $('body')
        .on('change', 'input[type="file"].inputFileMedia', function (e) {
            e.preventDefault();

            let $file = $(this);

            $file.prev().show();

            const mediaName = $file.data('media-name');

            let formData = new FormData();
            Array.prototype.forEach.call(this.files, function (file) {
                formData.append('file', file);
            });

            let token = $('meta[name="csrf-token"]').attr('content');
            formData.append('_token', token);

            $.ajax({
                url: window.uploadMediaPath || window.adminPath + '/media/upload',
                data: formData,
                type: 'POST',
                processData: false,
                contentType: false,
                xhr: function () {
                    var jqXHR = null;
                    if (window.ActiveXObject) {
                        jqXHR = new window.ActiveXObject("Microsoft.XMLHTTP");
                    } else {
                        jqXHR = new window.XMLHttpRequest();
                    }

                    jqXHR.upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = Math.round((evt.loaded * 100) / evt.total);

                            $file.prev().find('.progress-bar').css('width', percentComplete + '%');
                        }
                    }, false);

                    return jqXHR;
                },
                success: function (e) {
                    $file.val('');

                    const f = e.file || e.files[0];
                    const preview = f.is_image
                        ? `<img src="${f.thumb}" alt="Image" class="img-thumbnail">`
                        : fileTypePreviewHtml(f.extension);
                    const html = `${preview}<input type="hidden" name="${mediaName}" value="${f.id}"><a href="#" class="remove-media"><i class="fas fa-times-circle"></i></a>`;

                    $file.closest('.media-form-group').find('.media-preview').html(html);

                    $file.prev().find('.progress-bar').css('width', '0%');
                    $file.prev().hide();

                    $(document).trigger('MediaUploaded', {
                        name: mediaName,
                        file: f
                    })
                },
                error: function (e) {
                    $file.val('');
                    $file.prev().find('.progress-bar').css('width', '0%');
                    $file.prev().hide();

                    let text;

                    if (e.responseJSON && e.responseJSON.message) {
                        text = e.responseJSON.message
                    } else {
                        text = e.statusText || 'Không thể xử lý';
                    }

                    if (typeof swal === 'undefined') {
                        alert(text);
                    } else {
                        swal({title: 'Error', text, type: 'error'});
                    }
                }
            })
        })
        .on('click', '.media-preview .remove-media', function (e) {
            e.preventDefault();

            $(this).closest('.media-preview').html('');
        });
});
