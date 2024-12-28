<div class="form-group row component-{{ $name }}">
    <label for="{{ $name }}" class="col-12 col-form-label font-weight-600">{{ $label }}</label>
    <div class="col-12">
        <textarea name="{{ $name }}"
                  id="{{ $name }}"
                  class="form-control code-editor @error($name) is-invalid @enderror d-none"
                  placeholder="{{ $placeholder ?? $label }}"
        ></textarea>

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

@push('styles')
    <style>
        .component-{{ $name }} .cm-editor {
            height: 400px;
        }
    </style>
@endpush

@push('scripts')
    <textarea class="d-none" id="{{ $name }}_content">{{ old(get_dot_array_form($name), $value ?? object_get($item, get_dot_array_form($name))) }}</textarea>

    @if ($langType = $lang ?? 'html')
        <script type="importmap">
            {
                "imports": {
                    "codemirror/": "{{ asset('vendor/newnet-admin/plugins/codemirror') }}/"
                }
            }
        </script>
        <script async type="module">
            import { basicSetup, EditorView } from "codemirror/codemirror/dist/index.js";
            import { {{ $langType }} } from "codemirror/lang-{{ $langType }}/dist/index.js";

            let textarea = document.getElementById('{{ $name }}');
            let content = document.getElementById('{{ $name }}_content');

            let view = new EditorView({
                doc: content.value,
                extensions: [basicSetup, {{ $langType }}()],
            });

            textarea.insertAdjacentElement("afterend", view.dom);
            textarea.closest('form').onsubmit = function () {
                textarea.value = view.state.doc;
            }
        </script>
    @endif
@endpush
