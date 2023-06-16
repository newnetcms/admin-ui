<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <input type="file"
               name="{{ $name }}"
               id="{{ $name }}"
               class="custom-input-file form-control @error(get_dot_array_form($name)) is-invalid @enderror"
               {{ !empty($multiple) ? 'multiple' : '' }}
               data-multiple-caption="{count} files selected"
        >
        <label for="{{ $name }}">
            <i class="fa fa-upload"></i>
            <span>Choose a file…</span>
        </label>
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

@assetadd('file-input', asset('vendor/newnet-admin/js/scripts/file-input.js'), ['jquery'])
