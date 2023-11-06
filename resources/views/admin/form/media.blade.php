<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        @if($clearable ?? true)
            <input type="hidden" name="{{ $name }}" value="">
        @endif

        <div class="group-validate media-form-group @error(get_dot_array_form($name)) is-invalid @enderror">
            <div class="media-preview">
                @if(($mediaId = old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name)))) && is_numeric($mediaId) && ($media = get_media($mediaId)))
                    <a href="{{ $media->getUrl() }}" target="_blank">
                        @if($media->isOfType('image'))
                            <img src="{{ $media->getUrl($conversion ?? 'thumb') }}" alt="Image" class="img-thumbnail">
                        @else
                            {{ $media->name }}
                        @endif
                    </a>
                    <input type="hidden" name="{{ $name }}" value="{{ $media->id }}">
                @elseif(($media = $value ?? object_get($item, get_dot_array_form($name))) && $media instanceof \Newnet\Media\Models\Media)
                    <a href="{{ $media->getUrl() }}" target="_blank">
                        @if($media->isOfType('image'))
                            <img src="{{ $media->getUrl($conversion ?? 'thumb') }}" alt="Image" class="img-thumbnail">
                        @else
                            {{ $media->name }}
                        @endif
                    </a>
                    <input type="hidden" name="{{ $name }}" value="{{ $media->id }}">
                @elseif($item && method_exists($item, 'getFirstMediaUrl') && $item->hasMedia($name))
                    <a href="{{ $item->getFirstMediaUrl($name) }}" target="_blank">
                        @if($media->isOfType('image'))
                            <img src="{{ $item->getFirstMediaUrl($name, $conversion ?? 'thumb') }}" alt="Image" class="img-thumbnail">
                        @else
                            {{ $media->name }}
                        @endif
                    </a>
                    <input type="hidden" name="{{ $name }}" value="{{ $item->getFirstMedia($name)->id }}">
                @endif

                <a href="#" class="remove-media">
                    <i class="fas fa-times-circle"></i>
                </a>
            </div>

            <div class="progress progress-sm mb-3" style="display: none;">
                <div class="progress-bar progress-bar-primary progress-bar-striped progress-bar-animated" style="width: 0%"></div>
            </div>
            <input type="file" class="inputFileMedia" id="inputFileMedia_{{ $name }}" data-media-name="{{ $name }}">

            <div class="media-button-group">
                {{--@if(!isset($fileManager) || $fileManager)
                    <a href="javascript:;" class="font-weight-600">[File Manager]</a>
                @endif--}}
                <label for="inputFileMedia_{{ $name }}" class="labelFileMedia font-weight-600">[Choose Files]</label>
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
@assetadd('media-script', asset('vendor/newnet-admin/js/scripts/media.js'), ['jquery'])
@assetadd('media-style', asset('vendor/newnet-admin/css/media.css'))
