<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <input type="text"
               class="form-control slug @error(get_dot_array_form($name)) is-invalid @enderror"
               name="{{ $name }}"
               id="{{ $name }}"
               value="{{ old(get_dot_array_form($name), object_get($item, get_dot_array_form($name))) }}"
               data-slug-from="{{ $slugFrom ?? '#name' }}"
               data-slug-prefix="{{ $slugPrefix ?? '' }}"
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

@assetadd('slug-script', asset('vendor/newnet-admin/js/scripts/slug.js'), ['jquery'])
