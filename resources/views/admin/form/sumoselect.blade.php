<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <select name="{{ $name }}{{ !empty($multiple) ? '[]' : '' }}"
                id="{{ $name }}"
                {{ !empty($multiple) ? 'multiple' : '' }}
                class="form-control sumoselect @error(get_dot_array_form($name)) is-invalid @enderror"
                placeholder="{{ $placeholder ?? $label }}"
                data-search="{{ !empty($search) ? 'true' : 'false' }}"
                data-search-text="{{ $searchText ?? '' }}"
                data-select-all="{{ !empty($selectAll) ? 'true' : 'false' }}"
                data-ok-cancel-in-multi="{{ !empty($okCancelInMulti) ? 'true' : 'false' }}"
        >
            @if(!empty($allowClear ?? true))
                <option value="">{{ $placeholder ?? "--- {$label} ---" }}</option>
            @endif
            @foreach($options as $option)
                <option value="{{ $option['value'] }}"
                        {{ get_selected_value($option['value'], old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name)) ?? $default ?? null)) }}
                >
                    {{ $option['label'] }}
                </option>
            @endforeach
        </select>

        @error(get_dot_array_form($name))
            <span class="invalid-feedback text-left" style="display: block;">
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

@assetadd('sumoselect', asset("vendor/newnet-admin/plugins/jquery.sumoselect/sumoselect.min.css"))
@assetadd('sumoselect', asset("vendor/newnet-admin/plugins/jquery.sumoselect/jquery.sumoselect.min.js"), ['jquery'])
@assetadd('sumoselect-script', asset("vendor/newnet-admin/js/scripts/sumoselect.js"), ['jquery', 'sumoselect'])
