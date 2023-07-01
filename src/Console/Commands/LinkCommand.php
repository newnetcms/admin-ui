<?php

namespace Newnet\AdminUi\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class LinkCommand extends Command
{
    protected $name = 'cms:link-admin-ui';

    protected $description = 'Link Admin UI into public for developemnt';

    public function handle()
    {
        $target = realpath(__DIR__.'/../../../public/newnet-admin');
        $link = public_path('vendor/newnet-admin');

        if (!File::isDirectory(public_path('vendor'))) {
            File::makeDirectory(public_path('vendor'), 0755, true);
        }

        if (!File::exists($link)) {
            File::link($target, $link);

            $this->info($target.' <=> '.$link);
        } else {
            $this->error('Target is exists: '.$link);
        }
    }
}
