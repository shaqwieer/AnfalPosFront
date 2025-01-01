<script setup>
import { onMounted, ref, computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useCityStore } from '@/stores/cityStore';
import { useI18n } from 'vue-i18n';
import { FilterMatchMode } from 'primevue/api';
import CreateUpdateDialog from '@/views/pages/city/CreateUpdateDialog.vue';
import DeleteDialog from '@/components/DeleteDialog.vue';
const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);
const { t } = useI18n();
const cityStore = useCityStore();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
onMounted(async () => {
    await cityStore.getCities();
});
const cities = computed(() => cityStore.cities);
//Editing/Adding Setting
const load = ref(false);
const updateAddDialogVisible = ref(false);
const updateData = ref({});
const isAddFlag = ref(true);
const toggleCreateEditDialog = (addFlag, data, close) => {
    if (!addFlag && !close) {
        updateData.value = data;
        isAddFlag.value = false;
        load.value = true;
    } else if (addFlag && !close) {
        updateData.value = data;
        isAddFlag.value = true;
        load.value = true;
    } else {
        load.value = false;
    }
    updateAddDialogVisible.value = !updateAddDialogVisible.value;
};
//Delete setting
const deleteDialogVisible = ref(false);
const deletedData = ref('');
const deletedKey = ref('');
const toggleDeleteDialog = (data, close) => {
    if (!close) {
        deletedData.value = data.name;
        deletedKey.value = data.id;
    }

    deleteDialogVisible.value = !deleteDialogVisible.value;
};
const confirmDelete = async (id) => {
    await cityStore.deleteCity(id);
    toggleDeleteDialog({}, true);
};

const editData = async (id, newData) => {
    await cityStore.updateCity(id, newData);
    toggleCreateEditDialog(true, {}, true);
};
const addData = async (data) => {
    await cityStore.createCity(data);
    toggleCreateEditDialog(true, {}, true);
};
</script>
<template>
    <div class="grid">
        <div class="col-12">
            <div :class="['card', { 'rtl-direction': rtl }]">
                <DataTable :value="cities" dataKey="id" :paginator="true" :rows="10" :filters="filters" :globalFilterFields="['name']" :rowsPerPageOptions="[5, 10, 25]">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">{{ t('cityPage.manage') }}</h5>
                            <div class="flex gap-2">
                                <IconField :iconPosition="rtl ? 'left' : 'right'" class="block mt-2 md:mt-0">
                                    <InputIcon class="pi pi-search" />
                                    <InputText class="w-full sm:w-auto" v-model="filters['global'].value" :placeholder="t('cityPage.searchPlaceholder')" />
                                </IconField>
                                <Button :label="t('cityPage.createButtonLabel')" v-tooltip.top="t('cityPage.createButtonLabel')" icon="pi pi-plus" @click="toggleCreateEditDialog(true, {}, false)" />
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <div class="flex justify-content-center align-items-center font-bold text-lg">
                            {{ t('cityPage.emptyMessage') }}
                        </div></template
                    >

                    <Column field="name" :header="t('cityPage.nameHeader')" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="font-semibold text-md">{{ slotProps.data.name }}</span>
                        </template>
                    </Column>

                    <Column field="countryName" :header="t('cityPage.countryNameHeader')" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <span class="font-semibold text-md">{{ slotProps.data.countryName }}</span>
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div class="flex flex-wrap gap-3">
                                <Button icon="pi pi-trash" class="w-4rem" text rounded v-tooltip.top="t('cityPage.deleteTooltip')" severity="danger" @click="toggleDeleteDialog(slotProps.data, false)" />
                                <Button icon="pi pi-pencil" class="w-4rem" text rounded v-tooltip.top="t('cityPage.updateTooltip')" severity="success" @click="toggleCreateEditDialog(false, slotProps.data, false)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
    <DeleteDialog
        v-model:visible="deleteDialogVisible"
        :confirmDelete="confirmDelete"
        :closeDialog="
            () => {
                toggleDeleteDialog({}, true);
            }
        "
        :deletedKey="deletedKey"
        :deleteText="deletedData"
    />
    <!-- Add Dialog -->
    <CreateUpdateDialog
        v-model="updateAddDialogVisible"
        :closeDialog="
            () => {
                toggleCreateEditDialog(true, {}, true);
            }
        "
        :IsAdd="isAddFlag"
        :selectedData="updateData"
        :createElement="addData"
        :editElement="editData"
        :load="load"
    >
    </CreateUpdateDialog>
</template>
<style scoped>
.rtl-direction :deep(.p-datatable .p-datatable-tbody > tr > td) {
    text-align: right;
}
:deep(.p-paginator .p-dropdown .p-dropdown-label) {
    padding-right: 1rem;
}
.rtl-direction :deep(.p-paginator .p-paginator-first) {
    rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-prev) {
    rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-next) {
    rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-last) {
    rotate: 180deg;
}
</style>
