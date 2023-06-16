# Package Admin UI

---

## Danh cho môi trường production:

Publish vendor:

```bash
php artisan vendor:publish --tag=admin-ui
```

## Dành cho môi trường development:

### 1. Link thư mục assets

```bash
cms:admin-ui.link
```

### 2. Build file assets

```bash
npm install
```

```bash
npm run watch
```

```bash
npm run prod
```
