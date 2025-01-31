<template>
    <div class="flex flex-column w-full">
        <div class="flex justify-content-between card bg-primary p-4 align-items-center">
            <span class="text-2xl font-bold">{{ props.title }}</span>
            <slot name="close"></slot>

            <div class="flex gap-3 " v-if="(simple && hasSearch) || hasReload || hasAddButton">
                <IconField v-if="simple && hasSearch" iconPosition="left">
                    <InputText type="text" v-model="searchText" :placeholder="t('labels.search')" class="w-full" />
                    <InputIcon class="pi pi-search" />
                </IconField>

                <slot v-if="hasReload" name="action"></slot>

                <Button
                    size="small"
                    v-if="props.extraText"
                    @click="
                        () => {
                            props.extraButton();
                        }
                    "
                    ><font-awesome-icon :icon="extraIcon" /><span class="hidden md:inline">{{ extraText }}</span>
                </Button>
                <Button
                    v-if="hasAddButton"
                    size="small"
                    class="min-w-max flex gap-2  bg-white text-black-alpha-80"
                    @click="
                        () => {
                            props.addButton();
                        }
                    "
                >
                    <font-awesome-icon :icon="'plus'" /><span class="hidden md:inline">{{ addText }}</span>
                </Button>
            </div>
        </div>
        <div v-if="!simple" class="flex justify-content-between mx-3">
            <IconField iconPosition="left" class="w-9 flex" v-if="fromInvoice == false">
                <InputText type="text" v-model="searchText" :placeholder="t('labels.search')" class="w-full" />
                <InputIcon class="pi pi-search" />
            </IconField>
            <SelectButton v-model="value" :options="options" optionLabel="value" dataKey="value" optionValue="value" :allowEmpty="false" aria-labelledby="custom" :class="['flex', mainStore.isRTL ? 'flex-row-reverse' : 'flex-row']">
                <template #option="slotProps">
                    <i :class="slotProps.option.icon"></i>
                </template>
            </SelectButton>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
const { t } = useI18n();
const mainStore = useMainStore();
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    addText: {
        type: String,
        default: 'Add'
    },
    addButton: {
        type: Function,
        default: () => {}
    },
    hasAddButton: {
        type: Boolean,
        default: true
    },
    hasSearch: {
        type: Boolean,
        default: true
    },
    hasReload: {
        type: Boolean,
        default: false
    },
    extraText: {
        type: String,
        default: ''
    },
    extraButton: {
        type: Function,
        default: () => {}
    },
    extraIcon: {
        type: String,
        default: ''
    },
    simple: {
        type: Boolean,
        default: false
    },
    fromInvoice: {
        type: Boolean,
        default: false
    }
});
const searchText = defineModel('searchText', { default: '', type: String });
const value = defineModel('value', { default: 'grid', type: String });
const options = ref([
    { icon: 'pi pi-bars', value: 'list' },
    { icon: 'pi pi-th-large', value: 'grid' }
]);
</script>
<style scoped>
.rtl-direction :deep(.p-selectbutton .p-button-group .p-component) {
    flex-direction: row-reverse !important;
}
</style>
