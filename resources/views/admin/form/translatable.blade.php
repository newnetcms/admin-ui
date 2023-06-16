<div class="form-group row component-translatable">
    <label for="translatable" class="col-12 col-form-label font-weight-600">{{ trans('admin::translate.language') }}</label>
    <div class="col-12">
        <input type="hidden" name="edit_locale" value="{{ request('edit_locale') }}">

        <div class="language-list">
            <ul class="list-unstyled">
                @foreach(LaravelLocalization::getLocalesOrder() as $localeCode => $properties)
                    <li>
                        @if(get_current_edit_locale() == $localeCode)
                            <img src="{{ get_flag_img($localeCode) }}" alt="{{ $properties['native'] }}">
                            <strong>
                                {{ $properties['native'] }}
                            </strong>
                            ({{ trans('admin::translate.editing') }})
                        @else
                            <a href="{{ Request::fullUrlWithQuery(['edit_locale' => $localeCode]) }}">
                                <img src="{{ get_flag_img($localeCode) }}" alt="{{ $properties['native'] }}">
                                {{ $properties['native'] }}
                                @if(($attributeName = $checkKey ?? 'name') && object_get($item, 'exists') && method_exists($item, 'getTranslation') && $item->getTranslation($attributeName, $localeCode, false))
                                    <i class="fas fa-edit"></i>
                                @else
                                    <i class="fas fa-plus"></i>
                                @endif
                            </a>
                        @endif
                    </li>
                @endforeach
            </ul>
        </div>
    </div>
</div>
