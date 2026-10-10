<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <textarea name="{{ $name }}"
                  id="{{ $name }}"
                  class="form-control tinymce-editor @error($name) is-invalid @enderror"
                  placeholder="{{ $placeholder ?? $label }}"
        >{{ old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name))) }}</textarea>
        @error($name)
            <span class="invalid-feedback text-left">
                <strong>{{ $message }}</strong>
            </span>
        @enderror

        @if(!empty($helper))
            <span class="helper-block">
                {!! $helper !!}
            </span>
        @endif
    </div>
</div>

{{-- Tích hợp module media cho TinyMCE (nút "Quản lý tệp" trên toolbar, nút
     "Browse" của dialog Chèn ảnh/Link/Media, kéo-thả file vào vùng soạn thảo để
     upload): 1 modal dùng chung cho mọi editor trên trang (@once). Chỉ nhúng khi
     có module media; cấu hình gán ngay khi parse HTML (trước DOMContentLoaded)
     để tinymce.js biết có bật các tính năng này hay không. --}}
@once
    @if(view()->exists('media::form.media') && Route::has('media.admin.media.ajaxMedia'))
        @include('media::form.media', ['name' => 'tinymce_media_picker', 'label' => '', 'media_type' => 'editor'])
        @php
            $tinymceMediaConfig = [
                'label' => __('media::media.picker.title'),
                'uploadUrl' => route('media.admin.media.storeAjax'),
                // cùng allowlist MediaUploader kiểm tra ở server — chặn sớm ở client
                'extensions' => array_values(array_map('strtolower', config('cms.media.accept_upload_extension', []))),
                'messages' => [
                    'dropHint' => __('media::media.upload.drop_hint'),
                    'uploading' => __('media::media.upload.uploading'),
                    'uploadingMany' => __('media::media.upload.uploading_many'),
                    'error' => __('media::media.upload.error'),
                    'unsupportedType' => __('media::media.upload.unsupported_type'),
                ],
            ];
        @endphp
        <script>
            window.NewnetMediaPickerAvailable = true;
            window.NewnetMediaConfig = {!! json_encode($tinymceMediaConfig, JSON_HEX_TAG | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!};
        </script>
    @endif
@endonce

@assetadd('tinymce', asset("vendor/newnet-admin/css/tinymce.css"))
@assetadd('tinymce', asset("vendor/newnet-admin/plugins/tinymce/tinymce.min.js"), ['jquery'])
@assetadd('tinymce-script', asset("vendor/newnet-admin/js/scripts/tinymce.js"), ['jquery', 'tinymce'])
