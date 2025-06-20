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

// Composables
const { reportData, reportSummary, chartData, loading } = useReportData(
  computed(() => props.selectedReport)
);

const { exportReport, hasExportType } = useReportExport(
  computed(() => props.selectedReport)
);
</script>

<template>
  <div class="main-content">
    <!-- Welcome Screen -->
    <div v-if="!selectedReport" class="welcome-screen">
      <div class="welcome-content">
        <i class="pi pi-chart-bar welcome-icon"></i>
        <h2>{{ t('reports.selectReport') }}</h2>
      </div>
    </div>

    <!-- Report Content -->
    <div v-if="selectedReport" class="report-content">
      <!-- Report Header -->
      <div class="content-header">
        <div class="header-info">
          <h1 class="report-title">{{ t(selectedReport.name) }}</h1>
        </div>
        
        <div class="header-actions">
          <Button 
            v-if="hasExportType(selectedReport, 'excel')"
            icon="pi pi-file-excel" 
            :label="t('reports.exportExcel')"
            class="p-button-success"
            :loading="loading"
            @click="exportReport('excel')"
          />
          <Button 
            v-if="hasExportType(selectedReport, 'pdf')"
            icon="pi pi-file-pdf" 
            :label="t('reports.exportPdf')"
            class="p-button-danger"
            :loading="loading"
            @click="exportReport('pdf')"
          />
        </div>
      </div>

      <!-- Filters Section -->
      <ReportFilters 
        :report="selectedReport"
      />

      <!-- Summary Cards -->
      <!-- <SummaryCards 
        :report="selectedReport"
        :summary="reportSummary"
      /> -->

      <!-- Chart Section -->
      <!-- <ReportChart 
        :report="selectedReport"
        :chartData="chartData"
      /> -->

      <!-- Data Table -->
      <!-- <ReportTable 
        :report="selectedReport"
        :data="reportData"
        :loading="loading"
      /> -->
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

.report-content {
  max-width: 1400px;
  margin: 0 auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 300;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 1rem;
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
}
</style>