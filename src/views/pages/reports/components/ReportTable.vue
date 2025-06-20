<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatValue } from '../utils/formatters';

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
  loading: {
    type: Boolean,
    default: false
  }
});

// Reactive data
const filters = ref({});
const selectedRows = ref([]);

// Computed
const hasData = computed(() => {
  return props.data && props.data.length > 0;
});

const globalFilterFields = computed(() => {
  return props.report.columns
    .filter(col => col.filterable)
    .map(col => col.field);
});

const exportColumns = computed(() => {
  return props.report.columns.map(col => ({
    title: col.header,
    dataKey: col.field
  }));
});

// Methods
const clearFilters = () => {
  filters.value = {};
};

const exportCSV = () => {
  if (!hasData.value) return;
  
  const csvContent = generateCSV();
  downloadFile(csvContent, 'csv', 'text/csv');
};

const generateCSV = () => {
  const headers = props.report.columns.map(col => col.header).join(',');
  const rows = props.data.map(row => 
    props.report.columns.map(col => {
      const value = row[col.field];
      return formatValue(value, col.type);
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
};

const downloadFile = (content, extension, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${props.report.id}-data-${timestamp}.${extension}`);
  document.body.appendChild(link);
  link.click();
  
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

const getColumnClass = (column) => {
  const classes = ['table-column'];
  
  if (column.type === 'currency') classes.push('text-right');
  if (column.type === 'number') classes.push('text-right');
  if (column.type === 'date') classes.push('text-center');
  
  return classes.join(' ');
};

const getRowClass = (data, index) => {
  return {
    'table-row-even': index % 2 === 0,
    'table-row-odd': index % 2 === 1
  };
};
</script>

<template>
  <Card class="table-section">
    <template #header>
      <div class="table-header">
        <div class="header-content">
          <i class="pi pi-table header-icon"></i>
          <h3>{{ t('reports.reportData') }}</h3>
          <Badge v-if="hasData" :value="data.length" class="data-count-badge" />
        </div>
        
        <div class="table-actions">
          <Button
            icon="pi pi-filter-slash"
            :label="t('common.clearFilters')"
            class="p-button-outlined p-button-sm"
            @click="clearFilters"
            :disabled="Object.keys(filters).length === 0"
          />
          <Button
            icon="pi pi-download"
            :label="t('common.exportCSV')"
            class="p-button-outlined p-button-sm"
            @click="exportCSV"
            :disabled="!hasData"
          />
        </div>
      </div>
    </template>
    
    <template #content>
      <DataTable
        :value="data"
        :paginator="true"
        :rows="25"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        :loading="loading"
        filterDisplay="row"
        :globalFilterFields="globalFilterFields"
        sortMode="multiple"
        removableSort
        v-model:selection="selectedRows"
        v-model:filters="filters"
        :rowClass="getRowClass"
        class="report-datatable"
        responsiveLayout="scroll"
        :scrollable="true"
        scrollHeight="500px"
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
        
        <Column
          v-for="column in report.columns"
          :key="column.field"
          :field="column.field"
          :header="column.header"
          :sortable="column.sortable"
          :class="getColumnClass(column)"
          :style="{ minWidth: '150px' }"
        >
          <template v-if="column.filterable" #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              type="text"
              @keydown.enter="filterCallback()"
              :placeholder="`Search ${column.header}`"
              class="column-filter"
            />
          </template>
          
          <template #body="{ data, field }">
            <div class="cell-content">
              <!-- Currency Format -->
              <span v-if="column.type === 'currency'" class="currency-value">
                {{ formatValue(data[field], 'currency') }}
              </span>
              
              <!-- Date Format -->
              <span v-else-if="column.type === 'date'" class="date-value">
                {{ formatValue(data[field], 'date') }}
              </span>
              
              <!-- Number Format -->
              <span v-else-if="column.type === 'number'" class="number-value">
                {{ formatValue(data[field], 'number') }}
              </span>
              
              <!-- Boolean Format -->
              <Tag 
                v-else-if="column.type === 'boolean'"
                :value="data[field] ? 'Yes' : 'No'"
                :severity="data[field] ? 'success' : 'danger'"
              />
              
              <!-- Status Format -->
              <Tag 
                v-else-if="column.type === 'status'"
                :value="data[field]"
                :severity="getStatusSeverity(data[field])"
              />
              
              <!-- Default Text -->
              <span v-else class="text-value">
                {{ data[field] || '-' }}
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script>
// Additional methods
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
</script>

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

.table-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.column-filter {
  width: 100%;
  font-size: 0.875rem;
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

/* Row Striping */
:deep(.table-row-even) {
  background-color: #fafafa;
}

:deep(.table-row-odd) {
  background-color: white;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-actions {
    justify-content: center;
  }
  
  .report-datatable {
    font-size: 0.875rem;
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
</style>