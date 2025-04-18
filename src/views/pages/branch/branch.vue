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

const totalRecords = ref(0);
const rows = ref(6);
const first = ref(0);

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
  return entities.value.slice(first.value, first.value + rowsPerPage.value);
});

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

const rowsPerPage = ref(6);
const currentPage = ref(0);

const onPageChange = (event) => {
  currentPage.value = event.page ?? 0;
};

const onRowsChange = (newRows) => {
  rowsPerPage.value = newRows;
  currentPage.value = 0;
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
    console.log(data);
  } catch (err) {
    handleError(err, mainStore.loading);
  }
  toggleCreateEditDialog(true, {}, true);
};

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log('تم نسخ النص:', text);
    })
    .catch((err) => console.error('فشل النسخ:', err));
};
</script>
<template>
  <div :class="['grid px-6', { 'rtl-direction': rtl }]">
    <div class="flex flex-column row-gap-5 px-3 lg:flex-row justify-content-between mb-5 lg:mb-0">
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

    <div class="grid" style="min-width: 100%">
      <!-- v-for="data in paginatedEntities" :key="data.id" -->
      <div v-for="(data, index) in paginatedEntities" :key="index" class="col-12 lg:col-6 xl:col-4">
        <div class="card mb-0 flex flex-column justify-content-between relative">
          <Tag class="absolute" style="right: 12px; top: 12px" :class="!data.isDeActivated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" :value="!data.isDeActivated ? 'Active' : 'Inactive'"></Tag>

          <div style="right: 12px; top: 42px" v-if="data.branchTypeName == 'VAN'" v-tooltip.top="data.branchTypeName" class="absolute w-3rem h-3rem border-round-lg bg-blue-50 flex align-items-center justify-content-center">
            <i class="pi pi-truck text-blue-500 text-xl"></i>
          </div>

          <div class="flex justify-content-between">
            <div class="">
              <!-- <span class="block text-500 font-medium mb-3">{{ t('RoleCard.totalUsers', { count: data.users.length }) }}</span> -->
              <div class="text-900 font-medium text-xl">{{ data.name }}</div>
              <div class="block text-500 font-medium mb-3">{{ data.cityName }},{{ data.countryName }}</div>
              <div class="block text-500 font-medium mb-2"></div>

              <div class="block text-500 font-sm">
                <i class="pi pi-phone mr-2"></i>
                {{ data.primaryPhone }}
              </div>
              <div class="block text-500 font-sm">
                <i class="pi pi-envelope mr-2"> </i>
                {{ data.email }}
              </div>
              <div class="block text-500 font-sm mb-3">
                <i class="pi pi-map-marker mr-2"></i>
                {{ data.address }}
              </div>
            </div>

            <!-- <div class="flex align-items-center justify-content-center">
              <AvatarGroup>
                <Avatar @click="copyToClipboard(data.primaryPhone)" v-html="'<i class=\'pi pi-phone \'></i>'" v-tooltip.top="data.primaryPhone" size="large" shape="circle" class="avatar-hover-animation cursor-pointer" />
                <Avatar @click="copyToClipboard(data.email)" v-html="'<i class=\'pi pi-envelope \'></i>'" v-tooltip.top="data.email" size="large" shape="circle" class="avatar-hover-animation cursor-pointer" />
                <Avatar @click="copyToClipboard(data.address)" v-html="'<i class=\'pi pi-map-marker \'></i>'" v-tooltip.top="data.address" size="large" shape="circle" class="avatar-hover-animation cursor-pointer" />
              </AvatarGroup>
            </div> -->
          </div>
          <div class="flex justify-content-between">
            <Button :label="t('organizationUpdateButton')" @click="toggleCreateEditDialog(false, data, false)" class="h-2rem border-1 text-primary" severity="secondary" outlined />

            <Button
              :label="data.isDeActivated ? `${t('organizationActiveAction')}` : `${t('organizationDeactivatedAction')}`"
              @click="toggleActivateDeactivateDialog(data.isDeActivated, data.id)"
              :severity="data.isDeActivated ? 'success' : 'danger'"
              :class="data.isDeActivated ? 'bg-white border-green-500 text-green ' : '   bg-white border-red-500 text-red-500'"
              class="h-2rem"
              outlined
            />
          </div>
        </div>
      </div>
    </div>

    <div class="w-full flex justify-content-center mt-4">
      <Paginator class="w-full" :first="first" @update:rows="onRowsChange" @page="onPageChange" @update:first="onFirstChange" :totalRecords="totalRecords" :rows="rowsPerPage" :rowsPerPageOptions="[6, 12, 18, 24, 30]" />
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

.avatar-hover-animation {
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.avatar-hover-animation:hover {
  transform: scale(1.2);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
</style>
