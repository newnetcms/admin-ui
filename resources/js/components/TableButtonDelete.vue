<template>
    <a :href="urlDelete" class="btn btn-danger-soft btn-sm" @click.prevent="handleDelete">
        <i class="far fa-trash-alt"></i>
    </a>
</template>

<script>
    export default {
        props: {
            urlDelete: {
                required: true,
                type: String
            }
        },
        methods: {
            handleDelete() {
                swal({
                    title: this.$t("table_button_delete.title"),
                    text: this.$t("table_button_delete.text"),
                    type: "warning",
                    showCancelButton: true,
                    cancelButtonText: this.$t("table_button_delete.no"),
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: this.$t("table_button_delete.yes"),
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, () => {
                    this.axios.delete(this.urlDelete).then(res => {
                        if (res.data.success) {
                            window.location.reload();
                        } else {
                            this.showDeleteError(res.data.message);
                        }
                    }).catch(err => {
                        this.showDeleteError(err.response && err.response.data && err.response.data.message);
                    });
                });
            },
            showDeleteError(message) {
                swal({
                    title: this.$t("table_button_delete.error"),
                    text: message || this.$t("table_button_delete.error_message"),
                    type: "error"
                });
            }
        }
    }
</script>
