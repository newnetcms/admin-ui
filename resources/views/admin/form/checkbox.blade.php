<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <div class="custom-control custom-checkbox">
            <input type="hidden" name="{{ $name }}" value="0" checked>
            <input type="checkbox"
                   class="custom-control-input @error(get_dot_array_form($name)) is-invalid @enderror"
                   id="{{ $name }}"
                   name="{{ $name }}"
                   value="1"
                   {{ old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name)) ?? $default ?? false) ? 'checked' : '' }}
            >
            <label class="custom-control-label" for="{{ $name }}">
                {{ $placeholder ?? $label }}
            </label>
        </div>

        @error(get_dot_array_form($name))
            <span class="invalid-feedback text-left" style="display:block;">
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
