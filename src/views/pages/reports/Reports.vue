<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

const { t } = useI18n();
const mainStore = useMainStore();
const loading = ref(false);
const rtl = computed(() => mainStore.isRTL);

// Available reports configuration
const reports = ref([
  {
    id: 'aging-report',
    name: t('reports.agingReport'),
    icon: 'pi-file-pdf',
    color: 'bg-blue-100',
    textColor: 'text-blue-700',
    description: t('reports.agingReportDescription'),
    endpoint: '/Invoices/GenerateAgingReport',
    requestMethod: 'POST',
    filters: [
      { 
        type: 'date', 
        name: 'asOfDate', 
        label: t('reports.asOfDate'),
        required: true,
        default: new Date() 
      },
      { 
        type: 'dropdown', 
        name: 'branchId', 
        label: t('reports.branch'),
        required: true,
        endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
        optionLabel: 'name',
        optionValue: 'id'
      }
    ]
  },
  // Additional report configurations can be added here
//   {
//     id: 'sales-report',
//     name: t('reports.salesReport'),
//     icon: 'pi-chart-line',
//     color: 'bg-green-100',
//     textColor: 'text-green-700',
//     description: t('reports.salesReportDescription'),
//     endpoint: '/Reports/GenerateSalesReport',
//     requestMethod: 'POST',
//     filters: [
//       { 
//         type: 'daterange', 
//         name: 'dateRange', 
//         label: t('reports.dateRange'),
//         required: true,
//         startDate: 'startDate',
//         endDate: 'endDate',
//         default: { 
//           startDate: new Date(new Date().setDate(new Date().getDate() - 30)), 
//           endDate: new Date() 
//         }
//       },
//       { 
//         type: 'dropdown', 
//         name: 'branchId', 
//         label: t('reports.branch'),
//         required: true,
//         endpoint: '/Reports/GetUserVanSaleInBranch',
//         optionLabel: 'name',
//         optionValue: 'id'
//       }
//     ]
//   },
//   {
//     id: 'inventory-report',
//     name: t('reports.inventoryReport'),
//     icon: 'pi-box',
//     color: 'bg-purple-100',
//     textColor: 'text-purple-700',
//     description: t('reports.inventoryReportDescription'),
//     endpoint: '/Reports/GenerateInventoryReport',
//     requestMethod: 'POST',
//     filters: [
//       { 
//         type: 'date', 
//         name: 'asOfDate', 
//         label: t('reports.asOfDate'),
//         required: true,
//         default: new Date() 
//       },
//       { 
//         type: 'dropdown', 
//         name: 'branchId', 
//         label: t('reports.branch'),
//         required: true,
//         endpoint: '/Reports/GetUserVanSaleInBranch',
//         optionLabel: 'name',
//         optionValue: 'id'
//       }
//     ]
//   }
]);

// Selected report and filter handling
const selectedReport = ref(null);
const filterValues = reactive({});
const filterOptions = reactive({});
const reportDialogVisible = ref(false);

const selectReport = (report) => {
  selectedReport.value = report;
  resetFilterValues();
  loadFilterOptions();
  reportDialogVisible.value = true;
};

const resetFilterValues = () => {
  if (!selectedReport.value) return;
  
  // Initialize filter values with defaults
  filterValues.value = {};
  selectedReport.value.filters.forEach(filter => {
    if (filter.type === 'date' || filter.type === 'datetime') {
      filterValues[filter.name] = filter.default || new Date();
    } 
    else if (filter.type === 'daterange') {
      filterValues[filter.startDate] = filter.default?.startDate || new Date(new Date().setDate(new Date().getDate() - 30));
      filterValues[filter.endDate] = filter.default?.endDate || new Date();
    }
    else if (filter.type === 'dropdown') {
      filterValues[filter.name] = null;
    }
    else if (filter.type === 'checkbox') {
      filterValues[filter.name] = filter.default || false;
    }
    else if (filter.type === 'radio') {
      filterValues[filter.name] = filter.default || filter.options?.[0]?.value;
    }
    else {
      filterValues[filter.name] = filter.default || null;
    }
  });
};

const loadFilterOptions = async () => {
  if (!selectedReport.value) return;

  loading.value = true;
  try {
    // Load options for dropdowns and other filters that need data
    for (const filter of selectedReport.value.filters) {
      if (filter.type === 'dropdown' && filter.endpoint) {
        const response = await apiClient.get(filter.endpoint);
        if (response.data.success) {
          filterOptions[filter.name] = response.data.data;
        }
      }
    }
  } catch (err) {
    handleError(err, mainStore.loading);
  } finally {
    loading.value = false;
  }
};

