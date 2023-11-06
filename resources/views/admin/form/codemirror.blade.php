<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <textarea name="{{ $name }}"
                  id="{{ $name }}"
                  class="form-control codemirror @error($name) is-invalid @enderror"
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

@assetadd('codemirror-script', asset("vendor/newnet-admin/js/scripts/codemirror.js"))
