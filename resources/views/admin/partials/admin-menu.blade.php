<nav class="sidebar-nav">
    <ul class="metismenu">
        @include('admin::partials.admin-menu-items', ['items' => AdminMenu::load()->filterPermisison()->filterChildren()->sortBy('order')->roots(), 'level' => 1])
    </ul>
</nav>
