$(document).ready(function () {
    "use strict"; // Start of use strict

    let $fileList = $('.file-list');

    $fileList.on('click', '.remove-media', function (e) {
        e.preventDefault();

        $(this).closest('.file-item').remove();
    });

    $('input[type="file"].inputFiles').on('change', function (e) {
        e.preventDefault();

        let $file = $(this);

        $file.prev().show();

        const fileName = $file.data('name');

        let formData = new FormData();
        Array.prototype.forEach.call(this.files, function (file) {
            formData.append('file[]', file);
        });

        let token = $('meta[name="csrf-token"]').attr('content');
        formData.append('_token', token);

        $.ajax({
            url: adminPath + '/media/upload',
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

                let html = [];

                e.files.map(function (f) {
                    console.log(f);
                    html.push(`<div class="file-item"><a href="${f.url}" target="_blank" class="file-name">${f.file_name}</a><input type="hidden" name="${fileName}[]" value="${f.id}"><a href="#" class="remove-media" title="Delete Image"><i class="fas fa-times-circle"></i></a></div>`);
                });

                $file.closest('.files-form-group').find('.file-list').append(html.join("\n"));

                $file.prev().find('.progress-bar').css('width', '0%');
                $file.prev().hide();
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

                swal({title: 'Error', text, type: 'error'});
            }
        })
    });
});
