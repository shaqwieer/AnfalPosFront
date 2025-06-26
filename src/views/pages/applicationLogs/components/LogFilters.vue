<template>
  <div class="col-12 mb-4">
    <div class="card p-4">
      <div class="grid">
        <!-- Log Level Filter -->
        <div class="col-12 md:col-3">
          <label class="block font-medium mb-2">{{ t('applicationLogs.level') }}</label>
          <Dropdown :model-value="filters.level" @update:model-value="updateFilter('level', $event)" :options="logLevels" optionLabel="label" optionValue="value" :placeholder="t('applicationLogs.selectLevel')" class="w-full" showClear>
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center gap-2">
                <Tag :severity="getLogLevelSeverity(slotProps.value)" class="px-2">
                  {{ getLevelLabel(slotProps.value) }}
                </Tag>
              </div>
              <span v-else class="text-500">{{ slotProps.placeholder }}</span>
            </template>

            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <Tag :severity="getLogLevelSeverity(slotProps.option.value)" class="px-2">
                  {{ slotProps.option.label }}
                </Tag>
              </div>
            </template>
          </Dropdown>
        </div>

        <!-- Search Term -->
        <div class="col-12 md:col-3">
          <label class="block font-medium mb-2">{{ t('applicationLogs.searchTerm') }}</label>
          <InputText :model-value="filters.searchTerm" @update:model-value="updateFilter('searchTerm', $event)" :placeholder="t('applicationLogs.searchPlaceholder')" class="w-full" />
        </div>

        <!-- Request Path -->
        <div class="col-12 md:col-3">
          <label class="block font-medium mb-2">{{ t('applicationLogs.requestPath') }}</label>
          <InputText :model-value="filters.requestPath" @update:model-value="updateFilter('requestPath', $event)" :placeholder="t('applicationLogs.requestPathPlaceholder')" class="w-full" />
        </div>

        <!-- Search Button -->
        <div class="col-12 md:col-3">
          <label class="block font-medium mb-2">&nbsp;</label>
          <Button :label="t('applicationLogs.search')" icon="pi pi-search" @click="$emit('search')" :loading="loading" class="w-full" />
        </div>

        <!-- Date Range -->
        <div class="col-12 md:col-6">
          <label class="block font-medium mb-2">{{ t('applicationLogs.fromDate') }} *</label>
          <Calendar :model-value="filters.fromDate" @update:model-value="updateFilter('fromDate', $event)" :showIcon="true"  dateFormat="yy-mm-dd" class="w-full" />
        </div>

        <div class="col-12 md:col-6">
          <label class="block font-medium mb-2">{{ t('applicationLogs.toDate') }} *</label>
          <Calendar :model-value="filters.toDate" @update:model-value="updateFilter('toDate', $event)" :showIcon="true" dateFormat="yy-mm-dd" class="w-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  filters: Object,
  loading: Boolean
});

const emit = defineEmits(['update:filters', 'search']);

const logLevels = ref([
  // { label: 'Trace', value: 'Trace' },
  // { label: 'Debug', value: 'Debug' },
  // { label: 'Information', value: 'Information' },
  { label: 'Warning', value: 'Warning' },
  { label: 'Error', value: 'Error' }
  // { label: 'Critical', value: 'Critical' }
]);

const updateFilter = (key, value) => {
  let  newValue = value;
  if (key === 'fromDate') {
    const newDate = new Date(value);
    newDate.setHours(12, 0, 0, 0);
    newValue = newDate;
  } else if (key === 'toDate') {
    const newDate = new Date(value);
    newDate.setHours(12, 0, 0, 0);
    newValue = newDate;
  }
  emit('update:filters', { ...props.filters, [key]: newValue });
  newValue = null;
};

const getLogLevelSeverity = (level) => {
  switch (level?.toLowerCase()) {
    case 'trace':
      return 'secondary';
    case 'debug':
      return 'info';
    case 'information':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'danger';
    case 'critical':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getLevelLabel = (level) => {
  const found = logLevels.value.find((l) => l.value === level);
  return found ? found.label : level;
};
</script>

<style scoped>
:deep(.p-calendar .p-inputtext) {
  width: 100%;
}
</style>
