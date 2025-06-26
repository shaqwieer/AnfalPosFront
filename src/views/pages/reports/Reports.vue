<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import { useReports } from './composables/useReports';
import ReportTable from './components/ReportTable.vue';
import SummaryCards from './components/SummaryCards.vue';
import ReportChart from './components/ReportChart.vue';

const { t } = useI18n();
const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);

// Add current view state - THIS IS NEW
const currentView = ref('table'); // 'table' or 'charts'

const {
  loading,
  selectedReport,
  filterValues,
  filterOptions,
  reportDialogVisible,
  reportsByCategory,
  availableFormats,
  isFormValid,
  hasDataEndpoint,
  hasSummaryCardsEnabled,
  hasChartsEnabled,
  showDataVisualization,
  visualizationTypeOptions,
  reportData,
  tableConfig,
  chartData,
  summaryData,
  formattedSummaryCards,
  hasData,
  hasSummaryCards,
  hasCharts,
  enabledVisualizationTypes,
  availableVisualizationOptions,
  shouldShowSummary,
  shouldShowTable,
  shouldShowCharts,
  selectReport,
  generateReport,
  closeDialog,
  loadReportData,
  refreshReportData,
  toggleDataVisualization,
  handleVisualizationTypesChange
} = useReports();

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

// NEW METHOD - Add this method to set current view
const setCurrentView = (view) => {
  if (view === 'charts' && !hasCharts.value) {
    return; // Don't switch to charts if no charts available
  }
  currentView.value = view;
};
const onDateSelect = (selectedDate, key) => {
  if (!selectedDate) return; // Handle null selection
  filterValues[key].value = selectedDate.setHours(12, 0, 0, 0);
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
                <div class="flex gap-1 mt-2 flex-wrap">
                  <Tag v-if="report.endpoints.pdf" class="bg-red-100 text-red-700 text-xs px-2 py-1" icon="pi pi-file-pdf"> PDF </Tag>
                  <Tag v-if="report.endpoints.excel" class="bg-green-100 text-green-700 text-xs px-2 py-1" icon="pi pi-file-excel"> Excel </Tag>
                  <Tag v-if="report.endpoints.data" class="bg-blue-100 text-blue-700 text-xs px-2 py-1" icon="pi pi-eye"> Data </Tag>
                  <Tag v-if="report.summaryCards" class="bg-purple-100 text-purple-700 text-xs px-2 py-1" icon="pi pi-chart-bar"> Summary </Tag>
                  <Tag v-if="report.chartConfigs" class="bg-orange-100 text-orange-700 text-xs px-2 py-1" icon="pi pi-chart-line"> Charts </Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="reports-main gap-3">
        <!-- Welcome State -->
        <div v-if="!selectedReport" class="welcome-state">
          <div class="text-center">
            <i class="pi pi-file-text text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-2xl font-semibold text-gray-700 mb-2">
              {{ t('reports.welcome.title') }}
            </h3>
            <p class="text-gray-500 mb-6 max-w-md mx-auto">
              {{ t('reports.welcome.description') }}
            </p>
          </div>
        </div>

        <!-- Selected Report Content -->
        <div v-else class="report-content">
          <!-- Report Header -->
          <div class="report-header">
            <div class="flex align-items-center gap-3 ">
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
                <!-- FEATURES INDICATORS -->
                <div class="flex align-items-center gap-2 mt-2 flex-wrap">
                  <Tag v-if="hasSummaryCardsEnabled" class="bg-purple-100 text-purple-700 text-xs" icon="pi pi-chart-bar"> {{ selectedReport.summaryCards.length }} Summary Cards </Tag>
                  <Tag v-if="hasChartsEnabled" class="bg-orange-100 text-orange-700 text-xs" icon="pi pi-chart-line"> {{ selectedReport.chartConfigs.length }} Charts </Tag>
                  <Tag v-if="hasDataEndpoint" class="bg-blue-100 text-blue-700 text-xs" icon="pi pi-table"> Data Table Available </Tag>
                </div>
              </div>
              <div class="flex gap-2 mx-8 flex-wrap">
                <Button v-if="selectedReport.endpoints.pdf" @click="generateReport('pdf')" :loading="loading" :disabled="!isFormValid" icon="pi pi-file-pdf" outlined class="p-button-danger w-3rem h-3rem cursor-pointer" size="small">
                  <!-- {{ t('reports.exportPdf') }} -->
                </Button>

                <Button v-if="selectedReport.endpoints.excel" @click="generateReport('excel')" :loading="loading" :disabled="!isFormValid" icon="pi pi-file-excel" outlined class="p-button-success w-3rem h-3rem cursor-pointer" size="small">
                  <!-- {{ t('reports.exportExcel') }} -->
                </Button>

                <!-- VIEW DATA BUTTON -->
                <Button v-if="hasDataEndpoint" @click="loadReportData" :loading="loading" :disabled="!isFormValid" icon="pi pi-eye" outlined class="p-button-info w-3rem h-3rem cursor-pointer" size="small">
                  <!-- View Data -->
                </Button>
              </div>
            </div>

            <!-- Export Actions -->
          </div>

          <!-- Filters Section -->
          <Panel :header="t('reports.filters')" class="mb-1">
            <div class="grid">
              <div v-for="filter in selectedReport.filters" :key="filter.name" class="col-12 md:col-6 lg:col-4">
                <div class="field">
                  <label :for="filter.name" class="block font-medium mb-2 text-sm" :class="{ required: filter.required }">
                    {{ t(filter.label) }}
                  </label>

                  <!-- Date Picker -->
                  <Calendar v-if="filter.type === 'date'" v-model="filterValues[filter.name]" @date-select="(e) => onDateSelect(e, filter.name)" :id="filter.name" dateFormat="yy-mm-dd" class="w-full" />

                  <!-- Date Range Picker -->
                  <div v-else-if="filter.type === 'daterange'" class="flex gap-2">
                    <Calendar v-model="filterValues[filter.startDate]" :id="filter.startDate" @date-select="(e) => onDateSelect(e, filter.startDate)" dateFormat="yy-mm-dd" class="w-full" :placeholder="t('reports.startDate')" />
                    <Calendar v-model="filterValues[filter.endDate]" :id="filter.endDate" @date-select="(e) => onDateSelect(e, filter.endDate)" dateFormat="yy-mm-dd" class="w-full" :placeholder="t('reports.endDate')" />
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

          <!-- 🎯 NEW: SUMMARY CARDS SECTION (Under Filters) -->
          <div v-if="hasData && shouldShowSummary" class="summary-cards-section mb-4 ">
            <SummaryCards :report="selectedReport" :summary="summaryData" :formatted-summary-cards="formattedSummaryCards" :loading="loading" />
          </div>

          <!-- 🎯 NEW: DATA VISUALIZATION SECTION WITH SAP-STYLE TOGGLE BUTTONS -->
          <div v-if="hasData" class="data-visualization-section">
            <!-- Toggle Buttons Header -->
            <div class="visualization-header">
              <div class="flex align-items-center justify-content-between">
                <h3 class="text-lg font-semibold text-gray-800 flex align-items-center gap-2">
                  <i class="pi pi-chart-line text-blue-500"></i>
                  Data Visualization
                </h3>

                <!-- SAP-Style Toggle Buttons -->
                <div class="toggle-buttons">
                  <Button v-tooltip.top="'Table View'" :class="['toggle-btn', { active: currentView === 'table' }]" @click="setCurrentView('table')" icon="pi pi-table" text size="small" />
                  <Button v-tooltip.top="'Chart View'" :class="['toggle-btn', { active: currentView === 'charts' }]" @click="setCurrentView('charts')" icon="pi pi-chart-bar" text size="small" :disabled="!hasCharts" />
                </div>
              </div>
            </div>

            <!-- Content based on current view -->
            <div class="visualization-content">
              <!-- Table View -->
              <div v-if="currentView === 'table'" class="table-view">
                <ReportTable :report="selectedReport" :data="reportData" :table-config="tableConfig" :loading="loading" @refresh-table="refreshReportData" />
              </div>

              <!-- Charts View -->
              <div v-else-if="currentView === 'charts' && hasCharts" class="charts-view">
                <div class="charts-grid">
                  <ReportChart v-for="chart in chartData" :key="chart.id" :chart="chart" :loading="loading" class="chart-item" />
                </div>
              </div>

              <!-- No Charts Available -->
              <div v-else-if="currentView === 'charts' && !hasCharts" class="no-charts-state">
                <div class="text-center py-8">
                  <i class="pi pi-chart-bar text-4xl text-gray-300 mb-3"></i>
                  <p class="text-gray-500">No charts available for this report</p>
                  <Button label="Switch to Table View" icon="pi pi-table" @click="setCurrentView('table')" class="mt-3" outlined />
                </div>
              </div>
            </div>
          </div>

          <!-- ORIGINAL: No Data State when data visualization is shown but no data -->
          <div v-else-if="showDataVisualization && !hasData" class="text-center py-8">
            <i class="pi pi-info-circle text-4xl text-blue-400 mb-3"></i>
            <p class="text-gray-500">No data available for the selected filters</p>
            <Button label="Load Data" icon="pi pi-refresh" @click="loadReportData" :loading="loading" :disabled="!isFormValid" class="mt-3" />
          </div>
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
  height: calc(100vh - 14rem);
  background-color: #f8f9fa;
}

