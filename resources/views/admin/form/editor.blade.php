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

@assetadd('tinymce', asset("vendor/newnet-admin/css/tinymce.css"))
@assetadd('tinymce', asset("vendor/newnet-admin/plugins/tinymce/tinymce.min.js"), ['jquery'])
@assetadd('tinymce-script', asset("vendor/newnet-admin/js/scripts/tinymce.js"), ['jquery', 'tinymce'])
