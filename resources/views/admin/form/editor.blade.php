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

{{-- Thư viện media cho nút "Browse" của dialog Chèn ảnh/Link/Media trong
     TinyMCE: 1 modal dùng chung cho mọi editor trên trang (@once). Chỉ nhúng khi
     có module media; cờ NewnetMediaPickerAvailable gán ngay khi parse HTML (trước
     DOMContentLoaded) để tinymce.js biết có bật file_picker_callback hay không. --}}
@once
    @if(view()->exists('media::form.media') && Route::has('media.admin.media.ajaxMedia'))
        @include('media::form.media', ['name' => 'tinymce_media_picker', 'label' => '', 'media_type' => 'editor'])
        <script>
            window.NewnetMediaPickerAvailable = true;
            window.NewnetMediaPickerLabel = {!! json_encode(__('media::media.picker.title'), JSON_HEX_TAG | JSON_UNESCAPED_UNICODE) !!};
        </script>
    @endif
@endonce

@assetadd('tinymce', asset("vendor/newnet-admin/css/tinymce.css"))
@assetadd('tinymce', asset("vendor/newnet-admin/plugins/tinymce/tinymce.min.js"), ['jquery'])
@assetadd('tinymce-script', asset("vendor/newnet-admin/js/scripts/tinymce.js"), ['jquery', 'tinymce'])
