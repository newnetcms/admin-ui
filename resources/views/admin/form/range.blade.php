<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <input type="range"
               class="custom-range @error(get_dot_array_form($name)) is-invalid @enderror"
               name="{{ $name }}"
               id="{{ $name }}"
               value="{{ old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name))) ?? $default ?? null }}"
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
