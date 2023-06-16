<nav class="sidebar sidebar-bunker">
    <div class="sidebar-header">
        @if(setting('logo_admin'))
            <a href="{{ url('/') }}" target="_blank">
                <img src="{{ get_setting_media_url('logo_admin', '', asset('vendor/newnet-admin/img/logo.png')) }}" alt="Logo">
            </a>
        @else
            <a href="{{ url('/') }}" target="_blank">
                <span class="logo-admin-text text-uppercase">{{ setting('site_title_short', parse_url(config('app.url'), PHP_URL_HOST)) }}</span>
            </a>
        @endif
    </div><!--/.sidebar header-->

    <div class="sidebar-body">
        @include('admin::partials.admin-menu')
    </div>
</nav>
