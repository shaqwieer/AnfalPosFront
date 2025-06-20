<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import ReportFilters from './ReportFilters.vue';
import SummaryCards from './SummaryCards.vue';
import ReportChart from './ReportChart.vue';
import ReportTable from './ReportTable.vue';
import { useReportData } from '../composables/useReportData';
import { useReportExport } from '../composables/useReportExport';

const { t } = useI18n();

// Props
const props = defineProps({
  selectedReport: {
    type: Object,
    default: null
  }
});

// Composables - pass selectedReport as computed to make it reactive
const { 
  reportData, 
  reportSummary, 
  chartData, 
  multipleCharts,
  formattedSummaryCards,
  tableConfig,
  loading,
  hasData,
  hasChartData,
  hasMultipleCharts,
  switchChart,
  refreshData
} = useReportData(computed(() => props.selectedReport));

const { exportReport, hasExportType } = useReportExport(
  computed(() => props.selectedReport)
);

// Methods
const handleChartSwitch = (chartId) => {
  switchChart(chartId);
};

const handleRefreshChart = () => {
  refreshData();
};

const handleRefreshTable = () => {
  refreshData();
};

const handleExportReport = async (type) => {
  const success = await exportReport(type);
  if (success) {
    console.log(`${type.toUpperCase()} export completed successfully`);
  }
};
</script>

