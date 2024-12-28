<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <textarea name="{{ $name }}"
                  id="{{ $name }}"
                  class="form-control code-editor @error($name) is-invalid @enderror d-none"
                  placeholder="{{ $placeholder ?? $label }}"
        ></textarea>

        <div id="ace_{{ $name }}"></div>

        @error(get_dot_array_form($name))
            <span class="invalid-feedback text-left">
                <strong>{{ $message }}</strong>
            </span>
        @enderror

        @if(!empty($helper))
            <span class="helper-block">
                {!! $helper !!}
            </span>
        @endif
    </div>
</div>

@assetadd(asset('vendor/newnet-admin/plugins/ace/ace.js'))

@push('styles')
    <style>
        #ace_{{ $name }} {
            height: 275px;
            margin-top: 5px;
        }
    </style>
@endpush

@push('scripts')
    <textarea class="d-none" id="{{ $name }}_content">{{ old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name))) }}</textarea>

    <script>
        jQuery(document).ready(function ($) {
            let textarea = document.getElementById('{{ $name }}');
            let content = document.getElementById('{{ $name }}_content');

            let editor = ace.edit("ace_{{ $name }}");
            editor.session.setMode("ace/mode/html");
            editor.setAutoScrollEditorIntoView(true);
            editor.setShowPrintMargin(false);
            editor.setOption("enableEmmet", true);
            editor.setOptions({
                enableSnippets: true,
                enableBasicAutocompletion: true
            });

            let fromSetValue = false;
            editor.on("change", function() {
                if (!fromSetValue) {
                    textarea.value = editor.getValue();
                }
            })
            fromSetValue = true;
            editor.setValue(content.value, -1);
            fromSetValue = false;
        });
    </script>
@endpush
