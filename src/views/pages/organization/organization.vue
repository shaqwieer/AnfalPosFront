<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { FilterMatchMode } from 'primevue/api';
import apiClient from '@/api/apiClient';
import CreateUpdateDialog from '@/views/pages/organization/CreateUpdateDialog.vue';
import { useOrganizationStore } from '@/stores/organizationStore';
import ImageLoader from '@/components/ImageLoader.vue';
import { handleError } from '@/utilities/errorHandler';
import placeHolderPhoto from '@/assets/images/placeholder.jpg';
import { provide } from 'vue';

const organizationStore = useOrganizationStore();
const invoiceTemplates = computed(() => organizationStore.lookups.invoiceTemplates);
const organizationTypes = computed(() => organizationStore.lookups.organizationTypes);
const organizationConfigs = computed(() => organizationStore.lookups.organizationConfigs);

const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);
const containerClass = computed(() => ({
  rtl: mainStore.isRTL,
  ltr: !mainStore.isRTL
}));
const { t } = useI18n();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const entities = ref([]);
// Pagination Options
const paginatedEntities = computed(() => {
  return entities.value.slice(first.value, first.value + rows.value);
});

const totalRecords = ref(0);
const rows = ref(12);
const first = ref(0);

const getOrganizations = async () => {
  try {
    const response = await apiClient.get(`/Organizations`);
    entities.value = response.data.data;
    totalRecords.value = entities.value.length;
    updatePaginatedData();
  } catch (err) {
    handleError(err, mainStore.loading);
  }
};
provide('getOrganizations', getOrganizations);

onMounted(async () => {
  getOrganizations();
});
const updatePaginatedData = () => {
  paginatedEntities.value = entities.value.slice(first.value, first.value + rows.value);
};
watch([first, rows], () => {
  updatePaginatedData();
});
const onFirstChange = (newFirst) => {
  first.value = newFirst;
};

const onRowsChange = (newRows) => {
  rows.value = newRows;
  first.value = 0; // Reset to first page when rows per page changes
};

const onPageChange = (event) => {
  first.value = event.first;
  rows.value = event.rows;
};
// Deactivate Activate Organization
const activateDeactivateVisible = ref(false);
const activationStatus = ref(false);
let selectedOrganizationUniqueIdentifier = '';
const toggleActivateDeactivateDialog = (status, uniqueIdentifier) => {
  activationStatus.value = status;
  selectedOrganizationUniqueIdentifier = uniqueIdentifier;
  activateDeactivateVisible.value = !activateDeactivateVisible.value;
};
const activateDeactivateOrganization = async () => {
  try {
    const response = await apiClient.post(`/Organizations/DeActivateActivate/${selectedOrganizationUniqueIdentifier}`);
    const index = entities.value.findIndex((entity) => entity.uniqueIdentifier === selectedOrganizationUniqueIdentifier);
    entities.value[index].isDeActivated = !entities.value[index].isDeActivated;
    mainStore.loading.setNotificationInfo('success', response.data.message);
    activateDeactivateVisible.value = false;
  } catch (err) {
    handleError(err, mainStore.loading);
  }
};
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

