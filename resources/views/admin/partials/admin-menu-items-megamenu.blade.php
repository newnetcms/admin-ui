@foreach($items as $item)
    @if($item->hasChildren() || $item->url() != '#')
        <li @lm_attrs($item) @lm_endattrs data-order="{{ $item->data('order') }}">
            @if($item->link)
                <a href="{!! $item->url() != '#' ? $item->url() : $item->getFirstChildUrl() !!}"
                   @lm_attrs($item->link) @lm_endattrs>
                    @if($item->data('icon'))
                        <i class="{{ $item->data('icon') }} mr-2"></i>
                    @endif

                    {!! $item->title !!}

                    @if($level == 1 && $item->hasChildren())
                        <i class="nav-arrow fas fa-angle-down"></i>
                    @endif
                    @if($level == 2 && $item->hasChildren())
                        <i class="nav-arrow fas fa-angle-right"></i>
                    @endif
                </a>
            @else
                <span class="nav-label">{!! $item->title !!}</span>
            @endif

            @if($item->hasChildren())
                <ul class="nav-{{ menu_level_text($level + 1) }}-level {{ $item->isActive ? 'mm-show' : 'mm-collapse' }} animated fadeIn">
                    @include('admin::partials.admin-menu-items-megamenu', ['items' => $item->children(), 'level' => $level + 1])
                </ul>
            @endif
        </li>
    @endif
@endforeach
