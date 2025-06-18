<template>
  <Dialog :visible="visible"
          :modal="true" 
          :closable="true" 
          :style="{width: '900px', maxHeight: '90vh'}"  
          @update:visible="$emit('update:visible', $event)"
          :header="t('applicationLogs.logDetails')"
          class="log-detail-dialog">
    
    <div v-if="log" class="p-3">
      <!-- Basic Log Information -->
      <div class="grid mb-4">
        <div class="col-12 md:col-6">
          <label class="block font-semibold text-sm text-500 mb-1">{{ t('applicationLogs.level') }}</label>
          <Tag :severity="getLogLevelSeverity(log.level)" class="px-3 py-2">
            {{ log.level }}
          </Tag>
        </div>
        <div class="col-12 md:col-6">
          <label class="block font-semibold text-sm text-500 mb-1">{{ t('applicationLogs.raiseDate') }}</label>
          <p class="text-lg m-0">{{ formatDateTime(log.raiseDate) }}</p>
        </div>
        <div class="col-12 md:col-6" v-if="log.machineName">
          <label class="block font-semibold text-sm text-500 mb-1">{{ t('applicationLogs.machineName') }}</label>
          <p class="text-lg m-0">{{ log.machineName }}</p>
        </div>
      </div>

      <!-- Message Section -->
      <div class="surface-100 p-3 border-round mb-4">
        <h5 class="mt-0 mb-3">{{ t('applicationLogs.message') }}</h5>
        <div class="mb-3">
          <label class="block font-semibold text-sm text-500 mb-1">{{ t('applicationLogs.message') }}</label>
          <div class="surface-0 p-3 border-round border-1 surface-border">
            <pre class="m-0 white-space-pre-wrap">{{ log.message }}</pre>
          </div>
        </div>
        
        <div v-if="log.messageTemplate && log.messageTemplate !== log.message" class="mb-3">
          <label class="block font-semibold text-sm text-500 mb-1">{{ t('applicationLogs.messageTemplate') }}</label>
          <div class="surface-0 p-3 border-round border-1 surface-border">
            <pre class="m-0 white-space-pre-wrap">{{ log.messageTemplate }}</pre>
          </div>
        </div>
      </div>

      <!-- Exception Section -->
      <div v-if="log.exception" class="surface-100 p-3 border-round mb-4">
        <h5 class="mt-0 mb-3 text-red-600">
          <i class="pi pi-exclamation-triangle mr-2"></i>
          {{ t('applicationLogs.exception') }}
        </h5>
        <div class="surface-0 p-3 border-round border-1 surface-border max-h-20rem overflow-auto">
          <pre class="m-0 white-space-pre-wrap text-red-600">{{ log.exception }}</pre>
        </div>
      </div>

      <!-- Properties Section -->
      <div v-if="hasProperties" class="surface-100 p-3 border-round mb-4">
        <div class="flex justify-content-between align-items-center mb-3">
          <h5 class="mt-0 mb-0">{{ t('applicationLogs.properties') }}</h5>
          <div class="flex gap-2">
            <Button icon="pi pi-table" 
                    :severity="viewMode === 'table' ? 'primary' : 'secondary'" 
                    text 
                    size="small"
                    @click="viewMode = 'table'"
                    :title="t('applicationLogs.tableView')" />
            <Button icon="pi pi-code" 
                    :severity="viewMode === 'json' ? 'primary' : 'secondary'" 
                    text 
                    size="small"
                    @click="viewMode = 'json'"
                    :title="t('applicationLogs.jsonView')" />
          </div>
        </div>

        <!-- Table View -->
        <div v-if="viewMode === 'table'" class="properties-table">
          <DataTable :value="propertiesArray" 
                     :scrollable="true" 
                     scrollHeight="300px"
                     :paginator="propertiesArray.length > 10"
                     :rows="10"
                     class="p-datatable-sm">
            <Column field="key" :header="t('applicationLogs.propertyKey')" style="width: 30%">
              <template #body="slotProps">
                <span class="font-semibold text-primary">{{ slotProps.data.key }}</span>
              </template>
            </Column>
            <Column field="type" :header="t('applicationLogs.propertyType')" style="width: 15%">
              <template #body="slotProps">
                <Tag severity="info" class="text-xs">{{ slotProps.data.type }}</Tag>
              </template>
            </Column>
            <Column field="value" :header="t('applicationLogs.propertyValue')" style="width: 55%">
              <template #body="slotProps">
                <div class="property-value">
                  <!-- String values -->
                  <span v-if="slotProps.data.type === 'string'" class="text-green-700">
                    "{{ slotProps.data.value }}"
                  </span>
                  
                  <!-- Number values -->
                  <span v-else-if="slotProps.data.type === 'number'" class="text-blue-700">
                    {{ slotProps.data.value }}
                  </span>
                  
                  <!-- Boolean values -->
                  <span v-else-if="slotProps.data.type === 'boolean'" class="text-purple-700">
                    {{ slotProps.data.value }}
                  </span>
                  
                  <!-- Null values -->
                  <span v-else-if="slotProps.data.type === 'null'" class="text-500 italic">
                    null
                  </span>
                  
                  <!-- Object/Array values -->
                  <div v-else-if="slotProps.data.type === 'object' || slotProps.data.type === 'array'" 
                       class="object-value">
                    <Button :label="t('applicationLogs.viewObject')" 
                            icon="pi pi-eye" 
                            text 
                            size="small"
                            @click="viewObjectValue(slotProps.data)" />
                  </div>
                  
                  <!-- Other types -->
                  <span v-else class="text-600">
                    {{ String(slotProps.data.value) }}
                  </span>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- JSON View -->
        <div v-else-if="viewMode === 'json'" class="json-view">
          <div class="surface-0 p-3 border-round border-1 surface-border max-h-20rem overflow-auto">
            <pre class="m-0 white-space-pre-wrap">{{ formattedPropertiesJson }}</pre>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button :label="t('applicationLogs.copyToClipboard')" 
                icon="pi pi-copy" 
                severity="secondary" 
                @click="copyLogToClipboard" />
        <Button :label="t('applicationLogs.close')" 
                severity="secondary" 
                @click="$emit('update:visible', false)" />
      </div>
    </template>
  </Dialog>

  <!-- Object Value Dialog -->
  <Dialog v-model:visible="objectValueVisible"
          :modal="true"
          :style="{width: '600px'}"
          :header="objectValueTitle">
    <div class="surface-0 p-3 border-round border-1 surface-border max-h-30rem overflow-auto">
      <pre class="m-0 white-space-pre-wrap">{{ objectValueContent }}</pre>
    </div>
    <template #footer>
      <Button :label="t('applicationLogs.close')" 
              severity="secondary" 
              @click="objectValueVisible = false" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDateTime } from '../utils/formatters';

