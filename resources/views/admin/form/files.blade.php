<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <div class="group-validate files-form-group @error(get_dot_array_form($name)) is-invalid @enderror">
            <div class="file-list">
                <input type="hidden" name="{{ $name }}">
                @if(($listMedia = object_get($item, get_dot_array_form($name))) && ($listMedia instanceof \Illuminate\Support\Collection || is_array($listMedia)) )
                    @foreach($listMedia as $mediaId)
                        @if($media = get_media($mediaId))
                            <div class="file-item" data-alt="{{ object_get($media, 'mediaTags.label') }}">
                                <a href="{{ $media->url }}" target="_blank" class="file-name">{{ $media->file_name }}</a>
                                <input type="hidden" name="{{ $name }}[]" value="{{ $media->id }}">
                                <a href="#" class="remove-media" title="Delete Image"><i class="fas fa-times-circle"></i></a>
                            </div>
                        @endif
                    @endforeach
                @elseif($item && method_exists($item, 'getMedia') && $item->hasMedia($name))
                    @foreach($item->getMedia($name) as $media)
                        <div class="file-item" data-alt="{{ object_get($media, 'mediaTags.label') }}">
                            <a href="{{ $media->url }}" target="_blank" class="file-name">{{ $media->file_name }}</a>
                            <input type="hidden" name="{{ $name }}[]" value="{{ $media->id }}">
                            <a href="#" class="remove-media" title="Delete Image"><i class="fas fa-times-circle"></i></a>
                        </div>
                    @endforeach
                @elseif(($listMedia = object_get($item, get_dot_array_form($name))) && is_array($listMedia))
                    @foreach($listMedia as $mediaId)
                        @if($media = get_media($mediaId))
                            <div class="file-item" data-alt="{{ object_get($media, 'mediaTags.label') }}">
                                <a href="{{ $media->url }}" target="_blank" class="file-name">{{ $media->file_name }}</a>
                                <input type="hidden" name="{{ $name }}[]" value="{{ $media->id }}">
                                <a href="#" class="remove-media" title="Delete Image"><i class="fas fa-times-circle"></i></a>
                            </div>
                        @endif
                    @endforeach
                @endif
            </div>

            <div class="progress progress-sm mb-3" style="display: none;">
                <div class="progress-bar progress-bar-primary progress-bar-striped progress-bar-animated" style="width: 0%"></div>
            </div>
            <input type="file" multiple class="inputFiles" id="inputFiles_{{ $name }}" data-name="{{ $name }}">

            <div class="gallery-button-group">
                <label for="inputFiles_{{ $name }}" class="labelFiles font-weight-600">[Choose Files]</label>
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

@assetadd('jquery-ui', asset('vendor/newnet-admin/plugins/jquery-ui/jquery-ui.min.css'))
@assetadd('jquery-ui', asset('vendor/newnet-admin/plugins/jquery-ui/jquery-ui.min.js'), ['jquery'])
@assetadd('toastr', 'vendor/newnet-admin/plugins/toastr/toastr.min.js', ['jquery'])
@assetadd('toastr', 'vendor/newnet-admin/plugins/toastr/toastr.css')
@assetadd('files-script', asset('vendor/newnet-admin/js/scripts/files.js'), ['jquery'])
@assetadd('files-style', asset('vendor/newnet-admin/css/files.css'))
