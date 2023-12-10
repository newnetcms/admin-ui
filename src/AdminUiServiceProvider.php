<?php

namespace Newnet\AdminUi;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Newnet\AdminUi\Console\Commands\LinkCommand;

class AdminUiServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->mergeConfigFrom(__DIR__.'/../config/adminui.php', 'cms.adminui');
        $this->loadJsonTranslationsFrom(__DIR__.'/../lang');

        $this->app->singleton(AdminMenuBuilder::class, function () {
            return new AdminMenuBuilder();
        });
    }

    public function boot()
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views/admin', 'admin');
        $this->loadTranslationsFrom(__DIR__ . '/../lang', 'admin');

        $this->publishes([
            __DIR__ . '/../public/newnet-admin' => public_path('vendor/newnet-admin'),
        ], 'admin-ui');

        $this->publishes([
            __DIR__.'/../config/adminui.php' => config_path('cms/adminui.php'),
        ], 'module-config');

        if ($this->app->runningInConsole()) {
            $this->commands([
                LinkCommand::class,
            ]);
        }

        $this->registerBlade();

        $this->supportForOlderVersion();

        Paginator::useBootstrapFour();
    }

    public function provides()
    {
        return [
            AdminMenuBuilder::class
        ];
    }

    protected function registerBlade()
    {
        Blade::include('admin::form.input', 'input');
        Blade::include('admin::form.select', 'select');
        Blade::include('admin::form.select2', 'select2');
        Blade::include('admin::form.select2', 'selecth');
        Blade::include('admin::form.textarea', 'textarea');
        Blade::include('admin::form.editor', 'editor');
        Blade::include('admin::form.file', 'file');
        Blade::include('admin::form.image', 'image');
        Blade::include('admin::form.checkbox', 'checkbox');
        Blade::include('admin::form.sumoselect', 'sumoselect');
        Blade::include('admin::form.slug', 'slug');
        Blade::include('admin::form.media', 'mediafile');
        Blade::include('admin::form.gallery', 'gallery');
        Blade::include('admin::form.dateinput', 'dateinput');
        Blade::include('admin::form.datetimeinput', 'datetimeinput');
        Blade::include('admin::form.daterangeinput', 'daterangeinput');
        Blade::include('admin::form.datetimerangeinput', 'datetimerangeinput');
        Blade::include('admin::form.codemirror', 'codemirror');
        Blade::include('admin::form.money', 'money');
        Blade::include('admin::form.range', 'range');

        Blade::include('admin::form.translatable', 'translatable');
        Blade::include('admin::form.translatable-alert', 'translatableAlert');
        Blade::include('admin::form.translatable-status', 'translatableStatus');
        Blade::include('admin::form.translatable-header', 'translatableHeader');

        Blade::directive('vnmoney', function ($amount) {
            return "<?php echo vnmoney($amount); ?>";
        });
    }

    /**
     * Support for older versions
     * Will be remove in the next version
     *
     * @deprecated
     * @return void
     */
    protected function supportForOlderVersion(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'core');
        $this->loadTranslationsFrom(__DIR__ . '/../lang', 'core');
    }
}
