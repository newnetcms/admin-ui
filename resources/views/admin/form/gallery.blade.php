<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <div class="group-validate gallery-form-group @error(get_dot_array_form($name)) is-invalid @enderror">
            <div class="gallery-list">
                @if(($listMedia = object_get($item, get_dot_array_form($name))) && $listMedia instanceof \Illuminate\Support\Collection && is_numeric($listMedia->first()))
                    @foreach($listMedia as $mediaId)
                        @if($media = get_media($mediaId))
                            <div class="gallery-item" data-alt="{{ object_get($media, 'mediaTags.label') }}">
                                <img src="{{ imageProxy($media->getUrl(), 300, 300) }}" alt="Image">
                                <input type="hidden" name="{{ $name }}[]" value="{{ $media->id }}">
                                <a href="#" class="remove-media" title="Delete Image"><i class="fas fa-times-circle"></i></a>
                            </div>
                        @endif
                    @endforeach
                @elseif($item && method_exists($item, 'getMedia') && $item->hasMedia($name))
                    @foreach($item->getMedia($name) as $media)
                        <div class="gallery-item" data-alt="{{ object_get($media, 'mediaTags.label') }}">
                            <img src="{{ imageProxy($media->getUrl(), 300, 300) }}" alt="Image">
                            <input type="hidden" name="{{ $name }}[]" value="{{ $media->id }}">
                            <a href="#" class="remove-media" title="Delete Image"><i class="fas fa-times-circle"></i></a>
                        </div>
                    @endforeach
                @endif
            </div>

            <div class="progress progress-sm mb-3" style="display: none;">
                <div class="progress-bar progress-bar-primary progress-bar-striped progress-bar-animated" style="width: 0%"></div>
            </div>
            <input type="file" multiple class="inputFileGallery" id="inputFileGallery_{{ $name }}" data-gallery-name="{{ $name }}">

            <div class="gallery-button-group">
                {{--<a href="javascript:;" class="font-weight-600">[File Manager]</a>--}}
                <label for="inputFileGallery_{{ $name }}" class="labelFileGallery font-weight-600">[Choose Files]</label>
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
@assetadd('gallery-script', asset('vendor/newnet-admin/js/scripts/gallery.js'), ['jquery'])
@assetadd('gallery-style', asset('vendor/newnet-admin/css/gallery.css'))
