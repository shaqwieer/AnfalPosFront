<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatValue } from '../utils/formatters';
import { exportTableAsCSV, generateTableSummary } from '../utils/tableBuilder';

const { t } = useI18n();

// Props
const props = defineProps({
  report: {
    type: Object,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  tableConfig: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Reactive data
const filters = ref({});
const selectedRows = ref([]);
const globalFilterValue = ref('');
const expandedRows = ref([]);
const tableSummary = ref({});

// Computed
const hasData = computed(() => {
  return props.data && props.data.length > 0;
});

const hasTableConfig = computed(() => {
  return props.tableConfig && Object.keys(props.tableConfig).length > 0;
});

const tableData = computed(() => {
  return hasTableConfig.value ? props.tableConfig.data : props.data;
});

const tableColumns = computed(() => {
  if (hasTableConfig.value && props.tableConfig.columns) {
    return props.tableConfig.columns;
  }
  
  // Fallback to report columns
  return props.report.columns || [];
});

const tableOptions = computed(() => {
  return hasTableConfig.value ? props.tableConfig.options : {
    enablePagination: true,
    defaultPageSize: 25,
    enableSorting: true,
    enableFiltering: true,
    enableExport: true,
    enableSelection: false
  };
});

const globalFilterFields = computed(() => {
  return tableColumns.value
    .filter(col => col.filterable)
    .map(col => col.field);
});

const exportColumns = computed(() => {
  return tableColumns.value.map(col => ({
    title: col.header,
    dataKey: col.field
  }));
});

const hasSelection = computed(() => {
  return tableOptions.value.enableSelection && selectedRows.value.length > 0;
});

const rowsPerPageOptions = computed(() => {
  return [10, 25, 50, 100, 200];
});

// Methods
const clearFilters = () => {
  filters.value = {};
  globalFilterValue.value = '';
};

const exportCSV = () => {
  if (!hasData.value) return;
  
  const filename = `${props.report.id}-data-${new Date().toISOString().split('T')[0]}.csv`;
  exportTableAsCSV(tableData.value, tableColumns.value, filename);
};

const exportSelectedCSV = () => {
  if (!hasSelection.value) return;
  
  const filename = `${props.report.id}-selected-${new Date().toISOString().split('T')[0]}.csv`;
  exportTableAsCSV(selectedRows.value, tableColumns.value, filename);
};

const getColumnClass = (column) => {
  const classes = ['table-column'];
  
  if (column.align) classes.push(`text-${column.align}`);
  if (column.type === 'currency') classes.push('text-right');
  if (column.type === 'number') classes.push('text-right');
  if (column.type === 'date') classes.push('text-center');
  if (column.type === 'boolean') classes.push('text-center');
  
  return classes.join(' ');
};

const getRowClass = (data, index) => {
  const classes = {};
  
  if (index % 2 === 0) classes['table-row-even'] = true;
  if (index % 2 === 1) classes['table-row-odd'] = true;
  
  // Add custom row classes based on data
  if (data._isGroupHeader) classes['group-header-row'] = true;
  if (data.status === 'inactive') classes['inactive-row'] = true;
  if (data.isHighlighted) classes['highlighted-row'] = true;
  
  return classes;
};

const formatCellValue = (data, column) => {
  const value = getNestedValue(data, column.field);
  
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value);
  }
  
  return formatValue(value, column.type, column.formatOptions);
};

const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

const getStatusSeverity = (status) => {
  if (!status) return 'secondary';
  
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus.includes('active') || lowerStatus.includes('completed') || lowerStatus.includes('paid')) {
    return 'success';
  } else if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
    return 'warning';
  } else if (lowerStatus.includes('inactive') || lowerStatus.includes('cancelled') || lowerStatus.includes('failed')) {
    return 'danger';
  }
  
  return 'info';
};

const toggleRowExpansion = (event) => {
  // Handle row expansion for detailed view
  const rowData = event.data;
  const isExpanded = expandedRows.value.includes(rowData);
  
  if (isExpanded) {
    expandedRows.value = expandedRows.value.filter(row => row !== rowData);
  } else {
    expandedRows.value.push(rowData);
  }
};

const selectAllRows = () => {
  selectedRows.value = [...tableData.value];
};

