<template>
  <div :class="['grid px-6', { 'rtl-direction': rtl }]">
    <!-- Header Section -->
    <div class="flex flex-column row-gap-5 px-3 lg:flex-row justify-content-between mb-5 lg:mb-0 w-full">
      <div class="lg:col-8 px-0 pt-2">
        <h3 class="text-700 text-3xl font-semibold">{{ t('applicationLogs.header') }}</h3>
        <p class="text-500 text-lg">{{ t('applicationLogs.description') }}</p>
      </div>
    </div>

    <!-- Log Filters -->
    <LogFilters :filters="filters" :loading="loading" @search="searchLogs" @update:filters="updateFilters" />

    <!-- Statistics Cards -->
    <StatisticsCards v-if="logs.length > 0" :stats="logStats" />

    <!-- Logs List -->
    <LogsList :logs="logs" :loading="loading" @select="selectLog" @refresh="searchLogs" />

    <!-- Log Detail Dialog -->
    <LogDetail v-model:visible="logDetailVisible" :log="selectedLog" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import LogFilters from './components/LogFilters.vue';
import StatisticsCards from './components/StatisticsCards.vue';
import LogsList from './components/LogsList.vue';
import LogDetail from './components/LogDetail.vue';
import { useApplicationLogs } from './composables/useApplicationLogs';

const { t } = useI18n();
const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);

// Composables
const { logs, selectedLog, logDetailVisible, logStats, filters, loading, selectLog, searchLogs } = useApplicationLogs();
const updateFilters = (newFilters) => {
  console.log('Updating filters:', newFilters);
  Object.assign(filters, newFilters);
};
onMounted(() => {
  searchLogs();
});
</script>

<style scoped>
.rtl-direction {
  direction: rtl;
}
</style>
