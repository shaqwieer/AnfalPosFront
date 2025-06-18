<template>
  <div class="col-12">
    <div class="card">
      <div class="flex justify-content-between align-items-center p-4 border-bottom-1 surface-border">
        <h4 class="text-xl font-semibold m-0">{{ t('applicationLogs.logsList') }}</h4>
        <Button icon="pi pi-refresh" severity="secondary" @click="$emit('refresh')" :loading="loading" />
      </div>

      <div v-if="loading" class="p-4 text-center">
        <ProgressSpinner />
      </div>

      <div v-else-if="!logs.length" class="p-4 text-center">
        <i class="pi pi-info-circle text-3xl text-500 mb-3"></i>
        <p class="text-500 text-lg">{{ t('applicationLogs.noLogs') }}</p>
      </div>

      <div v-else class="p-0">
        <div v-for="log in logs" 
             :key="log.id || log.raiseDate" 
             class="p-4 border-bottom-1 surface-border cursor-pointer hover:surface-hover transition-duration-200"
             @click="$emit('select', log)">
          <div class="flex justify-content-between align-items-start">
            <div class="flex align-items-start gap-3 flex-1">
              <!-- Log Level Badge -->
              <div class="flex flex-column align-items-center gap-1">
                <Tag :severity="getLogLevelSeverity(log.level)" class="px-2 py-1">
                  {{ log.level }}
                </Tag>
                <small class="text-500">{{ formatTime(log.raiseDate) }}</small>
              </div>
              
              <!-- Log Content -->
              <div class="flex-1 min-w-0">
                <div class="flex align-items-center gap-2 mb-2">
                  <h6 class="m-0 font-semibold text-truncate" style="max-width: 400px;" 
                      :title="log.message">
                    {{ log.message || log.messageTemplate }}
                  </h6>
                  <Tag v-if="log.machineName" severity="info" class="text-xs">
                    {{ log.machineName }}
                  </Tag>
                </div>
                
                <!-- Message Template (if different from message) -->
                <p v-if="log.messageTemplate && log.messageTemplate !== log.message" 
                   class="text-500 text-sm mb-2 text-truncate" 
                   style="max-width: 500px;"
                   :title="log.messageTemplate">
                  {{ log.messageTemplate }}
                </p>
                
                <!-- Exception Preview -->
                <div v-if="log.exception" class="mt-2">
                  <Tag severity="danger" class="text-xs">
                    <i class="pi pi-exclamation-triangle mr-1"></i>
                    {{ t('applicationLogs.hasException') }}
                  </Tag>
                </div>
                
                <!-- Properties Preview -->
                <div v-if="hasProperties(log)" class="mt-2">
                  <div class="flex flex-wrap gap-1">
                    <Tag v-for="(value, key) in getTopProperties(log.properties)" 
                         :key="key" 
                         severity="secondary" 
                         class="text-xs">
                      {{ key }}: {{ formatPropertyValue(value) }}
                    </Tag>
                    <Tag v-if="getPropertiesCount(log.properties) > 3" 
                         severity="secondary" 
                         class="text-xs">
                      +{{ getPropertiesCount(log.properties) - 3 }} {{ t('applicationLogs.more') }}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-column align-items-end gap-2">
              <small class="text-500">{{ formatDate(log.raiseDate) }}</small>
              <Button icon="pi pi-eye" 
                      severity="secondary" 
                      text 
                      size="small"
                      :title="t('applicationLogs.viewDetails')" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { formatDate, formatTime } from '../utils/formatters';

const { t } = useI18n();

defineProps({
  logs: Array,
  loading: Boolean
});

defineEmits(['select', 'refresh']);

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

const hasProperties = (log) => {
  if (!log.properties) return false;
  
  try {
    const props = typeof log.properties === 'string' 
      ? JSON.parse(log.properties) 
      : log.properties;
    return props && typeof props === 'object' && Object.keys(props).length > 0;
  } catch {
    return false;
  }
};

const getTopProperties = (properties) => {
  if (!properties) return {};
  
  try {
    const props = typeof properties === 'string' 
      ? JSON.parse(properties) 
      : properties;
    
    if (props && typeof props === 'object') {
      const entries = Object.entries(props);
      return Object.fromEntries(entries.slice(0, 3));
    }
  } catch {
    return {};
  }
  
  return {};
};

const getPropertiesCount = (properties) => {
  if (!properties) return 0;
  
  try {
    const props = typeof properties === 'string' 
      ? JSON.parse(properties) 
      : properties;
    return props && typeof props === 'object' ? Object.keys(props).length : 0;
  } catch {
    return 0;
  }
};

const formatPropertyValue = (value) => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string' && value.length > 20) {
    return value.substring(0, 20) + '...';
  }
  if (typeof value === 'object') {
    return '[Object]';
  }
  return String(value);
};
</script>

<style scoped>
.card {
  border-radius: 12px;
}

.hover:surface-hover:hover {
  background-color: var(--surface-hover);
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>