const isFormValid = computed(() => {
  if (!selectedReport.value) return false;
  
  for (const filter of selectedReport.value.filters) {
    if (filter.required) {
      if (filter.type === 'daterange') {
        if (!filterValues[filter.startDate] || !filterValues[filter.endDate]) {
          return false;
        }
      } else if (!filterValues[filter.name]) {
        return false;
      }
    }
  }
  return true;
});

const generateReport = async () => {
  if (!selectedReport.value || !isFormValid.value) return;

  loading.value = true;
  try {
    // Prepare payload from filter values
    const payload = {};
    selectedReport.value.filters.forEach(filter => {
      if (filter.type === 'daterange') {
        payload[filter.startDate] = filterValues[filter.startDate];
        payload[filter.endDate] = filterValues[filter.endDate];
      } else {
        payload[filter.name] = filterValues[filter.name];
      }
    });

    // Get report from API
    const response = await apiClient({
      url: selectedReport.value.endpoint,
      method: selectedReport.value.requestMethod,
      data: payload,
      responseType: 'blob'
    });

    // Handle PDF response
    const contentType = response.headers['content-type'];
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedReport.value.id}-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    mainStore.loading.setNotificationInfo('success', t('reports.downloadSuccess'));
    reportDialogVisible.value = false;
  } catch (err) {
    handleError(err, mainStore.loading);
  } finally {
    loading.value = false;
  }
};

// For new report form (admin functionality)
const newReportFormVisible = ref(false);
const newReport = reactive({
  id: '',
  name: '',
  icon: 'pi-file',
  color: 'bg-blue-100',
  textColor: 'text-blue-700',
  description: '',
  endpoint: '',
  requestMethod: 'POST',
  filters: []
});

const showNewReportForm = () => {
  newReportFormVisible.value = true;
};

const addNewReport = () => {
  // This would typically save to backend, but for now just adds to local array
  reports.value.push({...newReport});
  newReportFormVisible.value = false;
  // Reset form
  Object.keys(newReport).forEach(key => {
    if (Array.isArray(newReport[key])) {
      newReport[key] = [];
    } else if (typeof newReport[key] === 'object') {
      newReport[key] = {};
    } else {
      newReport[key] = '';
    }
  });
  newReport.requestMethod = 'POST';
  newReport.icon = 'pi-file';
  newReport.color = 'bg-blue-100';
  newReport.textColor = 'text-blue-700';
};

// Initialize
onMounted(() => {
  // Any initialization needed
});
</script>

