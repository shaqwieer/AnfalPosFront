<template>
  <div class="col-12 mb-4">
    <div class="grid">
      <div class="col-12 md:col-3">
        <div class="card p-4 text-center">
          <div class="text-2xl font-semibold text-blue-600">{{ stats.totalLogs }}</div>
          <div class="text-500">{{ t('applicationLogs.totalLogs') }}</div>
        </div>
      </div>
      
      <div class="col-12 md:col-3">
        <div class="card p-4 text-center">
          <div class="text-2xl font-semibold text-red-600">{{ stats.errorCount }}</div>
          <div class="text-500">{{ t('applicationLogs.errorLogs') }}</div>
        </div>
      </div>
      
      <div class="col-12 md:col-3">
        <div class="card p-4 text-center">
          <div class="text-2xl font-semibold text-orange-600">{{ stats.warningCount }}</div>
          <div class="text-500">{{ t('applicationLogs.warningLogs') }}</div>
        </div>
      </div>
      
      <div class="col-12 md:col-3">
        <div class="card p-4 text-center">
          <div class="text-2xl font-semibold text-green-600">{{ stats.infoCount }}</div>
          <div class="text-500">{{ t('applicationLogs.infoLogs') }}</div>
        </div>
      </div>
    </div>

    <!-- Level Distribution Chart -->
    <div class="grid mt-3">
      <div class="col-12">
        <div class="card p-4">
          <h5 class="mb-3">{{ t('applicationLogs.levelDistribution') }}</h5>
          <div class="flex flex-wrap gap-3">
            <div v-for="(count, level) in stats.levelDistribution" :key="level" 
                 class="flex align-items-center gap-2">
              <Tag :severity="getLogLevelSeverity(level)" class="px-2">
                {{ level }}
              </Tag>
              <span class="font-semibold">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  stats: Object
});

const getLogLevelSeverity = (level) => {
  switch (level?.toLowerCase()) {
    case 'trace': return 'secondary';
    case 'debug': return 'info';
    case 'information': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    case 'critical': return 'danger';
    default: return 'secondary';
  }
};
</script>

<style scoped>
.card {
  border-radius: 12px;
}
</style>