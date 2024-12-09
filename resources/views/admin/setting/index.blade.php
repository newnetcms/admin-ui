@extends('admin::master')

@section('meta_title', __('admin::setting.index.page_title'))

@section('page_title', __('admin::setting.index.page_title'))

@section('page_subtitle', __('admin::setting.index.page_subtitle'))

@section('breadcrumb')
    <nav aria-label="breadcrumb" class="col-sm-4 order-sm-last mb-3 mb-sm-0 p-0 ">
        <ol class="breadcrumb d-inline-flex font-weight-600 fs-13 bg-white mb-0 float-sm-right">
            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">{{ trans('dashboard::message.index.breadcrumb') }}</a></li>
            <li class="breadcrumb-item active">{{ trans('admin::setting.index.breadcrumb') }}</li>
        </ol>
    </nav>
@stop

@section('content')
    <form action="{{ route('setting.admin.setting.save') }}" method="POST" enctype="multipart/form-data">
        @csrf

        <div class="card mb-4">
            <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fs-17 font-weight-600 mb-0">
                            {{ __('admin::setting.index.page_title') }}
                        </h6>
                    </div>
                    <div class="text-right">
                        <div class="btn-group">
                            <button class="btn btn-success" type="submit">{{ __('core::button.save') }}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="form-horizontal">
                    @input(['name' => 'site_title', 'label' => __('admin::setting.general.site_title')])
                    @input(['name' => 'site_title_short', 'label' => __('admin::setting.general.site_title_short')])
                    @code(['name' => 'code_head', 'label' => __('admin::setting.general.code_head')])
                    @code(['name' => 'code_footer', 'label' => __('admin::setting.general.code_footer')])
                    @mediafile(['name' => 'logo', 'label' => __('admin::setting.general.logo'), 'conversion' => '', 'clearable' => true])
                    @mediafile(['name' => 'logo_login', 'label' => __('admin::setting.general.logo_login'), 'conversion' => '', 'clearable' => true])
                    @mediafile(['name' => 'logo_admin', 'label' => __('admin::setting.general.logo_admin'), 'conversion' => '', 'clearable' => true])
                    @mediafile(['name' => 'favicon', 'label' => __('admin::setting.general.favicon'), 'conversion' => ''])
                    @checkbox(['name' => 'maintenance_enabled', 'label' => __('admin::setting.general.maintenance_enabled')])
                </div>
            </div>
            <div class="card-footer text-right">
                <div class="btn-group">
                    <button class="btn btn-success" type="submit">{{ __('core::button.save') }}</button>
                </div>
            </div>
        </div>
    </form>
@stop