<template>
  <div :class="['grid px-6', { 'rtl-direction': rtl }]">
    <!-- Header Section -->
    <div class="flex flex-column row-gap-5 px-3 lg:flex-row justify-content-between mb-5 lg:mb-0 w-full">
      <div class="lg:col-8 px-0 pt-2">
        <h3 class="text-700 text-3xl font-semibold">{{ t('reports.header') }}</h3>
        <p class="text-500 text-lg">{{ t('reports.description') }}</p>
      </div>
      
      <div v-if="false" class="flex cursor-pointer flex-row justify-content-center gap-2 align-items-center bg-primary text-white border-round h-3rem w-full lg:w-14rem" @click="showNewReportForm">
        <div class="">+</div>
        <div class="">{{ t('reports.addNewReport') }}</div>
      </div>
    </div>

    <!-- Search Bar -->
    <!-- <div class="col-12 mb-4">
      <span class="p-input-icon-left w-full md:w-6">
        <i class="pi pi-search" />
        <InputText v-model="searchQuery" class="w-full" :placeholder="t('reports.searchReports')" />
      </span>
    </div> -->

    <!-- Reports Grid -->
    <div class="grid" style="min-width: 100%">
      <div v-for="report in reports" :key="report.id" class="col-12 lg:col-6 xl:col-4">
        <div class="card mb-4 cursor-pointer shadow-2 hover:shadow-5 transition-duration-200" @click="selectReport(report)">
          <div class="flex flex-column p-4 h-full">
            <div class="flex align-items-center mb-4">
              <div :class="[report.color, 'w-3rem h-3rem border-circle flex align-items-center justify-content-center mr-3']">
                <i :class="['pi', report.icon, report.textColor, 'text-xl']"></i>
              </div>
              <h3 :class="['font-semibold text-xl m-0', report.textColor]">{{ report.name }}</h3>
            </div>
            
            <p class="line-height-3 text-500 my-3">{{ report.description }}</p>
            
            <div class="flex justify-content-between mt-auto">
              <div class="flex gap-2">
                <Tag v-for="(filter, index) in report.filters.slice(0, 2)" :key="index" :class="[report.color, report.textColor, 'font-semibold']">
                  {{ filter.label }}
                </Tag>
                <Tag v-if="report.filters.length > 2" :class="[report.color, report.textColor, 'font-semibold']">
                  +{{ report.filters.length - 2 }}
                </Tag>
              </div>
              <Button icon="pi pi-download" :class="[report.textColor, 'p-button-rounded p-button-text']" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Report Parameter Dialog -->
  <Dialog v-model:visible="reportDialogVisible" :modal="true" :closable="true" :style="{width: '500px'}" :header="selectedReport?.name">
    <div v-if="selectedReport" class="flex flex-column gap-3 p-3">
      <div v-for="filter in selectedReport.filters" :key="filter.name" class="field w-full">
        <label :for="filter.name" class="block font-medium mb-2" :class="{ 'required': filter.required }">
          {{ filter.label }}
        </label>

        <!-- Date Picker -->
        <Calendar 
          v-if="filter.type === 'date'" 
          v-model="filterValues[filter.name]" 
          :showIcon="true" 
          :id="filter.name"
          dateFormat="yy-mm-dd"
          class="w-full"
        />
        
        <!-- Date Range Picker -->
        <div v-else-if="filter.type === 'daterange'" class="flex gap-2">
          <Calendar 
            v-model="filterValues[filter.startDate]" 
            :showIcon="true" 
            :id="filter.startDate"
            dateFormat="yy-mm-dd"
            class="w-full"
            :placeholder="t('reports.startDate')"
          />
          <Calendar 
            v-model="filterValues[filter.endDate]" 
            :showIcon="true" 
            :id="filter.endDate"
            dateFormat="yy-mm-dd"
            class="w-full"
            :placeholder="t('reports.endDate')"
          />
        </div>
        
        <!-- Dropdown -->
        <Dropdown 
          v-else-if="filter.type === 'dropdown'" 
          v-model="filterValues[filter.name]" 
          :options="filterOptions[filter.name] || []" 
          :optionLabel="filter.optionLabel" 
          :optionValue="filter.optionValue"
          :placeholder="filter.label"
          class="w-full"
        />

        <!-- Other filter types can be added here -->
      </div>
    </div>

    <!-- <template #footer> -->
      <div class="flex justify-content-end gap-2">
        <Button :label="t('reports.cancel')" severity="secondary" outlined @click="reportDialogVisible = false" />
        <Button :label="t('reports.generate')" :loading="loading" @click="generateReport()" :disabled="!isFormValid" />
      </div>
    <!-- </template> -->
  </Dialog>

  <!-- New Report Form Dialog (Admin only) -->
  <Dialog v-model:visible="newReportFormVisible" :modal="true" :closable="true" :style="{width: '600px'}" :header="t('reports.addNewReport')">
    <div class="flex flex-column gap-3 p-3">
      <!-- Report Form Fields -->
      <div class="field w-full">
        <label for="report-id" class="block font-medium mb-2 required">{{ t('reports.reportId') }}</label>
        <InputText id="report-id" v-model="newReport.id" class="w-full" />
      </div>
      
      <div class="field w-full">
        <label for="report-name" class="block font-medium mb-2 required">{{ t('reports.reportName') }}</label>
        <InputText id="report-name" v-model="newReport.name" class="w-full" />
      </div>
      
      <div class="field w-full">
        <label for="report-description" class="block font-medium mb-2">{{ t('reports.reportDescription') }}</label>
        <Textarea id="report-description" v-model="newReport.description" class="w-full" rows="3" />
      </div>
      
      <div class="field w-full">
        <label for="report-endpoint" class="block font-medium mb-2 required">{{ t('reports.reportEndpoint') }}</label>
        <InputText id="report-endpoint" v-model="newReport.endpoint" class="w-full" />
      </div>
      
      <div class="field w-full">
        <label for="report-method" class="block font-medium mb-2 required">{{ t('reports.requestMethod') }}</label>
        <Dropdown id="report-method" v-model="newReport.requestMethod" :options="['GET', 'POST']" class="w-full" />
      </div>
      
      <!-- For simplicity, we're not implementing the full filter configuration UI -->
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button :label="t('reports.cancel')" severity="secondary" outlined @click="newReportFormVisible = false" />
        <Button :label="t('reports.addReport')" @click="addNewReport()" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.rtl-direction {
  direction: rtl;
}

.field .required:after {
  content: " *";
  color: red;
}

.card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-3px);
}

:deep(.p-dropdown-label) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

:deep(.p-calendar .p-inputtext) {
  width: 100%;
}
</style>