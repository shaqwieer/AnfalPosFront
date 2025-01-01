<script setup>

import { computed } from 'vue';

import { useMainStore } from '@/stores/mainStore';
const mainStore = useMainStore();
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const containerClass = computed(() => ({
    rtl: mainStore.isRTL,
    ltr: !mainStore.isRTL
}));
const visible = defineModel(false);
// eslint-disable-next-line no-unused-vars
const props = defineProps({
    confirmDelete: {
        type: Function,
        required: true
    },
    closeDialog: {
        type: Function,
        required: false
    },
    deleteText: {
        type: String,
        required: false,
        default: ''
    },
    deletedKey: {
        type: String,
        required: false,
    },

});
</script>
<template>
    <Dialog v-model:visible="visible" :modal="true" :breakpoints="{ '640px': '25rem' }" :class="containerClass" :style="{ width: '35rem' }">
        <div class="flex flex-column align-items-center justify-content-center gap-6">
            <span class="text-2xl mx-auto text-center font-bold">{{ t('deleteDialog.confirmDelete', { deleteText }) }}</span>
            <div class="flex justify-content-evenly align-items-center gap-6 p-3 w-full">
                <Button
                    :label="t('deleteDialog.delete')"
                    icon="pi pi-times"
                    severity="danger"
                    @click="
                        () => {
                            confirmDelete(deletedKey);
                            visible = false;
                        }
                    "
                />
                <Button
                    :label="t('deleteDialog.cancel')"
                    icon="pi pi-check"
                    @click="
                        () => {
                            //closeDialog();
                            visible = false;
                        }
                    "
                />
            </div>
        </div>
    </Dialog>
</template>
