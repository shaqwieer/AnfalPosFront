// composables/useReports.js
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useMainStore } from '@/stores/mainStore';
import { useReportFilters } from './useReportFilters';

export function useReports() {
  const { t } = useI18n();
  const mainStore = useMainStore();

  // State
  const loading = ref(false);
  const selectedReport = ref(null);
  const reportDialogVisible = ref(false);

  // Use filter composable
  const { filterValues, filterOptions, initializeFilters, loadFilterOptions, validateFilters, prepareFilterPayload, resetFilters } = useReportFilters();

  // Report definitions
  const reportDefinitions = ref([
    {
      id: 'aging-report',
      name: 'reports.agingReport',
      description: 'reports.agingReportDescription',
      icon: 'pi-clock',
      category: 'financial',
      endpoints: {
        pdf: '/Invoices/GenerateAgingReport',
        excel: '/Invoices/GenerateAgingReportForExcel',
        data: '/Invoices/GetAgingReportData'
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
      id: 'item-availability-report',
      name: 'reports.itemAvailabilityReport',
      description: 'reports.itemAvailabilityReportDescription',
      icon: 'pi-box',
      category: 'inventory',
      endpoints: {
        pdf: '/Items/GenerateItemAvailabiltyReport',
        data: '/Items/GetItemAvailabilityData'
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
        data: '/shiftSessions/GetSalesRepWithCashData'
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
      id: 'item-usability-report',
      name: 'reports.itemUsabilityReport',
      description: 'reports.itemUsabilityReportDescription',
      icon: 'pi-chart-line',
      category: 'analytics',
      endpoints: {
        pdf: '/Invoices/GenerateItemUsabilityFor',
        excel: '/Invoices/GenerateItemUsabilityForExcel',
        data: '/Invoices/GetItemUsabilityData'
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
        excel: '/Invoices/GenerateCollectionExcel',
        data: '/Invoices/GetCollectionData'
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
    },
    {
      id: 'sales-excel-report',
      name: 'reports.salesExcelReport',
      description: 'reports.salesExcelReportDescription',
      icon: 'pi-chart-bar',
      category: 'sales',
      endpoints: {
        excel: '/Invoices/GetSalesAsExcel',
        data: '/Invoices/GetSalesData'
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
    },
    {
      id: 'payments-approval-report',
      name: 'reports.paymentsApprovalExcelReport',
      description: 'reports.paymentsApprovalExcelReportDescription',
      icon: 'pi-check-circle',
      category: 'financial',
      endpoints: {
        excel: '/Invoices/GetPaymentsApprovelExcelReport',
        data: '/Invoices/GetPaymentsApprovalData'
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
    reportDefinitions.value.forEach((report) => {
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

  // Methods
  const selectReport = async (report) => {
    selectedReport.value = report;
    initializeFilters(report.filters);
    await loadFilterOptions(report.filters);
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
      reportDialogVisible.value = false;
    } catch (err) {
      handleError(err, mainStore.loading);
    } finally {
      loading.value = false;
    }
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
    resetFilters();
  };

  return {
    // State
    loading,
    selectedReport,
    filterValues,
    filterOptions,
    reportDialogVisible,
    reportDefinitions,

    // Computed
    reportsByCategory,
    availableFormats,
    isFormValid,

    // Methods
    selectReport,
    generateReport,
    closeDialog
  };
}
