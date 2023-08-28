<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <div class="group-validate @error(get_dot_array_form($name)) is-invalid @enderror">
            <div class="fileinput fileinput-new" data-provides="fileinput">
                @if(method_exists($item, 'getFirstMediaUrl') && $item->hasMedia($name))
                    <div class="fileinput-new img-thumbnail" style="max-width: 250px; max-height: 250px;">
                        <img src="{{ Img::url($item->getFirstMedia($name)->getUrl(), 300, 300) }}" alt="Image">
                    </div>
                @endif
                <div class="fileinput-preview fileinput-exists img-thumbnail" style="max-width: 250px; max-height: 250px;"></div>
                <div>
                <span class="btn btn-outline-secondary btn-file">
                    <span class="fileinput-new">@lang('Select image')</span>
                    <span class="fileinput-exists">@lang('Change')</span>
                    <input type="file" name="{{ $name }}" id="{{ $name }}">
                </span>
                    <a href="#" class="btn btn-outline-secondary fileinput-exists" data-dismiss="fileinput">@lang('Remove')</a>
                </div>
            </div>
        </div>

        @error(get_dot_array_form($name))
            <span class="invalid-feedback text-left" style="display: block">
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

@assetadd('jasny-bootstrap', asset('vendor/newnet-admin/plugins/jasny-bootstrap/css/jasny-bootstrap.min.css'), ['bootstrap'])
@assetadd('jasny-bootstrap', asset('vendor/newnet-admin/plugins/jasny-bootstrap/js/jasny-bootstrap.min.js'), ['jquery', 'bootstrap'])