.reports-layout {
  display: flex;
  height: 100%;
}

/* Sidebar Styles */
.reports-sidebar {
  width: 320px;
  height: 80vh;
  overflow-y: auto;
  background: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  max-width: 1400px;
  margin: 0 auto;
}

.report-header {
  background: white;
  padding: 2rem;
  height: auto;
  min-height: 9rem;
  border-radius: 12px;
  margin-bottom: 1rem;
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

/* 🎯 NEW STYLES FOR ENHANCED UI */

/* Summary Cards Section */
.summary-cards-section {
  background: transparent;
  border-radius: 8px;
  padding: 1.5rem;
  /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
  /* border: 1px solid #e9ecef; */
}

/* Data Visualization Section */
.data-visualization-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  overflow: hidden;
}

/* Visualization Header */
.visualization-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* SAP-Style Toggle Buttons */
.toggle-buttons {
  display: flex;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toggle-btn {
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #6c757d !important;
  padding: 0.5rem 0.75rem !important;
  min-width: 40px;
  height: 36px;
  transition: all 0.2s ease;
  position: relative;
}

.toggle-btn:not(:last-child) {
  border-right: 1px solid #dee2e6 !important;
}

.toggle-btn:hover:not(.active):not(:disabled) {
  background: #f8f9fa !important;
  color: #495057 !important;
}

.toggle-btn.active {
  background: #0d6efd !important;
  color: white !important;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Visualization Content */
.visualization-content {
  padding: 1.5rem;
}

/* Table View */
.table-view {
  min-height: 400px;
}

/* Charts View */
.charts-view {
  min-height: 400px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.5rem;
}

.chart-item {
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* No Charts State */
.no-charts-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
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
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
}

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
    min-height: auto;
  }

  .welcome-state {
    min-height: 300px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-item {
    min-height: 300px;
  }

  .visualization-header .flex {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .toggle-buttons {
    align-self: stretch;
  }

  .visualization-content {
    padding: 1rem;
  }

  .summary-cards-section {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .report-item {
    padding: 0.5rem;
  }

  .chart-item {
    min-height: 250px;
  }

  .visualization-header {
    padding: 1rem;
  }

  .visualization-content {
    padding: 0.75rem;
  }

  .toggle-btn {
    min-width: 36px;
    height: 32px;
    padding: 0.375rem 0.5rem !important;
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

/* Animation for view transitions */
.table-view,
.charts-view {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced tooltip styling */
:deep(.p-tooltip .p-tooltip-text) {
  font-size: 0.75rem;
  padding: 0.375rem 0.5rem;
  background: #212529;
  color: white;
  border-radius: 4px;
}

/* Active state indicator */
.toggle-btn.active::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #ffffff;
  opacity: 0.8;
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