const clearSelection = () => {
  selectedRows.value = [];
};

const generateSummary = () => {
  if (!hasData.value) return;
  
  tableSummary.value = generateTableSummary(tableData.value, tableColumns.value);
};

const refreshTable = () => {
  // Emit refresh event to parent
  emit('refresh-table');
};

const copyToClipboard = (value) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(String(value));
  }
};

// Emits
const emit = defineEmits(['refresh-table', 'row-select', 'row-expand']);

// Watchers
watch(() => props.data, () => {
  generateSummary();
}, { immediate: true, deep: true });

watch(() => props.tableConfig, () => {
  generateSummary();
}, { immediate: true, deep: true });

watch(selectedRows, (newSelection) => {
  emit('row-select', newSelection);
}, { deep: true });
</script>

<template>
  <Card class="table-section">
    <template #header>
      <div class="table-header">
        <div class="header-content">
          <i class="pi pi-table header-icon"></i>
          <h3>{{ t('reports.reportData') }}</h3>
          <Badge v-if="hasData" :value="tableData.length" class="data-count-badge" />
          <Badge v-if="hasSelection" :value="`${selectedRows.length} selected`" severity="success" class="selection-badge" />
        </div>
        
        <div class="table-actions">
          <!-- Global Search -->
          <div class="search-field">
            <InputText
              v-model="globalFilterValue"
              :placeholder="t('common.search')"
              class="global-search"
            >
              <template #prefix>
                <i class="pi pi-search"></i>
              </template>
            </InputText>
          </div>
          
          <!-- Action Buttons -->
          <Button
            icon="pi pi-filter-slash"
            :label="t('common.clearFilters')"
            class="p-button-outlined p-button-sm"
            @click="clearFilters"
            :disabled="Object.keys(filters).length === 0 && !globalFilterValue"
          />
          
          <Button
            v-if="tableOptions.enableSelection"
            icon="pi pi-check-square"
            :label="t('common.selectAll')"
            class="p-button-outlined p-button-sm"
            @click="selectAllRows"
            :disabled="!hasData"
          />
          
          <Button
            v-if="hasSelection"
            icon="pi pi-times"
            :label="t('common.clearSelection')"
            class="p-button-outlined p-button-sm"
            @click="clearSelection"
          />
          
          <SplitButton
            icon="pi pi-download"
            :label="t('common.export')"
            class="p-button-outlined p-button-sm"
            @click="exportCSV"
            :model="[
              {
                label: t('common.exportCSV'),
                icon: 'pi pi-file',
                command: () => exportCSV()
              },
              {
                label: t('common.exportSelected'),
                icon: 'pi pi-check',
                command: () => exportSelectedCSV(),
                disabled: !hasSelection
              }
            ]"
            :disabled="!hasData"
          />
          
          <Button
            icon="pi pi-refresh"
            class="p-button-text p-button-sm"
            v-tooltip="t('common.refresh')"
            @click="refreshTable"
          />
        </div>
      </div>
    </template>
    
    <template #content>
      <DataTable
        :value="tableData"
        :paginator="tableOptions.enablePagination"
        :rows="tableOptions.defaultPageSize || 25"
        :rowsPerPageOptions="rowsPerPageOptions"
        :loading="loading"
        :globalFilterFields="globalFilterFields"
        :globalFilter="globalFilterValue"
        filterDisplay="row"
        sortMode="multiple"
        removableSort
        :selection="tableOptions.enableSelection ? selectedRows : undefined"
        :selectionMode="tableOptions.enableSelection ? 'multiple' : undefined"
        v-model:selection="selectedRows"
        v-model:filters="filters"
        v-model:expandedRows="expandedRows"
        :rowClass="getRowClass"
        class="report-datatable"
        responsiveLayout="scroll"
        :scrollable="true"
        scrollHeight="600px"
        :resizableColumns="true"
        columnResizeMode="expand"
        showGridlines
        stripedRows
        @row-click="toggleRowExpansion"
      >
        <template #empty>
          <div class="table-empty-state">
            <i class="pi pi-inbox empty-icon"></i>
            <h4>{{ t('reports.noDataFound') }}</h4>
            <p>{{ t('reports.noDataDescription') }}</p>
          </div>
        </template>
        
        <template #loading>
          <div class="table-loading-state">
            <ProgressSpinner style="width:50px;height:50px" />
            <p>{{ t('common.loading') }}</p>
          </div>
        </template>
        
        <!-- Selection Column -->
        <Column
          v-if="tableOptions.enableSelection"
          selectionMode="multiple"
          headerStyle="width: 3rem"
        />
        
        <!-- Expand Column -->
        <Column
          v-if="tableOptions.enableGrouping"
          expander
          headerStyle="width: 3rem"
        />
        
        <!-- Data Columns -->
        <Column
          v-for="column in tableColumns"
          :key="column.field"
          :field="column.field"
          :header="column.header"
          :sortable="column.sortable"
          :class="getColumnClass(column)"
          :style="{ 
            minWidth: column.width || '150px',
            width: column.width || 'auto'
          }"
          :frozen="column.frozen"
          :showFilterMenu="column.filterable"
        >
          <!-- Column Filter -->
          <template v-if="column.filterable" #filter="{ filterModel, filterCallback }">
            <!-- Text Filter -->
            <InputText
              v-if="!column.filterConfig || column.filterConfig.type === 'text'"
              v-model="filterModel.value"
              type="text"
              @keydown.enter="filterCallback()"
              :placeholder="`Filter ${column.header}`"
              class="column-filter"
            />
            
            <!-- Number Filter -->
            <InputNumber
              v-else-if="column.filterConfig.type === 'number'"
              v-model="filterModel.value"
              @keydown.enter="filterCallback()"
              :placeholder="`Filter ${column.header}`"
              class="column-filter"
            />
            
            <!-- Date Filter -->
            <Calendar
              v-else-if="column.filterConfig.type === 'date'"
              v-model="filterModel.value"
              dateFormat="yy-mm-dd"
              :placeholder="`Filter ${column.header}`"
              class="column-filter"
            />
            
            <!-- Select Filter -->
            <Dropdown
              v-else-if="column.filterConfig.type === 'select'"
              v-model="filterModel.value"
              :options="column.filterConfig.options"
              optionLabel="label"
              optionValue="value"
              :placeholder="`Filter ${column.header}`"
              class="column-filter"
              showClear
            />
          </template>
          
          <!-- Column Body -->
          <template #body="{ data, field }">
            <div class="cell-content" @click.stop="copyToClipboard(getNestedValue(data, field))">
              <!-- Group Header -->
              <div v-if="data._isGroupHeader" class="group-header">
                <strong>{{ data._groupName }}</strong>
                <Badge :value="data._groupCount" />
              </div>
              
              <!-- Currency Format -->
              <span v-else-if="column.type === 'currency'" class="currency-value">
                {{ formatCellValue(data, column) }}
              </span>
              
              <!-- Date Format -->
              <span v-else-if="column.type === 'date'" class="date-value">
                {{ formatCellValue(data, column) }}
              </span>
              
              <!-- Number Format -->
              <span v-else-if="column.type === 'number'" class="number-value">
                {{ formatCellValue(data, column) }}
              </span>
              
              <!-- Boolean Format -->
              <Tag 
                v-else-if="column.type === 'boolean'"
                :value="getNestedValue(data, field) ? 'Yes' : 'No'"
                :severity="getNestedValue(data, field) ? 'success' : 'danger'"
              />
              
              <!-- Status Format -->
              <Tag 
                v-else-if="column.type === 'status'"
                :value="getNestedValue(data, field)"
                :severity="getStatusSeverity(getNestedValue(data, field))"
              />
              
              <!-- Email Format -->
              <a
                v-else-if="column.type === 'email'"
                :href="`mailto:${getNestedValue(data, field)}`"
                class="email-link"
                @click.stop
              >
                {{ getNestedValue(data, field) }}
              </a>
              
              <!-- URL Format -->
              <a
                v-else-if="column.type === 'url'"
                :href="getNestedValue(data, field)"
                target="_blank"
                class="url-link"
                @click.stop
              >
                {{ getNestedValue(data, field) }}
              </a>
              
              <!-- Default Text -->
              <span v-else class="text-value">
                {{ formatCellValue(data, column) }}
              </span>
            </div>
          </template>
        </Column>
        
        <!-- Expansion Template -->
        <template v-if="tableOptions.enableGrouping" #expansion="{ data }">
          <div class="row-expansion">
            <h5>Details for {{ data[tableColumns[0]?.field] }}</h5>
            <div class="expansion-grid">
              <div
                v-for="column in tableColumns"
                :key="column.field"
                class="expansion-item"
              >
                <strong>{{ column.header }}:</strong>
                <span>{{ formatCellValue(data, column) }}</span>
              </div>
            </div>
          </div>
        </template>
      </DataTable>
      
      <!-- Table Summary -->
      <div v-if="tableSummary.totalRows" class="table-summary">
        <div class="summary-row">
          <span class="summary-label">Total Rows:</span>
          <span class="summary-value">{{ tableSummary.totalRows.toLocaleString() }}</span>
        </div>
        <div
          v-for="column in tableSummary.columns"
          :key="column.field"
          class="summary-row"
        >
          <span class="summary-label">{{ column.header }}:</span>
          <div class="summary-stats">
            <span v-if="column.sum" class="stat">Sum: {{ formatValue(column.sum, column.type) }}</span>
            <span v-if="column.average" class="stat">Avg: {{ formatValue(column.average, column.type) }}</span>
            <span v-if="column.min" class="stat">Min: {{ formatValue(column.min, column.type) }}</span>
            <span v-if="column.max" class="stat">Max: {{ formatValue(column.max, column.type) }}</span>
            <span v-if="column.uniqueValues" class="stat">Unique: {{ column.uniqueValues }}</span>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.table-section {
  margin-bottom: 2rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.header-icon {
  font-size: 1.25rem;
  color: #3498db;
}

.table-header h3 {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
  font-size: 1.25rem;
}

.data-count-badge {
  background: #3498db;
  color: white;
}

.selection-badge {
  background: #27ae60;
  color: white;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.search-field {
  position: relative;
}

.global-search {
  min-width: 200px;
}

.table-empty-state,
.table-loading-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.table-empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.table-empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.cell-content {
  padding: 0.25rem 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cell-content:hover {
  background: rgba(52, 152, 219, 0.1);
  border-radius: 3px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
}

.currency-value {
  font-weight: 600;
  color: #27ae60;
}

.number-value {
  font-weight: 500;
  color: #2c3e50;
}

.date-value {
  color: #6c757d;
  font-size: 0.9rem;
}

.text-value {
  color: #2c3e50;
}

.email-link,
.url-link {
  color: #3498db;
  text-decoration: none;
}

.email-link:hover,
.url-link:hover {
  text-decoration: underline;
}

.column-filter {
  width: 100%;
  font-size: 0.875rem;
}

.row-expansion {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin: 0.5rem 0;
}

.expansion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.expansion-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.table-summary {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid #e9ecef;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 600;
  color: #495057;
}

.summary-value {
  color: #2c3e50;
  font-weight: 500;
}

.summary-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Table Styling */
.report-datatable {
  border: none;
  box-shadow: none;
}

/* Text Alignment */
.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

/* Row Striping */
:deep(.table-row-even) {
  background-color: #fafafa;
}

:deep(.table-row-odd) {
  background-color: white;
}

:deep(.group-header-row) {
  background-color: #e3f2fd !important;
  font-weight: 600;
}

:deep(.inactive-row) {
  opacity: 0.6;
}

:deep(.highlighted-row) {
  background-color: #fff3cd !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .global-search {
    min-width: auto;
    width: 100%;
  }
  
  .report-datatable {
    font-size: 0.875rem;
  }
  
  .expansion-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* Loading Animation */
.table-loading-state p {
  margin-top: 1rem;
  font-weight: 500;
}

/* PrimeVue Overrides */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8f9fa;
  border: none;
  padding: 1rem;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f3f4;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #e3f2fd !important;
}

:deep(.p-paginator) {
  background: #f8f9fa;
  border: none;
  padding: 1rem;
}

:deep(.p-datatable .p-column-filter) {
  width: 100%;
}

:deep(.p-datatable .p-datatable-scrollable-body) {
  border-radius: 6px;
}
</style>