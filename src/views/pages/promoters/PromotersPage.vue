<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import DeleteDialog from '@/components/DeleteDialog.vue';
import PromoterForm from './components/PromoterForm.vue';
import PromotersList from './components/PromotersList.vue';
import { usePromoters } from './composables/usePromoters';
import { handleError } from '@/utilities/errorHandler';

const { t } = useI18n();
const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);

// Composables
const { promoters,filteredPromoters, branches, loading, totalRecords, loadPromoters, loadBranches, createPromoter, updatePromoter, deletePromoter } = usePromoters();

// Component state
const formVisible = ref(false);
const selectedPromoter = ref(null);
const isEditing = ref(false);
const searchQuery = ref('');
const selectedBranch = ref(null);

// Pagination
// const lazyParams = ref({
//   first: 0,
//   rows: 10,
//   page: 0,
//   sortField: 'name',
//   sortOrder: 1
// });

// Computed
const pageTitle = computed(() => (isEditing.value ? t('promoters.editPromoter') : t('promoters.addPromoter')));

// Methods
const openNewPromoterDialog = () => {
  selectedPromoter.value = null;
  isEditing.value = false;
  formVisible.value = true;
};

const openEditPromoterDialog = (promoter) => {
  selectedPromoter.value = { ...promoter };
  isEditing.value = true;
  formVisible.value = true;
};

const handleFormSave = async (promoterData) => {
  try {
    if (isEditing.value) {
      const response = await updatePromoter(selectedPromoter.value.id, promoterData);
      mainStore.loading.setNotificationInfo('success', response.message || t('promoters.promoterUpdated'));
    } else {
      const response = await createPromoter(promoterData);
      mainStore.loading.setNotificationInfo('success', response.message || t('promoters.promoterCreated'));
    }
    formVisible.value = false;
    await loadData();
  } catch (error) {
    // Error handling is done in the composable
  }
};

const handleFormCancel = () => {
  formVisible.value = false;
  selectedPromoter.value = null;
};
const deleteDialogVisible = ref(false);
const deleteText = ref('');
const deletedKey = ref('');
const confirmDelete = async () => {
  try {
    const response = await deletePromoter(deletedKey.value);
    const index = promoters.value.findIndex((entity) => entity.id === deletedKey.value);
    promoters.value.splice(index, 1);
    deleteDialogVisible.value = false;
    mainStore.loading.setNotificationInfo('success', response.message);
  } catch (err) {
    handleError(err, mainStore.loading);
  }
};
const onFilter=()=> {
  const query = searchQuery.value?.toLowerCase().trim();
  const branchId = selectedBranch.value?.id;
  filteredPromoters.value = promoters.value.filter((promoter) => {
    const matchesText =
      !query ||
      promoter.name?.toLowerCase().includes(query) ||
      promoter.contactInfo?.toLowerCase().includes(query);

    const matchesBranch =
      !branchId || promoter.branchId === branchId;

    return matchesText && matchesBranch;
  });
}

const clearFilters = () => {
  searchQuery.value = '';
  selectedBranch.value = null;
  loadData();
};

const loadData = () => {
  const filters = {
    search: searchQuery.value,
    branchId: selectedBranch.value?.id,
    // ...lazyParams.value
  };
  loadPromoters(filters);
};

// Lifecycle
onMounted(async () => {
  await Promise.all([loadBranches(), loadData()]);
});
</script>

<template>
  <div :class="['promoters-page px-6', { 'rtl-direction': rtl }]">
    <!-- Header -->
    <div class="flex flex-column lg:flex-row justify-content-between align-items-start lg:align-items-center mb-5 gap-3">
      <div>
        <h1 class="text-3xl font-semibold text-900 m-0 mb-2">{{ t('promoters.title') }}</h1>
        <p class="text-600 text-lg m-0">{{ t('promoters.description') }}</p>
      </div>
      <Button :label="t('promoters.addPromoter')" icon="pi pi-plus" @click="openNewPromoterDialog" class="p-button-primary" />
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="grid p-4">
        <div class="col-12 md:col-4">
          <label class="block font-medium mb-2">{{ t('promoters.search') }}</label>
          <InputText v-model="searchQuery" :placeholder="t('promoters.searchPlaceholder')" class="w-full" @keyup.enter="onFilter" />
        </div>
        <div class="col-12 md:col-4">
          <label class="block font-medium mb-2">{{ t('promoters.branch') }}</label>
          <Dropdown v-model="selectedBranch" :options="branches" optionLabel="name" :placeholder="t('promoters.selectBranch')" class="w-full" :loading="loading" showClear />
        </div>
        <div class="col-12 md:col-4 flex align-items-end">
          <div class="flex gap-2 w-full">
            <Button :label="t('common.filter')" icon="pi pi-search" @click="onFilter" class="flex-1" />
            <Button :label="t('common.clear')" icon="pi pi-times" severity="secondary" @click="clearFilters" class="flex-1" />
          </div>
        </div>
      </div>
    </div>

    <!-- Promoters List -->
    <PromotersList
      :promoters="filteredPromoters"
      :loading="loading"
      :total-records="totalRecords"
      @edit="openEditPromoterDialog"
      @delete="
        (data) => {
          deleteDialogVisible = true;
          deleteText = t('promoters.confirmDelete', { name: data.name });
          deletedKey = data.id;
        }
      "
    />

    <!-- Promoter Form Dialog -->
    <PromoterForm v-model:visible="formVisible" :promoter="selectedPromoter" :branches="branches" :title="pageTitle" :is-editing="isEditing" @save="handleFormSave" @cancel="handleFormCancel" />
    <DeleteDialog
      v-model="deleteDialogVisible"
      :confirmDelete="
        () => {
          confirmDelete();
        }
      "
      :deleteText="deleteText"
      :deletedKey="deletedKey"
    />
  </div>
</template>

<style scoped>
.promoters-page {
  min-height: 100vh;
}

.rtl-direction {
  direction: rtl;
}

.card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .promoters-page {
    padding: 1rem !important;
  }
}
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
