<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  reports: {
    type: Array,
    required: true
  },
  selectedReport: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['select-report']);

// Methods
const handleReportSelect = (report) => {
  emit('select-report', report);
};
</script>

<template>
  <div class="reports-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">{{ t('reports.title') }}</h2>
    </div>
    
    <div class="reports-list">
      <div
        v-for="report in reports"
        :key="report.id"
        :class="['report-item', { 'active': selectedReport?.id === report.id }]"
        @click="handleReportSelect(report)"
      >
        <div class="report-icon">
          <i :class="['pi', report.icon]"></i>
        </div>
        <div class="report-info">
          <h4 class="report-name">{{ t(report.name) }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.sidebar-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 300;
  color: #2c3e50;
}

.reports-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.report-item {
  display: flex;
  gap:4px;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.report-item:hover {
  background-color: #f8f9fa;
}

.report-item.active {
  background-color: #e3f2fd;
  border-left-color: #2196f3;
}

.report-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.report-item.active .report-icon {
  background: linear-gradient(135deg, #2196f3, #1976d2);
}

.report-info {
  flex: 1;
  min-width: 0;
}

.report-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.3;
  word-wrap: break-word;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .reports-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .reports-list {
    max-height: 200px;
  }
}
</style>