@if($errors->count())
    <div class="flash-block" style="padding: 2rem 2rem 0;">
        <div class="form-error-block">
            <div class="alert alert-danger">
                @foreach($errors->all() as $error)
                    <div>{{ $error }}</div>
                @endforeach
            </div>
        </div>
    </div>
@endif
