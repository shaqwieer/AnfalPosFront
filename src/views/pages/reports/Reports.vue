<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import { useReports } from './composables/useReports';

const { t } = useI18n();
const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);

const { loading, selectedReport, filterValues, filterOptions, reportDialogVisible, reportsByCategory, availableFormats, isFormValid, selectReport, generateReport, closeDialog } = useReports();

// Category configurations for styling
const categoryConfig = {
  financial: {
    icon: 'pi-dollar',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  sales: {
    icon: 'pi-chart-line',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  inventory: {
    icon: 'pi-box',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  analytics: {
    icon: 'pi-chart-bar',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
};

const getCategoryDisplayName = (category) => {
  const categoryNames = {
    financial: t('reports.categories.financial'),
    sales: t('reports.categories.sales'),
    inventory: t('reports.categories.inventory'),
    analytics: t('reports.categories.analytics')
  };
  return categoryNames[category] || category;
};
</script>

<template>
  <div :class="['reports-container', { 'rtl-direction': rtl }]">
    <!-- Main Layout -->
    <div class="reports-layout">
      <!-- Sidebar -->
      <div class="reports-sidebar">
        <div class="sidebar-header">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">
            <i class="pi pi-file-text mr-2"></i>
            {{ t('reports.title') }}
          </h2>
          <p class="text-sm text-gray-600">{{ t('reports.subtitle') }}</p>
        </div>

        <!-- Reports Navigation -->
        <div class="sidebar-content">
          <div v-for="(reports, category) in reportsByCategory" :key="category" class="category-section">
            <!-- Category Header -->
            <div class="category-header">
              <div class="flex align-items-center gap-2">
                <i :class="['pi', categoryConfig[category]?.icon || 'pi-folder', categoryConfig[category]?.color || 'text-gray-600']"></i>
                <span class="font-medium text-sm">{{ getCategoryDisplayName(category) }}</span>
              </div>
              <Badge :value="reports.length" class="bg-gray-100 text-gray-700 text-xs" />
            </div>

            <!-- Reports List -->
            <div class="reports-list">
              <div
                v-for="report in reports"
                :key="report.id"
                @click="selectReport(report)"
                :class="[
                  'report-item',
                  {
                    'report-item-active': selectedReport?.id === report.id
                  }
                ]"
              >
                <div class="flex align-items-center gap-3">
                  <div :class="['report-icon', categoryConfig[category]?.bgColor, categoryConfig[category]?.borderColor]">
                    <i :class="['pi', report.icon, categoryConfig[category]?.color]"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-sm text-gray-800">
                      {{ t(report.name) }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ t(report.description) }}
                    </div>
                  </div>
                </div>

                <!-- Available formats indicators -->
                <div class="flex gap-1 mt-2">
                  <Tag v-if="report.endpoints.pdf" class="bg-red-100 text-red-700 text-xs px-2 py-1" icon="pi pi-file-pdf"> PDF </Tag>
                  <Tag v-if="report.endpoints.excel" class="bg-green-100 text-green-700 text-xs px-2 py-1" icon="pi pi-file-excel"> Excel </Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="reports-main">
        <!-- Welcome State -->
        <div v-if="!selectedReport" class="welcome-state">
          <div class="text-center">
            <i class="pi pi-file-text text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-2xl font-semibold text-gray-700 mb-2">
              {{ t('reports.welcome.title') }}
            </h3>
          </div>
        </div>

        <!-- Selected Report Content -->
        <div v-else class="report-content">
          <!-- Report Header -->
          <div class="report-header">
            <div class="flex align-items-center gap-3 mb-4">
              <div :class="['report-icon-large', categoryConfig[selectedReport.category]?.bgColor, categoryConfig[selectedReport.category]?.borderColor]">
                <i :class="['pi', selectedReport.icon, categoryConfig[selectedReport.category]?.color, 'text-2xl']"></i>
              </div>
              <div>
                <h1 class="text-2xl font-semibold text-gray-800">
                  {{ t(selectedReport.name) }}
                </h1>
                <p class="text-gray-600 mt-1">
                  {{ t(selectedReport.description) }}
                </p>
              </div>
            </div>

            <!-- Export Actions -->
            <div class="flex gap-2 mb-6">
              <Button v-if="selectedReport.endpoints.pdf" @click="generateReport('pdf')" :loading="loading" :disabled="!isFormValid" icon="pi pi-file-pdf" class="w-8rem p-button-danger">
                {{ t('reports.exportPdf') }}
              </Button>
              <Button v-if="selectedReport.endpoints.excel" @click="generateReport('excel')" :loading="loading" :disabled="!isFormValid" icon="pi pi-file-excel" class="w-8rem p-button-success">
                {{ t('reports.exportExcel') }}
              </Button>
            </div>
          </div>

          <!-- Filters Section -->
          <Panel :header="t('reports.filters')" class="mb-4">
            <div class="grid gap-1">
              <div v-for="filter in selectedReport.filters" :key="filter.name" class="col-12 md:col-6 lg:col-4 xl:col-3">
                <div class="field">
                  <label :for="filter.name" class="block font-medium mb-2 text-sm" :class="{ required: filter.required }">
                    {{ t(filter.label) }}
                  </label>

                  <!-- Date Picker -->
                  <Calendar v-if="filter.type === 'date'" v-model="filterValues[filter.name]" :id="filter.name" dateFormat="yy-mm-dd" class="w-full" />

                  <!-- Date Range Picker -->
                  <div v-else-if="filter.type === 'daterange'" class="flex gap-2">
                    <Calendar v-model="filterValues[filter.startDate]" :id="filter.startDate" dateFormat="yy-mm-dd" class="w-full" :placeholder="t('reports.startDate')" />
                    <Calendar v-model="filterValues[filter.endDate]"  :id="filter.endDate" dateFormat="yy-mm-dd" class="w-full" :placeholder="t('reports.endDate')" />
                  </div>

                  <!-- Dropdown -->
                  <Dropdown
                    v-else-if="filter.type === 'dropdown'"
                    v-model="filterValues[filter.name]"
                    :options="filterOptions[filter.name] || []"
                    :optionLabel="filter.optionLabel"
                    :optionValue="filter.optionValue"
                    :placeholder="t(filter.label)"
                    class="w-full"
                    filter
                  />

                  <!-- MultiSelect -->
                  <MultiSelect
                    v-else-if="filter.type === 'multiselect'"
                    v-model="filterValues[filter.name]"
                    :options="filterOptions[filter.name] || []"
                    :optionLabel="filter.optionLabel"
                    :optionValue="filter.optionValue"
                    :placeholder="t(filter.label)"
                    class="w-full"
                    display="chip"
                  />

                  <!-- Text Input -->
                  <InputText v-else-if="filter.type === 'text'" v-model="filterValues[filter.name]" :id="filter.name" :placeholder="t(filter.label)" class="w-full" />

                  <!-- Checkbox -->
                  <div v-else-if="filter.type === 'checkbox'" class="flex align-items-center">
                    <Checkbox v-model="filterValues[filter.name]" :inputId="filter.name" :binary="true" />
                    <label :for="filter.name" class="ml-2">{{ t(filter.label) }}</label>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <!-- Future: Data Visualization Section -->
          <Panel :header="t('reports.dataVisualization')" class="mb-4" :collapsed="true" :toggleable="true">
            <div class="text-center py-8">
              <i class="pi pi-chart-line text-4xl text-gray-300 mb-3"></i>
              <p class="text-gray-500">{{ t('reports.dataVisualizationComingSoon') }}</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rtl-direction {
  direction: rtl;
}

.reports-container {
  height:calc(100vh-80px);
  background-color: #f8f9fa;
}

.reports-layout {
  display: flex;
  height: 100%;
}

/* Sidebar Styles */
.reports-sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 70vh;

}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.category-section {
  margin-bottom: 1.5rem;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.report-item {
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.report-item:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.report-item-active {
  background-color: #e3f2fd;
  border-color: #2196f3;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.1);
}

.report-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  flex-shrink: 0;
}

/* Main Content Styles */
.reports-main {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.welcome-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 500px;
}

.report-content {
  max-width: 1200px;
  margin: 0 auto;
}

.report-header {
  background: white;
  height: 12rem;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.report-icon-large {
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  flex-shrink: 0;
}

/* Form Styles */
.field .required:after {
  content: ' *';
  color: #ef4444;
  font-weight: bold;
}

/* Panel Overrides */
:deep(.p-panel-header) {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #495057;
  font-weight: 600;
}

:deep(.p-panel-content) {
  border-color: #dee2e6;
}

/* Calendar and Form Controls */
:deep(.p-calendar .p-inputtext) {
  width: 100%;
}

:deep(.p-dropdown-label) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

:deep(.p-multiselect-label) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* Button Styles */
:deep(.p-button.p-button-outlined) {
  border-width: 1px;
  font-weight: 500;
}

:deep(.p-button.p-button-outlined.p-button-danger) {
  color: #dc3545;
  border-color: #dc3545;
}

:deep(.p-button.p-button-outlined.p-button-danger:hover) {
  background: #dc3545;
  color: white;
}

:deep(.p-button.p-button-outlined.p-button-success) {
  color: #198754;
  border-color: #198754;
}

:deep(.p-button.p-button-outlined.p-button-success:hover) {
  background: #198754;
  color: white;
}

/* Tags */
:deep(.p-tag) {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Badge */
:deep(.p-badge) {
  font-size: 0.75rem;
  min-width: 1.5rem;
  height: 1.5rem;
  line-height: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .reports-layout {
    flex-direction: column;
  }

  .reports-sidebar {
    width: 100%;
    height: auto;
    max-height: 300px;
  }

  .reports-main {
    padding: 1rem;
  }

  .report-header {
    padding: 1rem;
  }

  .welcome-state {
    min-height: 300px;
  }
}

/* Scrollbar Styling */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Loading States */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Animation Classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>
