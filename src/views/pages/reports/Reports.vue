<script setup>
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import { computed } from 'vue';
import ReportsSidebar from './components/ReportsSidebar.vue';
import ReportContent from './components/ReportContent.vue';
import { useReports } from './composables/useReports';

const { t } = useI18n();
const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);

// Initialize reports composable
const { selectedReport, selectReport, reports } = useReports();
</script>

<template>
  <div :class="['reports-layout', { 'rtl-direction': rtl }]">
    <!-- Left Sidebar -->
    <ReportsSidebar
      :reports="reports"
      :selectedReport="selectedReport"
      @select-report="selectReport"
    />

    <!-- Main Content -->
    <ReportContent 
      :selectedReport="selectedReport"
    />
  </div>
</template>

<style scoped>
.reports-layout {
  display: flex;
  height: 100vh;
  /* background-color: #f5f5f5; */
}

.rtl-direction {
  direction: rtl;
}

/* Responsive Design */
@media (max-width: 768px) {
  .reports-layout {
    flex-direction: column;
    height: auto;
  }
}
</style>