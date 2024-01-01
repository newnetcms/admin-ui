<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="author" content="Newnet">
    <title>@yield('meta_title', 'Admin Panel') - {{ setting('site_title', config('app.name')) }}</title>

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="shortcut icon" href="{{ get_setting_media_url('favicon', '', asset('vendor/newnet-admin/img/icon/favicon.ico')) }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!--Global Styles(used by all pages)-->
    @assetadd('bootstrap', asset('vendor/newnet-admin/plugins/bootstrap/css/bootstrap.min.css'))
    @assetadd('metisMenu', asset('vendor/newnet-admin/plugins/metisMenu/metisMenu.min.css'))
    @assetadd('fontawesome', asset('vendor/newnet-admin/plugins/fontawesome/css/all.min.css'))
    @assetadd('typicons', asset('vendor/newnet-admin/plugins/typicons/src/typicons.min.css'))
    @assetadd('themify-icons', asset('vendor/newnet-admin/plugins/themify-icons/themify-icons.min.css'))
    @assetadd('sweetalert', asset('vendor/newnet-admin/plugins/sweetalert/sweetalert.css'))
    @assetadd('toastr', asset('vendor/newnet-admin/plugins/toastr/toastr.css'))
    @assetadd('animate', asset('vendor/newnet-admin/plugins/animate.min.css'))
    @assetadd('animate', asset('vendor/newnet-admin/plugins/animate.min.css'))

    {!! Asset::styles() !!}

    <!--Page Active Styles(used by this page)-->
    @yield('custom_css')
    @stack('page_styles')

    <!--Start Your Custom Style Now-->
    <link href="{{ asset('vendor/newnet-admin/dist/css/style.css') }}" rel="stylesheet">
    <link href="{{ asset('vendor/newnet-admin/css/app.css') }}" rel="stylesheet">
    <link href="{{ asset('vendor/newnet-admin/css/custom.css') }}" rel="stylesheet">

    <script>
        var locale = '{{ app()->getLocale() }}';
        var adminPath = '{{ url(config('core.admin_prefix')) }}';
        var echoServer = {
            url: '{{ config('broadcasting.connections.pusher.options.host') }}',
            appId: '{{ config('broadcasting.connections.pusher.app_id') }}',
            key: '{{ config('broadcasting.connections.pusher.key') }}',
            authToken: '{{ get_admin_echo_token() }}'
        }
    </script>

    @stack('styles')
</head>
<body class="fixed {{ get_admin_setting('enable_megamenu') ? 'enable-megamenu' : 'enable-sidebar' }}">
<div class="wrapper" id="app">
    @include('admin::partials.sidebar')

    <div class="content-wrapper">
        <div class="main-content">
            @section('nav-header')
                @include('admin::partials.header')
            @show

            @include('admin::partials.notification')
            @include('admin::form-error')

            @section('content-header')
                <div class="content-header row align-items-center m-0">
                    @yield('breadcrumb')

                    @include('admin::partials.page-title')
                </div>
            @show

            <div class="body-content">
                @yield('content')
            </div>
        </div>

        @include('admin::partials.footer')
    </div>

    <vue-snotify></vue-snotify>
</div>

@assetadd('jquery', asset('vendor/newnet-admin/plugins/jQuery/jquery-3.4.1.min.js'))
@assetadd('popper', asset('vendor/newnet-admin/dist/js/popper.min.js'))
@assetadd('bootstrap', asset('vendor/newnet-admin/plugins/bootstrap/js/bootstrap.min.js'), ['jquery', 'popper'])
@assetadd('metisMenu', asset('vendor/newnet-admin/plugins/metisMenu/metisMenu.min.js'), ['jquery'])
@assetadd('perfect-scrollbar', asset('vendor/newnet-admin/plugins/perfect-scrollbar/dist/perfect-scrollbar.min.js'))

@assetadd('sweetalert', asset('vendor/newnet-admin/plugins/sweetalert/sweetalert.min.js'))
@assetadd('toastr', asset('vendor/newnet-admin/plugins/toastr/toastr.min.js'))

@assetadd('sidebar', asset('vendor/newnet-admin/dist/js/sidebar.js'), ['jquery'])
@assetadd('core-script', asset('vendor/newnet-admin/js/script.js'), ['jquery'])

<script src="{{ asset('vendor/newnet-admin/js/manifest.js') }}"></script>
<script src="{{ asset('vendor/newnet-admin/js/vendor.js') }}"></script>
<script src="{{ asset('vendor/newnet-admin/js/app.js') }}"></script>

{!! Asset::scripts() !!}

@yield('js_custom') {{-- @deprecated --}}
@stack('page_scripts') {{-- @deprecated --}}

@stack('scripts')

@section('vue-app')
    <script>
        const app = new Vue({
            el: '#app',
            i18n: window.i18n
        });
    </script>
@show

</body>
</html>