const editData = async (id, data) => {
  try {
    const response = await apiClient.put('/Organizations/UpdateWithLogo', data);
    response.data.data.organizationTypeName = organizationTypes.value.find((e) => e.id === response.data.data.organizationTypeId).name;
    response.data.data.invoiceTemplateName = invoiceTemplates.value.find((e) => e.id === response.data.data.invoiceTemplateId).name;
    const index = entities.value.findIndex((entity) => entity.id === id);
    entities.value[index] = { ...entities.value[index], ...response.data.data };
    mainStore.loading.setNotificationInfo('success', response.data.message);
  } catch (err) {
    handleError(err, mainStore.loading);
  }
  toggleCreateEditDialog(true, {}, true);
};
const addData = async (data) => {
  try {
    const response = await apiClient.post('/Organizations/CreateWithLogo', data);
    response.data.data.organizationTypeName = organizationTypes.value.find((e) => e.id === response.data.data.organizationTypeId).name;
    response.data.data.invoiceTemplateName = invoiceTemplates.value.find((e) => e.id === response.data.data.invoiceTemplateId).name;
    entities.value.push(response.data.data);
    mainStore.loading.setNotificationInfo('success', response.data.message);
  } catch (err) {
    handleError(err, mainStore.loading);
  }
  toggleCreateEditDialog(true, {}, true);
};
</script>
<template>
  <div :class="['grid px-6', { 'rtl-direction': rtl }]">
    <!-- <SmartUplaoder /> -->
    <div class="col-12">
      <h3 class="text-700 text-xl font-semibold">{{ t('organizationHeader') }}</h3>
      <p class="text-500 text-base">{{ t('organizationDescription') }}</p>
    </div>

    <div class="flex justify-content-center lg:justify-content-end col-12">
      <Button :label="t('organizationAddButton')" @click="toggleCreateEditDialog(true, {}, false)" class="p-button p-component px-4 py-2 bg-primary text-white border-round flex align-items-center gap-2" />
    </div>

    <div class="col-12 md:col-6 lg:col-4 xl:col-3" v-for="data in paginatedEntities" :key="data.id">
      <Card style="width: 100%; overflow: hidden; min-width: 200px; max-width: 300px; height: 300px" class="p-4 flex flex-column justify-content-between">
        <template #header>
          <ImageLoader class="w-full h-8rem" alt="Logo" :src="data.logoImageUrl != null ? data.logoImageUrl : placeHolderPhoto" />
        </template>
        <template #title>{{ data.name }}</template>
        <template #subtitle>
          <div class="flex justify-content-between p-0">
            <span class="text-base text-400 font-semibold">{{ data.organizationTypeName }}</span>
            <Tag :class="!data.isDeActivated ? 'bg-green-100 text-green-800' : 'danger'" :value="!data.isDeActivated ? `${t('organizationActive')}` : `${t('organizationDeactivated')}`"></Tag>
          </div>
        </template>
        <template #footer>
          <div class="flex gap-1 mt-1 p-0">
            <!-- <Button :label="t('organizationUpdateButton')" @click="toggleCreateEditDialog(false, data, false)" severity="info" class=" h-2rem text-xs xl:text-sm" /> -->
            <Button :label="t('organizationUpdateButton')" @click="toggleCreateEditDialog(false, data, false)" severity="info" class="p-button p-component w-full px-4 py-2 bg-primary text-white border-round flex align-items-center gap-2" />

            <Button
              :label="data.isDeActivated ? `${t('organizationActiveAction')}` : `${t('organizationDeactivatedAction')}`"
              @click="toggleActivateDeactivateDialog(data.isDeActivated, data.uniqueIdentifier)"
              :severity="data.isDeActivated ? 'success' : 'danger'"
              outlined
              class="p-button p-component w-full px-1 py-2 border-round flex align-items-center gap-2"
            />
          </div>
        </template>
      </Card>
    </div>
    <div class="col-12 flex justify-content-center mt-4">
      <Paginator :first="first" :rows="rows" :totalRecords="totalRecords" :rowsPerPageOptions="[6, 12, 18, 24]" @update:first="onFirstChange" @update:rows="onRowsChange" @page="onPageChange" />
    </div>
  </div>
  <!-- Add Dialog -->
  <CreateUpdateDialog
    v-model="updateAddDialogVisible"
    :closeDialog="
      () => {
        toggleCreateEditDialog(true, {}, true);
      }
    "
    dismissableMask
    :IsAdd="isAddFlag"
    :selectedData="updateData"
    :createElement="addData"
    :editElement="editData"
    :load="load"
  >
  </CreateUpdateDialog>

  <Dialog dismissableMask v-model:visible="activateDeactivateVisible" :modal="true" :breakpoints="{ '640px': '25rem' }" :class="containerClass" :style="{ width: '30rem' }">
    <div class="flex flex-column align-items-center justify-content-center gap-6">
      <span class="text-xl mx-auto text-center font-bold">{{ t('activationDialog.confirmActivation') }}</span>
      <div class="flex justify-content-evenly align-items-center gap-6 p-3 w-full">
        <Button
          :label="activationStatus ? t('activationDialog.activate') : t('activationDialog.deactivate')"
          :severity="activationStatus ? 'success' : 'danger'"
          class="w-full h-2rem text-xs xl:text-sm"
          @click="
            () => {
              activateDeactivateOrganization();
            }
          "
        />
        <Button
          :label="t('deleteDialog.cancel')"
          outlined
          class="w-full h-2rem text-xs xl:text-sm"
          @click="
            () => {
              toggleActivateDeactivateDialog();
            }
          "
        />
      </div>
    </div>
  </Dialog>
</template>
<style>
.p-dialog-mask {
  background: #5b5b5b3b !important;
}
.p-card .p-card-body {
  padding: 0 !important;
}

</style>
<style scoped>
:deep(.p-card .p-card-content) {
  padding: 0% !important;
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
  padding-right: 1rem;
}
.rtl-direction :deep(.p-paginator .p-paginator-first) {
  rotate: 180deg !important;
}
.rtl-direction :deep(.p-paginator .p-paginator-prev) {
  rotate: 180deg !important;
}
.rtl-direction :deep(.p-paginator .p-paginator-next) {
  rotate: 180deg !important;
}
.rtl-direction :deep(.p-paginator .p-paginator-last) {
  rotate: 180deg !important;
}
:deep(.p-paginator) {
  background-color: transparent;
}
.h-2rem {
  height: 3rem !important;
}
</style>
