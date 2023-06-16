<template>
    <div class="newnet-tree">
        <el-tree
                :data="data"
                show-checkbox
                node-key="key"
                v-model="value"
                ref="tree"
                :default-checked-keys="checked"
                @check-change="handleCheckChange">
        </el-tree>
        <textarea v-if="name" :name="name" style="display: none;">{{ checked }}</textarea>
    </div>
</template>

<script>
    export default {
        props: {
            name: {
                type: String
            },
            data: {
                required: true,
                type: Array
            },
            value: {
                required: true,
            },
        },
        data() {
            return {
                checked: this.value || [],
            }
        },
        methods: {
            handleCheckChange() {
                this.checked = this.$refs.tree.getCheckedKeys().filter(function(item){
                    return !!item;
                });

                this.$emit('input', this.checked);
            },
        }
    }
</script>
