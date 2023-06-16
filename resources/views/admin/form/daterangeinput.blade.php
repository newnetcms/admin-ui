<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <input type="text"
               class="form-control daterange-picker @error($name) is-invalid @enderror"
               name="{{ $name }}"
               id="{{ $name }}"
               value="{{ old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name))) ?? $default ?? null }}"
               {{ !empty($disabled) ? 'disabled' : '' }}
               {{ !empty($readonly) ? 'readonly' : '' }}
               placeholder="{{ $placeholder ?? $label }}"
               {{ !empty($options) ? "data-options=" . json_encode($options) : '' }}
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

@assetadd('moment', asset('vendor/newnet-admin/plugins/moment/moment.js'))
@assetadd('daterangepicker', asset('vendor/newnet-admin/plugins/daterangepicker/daterangepicker.js'), ['jquery', 'moment'])
@assetadd('daterangepicker', asset('vendor/newnet-admin/plugins/daterangepicker/daterangepicker.css'))
@assetadd('date-picker-script', asset('vendor/newnet-admin/js/scripts/date-picker.js'), ['daterangepicker'])