<template>
  <div class="main-content">
    <!-- Welcome Screen -->
    <div v-if="!selectedReport" class="welcome-screen">
      <div class="welcome-content">
        <i class="pi pi-chart-bar welcome-icon"></i>
        <h2>{{ t('reports.selectReport') }}</h2>
        <p>{{ t('reports.selectReportDescription') }}</p>
      </div>
    </div>

    <!-- Report Content -->
    <div v-if="selectedReport" class="report-content">
      <!-- Report Header -->
      <div class="content-header">
        <div class="header-info">
          <h1 class="report-title">{{ selectedReport.name }}</h1>
          <p v-if="selectedReport.description" class="report-description">
            {{ selectedReport.description }}
          </p>
        </div>
        
        <div class="header-actions">
          <!-- Export Buttons -->
          <Button 
            v-if="hasExportType(selectedReport, 'excel')"
            icon="pi pi-file-excel" 
            :label="t('reports.exportExcel')"
            class="p-button-success"
            :loading="loading"
            @click="handleExportReport('excel')"
          />
          <Button 
            v-if="hasExportType(selectedReport, 'pdf')"
            icon="pi pi-file-pdf" 
            :label="t('reports.exportPdf')"
            class="p-button-danger"
            :loading="loading"
            @click="handleExportReport('pdf')"
          />
          
          <!-- Refresh Button -->
          <Button
            icon="pi pi-refresh"
            :label="t('common.refresh')"
            class="p-button-outlined"
            :loading="loading"
            @click="refreshData"
            v-tooltip="t('reports.refreshData')"
          />
        </div>
      </div>

      <!-- Filters Section -->
      <ReportFilters 
        :report="selectedReport"
      />

      <!-- Summary Cards Section -->
      <SummaryCards 
        :report="selectedReport"
        :summary="reportSummary"
        :formattedSummaryCards="formattedSummaryCards"
        :loading="loading"
      />

      <!-- Chart Section -->
      <ReportChart 
        :report="selectedReport"
        :chartData="chartData"
        :multipleCharts="multipleCharts"
        @chart-switched="handleChartSwitch"
        @refresh-chart="handleRefreshChart"
      />

      <!-- Data Table Section -->
      <ReportTable 
        :report="selectedReport"
        :data="reportData"
        :tableConfig="tableConfig"
        :loading="loading"
        @refresh-table="handleRefreshTable"
      />

      <!-- Data Status Footer -->
      <div v-if="hasData" class="data-status-footer">
        <div class="status-info">
          <div class="status-item">
            <i class="pi pi-database"></i>
            <span>{{ reportData.length }} {{ t('reports.recordsLoaded') }}</span>
          </div>
          
          <div v-if="hasChartData" class="status-item">
            <i class="pi pi-chart-bar"></i>
            <span>{{ chartData.labels?.length || 0 }} {{ t('reports.chartDataPoints') }}</span>
          </div>
          
          <div v-if="hasMultipleCharts" class="status-item">
            <i class="pi pi-images"></i>
            <span>{{ multipleCharts.length }} {{ t('reports.chartsAvailable') }}</span>
          </div>
          
          <div v-if="formattedSummaryCards.length" class="status-item">
            <i class="pi pi-calculator"></i>
            <span>{{ formattedSummaryCards.length }} {{ t('reports.summaryMetrics') }}</span>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <small class="last-updated">
            {{ t('reports.lastUpdated') }}: {{ new Date().toLocaleTimeString() }}
          </small>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else-if="!loading && selectedReport" class="no-data-state">
        <div class="no-data-content">
          <i class="pi pi-info-circle no-data-icon"></i>
          <h3>{{ t('reports.noDataAvailable') }}</h3>
          <p>{{ t('reports.noDataMessage') }}</p>
          
          <!-- Suggested Actions -->
          <div class="suggested-actions">
            <Button
              icon="pi pi-filter"
              :label="t('reports.adjustFilters')"
              class="p-button-outlined"
              @click="$refs.reportFilters?.scrollIntoView({ behavior: 'smooth' })"
            />
            <Button
              icon="pi pi-refresh"
              :label="t('reports.retryLoad')"
              class="p-button-text"
              @click="refreshData"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !hasData" class="loading-state">
        <div class="loading-content">
          <ProgressSpinner class="loading-spinner" />
          <h3>{{ t('reports.loadingData') }}</h3>
          <p>{{ t('reports.loadingMessage') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.welcome-content {
  text-align: center;
  color: #6c757d;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.welcome-content h2 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.welcome-content p {
  margin: 0;
  font-size: 1.1rem;
}

.report-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Styles */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-info {
  flex: 1;
}

.report-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 300;
  color: #2c3e50;
}

.report-description {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Data Status Footer */
.data-status-footer {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  border: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
}

.status-item i {
  color: #3498db;
  font-size: 1rem;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.last-updated {
  color: #6c757d;
  font-style: italic;
}

/* No Data State */
.no-data-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  margin: 2rem 0;
}

.no-data-content {
  text-align: center;
  color: #6c757d;
  max-width: 400px;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.no-data-content h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.no-data-content p {
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.suggested-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  margin: 2rem 0;
}

.loading-content {
  text-align: center;
  color: #6c757d;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin-bottom: 1rem;
}

.loading-content h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.loading-content p {
  margin: 0;
  font-size: 0.9rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .content-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .report-title {
    font-size: 1.5rem;
  }
  
  .data-status-footer {
    flex-direction: column;
    text-align: center;
  }
  
  .status-info {
    justify-content: center;
    gap: 1rem;
  }
  
  .suggested-actions {
    flex-direction: column;
    align-items: center;
  }
}

/* Tablet Responsive */
@media (max-width: 1024px) {
  .status-info {
    gap: 1rem;
  }
  
  .status-item {
    font-size: 0.85rem;
  }
}

/* Print Styles */
@media print {
  .main-content {
    padding: 0;
  }
  
  .header-actions,
  .data-status-footer,
  .suggested-actions {
    display: none;
  }
  
  .content-header {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}

/* Accessibility Enhancements */
.welcome-content:focus,
.no-data-content:focus,
.loading-content:focus {
  outline: 2px solid #3498db;
  outline-offset: 4px;
}

/* Smooth Transitions */
.report-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Status Icons Animation */
.status-item i {
  transition: color 0.2s ease;
}

.status-item:hover i {
  color: #2980b9;
}
</style>