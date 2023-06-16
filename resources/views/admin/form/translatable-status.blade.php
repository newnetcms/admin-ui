@if(isset($editUrl))
    <div class="newnet-translate-status">
        @foreach(LaravelLocalization::getLocalesOrder() as $localeCode => $properties)
            <a href="{{ $editUrl }}?edit_locale={{ $localeCode }}" title="{{ trans('admin::translate.edit_title', ['name' => $properties['native']]) }}">
                @if(($attributeName = $checkKey ?? 'name') && object_get($item, 'exists') && method_exists($item, 'getTranslation'))
                    @if($item->getTranslation($attributeName, $localeCode, false))
                        <i class="fas fa-edit"></i>
                    @else
                        <i class="fas fa-plus"></i>
                    @endif
                @endif
            </a>
        @endforeach
    </div>
@endif
