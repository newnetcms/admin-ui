<?php

namespace Newnet\AdminUi;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Lavary\Menu\Builder;

class AdminMenuBuilder extends Builder
{
    const ADMIN_MENU_NAME = 'admin_menu';

    protected array $extendOptions = ['icon', 'permission', 'order', 'public'];

    protected array $rawItems = [];

    protected array $menuPaths = [];

    protected bool $rawLoaded = false;

    public function __construct()
    {
        $name = self::ADMIN_MENU_NAME;
        $conf = config('core.admin_menu');

        parent::__construct($name, $conf);
    }

    public function loadMenuFrom($path)
    {
        $this->menuPaths[] = $path;
    }

    public function load()
    {
        if ($this->rawLoaded) {
            return $this;
        }

        foreach (array_unique($this->menuPaths) as $path) {
            if (File::exists($path)) {
                require_once $path;
            }
        }

        $items = collect($this->rawItems)->sortBy('parent');
        $loop = 0;
        $maxLoop = $items->count() * 5;

        while ($items->count()) {
            $item = $items->first();

            if (!empty($item['parent']) && !$this->{$item['parent']}) {
                $loop++;
                $items->push($item);
                $items->shift();
            } else {
                $this->addRawItem($item['title'], $item);
                $items->shift();
            }

            if ($loop >= $maxLoop) {
                Log::error('Infinite Loop Load AdminMenu', $items->toArray());
                break;
            }
        }

        $this->rawLoaded = true;

        return $this;
    }

    public function add($title, $options = '')
    {
        $id = isset($options['id']) ? $options['id'] : $this->id();

        $item = new AdminMenuItem($this, $id, $title, $options);

        $this->items->push($item);

        return $item;
    }

    public function addItem($title, $options = [])
    {
        $options['title'] = $title;
        $this->rawItems[] = $options;
    }

    public function activeMenu($menuId)
    {
        $this->load();

        if ($findMenu = $this->get($menuId)) {
            $findMenu->activate();
        }
    }

    public function filterPermisison()
    {
        return $this->filter(function ($item) {
            if ($item->hasChildren()) {
                return true;
            }

            $permission = $item->data('permission');
            if ($permission) {
                return admin_can($permission);
            }

            $route = $item->data('route');
            if ($route) {
                return admin_can($route);
            }

            return true;
        });
    }

    public function filterChildren()
    {
        return $this->filter(function ($item) {
            if ($item->url() != '#') {
                return true;
            }

            $checkArr = [];

            foreach ($item->children() as $child) {
                if ($child->hasChildren() || $child->url() != '#') {
                    $checkArr[] = true;
                }
            }

            return (bool) count(array_filter($checkArr));
        });
    }

    protected function addRawItem($title, $options = [])
    {
        if (isset($options['parent']) && !$this->{$options['parent']}) {
            unset($options['parent']);
        }

        if (empty($options['route']) && empty($options['href'])) {
            $options['href'] = '#';
        }

        if (!empty($options['route']) && empty($options['public']) && empty($options['permission'])) {
            $options['permission'] = $options['route'];
        }

        $item = $this->add($title, Arr::except($options, $this->extendOptions));

        if (isset($options['href'])) {
            $item->link->href($options['href']);
        }

        foreach ($this->extendOptions as $extend) {
            if (isset($options[$extend])) {
                $item->data($extend, $options[$extend]);
            }
        }

        if (!empty($options['id']) && empty($options['nickname'])) {
            $item->nickname($options['id']);
        }

        return $item;
    }
}
