<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <input type="{{ $type ?? 'text' }}"
               class="form-control @error(get_dot_array_form($name)) is-invalid @enderror"
               name="{{ $name }}"
               id="{{ $name }}"
               value="{{ old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name))) ?? $default ?? null }}"
               data-mask="money"
               {{ !empty($maskOption) ? "data-mask-option=" . json_encode($maskOption) : '' }}
               {{ !empty($disabled) ? 'disabled' : '' }}
               {{ !empty($readonly) ? 'readonly' : '' }}
               placeholder="{{ $placeholder ?? $label }}"
        >
        @error(get_dot_array_form($name))
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

@assetadd('jquery.mask', asset('vendor/newnet-admin/plugins/jQuery-mask-plugin/jquery.mask.min.js'), ['jquery'])
@assetadd('jquery.mask-script', asset('vendor/newnet-admin/js/scripts/mask.js'), ['jquery', 'jquery.mask'])
