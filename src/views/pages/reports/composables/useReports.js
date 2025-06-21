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
    hasData,
    fetchReportData,
    refreshData,
    clearData
  } = useReportData();

  // Report definitions with enhanced configurations
  const reportDefinitions = ref([
    {
      id: 'aging-report',
      name: 'reports.agingReport',
      description: 'reports.agingReportDescription',
      icon: 'pi-clock',
      category: 'financial',
      endpoints: {
        // pdf: '/Invoices/GenerateAgingReport',
        excel: '/Invoices/GenerateAgingReportForExcel',
        // data: '/Invoices/GetAgingReportData'
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
      ],
      // columns: [
      //   { field: 'customerName', header: 'Customer', sortable: true, filterable: true, width: '200px' },
      //   { field: 'customerCode', header: 'Customer Code', sortable: true, filterable: true, width: '120px' },
      //   { field: 'current', header: 'Current', sortable: true, type: 'currency', width: '120px' },
      //   { field: 'days30', header: '1-30 Days', sortable: true, type: 'currency', width: '120px' },
      //   { field: 'days60', header: '31-60 Days', sortable: true, type: 'currency', width: '120px' },
      //   { field: 'days90', header: '61-90 Days', sortable: true, type: 'currency', width: '120px' },
      //   { field: 'days120', header: '91-120 Days', sortable: true, type: 'currency', width: '120px' },
      //   { field: 'over120', header: '120+ Days', sortable: true, type: 'currency', width: '120px' },
      //   { field: 'totalBalance', header: 'Total Balance', sortable: true, type: 'currency', width: '140px' }
      // ],
      // tableOptions: {
      //   enablePagination: true,
      //   defaultPageSize: 50,
      //   enableSorting: true,
      //   enableFiltering: true,
      //   enableExport: true,
      //   enableSelection: false
      // }
    },
    {
      id: 'item-availability-report',
      name: 'reports.itemAvailabilityReport',
      description: 'reports.itemAvailabilityReportDescription',
      icon: 'pi-box',
      category: 'inventory',
      endpoints: {
        pdf: '/Items/GenerateItemAvailabiltyReport',
        // data: '/Items/GetItemAvailabilityData'
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
      ],
      // columns: [
      //   { field: 'itemCode', header: 'Item Code', sortable: true, filterable: true, width: '120px' },
      //   { field: 'itemDescription', header: 'Description', sortable: true, filterable: true, width: '250px' },
      //   { field: 'currentStock', header: 'Current Stock', sortable: true, type: 'number', width: '120px' },
      //   { field: 'availableStock', header: 'Available', sortable: true, type: 'number', width: '120px' },
      //   { field: 'reservedStock', header: 'Reserved', sortable: true, type: 'number', width: '120px' },
      //   { field: 'unit', header: 'Unit', sortable: true, filterable: true, width: '80px' },
      //   { field: 'lastUpdated', header: 'Last Updated', sortable: true, type: 'date', width: '130px' }
      // ]
    },
    {
      id: 'sales-rep-cash-report',
      name: 'reports.salesRepCashReport',
      description: 'reports.salesRepCashReportDescription',
      icon: 'pi-wallet',
      category: 'financial',
      endpoints: {
        pdf: '/shiftSessions/GenerateSalesRepWithCashReport',
        // data: '/shiftSessions/GetSalesRepWithCashData'
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
      ],
      // columns: [
      //   { field: 'salesRepName', header: 'Sales Rep', sortable: true, filterable: true, width: '180px' },
      //   { field: 'branchName', header: 'Branch', sortable: true, filterable: true, width: '150px' },
      //   { field: 'sessionNumber', header: 'Session #', sortable: true, filterable: true, width: '100px' },
      //   { field: 'startingCash', header: 'Starting Cash', sortable: true, type: 'currency', width: '130px' },
      //   { field: 'salesAmount', header: 'Sales Amount', sortable: true, type: 'currency', width: '130px' },
      //   { field: 'collectedCash', header: 'Collected Cash', sortable: true, type: 'currency', width: '130px' },
      //   { field: 'expectedCash', header: 'Expected Cash', sortable: true, type: 'currency', width: '130px' },
      //   { field: 'variance', header: 'Variance', sortable: true, type: 'currency', width: '120px' }
      // ]
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
        // excel: '/Invoices/GenerateItemUsabilityForExcel',
        // data: '/Invoices/GetItemUsabilityData'
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
      ],
      // columns: [
      //   { field: 'itemCode', header: 'Item Code', sortable: true, filterable: true, width: '120px' },
      //   { field: 'itemDescription', header: 'Description', sortable: true, filterable: true, width: '250px' },
      //   { field: 'totalSold', header: 'Total Sold', sortable: true, type: 'number', width: '120px' },
      //   { field: 'totalRevenue', header: 'Total Revenue', sortable: true, type: 'currency', width: '140px' },
      //   { field: 'averagePrice', header: 'Avg Price', sortable: true, type: 'currency', width: '120px' },
      //   { field: 'salesFrequency', header: 'Sales Frequency', sortable: true, type: 'number', width: '130px' },
      //   { field: 'lastSaleDate', header: 'Last Sale', sortable: true, type: 'date', width: '120px' }
      // ]
    },
    {
      id: 'collection-report',
      name: 'reports.collectionReport',
      description: 'reports.collectionReportDescription',
      icon: 'pi-money-bill',
      category: 'financial',
      endpoints: {
        pdf: '/Invoices/GenerateCollectionPdf',
        // excel: '/Invoices/GenerateCollectionExcel',
        // data: '/Invoices/GetCollectionData'
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
      ],
      // columns: [
      //   { field: 'receiptNumber', header: 'Receipt #', sortable: true, filterable: true, width: '120px' },
      //   { field: 'customerName', header: 'Customer', sortable: true, filterable: true, width: '200px' },
      //   { field: 'paymentDate', header: 'Payment Date', sortable: true, type: 'date', width: '120px' },
      //   { field: 'paymentMethod', header: 'Payment Method', sortable: true, filterable: true, width: '130px' },
      //   { field: 'collectedAmount', header: 'Collected Amount', sortable: true, type: 'currency', width: '140px' },
      //   { field: 'salesRepName', header: 'Sales Rep', sortable: true, filterable: true, width: '150px' },
      //   { field: 'branchName', header: 'Branch', sortable: true, filterable: true, width: '130px' }
      // ]
    },
    {
      id: 'payments-approval-report',
      name: 'reports.paymentsApprovalExcelReport',
      description: 'reports.paymentsApprovalExcelReportDescription',
      icon: 'pi-check-circle',
      category: 'financial',
      endpoints: {
        excel: '/Invoices/GetPaymentsApprovelExcelReport',
        // data: '/Invoices/GetPaymentsApprovalData'
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
      // columns: [
      //   { field: 'paymentId', header: 'Payment ID', sortable: true, filterable: true, width: '120px' },
      //   { field: 'customerName', header: 'Customer', sortable: true, filterable: true, width: '200px' },
      //   { field: 'amount', header: 'Amount', sortable: true, type: 'currency', width: '120px' },
      //   { field: 'requestDate', header: 'Request Date', sortable: true, type: 'date', width: '120px' },
      //   { field: 'status', header: 'Status', sortable: true, type: 'status', width: '100px' },
      //   { field: 'approvedBy', header: 'Approved By', sortable: true, filterable: true, width: '150px' },
      //   { field: 'approvalDate', header: 'Approval Date', sortable: true, type: 'date', width: '120px' }
      // ]
    }
  ]);  // Computed
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
    hasData,
    
    // Computed
    reportsByCategory,
    availableFormats,
    isFormValid,
    hasDataEndpoint,
    
    // Methods
    selectReport,
    generateReport,
    closeDialog,
    loadReportData,
    refreshReportData,
    toggleDataVisualization
  };
}