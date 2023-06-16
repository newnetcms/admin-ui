<nav class="navbar-custom-menu navbar navbar-expand-lg m-0">
    <div class="sidebar-toggle-icon" id="sidebarCollapse">sidebar toggle<span></span></div><!--/.sidebar toggle icon-->
    @if(get_admin_setting('enable_megamenu'))
        <div class="d-flex">
            <div class="logo-admin">
                <a href="{{ url('/') }}" target="_blank">
                    <img src="{{ get_setting_media_url('logo_admin', '', asset('vendor/newnet-admin/img/logo.png')) }}" alt="Logo">
                </a>
            </div>
        </div>
        <div class="d-flex flex-grow-1">
            <div class="d-none d-lg-block">
                <ul class="main-megamenu">
                    @include('admin::partials.admin-menu-items-megamenu', ['items' => AdminMenu::load()->filterPermisison()->filterChildren()->sortBy('order')->roots(), 'level' => 1])
                </ul>
            </div>
        </div>
    @endif
    <div class="d-flex flex-grow-1">
        <ul class="navbar-nav flex-row align-items-center ml-auto">
            <li class="nav-item dropdown dropdown-hover change-language">
                <a class="dropdown-toggle px-2" href="#" data-toggle="dropdown">
                    <img src="{{ get_flag_img(App::getLocale()) }}" alt="{{ App::getLocale() }}">
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    @foreach(config('cms.adminui.langs') as $localeCode => $properties)
                        <a href="{{ route('acl.admin.profile.language', $localeCode) }}" class="dropdown-item">
                            <span class="image-flag">
                                <img src="{{ get_flag_img($localeCode) }}" alt="{{ $properties['native'] }}">
                            </span>
                            <span class="locale-lang">
                                {{ $properties['native'] }}
                            </span>
                        </a>
                    @endforeach
                </div><!--/.dropdown-menu -->
            </li>

            <li class="nav-item dropdown dropdown-hover quick-actions">
                <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                    <i class="typcn typcn-th-large-outline"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    <div class="nav-grid-row row">
                        <a href="{{ url('/') }}" class="icon-menu-item col-4" target="_blank">
                            <i class="fas fa-globe"></i>
                            <span>{{ __('admin::message.view_website') }}</span>
                        </a>
                        <a href="{{ route('acl.admin.user.index') }}" class="icon-menu-item col-4">
                            <i class="typcn typcn-group-outline d-block"></i>
                            <span>{{ __('acl::user.quicklink_title') }}</span>
                        </a>
                        <a href="{{ route('admin.dashboard.setting') }}" class="icon-menu-item col-4">
                            <i class="typcn typcn-puzzle-outline d-block"></i>
                            <span>{{ __('dashboard::message.quicklink_title') }}</span>
                        </a>
                    </div>
                </div>
            </li><!--/.dropdown-->
            @if(Route::has('chat.admin.chat.index'))
                <li class="nav-item">
                    <a class="nav-link" href="{{ route('chat.admin.chat.index') }}">
                        <i class="typcn typcn-messages"></i>
                    </a>
                </li>
            @endif

            @if(0)
                <li class="nav-item dropdown dropdown-hover notification">
                    <a class="nav-link dropdown-toggle badge-dotx" href="#" data-toggle="dropdown">
                        <i class="typcn typcn-bell"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right">
                        <h6 class="notification-title">Notifications</h6>
                        <p class="notification-text">You have 2 unread notification</p>
                        <div class="notification-list">
                            <div class="media new">
                                <div class="img-user">
                                    <img src="{{ asset('vendor/newnet-admin/dist/img/avatar-1.jpg') }}" alt="">
                                </div>
                                <div class="media-body">
                                    <h6>Congratulate <strong>Socrates Itumay</strong> for work anniversaries
                                    </h6>
                                    <span>Mar 15 12:32pm</span>
                                </div>
                            </div><!--/.media -->
                            <div class="media new">
                                <div class="img-user online"><img
                                            src="{{ asset('vendor/newnet-admin/dist/img/avatar-1.jpg') }}" alt=""></div>
                                <div class="media-body">
                                    <h6><strong>Joyce Chua</strong> just created a new blog post</h6>
                                    <span>Mar 13 04:16am</span>
                                </div>
                            </div><!--/.media -->
                            <div class="media">
                                <div class="img-user"><img
                                            src="{{ asset('vendor/newnet-admin/dist/img/avatar-1.jpg') }}" alt=""></div>
                                <div class="media-body">
                                    <h6><strong>Althea Cabardo</strong> just created a new blog post</h6>
                                    <span>Mar 13 02:56am</span>
                                </div>
                            </div><!--/.media -->
                            <div class="media">
                                <div class="img-user"><img src="{{ asset('vendor/newnet-admin/dist/img/avatar-1.jpg') }}" alt=""></div>
                                <div class="media-body">
                                    <h6><strong>Adrian Monino</strong> added new comment on your photo</h6>
                                    <span>Mar 12 10:40pm</span>
                                </div>
                            </div><!--/.media -->
                        </div><!--/.notification -->
                        <div class="dropdown-footer"><a href="">View All Notifications</a></div>
                    </div><!--/.dropdown-menu -->
                </li><!--/.dropdown-->
            @endif

            <li class="nav-item dropdown dropdown-hover user-menu">
                <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                    <i class="typcn typcn-user-outline"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    <div class="dropdown-header d-sm-none">
                        <a href="" class="header-arrow"><i class="icon ion-md-arrow-back"></i></a>
                    </div>
                    <div class="user-header">
                        <div class="img-user">
                            <img src="{{ current_admin()->avatar }}" alt="{{ current_admin()->name }}">
                        </div><!-- img-user -->
                        <h6>{{ current_admin()->name }}</h6>
                        <span>{{ current_admin()->email }}</span>
                    </div><!-- user-header -->
                    <a href="{{ Route::has('acl.admin.profile.index') ? route('acl.admin.profile.index') : '' }}" class="dropdown-item">
                        <i class="typcn typcn-edit"></i>
                        {{ __('Edit Profile') }}
                    </a>
                    @if(Route::has('admin.dashboard.setting'))
                        <a href="{{ route('admin.dashboard.setting') }}" class="dropdown-item">
                            <i class="typcn typcn-cog-outline"></i>
                            {{ __('dashboard::message.setting.profile_menu') }}
                        </a>
                    @endif
                    <a href="{{ route('admin.logout') }}"
                       class="dropdown-item"
                       onclick="event.preventDefault();
                       document.getElementById('admin-logout-form').submit();"
                    >
                        <i class="typcn typcn-key-outline"></i>
                        {{ __('admin::system.header.logout') }}
                    </a>

                    <form id="admin-logout-form" action="{{ route('admin.logout') }}" method="POST" style="display: none;">
                        @csrf
                    </form>
                </div><!--/.dropdown-menu -->
            </li>
        </ul><!--/.navbar nav-->

        <div class="nav-clock">
            <div class="time">
                <span class="time-hours">{{ date('H') }}</span>
                <span class="time-min">{{ date('i') }}</span>
                <span class="time-sec">{{ date('s') }}</span>
            </div>
        </div><!-- nav-clock -->
    </div>
</nav><!--/.navbar-->
