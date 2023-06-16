<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        @if(!empty($allowClear))
            <input type="hidden" name="{{ $name }}{{ !empty($multiple) ? '[]' : '' }}">
        @endif
        <select name="{{ $name }}{{ !empty($multiple) ? '[]' : '' }}"
                id="{{ $name }}"
                {{ !empty($multiple) ? 'multiple' : '' }}
                class="form-control select2 @error(get_dot_array_form($name)) is-invalid @enderror"
                placeholder="{{ $placeholder ?? $label }}"
                data-allow-clear="{{ !empty($allowClear) && empty($multiple) ? 'true' : 'false' }}"
        >
            @if(!empty($allowClear ?? true))
                <option value="">{{ $placeholder ?? "--- {$label} ---" }}</option>
            @endif
            @foreach($options as $option)
                <option value="{{ $option['value'] }}"
                    {{ get_selected_value($option['value'], old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name)))) }}
                >
                    {{ $option['label'] }}
                </option>
            @endforeach
        </select>

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

@assetadd('select2', asset("vendor/newnet-admin/plugins/select2/dist/css/select2.min.css"))
@assetadd('select2', asset("vendor/newnet-admin/plugins/select2/dist/js/select2.min.js"), ['jquery'])
@assetadd('select2-bootstrap4', asset("vendor/newnet-admin/plugins/select2-bootstrap4/dist/select2-bootstrap4.min.css"), ['jquery', 'bootstrap', 'select2'])
@assetadd('select2-script', asset("vendor/newnet-admin/js/scripts/select2.js"), ['jquery', 'select2'])
