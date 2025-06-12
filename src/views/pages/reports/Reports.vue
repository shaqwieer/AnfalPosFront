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

// Report categories
const reportCategories = ref([
  {
    id: 'pdf-reports',
    name: t('reports.pdfReports'),
    icon: 'pi-file-pdf',
    color: 'bg-red-100',
    textColor: 'text-red-700',
    description: t('reports.pdfReportsDescription')
  },
  {
    id: 'excel-reports',
    name: t('reports.excelReports'),
    icon: 'pi-file-excel',
    color: 'bg-green-100',
    textColor: 'text-green-700',
    description: t('reports.excelReportsDescription')
  }
]);

// Available reports configuration
const reports = ref({
  'pdf-reports': [
    {
      id: 'aging-report',
      name: t('reports.agingReport'),
      icon: 'pi-file-pdf',
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
      description: t('reports.agingReportDescription'),
      endpoint: '/Invoices/GenerateAgingReport',
      requestMethod: 'POST',
      responseType: 'blob',
      fileExtension: 'pdf',
      contentType: 'application/pdf',
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
    {
      id: 'item-availability-report',
      name: t('reports.itemAvailabilityReport'),
      icon: 'pi-box',
      color: 'bg-green-100',
      textColor: 'text-green-700',
      description: t('reports.itemAvailabilityReportDescription'),
      endpoint: '/Items/GenerateItemAvailabiltyReport',
      requestMethod: 'POST',
      responseType: 'blob',
      fileExtension: 'pdf',
      contentType: 'application/pdf',
      filters: [
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
    {
      id: 'sales-rep-cash-report',
      name: t('reports.salesRepCashReport'),
      icon: 'pi-chart-line',
      color: 'bg-orange-100',
      textColor: 'text-orange-700',
      description: t('reports.salesRepCashReportDescription'),
      endpoint: '/shiftSessions/GenerateSalesRepWithCashReport',
      requestMethod: 'POST',
      responseType: 'blob',
      fileExtension: 'pdf',
      contentType: 'application/pdf',
      filters: [
        { 
          type: 'multiselect', 
          name: 'branchIds', 
          label: t('reports.branches'),
          required: true,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          optionLabel: 'name',
          optionValue: 'id'
        }
      ]
    },
    {
      id: 'item-usability-report',
      name: t('reports.itemUsabilityReport'),
      icon: 'pi-chart-bar',
      color: 'bg-purple-100',
      textColor: 'text-purple-700',
      description: t('reports.itemUsabilityReportDescription'),
      endpoint: '/Invoices/GenerateItemUsabilityFor',
      requestMethod: 'POST',
      responseType: 'blob',
      fileExtension: 'pdf',
      contentType: 'application/pdf',
      filters: [
        {
          type: 'daterange',
          startDate: 'fromDate',
          endDate: 'toDate',
          label: t('reports.dateRange'),
          required: true,
          default: {
            startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
            endDate: new Date()
          }
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
    {
      id: 'collection-report',
      name: t('reports.collectionReport'),
      icon: 'pi-money-bill',
      color: 'bg-teal-100',
      textColor: 'text-teal-700',
      description: t('reports.collectionReportDescription'),
      endpoint: '/Invoices/GenerateCollectionPdf',
      requestMethod: 'POST',
      responseType: 'blob',
      fileExtension: 'pdf',
      contentType: 'application/pdf',
      filters: [
        {
          type: 'daterange',
          startDate: 'fromDate',
          endDate: 'toDate',
          label: t('reports.dateRange'),
          required: false,
          default: {
            startDate: null,
            endDate: null
          }
        },
        { 
          type: 'dropdown', 
          name: 'branchId', 
          label: t('reports.branch'),
          required: false,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          lookupKey: 'branches',
          optionLabel: 'name',
          optionValue: 'id'
        },
        { 
          type: 'dropdown', 
          name: 'paymentMethodId', 
          label: t('reports.paymentMethod'),
          required: false,
          endpoint: '/PaymentMethods',
          lookupKey: 'paymentMethods',
          optionLabel: 'name',
          optionValue: 'id'
        },
        { 
          type: 'dropdown', 
          name: 'sessionId', 
          label: t('reports.sessionNumber'),
          required: false,
          endpoint: '/Payments/GenerateCollectionPdfLookup',
          lookupKey: 'sessionNumbers',
          optionLabel: 'id',
          optionValue: 'id'
        }
      ]
    }
  ],
  'excel-reports': [
    {
      id: 'sales-excel-report',
      name: t('reports.salesExcelReport'),
      icon: 'pi-chart-line',
      color: 'bg-green-100',
      textColor: 'text-green-700',
      description: t('reports.salesExcelReportDescription'),
      endpoint: '/Invoices/GetSalesAsExcel',
      requestMethod: 'POST',
      responseType: 'blob',
      fileExtension: 'xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filters: [
        {
          type: 'daterange',
          startDate: 'fromDate',
          endDate: 'toDate',
          label: t('reports.dateRange'),
          required: true,
          default: {
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate: new Date()
          }
        },
        { 
          type: 'multiselect', 
          name: 'branchIds', 
          label: t('reports.branches'),
          required: true,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          optionLabel: 'name',
          optionValue: 'id'
        }
      ]
    }
  ]
});

// Current view state
const currentCategory = ref(null);
const selectedReport = ref(null);
const filterValues = reactive({});
const filterOptions = reactive({});
const reportDialogVisible = ref(false);

// Navigation
const selectCategory = (category) => {
  currentCategory.value = category;
};

const goBack = () => {
  currentCategory.value = null;
  selectedReport.value = null;
  reportDialogVisible.value = false;
};

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
      filterValues[filter.startDate] = filter.default?.startDate;
      filterValues[filter.endDate] = filter.default?.endDate;
    }
    else if (filter.type === 'dropdown') {
      filterValues[filter.name] = null;
    }
    else if (filter.type === 'multiselect') {
      filterValues[filter.name] = [];
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
      if ((filter.type === 'dropdown' || filter.type === 'multiselect') && filter.endpoint) {
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
      } else if (filter.type === 'multiselect') {
        if (!filterValues[filter.name] || filterValues[filter.name].length === 0) {
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
    // Prepare payload/params from filter values
    const payload = {};
    const params = {};
    
    selectedReport.value.filters.forEach(filter => {
      if (filter.type === 'daterange') {
        const startValue = filterValues[filter.startDate];
        const endValue = filterValues[filter.endDate];
        
        if (selectedReport.value.requestMethod === 'GET') {
          if (startValue) params[filter.startDate] = startValue.toISOString();
          if (endValue) params[filter.endDate] = endValue.toISOString();
        } else {
          if (startValue) payload[filter.startDate] = startValue.toISOString();
          if (endValue) payload[filter.endDate] = endValue.toISOString();
        }
      } else {
        const value = filterValues[filter.name];
        if (value !== null && value !== undefined && value !== '') {
          if (selectedReport.value.requestMethod === 'GET') {
            params[filter.name] = value;
          } else {
            payload[filter.name] = value;
          }
        }
      }
    });

    // Prepare request configuration
    const requestConfig = {
      url: selectedReport.value.endpoint,
      method: selectedReport.value.requestMethod,
      responseType: selectedReport.value.responseType || 'blob'
    };

    if (selectedReport.value.requestMethod === 'GET') {
      requestConfig.params = params;
    } else {
      requestConfig.data = payload;
    }

    // Get report from API
    const response = await apiClient(requestConfig);

    // Handle file response
    const contentType = selectedReport.value.contentType || response.headers['content-type'];
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `${selectedReport.value.id}-${timestamp}.${selectedReport.value.fileExtension}`);
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
        <div class="flex align-items-center gap-3 mb-3" v-if="currentCategory">
          <Button icon="pi pi-arrow-left" severity="secondary" text @click="goBack" />
          <h3 class="text-700 text-3xl font-semibold m-0">{{ currentCategory.name }}</h3>
        </div>
        <h3 v-else class="text-700 text-3xl font-semibold">{{ t('reports.header') }}</h3>
        <p class="text-500 text-lg">
          {{ currentCategory ? currentCategory.description : t('reports.description') }}
        </p>
      </div>
    </div>

    <!-- Category Selection -->
    <div v-if="!currentCategory" class="grid" style="min-width: 100%">
      <div v-for="category in reportCategories" :key="category.id" class="col-12 lg:col-6">
        <div class="card mb-4 cursor-pointer shadow-2 hover:shadow-5 transition-duration-200" @click="selectCategory(category)">
          <div class="flex flex-column p-6 h-full">
            <div class="flex align-items-center mb-4">
              <div :class="[category.color, 'w-4rem h-4rem border-circle flex align-items-center justify-content-center mr-4']">
                <i :class="['pi', category.icon, category.textColor, 'text-2xl']"></i>
              </div>
              <h3 :class="['font-semibold text-2xl m-0', category.textColor]">{{ category.name }}</h3>
            </div>
            
            <p class="line-height-3 text-500 my-3 text-lg">{{ category.description }}</p>
            
            <div class="flex justify-content-between mt-auto align-items-center">
              <Tag :class="[category.color, category.textColor, 'font-semibold text-sm']">
                {{ reports[category.id].length }} {{ t('reports.reports') }}
              </Tag>
              <Button icon="pi pi-arrow-right" :class="[category.textColor, 'p-button-rounded p-button-text']" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports Grid (when category is selected) -->
    <div v-else class="grid" style="min-width: 100%">
      <div v-for="report in reports[currentCategory.id]" :key="report.id" class="col-12 lg:col-6 xl:col-4">
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
          filter 
          v-model="filterValues[filter.name]" 
          :options="filterOptions[filter.name] || []" 
          :optionLabel="filter.optionLabel" 
          :optionValue="filter.optionValue"
          :placeholder="filter.label"
          class="w-full"
        />

        <!-- MultiSelect -->
        <MultiSelect 
          v-else-if="filter.type === 'multiselect'" 
          v-model="filterValues[filter.name]" 
          :options="filterOptions[filter.name] || []" 
          :optionLabel="filter.optionLabel" 
          :optionValue="filter.optionValue"
          :placeholder="filter.label"
          class="w-full"
          display="chip"
        />

        <!-- Text Input -->
        <InputText 
          v-else-if="filter.type === 'text'" 
          v-model="filterValues[filter.name]" 
          :id="filter.name"
          :placeholder="filter.label"
          class="w-full"
        />

        <!-- Checkbox -->
        <div v-else-if="filter.type === 'checkbox'" class="flex align-items-center">
          <Checkbox 
            v-model="filterValues[filter.name]" 
            :inputId="filter.name"
            :binary="true"
          />
          <label :for="filter.name" class="ml-2">{{ filter.label }}</label>
        </div>

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
  transition: all 0.3s ease;
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