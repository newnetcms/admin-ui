@if(session()->has('success'))
    <div class="flash-block" style="padding: 2rem 2rem 0;">
        <div class="alert alert-success">
            {{ session()->get('success') }}
        </div>
    </div>
@endif

@if(session()->has('error'))
    <div class="flash-block" style="padding: 2rem 2rem 0;">
        <div class="alert alert-danger">
            {{ session()->get('error') }}
        </div>
    </div>
@endif

@if(session()->has('warning'))
    <div class="flash-block" style="padding: 2rem 2rem 0;">
        <div class="alert alert-warning">
            {{ session()->get('warning') }}
        </div>
    </div>
@endif
