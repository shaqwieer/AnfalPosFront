// composables/useReports.js
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useMainStore } from '@/stores/mainStore';
import { useReportFilters } from './useReportFilters';
import { useReportData } from './useReportData';

export function useReports() {
  const { t } = useI18n();
  const mainStore = useMainStore();
  
  // State
  const loading = ref(false);
  const selectedReport = ref(null);
  const reportDialogVisible = ref(false);
  const showDataVisualization = ref(false);
  
  // Use filter composable
  const {
    filterValues,
    filterOptions,
    initializeFilters,
    loadFilterOptions,
    validateFilters,
    prepareFilterPayload,
    resetFilters
  } = useReportFilters();

  // Use data composable
  const {
    reportData,
    tableConfig,
    chartData,
    summaryData,
    formattedSummaryCards,
    hasData,
    hasSummaryCards,
    fetchReportData,
    refreshData,
    clearData
  } = useReportData();

  // Report definitions with enhanced configurations including summary cards
  const reportDefinitions = ref([
    {
      id: 'aging-report',
      name: 'reports.agingReport',
      description: 'reports.agingReportDescription',
      icon: 'pi-clock',
      category: 'financial',
      endpoints: {
        excel: '/Invoices/GenerateAgingReportForExcel',
      },
      filters: [
        {
          type: 'date',
          name: 'asOfDate',
          label: 'reports.asOfDate',
          required: true,
          default: new Date()
        },
        {
          type: 'multiselect',
          name: 'branchIds',
          label: 'reports.branches',
          required: true,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          optionLabel: 'name',
          optionValue: 'id'
        }
      ]
    },
    {
      id: 'item-availability-report',
      name: 'reports.itemAvailabilityReport',
      description: 'reports.itemAvailabilityReportDescription',
      icon: 'pi-box',
      category: 'inventory',
      endpoints: {
        pdf: '/Items/GenerateItemAvailabiltyReport',
      },
      filters: [
        {
          type: 'dropdown',
          name: 'branchId',
          label: 'reports.branch',
          required: true,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          optionLabel: 'name',
          optionValue: 'id'
        }
      ]
    },
    {
      id: 'sales-rep-cash-report',
      name: 'reports.salesRepCashReport',
      description: 'reports.salesRepCashReportDescription',
      icon: 'pi-wallet',
      category: 'financial',
      endpoints: {
        pdf: '/shiftSessions/GenerateSalesRepWithCashReport',
      },
      filters: [
        {
          type: 'multiselect',
          name: 'branchIds',
          label: 'reports.branches',
          required: true,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          optionLabel: 'name',
          optionValue: 'id'
        }
      ]
    },
    {
      id: 'sales-excel-report',
      name: 'reports.salesExcelReport',
      description: 'reports.salesExcelReportDescription',
      icon: 'pi-chart-bar',
      category: 'sales',
      endpoints: {
        excel: '/Invoices/GetSalesAsExcel',
        data: '/Invoices/GetInvoiceDetailAsPreview'
      },
      filters: [
        {
          type: 'daterange',
          startDate: 'fromDate',
          endDate: 'toDate',
          label: 'reports.dateRange',
          required: true,
          default: {
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate: new Date()
          }
        },
        {
          type: 'multiselect',
          name: 'branchIds',
          label: 'reports.branches',
          required: true,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          optionLabel: 'name',
          optionValue: 'id'
        }
      ],
      // 🎯 SUMMARY CARDS CONFIGURATION
      summaryCards: [
        {
          key: 'totalSales',
          label: 'Total Sales',
          format: 'currency',
          color: 'primary',
          icon: 'pi pi-dollar',
          aggregate: {
            field: 'finalAmount',
            operation: 'sum'
          }
        },
        {
          key: 'totalInvoices',
          label: 'Total Invoices',
          format: 'number',
          color: 'success',
          icon: 'pi pi-file',
          aggregate: {
            field: 'billingDocId',
            operation: 'countUnique'
          }
        },
        {
          key: 'totalQuantity',
          label: 'Total Quantity',
          format: 'number',
          color: 'info',
          icon: 'pi pi-box',
          aggregate: {
            field: 'quantity',
            operation: 'sum'
          }
        },
        {
          key: 'avgOrderValue',
          label: 'Avg Order Value',
          format: 'currency',
          color: 'warning',
          icon: 'pi pi-chart-line',
          aggregate: {
            field: 'finalAmount',
            operation: 'average'
          }
        },
        {
          key: 'totalCustomers',
          label: 'Unique Customers',
          format: 'number',
          color: 'secondary',
          icon: 'pi pi-users',
          aggregate: {
            field: 'customerSapCode',
            operation: 'countUnique'
          }
        },
        {
          key: 'freeProducts',
          label: 'Free Products',
          format: 'number',
          color: 'success',
          icon: 'pi pi-gift',
          aggregate: {
            field: 'isFreeProduct',
            operation: 'countTrue'
          }
        }
      ],
      columns: [
        // Invoice Information
        { field: 'billingDocId', header: 'Invoice #', sortable: true, filterable: true, width: '120px' },
        { field: 'salesOrderId', header: 'Sales Order #', sortable: true, filterable: true, width: '120px' },
        { field: 'invoiceCreation', header: 'Invoice Date', sortable: true, type: 'date', width: '110px' },
        
        // Customer Information
        { field: 'customerName', header: 'Customer', sortable: true, filterable: true, width: '200px' },
        { field: 'customerSapCode', header: 'Customer Code', sortable: true, filterable: true, width: '120px' },
        
        // Product Information
        { field: 'sapItem', header: 'Item Code', sortable: true, filterable: true, width: '120px' },
        { field: 'sapDesc', header: 'Product Description', sortable: true, filterable: true, width: '250px' },
        { field: 'batch', header: 'Batch', sortable: true, filterable: true, width: '100px' },
        
        // Quantity & Pricing
        { field: 'quantity', header: 'Quantity', sortable: true, type: 'number', width: '100px' },
        { field: 'unit', header: 'Unit', sortable: true, filterable: true, width: '80px' },
        { field: 'price', header: 'Unit Price', sortable: true, type: 'currency', width: '110px' },
        
        // Financial Details
        { field: 'taxTotal', header: 'Tax', sortable: true, type: 'currency', width: '100px' },
        { field: 'finalAmount', header: 'Final Amount', sortable: true, type: 'currency', width: '120px' },
        { field: 'totalAmount', header: 'Total Amount', sortable: true, type: 'currency', width: '120px' },
        
        // Branch Information
        { field: 'branchEnglishName', header: 'Branch', sortable: true, filterable: true, width: '150px' },
        { field: 'sapStorageLocation', header: 'Storage Location', sortable: true, filterable: true, width: '130px' },
        
        // Flags
        { field: 'isFreeProduct', header: 'Free Product', sortable: true, type: 'boolean', width: '100px' },
        { field: 'isSpecificPrice', header: 'Special Price', sortable: true, type: 'boolean', width: '100px' }
      ],
      tableOptions: {
        enablePagination: true,
        defaultPageSize: 5,
        enableSorting: true,
        enableFiltering: true,
        enableExport: true,
        enableSelection: true
      }
    },
    {
      id: 'item-usability-report',
      name: 'reports.itemUsabilityReport',
      description: 'reports.itemUsabilityReportDescription',
      icon: 'pi-chart-line',
      category: 'analytics',
      endpoints: {
        pdf: '/Invoices/GenerateItemUsabilityFor',
      },
      filters: [
        {
          type: 'daterange',
          startDate: 'fromDate',
          endDate: 'toDate',
          label: 'reports.dateRange',
          required: true,
          default: {
            startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
            endDate: new Date()
          }
        },
        {
          type: 'dropdown',
          name: 'branchId',
          label: 'reports.branch',
          required: true,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          optionLabel: 'name',
          optionValue: 'id'
        }
      ]
    },
    {
      id: 'collection-report',
      name: 'reports.collectionReport',
      description: 'reports.collectionReportDescription',
      icon: 'pi-money-bill',
      category: 'financial',
      endpoints: {
        pdf: '/Invoices/GenerateCollectionPdf',
      },
      filters: [
        {
          type: 'daterange',
          startDate: 'fromDate',
          endDate: 'toDate',
          label: 'reports.dateRange',
          required: false,
          default: {
            startDate: null,
            endDate: null
          }
        },
        {
          type: 'dropdown',
          name: 'branchId',
          label: 'reports.branch',
          required: false,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          optionLabel: 'name',
          optionValue: 'id'
        },
        {
          type: 'dropdown',
          name: 'paymentMethodId',
          label: 'reports.paymentMethod',
          required: false,
          endpoint: '/PaymentMethods',
          optionLabel: 'name',
          optionValue: 'id'
        }
      ]
    },
    {
      id: 'payments-approval-report',
      name: 'reports.paymentsApprovalExcelReport',
      description: 'reports.paymentsApprovalExcelReportDescription',
      icon: 'pi-check-circle',
      category: 'financial',
      endpoints: {
        excel: '/Invoices/GetPaymentsApprovelExcelReport',
      },
      filters: [
        {
          type: 'daterange',
          startDate: 'fromDate',
          endDate: 'toDate',
          label: 'reports.dateRange',
          required: true,
          default: {
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate: new Date()
          }
        },
        {
          type: 'multiselect',
          name: 'branchIds',
          label: 'reports.branches',
          required: true,
          endpoint: '/BusinessEntities/GetUserVanSaleInBranch',
          optionLabel: 'name',
          optionValue: 'id'
        }
      ]
    }
  ]);

  // Computed
  const reportsByCategory = computed(() => {
    const categories = {};
    reportDefinitions.value.forEach(report => {
      if (!categories[report.category]) {
        categories[report.category] = [];
      }
      categories[report.category].push(report);
    });
    return categories;
  });

  const availableFormats = computed(() => {
    if (!selectedReport.value) return [];
    const formats = [];
    if (selectedReport.value.endpoints.pdf) formats.push('pdf');
    if (selectedReport.value.endpoints.excel) formats.push('excel');
    return formats;
  });

  const isFormValid = computed(() => {
    if (!selectedReport.value) return false;
    return validateFilters(selectedReport.value.filters);
  });

  const hasDataEndpoint = computed(() => {
    return selectedReport.value?.endpoints?.data;
  });

  const hasSummaryCardsEnabled = computed(() => {
    return selectedReport.value?.summaryCards && selectedReport.value.summaryCards.length > 0;
  });

  // Methods
  const selectReport = async (report) => {
    selectedReport.value = report;
    initializeFilters(report.filters);
    await loadFilterOptions(report.filters);
    
    // Clear previous data
    clearData();
    showDataVisualization.value = false;
    
    reportDialogVisible.value = true;
  };

  const generateReport = async (format = 'pdf') => {
    if (!selectedReport.value || !isFormValid.value || !selectedReport.value.endpoints[format]) {
      return;
    }

    loading.value = true;
    try {
      const payload = prepareFilterPayload(selectedReport.value.filters);
      const endpoint = selectedReport.value.endpoints[format];
      
      const response = await apiClient.post(endpoint, payload, {
        responseType: 'blob'
      });

      downloadFile(response, format);
      
      mainStore.loading.setNotificationInfo('success', t('reports.downloadSuccess'));
    } catch (err) {
      handleError(err, mainStore.loading);
    } finally {
      loading.value = false;
    }
  };

  const loadReportData = async () => {
    if (!selectedReport.value || !isFormValid.value || !hasDataEndpoint.value) {
      return;
    }

    const filters = prepareFilterPayload(selectedReport.value.filters);
    await fetchReportData(selectedReport.value, filters);
    
    if (hasData.value) {
      showDataVisualization.value = true;
    }
  };

  const refreshReportData = async () => {
    if (!selectedReport.value || !hasDataEndpoint.value) return;
    
    const filters = prepareFilterPayload(selectedReport.value.filters);
    await refreshData(selectedReport.value, filters);
  };

  const downloadFile = (response, format) => {
    const contentTypeMap = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    const extensionMap = {
      pdf: 'pdf',
      excel: 'xlsx'
    };

    const contentType = contentTypeMap[format];
    const extension = extensionMap[format];
    
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `${selectedReport.value.id}-${timestamp}.${extension}`);
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const closeDialog = () => {
    reportDialogVisible.value = false;
    selectedReport.value = null;
    showDataVisualization.value = false;
    resetFilters();
    clearData();
  };

  const toggleDataVisualization = () => {
    if (!showDataVisualization.value && hasDataEndpoint.value) {
      loadReportData();
    } else {
      showDataVisualization.value = !showDataVisualization.value;
    }
  };

  return {
    // State
    loading,
    selectedReport,
    filterValues,
    filterOptions,
    reportDialogVisible,
    reportDefinitions,
    showDataVisualization,
    
    // Data state
    reportData,
    tableConfig,
    chartData,
    summaryData,
    formattedSummaryCards,
    hasData,
    hasSummaryCards,
    
    // Computed
    reportsByCategory,
    availableFormats,
    isFormValid,
    hasDataEndpoint,
    hasSummaryCardsEnabled,
    
    // Methods
    selectReport,
    generateReport,
    closeDialog,
    loadReportData,
    refreshReportData,
    toggleDataVisualization
  };
}