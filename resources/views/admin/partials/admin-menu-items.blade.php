@foreach($items as $item)
    @if($item->hasChildren() || $item->url() != '#')
        <li @lm_attrs($item) @lm_endattrs data-order="{{ $item->data('order') }}" data-key="{{ $item->id }}">
            @if($item->link)
                <a href="{!! $item->hasChildren() ? '#' : $item->url() !!}"
                   @lm_attrs($item->link) @if($item->hasChildren()) class="has-arrow" @endif @lm_endattrs>
                    @if($level == 1 && $item->data('icon'))
                        <i class="{{ $item->data('icon') }} mr-2"></i>
                    @endif
                    {!! $item->title !!}
                </a>
            @else
                <span class="nav-label">{!! $item->title !!}</span>
            @endif

            @if($item->hasChildren())
                <ul class="nav-{{ menu_level_text($level + 1) }}-level {{ $item->isActive ? 'mm-show' : 'mm-collapse' }}">
                    @include('admin::partials.admin-menu-items', ['items' => $item->children(), 'level' => $level + 1])
                </ul>
            @endif
        </li>
    @endif
@endforeach
