<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { FilterMatchMode } from 'primevue/api';
import apiClient from '@/api/apiClient';
import CreateUpdateDialog from '@/views/pages/branch/CreateUpdateDialog.vue';
import { useOrganizationStore } from '@/stores/organizationStore';
import ImageLoader from '@/components/ImageLoader.vue';
import { handleError } from '@/utilities/errorHandler';
import placeHolderPhoto from '@/assets/images/placeholder.jpg';

const organizationStore = useOrganizationStore();
const countries = computed(() => organizationStore.branchLookups.countries);
const cities = computed(() => organizationStore.branchLookups.cities);
const branchTypes = computed(() => organizationStore.branchLookups.branchTypes);

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
onMounted(async () => {
  try {
    const response = await apiClient.get(`/Branches`);
    entities.value = response.data.data;
    totalRecords.value = entities.value.length;
    updatePaginatedData();
  } catch (err) {
    handleError(err, mainStore.loading);
  }
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
const toggleActivateDeactivateDialog = (status, id) => {
  activationStatus.value = status;
  selectedOrganizationUniqueIdentifier = id;
  activateDeactivateVisible.value = !activateDeactivateVisible.value;
};
const activateDeactivateOrganization = async () => {
  try {
    const response = await apiClient.post(`/Branches/DeActivateActivate/${selectedOrganizationUniqueIdentifier}`);
    const index = entities.value.findIndex((entity) => entity.id === selectedOrganizationUniqueIdentifier);
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
    const response = await apiClient.put(`/Branches/${id}`, data);
    response.data.data.branchTypeName = branchTypes.value.find((e) => e.id === response.data.data.branchTypeId).name;
    response.data.data.countryName = countries.value.find((e) => e.id === response.data.data.countryId).name;
    response.data.data.cityName = cities.value.find((e) => e.id === response.data.data.cityId).name;
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
    const response = await apiClient.post('/Branches', data);
    response.data.data.branchTypeName = branchTypes.value.find((e) => e.id === response.data.data.branchTypeId).name;
    response.data.data.countryName = countries.value.find((e) => e.id === response.data.data.countryId).name;
    response.data.data.cityName = cities.value.find((e) => e.id === response.data.data.cityId).name;
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
    <div class="flex flex-column row-gap-5 px-3 lg:flex-row justify-content-between">
      <div class="lg:col-8 px-0 pt-2">
        <h3 class="text-700 text-3xl font-semibold">{{ t('branch.Header') }}</h3>
        <p class="text-500 text-lg">{{ t('branch.Description') }}</p>
      </div>
      <div class="flex cursor-pointer flex-row justify-content-center gap-2 align-items-center bg-primary text-white border-round h-3rem w-full lg:w-14rem" @click="toggleCreateEditDialog(true, {}, false)">
        <div class="">+</div>
        <div class="">{{ t('AddBranch') }}</div>
      </div>
    </div>

    <!-- <SmartUplaoder /> -->

    <div class="col-12 md:col-6 lg:col-4 xl:col-4" v-for="data in paginatedEntities" :key="data.id">
      <Card style="width: 100%; overflow: hidden; min-width: 200px; border-top: 5px solid" class="flex h-full p-4 justify-content-between border-primary flex-column col-12 md:col-6 lg:col-4 xl:col-3 border-round p-0">
        <template #header>
          <div class="w-full h-8rem bg-primary flex align-items-center justify-content-center border-round">
            <h2 class="text-xl font-bold text-white">{{ data.name }}</h2>
          </div>
        </template>

        <template #title>
          <div class="flex justify-content-between gap-1 align-items-center pt-3">
            <span class="text-xl">{{ data.cityName }},{{ data.countryName }}</span>
            <Tag :class="!data.isDeActivated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" :value="!data.isDeActivated ? 'Active' : 'Inactive'"></Tag>
          </div>
        </template>
        <template #subtitle>
          <span class="text-base text-500 font-semibold">{{ data.branchTypeName }}</span>
        </template>
        <template #content>
          <div class="flex flex-column gap-2">
            <div class="flex gap-2 align-items-center">
              <i class="pi pi-phone mr-2"></i>
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ data.primaryPhone }}</span>
            </div>
            <div class="flex gap-2 align-items-center">
              <i class="pi pi-envelope mr-2"></i>
              <span>{{ data.email }}</span>
            </div>
            <div class="flex gap-2 align-items-center">
              <i class="pi pi-map-marker mr-2"></i>
              <span>{{ data.address }}</span>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex gap-3 justify-content-between">
            <Button :label="t('organizationUpdateButton')" @click="toggleCreateEditDialog(false, data, false)" class="p-button shadow-none p-component px-0 py-0 w-6 bg-primary text-white border-round flex align-items-center" />

            <Button
              :label="data.isDeActivated ? `${t('organizationActiveAction')}` : `${t('organizationDeactivatedAction')}`"
              :severity="data.isDeActivated ? 'success' : 'danger'"
              outlined
              class="p-button p-component w-6 border-round shadow-none flex align-items-center gap-2 px-0 py-0 h-3rem"
              @click="toggleActivateDeactivateDialog(data.isDeActivated, data.id)"
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
    :IsAdd="isAddFlag"
    :selectedData="updateData"
    :createElement="addData"
    :editElement="editData"
    :load="load"
  >
  </CreateUpdateDialog>

  <Dialog v-model:visible="activateDeactivateVisible" :modal="true" :breakpoints="{ '640px': '25rem' }" :class="containerClass" :style="{ width: '30rem' }">
    <div class="flex flex-column align-items-center justify-content-center gap-6">
      <span class="text-xl mx-auto text-center font-bold">{{ t('activationDialog.confirmActivation') }}</span>
      <div class="flex justify-content-evenly align-items-center gap-6 p-3 w-full">
        <Button
          :label="activationStatus ? t('activationDialog.activate') : t('activationDialog.deactivate')"
          :severity="activationStatus ? 'success' : 'danger'"
          class="p-button p-component w-6 border-round flex align-items-center gap-2 px-0 py-0 h-3rem"
          @click="
            () => {
              activateDeactivateOrganization();
            }
          "
        />
        <Button
          :label="t('deleteDialog.cancel')"
          outlined
          class="p-button p-component w-6 border-round flex align-items-center gap-2 px-0 py-0 h-3rem"
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
<style scoped>
:deep(.p-card .p-card-body) {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  padding: 0px;
}

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
</style>
