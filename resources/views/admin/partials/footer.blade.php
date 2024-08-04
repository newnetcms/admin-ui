<footer class="footer-content">
    <div class="footer-text d-flex align-items-center justify-content-between">
        <div class="copy">© {{ date('Y') }} {{ setting('site_title', 'Newnet') }}</div>
        <div class="credit">
            {!! config('core.credit') !!}
            v{{ Newnet::version() }}
        </div>
    </div>
</footer>
<div class="overlay"></div>
