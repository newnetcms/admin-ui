<?php

namespace Newnet\AdminUi\Facades;

use Illuminate\Support\Facades\Facade;
use Newnet\AdminUi\AdminMenuBuilder;

class AdminMenu extends Facade
{
    protected static function getFacadeAccessor()
    {
        return AdminMenuBuilder::class;
    }
}
