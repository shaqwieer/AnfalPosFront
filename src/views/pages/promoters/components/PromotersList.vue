<script setup>
import { useI18n } from 'vue-i18n';
import { formatDate } from '../utils/formatters';

const { t } = useI18n();

defineProps({
  promoters: Array,
  loading: Boolean,
  totalRecords: Number
});

defineEmits(['edit', 'delete']);

// Helper function to get promoter initials
const getPromoterInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    return words[0].substring(0, 2).toUpperCase();
  }
};

// Helper function to get contact info display
const getContactDisplay = (contactInfo) => {
  if (!contactInfo) return '-';
  if (contactInfo.length > 30) {
    return contactInfo.substring(0, 27) + '...';
  }
  return contactInfo;
};
</script>

<template>
  <div class="card">
    <div class="flex justify-content-between align-items-center p-4 border-bottom-1 surface-border">
      <h3 class="text-xl font-semibold m-0">{{ t('promoters.promotersList') }}</h3>
      <div class="flex align-items-center gap-2">
        <span class="text-500">{{ t('promoters.totalPromoters', { count: totalRecords }) }}</span>
      </div>
    </div>

    <DataTable
      :value="promoters"
      :loading="loading"
      :totalRecords="totalRecords"
      paginator
      :rows="5"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25, 50]"
      :currentPageReportTemplate="t('common.paginationInfo')"
      dataKey="id"
      responsiveLayout="scroll"
      sortMode="single"
      removableSort
      class="p-datatable-lg"
    >
      <!-- Empty state -->
      <template #empty>
        <div class="text-center p-6">
          <i class="pi pi-users text-4xl text-400 mb-3"></i>
          <h4 class="text-900 font-medium mb-2">{{ t('promoters.noPromoters') }}</h4>
          <p class="text-600">{{ t('promoters.noPromotersMessage') }}</p>
        </div>
      </template>

      <!-- Loading template -->
      <template #loading>
        <div class="text-center p-6">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="3" />
          <p class="text-600 mt-3">{{ t('common.loading') }}</p>
        </div>
      </template>

      <!-- Promoter Column -->
      <Column field="name" :header="t('promoters.promoter')" sortable class="min-w-12rem">
        <template #body="slotProps">
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle" style="width: 40px; height: 40px; font-size: 14px; font-weight: bold">
              {{ getPromoterInitials(slotProps.data.name) }}
            </div>
            <div>
              <div class="font-semibold text-900">{{ slotProps.data.name }}</div>
              <div class="text-600 text-sm" v-if="slotProps.data.contactInfo">
                <i class="pi pi-phone text-xs mr-1"></i>
                {{ getContactDisplay(slotProps.data.contactInfo) }}
              </div>
            </div>
          </div>
        </template>
      </Column>

      <!-- Branch Column -->
      <Column field="branchName" :header="t('promoters.branch')" sortable class="min-w-10rem">
        <template #body="slotProps">
          <div v-if="slotProps.data.branchName">
            <Tag :value="slotProps.data.branchName" severity="info" class="font-medium" />
          </div>
          <span v-else class="text-400">{{ t('common.notSet') }}</span>
        </template>
      </Column>

      <!-- Contact Info Column -->
      <Column field="contactInfo" :header="t('promoters.contactInfo')" class="min-w-12rem">
        <template #body="slotProps">
          <div v-if="slotProps.data.contactInfo" class="flex align-items-center gap-2">
            <i class="pi pi-phone text-600"></i>
            <span>{{ slotProps.data.contactInfo }}</span>
          </div>
          <span v-else class="text-400">{{ t('common.notSet') }}</span>
        </template>
      </Column>

      <!-- Created Date Column -->
      <Column field="createdAt" :header="t('common.createdAt')" sortable class="min-w-10rem">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-calendar text-600"></i>
            <span>{{ formatDate(slotProps.data.createdAt) }}</span>
          </div>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column :header="t('common.actions')" class="min-w-8rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="secondary" size="small" v-tooltip.top="t('common.edit')" @click="$emit('edit', slotProps.data)" class="p-button-rounded p-button-text" />
            <Button icon="pi pi-trash" severity="danger" size="small" v-tooltip.top="t('common.delete')" @click="$emit('delete', slotProps.data)" class="p-button-rounded p-button-text" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 1rem;
  font-weight: 600;
  background-color: var(--surface-50);
}

:deep(.p-paginator) {
  border: none;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: var(--surface-50);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.p-datatable .p-datatable-tbody > tr > td),
  :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.75rem 0.5rem;
  }
}
</style>