const { t } = useI18n();

const props = defineProps({
  visible: Boolean,
  log: Object
});

defineEmits(['update:visible']);

const viewMode = ref('table');
const objectValueVisible = ref(false);
const objectValueTitle = ref('');
const objectValueContent = ref('');

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

const hasProperties = computed(() => {
  if (!props.log?.properties) return false;
  
  try {
    const props_obj = typeof props.log.properties === 'string' 
      ? JSON.parse(props.log.properties) 
      : props.log.properties;
    return props_obj && typeof props_obj === 'object' && Object.keys(props_obj).length > 0;
  } catch {
    return false;
  }
});

const propertiesObject = computed(() => {
  if (!props.log?.properties) return {};
  
  try {
    return typeof props.log.properties === 'string' 
      ? JSON.parse(props.log.properties) 
      : props.log.properties;
  } catch {
    return {};
  }
});

const propertiesArray = computed(() => {
  const obj = propertiesObject.value;
  if (!obj || typeof obj !== 'object') return [];
  
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value,
    type: getValueType(value)
  }));
});

const formattedPropertiesJson = computed(() => {
  return JSON.stringify(propertiesObject.value, null, 2);
});

const getValueType = (value) => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const viewObjectValue = (propertyData) => {
  objectValueTitle.value = `${t('applicationLogs.propertyValue')}: ${propertyData.key}`;
  objectValueContent.value = JSON.stringify(propertyData.value, null, 2);
  objectValueVisible.value = true;
};

const copyLogToClipboard = async () => {
  if (!props.log) return;
  
  const logText = `
Level: ${props.log.level}
Date: ${formatDateTime(props.log.raiseDate)}
Machine: ${props.log.machineName || 'N/A'}
Message: ${props.log.message}
${props.log.messageTemplate ? `Template: ${props.log.messageTemplate}` : ''}
${props.log.exception ? `Exception: ${props.log.exception}` : ''}
${hasProperties.value ? `Properties: ${formattedPropertiesJson.value}` : ''}
  `.trim();
  
  try {
    await navigator.clipboard.writeText(logText);
    // You could add a toast notification here
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
  }
};

// Reset view mode when dialog opens
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    viewMode.value = 'table';
  }
});
</script>

<style scoped>
.log-detail-dialog {
  font-family: 'Source Code Pro', monospace;
}

.white-space-pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

.max-h-20rem {
  max-height: 20rem;
}

.max-h-30rem {
  max-height: 30rem;
}

.properties-table :deep(.p-datatable-tbody td) {
  word-break: break-word;
  vertical-align: top;
}

.property-value {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.object-value {
  display: flex;
  align-items: center;
}

.json-view {
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
}
</style>