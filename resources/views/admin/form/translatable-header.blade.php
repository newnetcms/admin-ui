@if(class_exists('LaravelLocalization'))
<div class="newnet-translate-header">
    @foreach(LaravelLocalization::getLocalesOrder() as $localeCode => $properties)
        <span>
                <img src="{{ get_flag_img($localeCode) }}" alt="{{ $properties['native'] }}">
            </span>
    @endforeach
</div>
@endif
