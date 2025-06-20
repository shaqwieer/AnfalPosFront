// Report configurations with full settings
export const reportConfigs = [
  // Aging Report (merged PDF and Excel)
  {
    id: 'aging-report',
    name: 'reports.agingReport', // Replace with t('reports.agingReport') in component
    icon: 'pi-chart-line',
    category: 'financial',
    description: 'Accounts receivable aging analysis', // Replace with t('reports.agingReportDescription')
    
    // Endpoints
    dataEndpoint: '/Invoices/GetAgingReportData',
    dataMethod: 'POST',
    excelEndpoint: '/Invoices/GenerateAgingReportForExcel',
    excelMethod: 'POST',
    pdfEndpoint: '/Invoices/GenerateAgingReport',
    pdfMethod: 'POST',
    
    // Chart configuration
    chartConfig: {
      type: 'bar',
      xField: 'ageGroup',
      yField: 'amount',
      title: 'Aging Analysis'
    },
    
    // Summary cards configuration
    summaryCards: [
      { key: 'totalAmount', label: 'Total Outstanding', format: 'currency', color: 'primary' },
      { key: 'currentAmount', label: 'Current', format: 'currency', color: 'success' },
      { key: 'overdueAmount', label: 'Overdue', format: 'currency', color: 'danger' },
      { key: 'customerCount', label: 'Customers', format: 'number', color: 'info' }
    ],
    
    // Table columns
    columns: [
      { field: 'customerName', header: 'Customer', sortable: true, filterable: true },
      { field: 'invoiceNumber', header: 'Invoice #', sortable: true, filterable: true },
      { field: 'invoiceDate', header: 'Date', sortable: true, type: 'date' },
      { field: 'dueDate', header: 'Due Date', sortable: true, type: 'date' },
      { field: 'amount', header: 'Amount', sortable: true, type: 'currency' },
      { field: 'daysOverdue', header: 'Days Overdue', sortable: true, type: 'number' }
    ],
    
    // Filters
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
        optionValue: 'id',
        // Special handling for different endpoints
        pdfTransform: (value) => ({ branchId: value }),
        excelTransform: (value) => ({ branchIds: [value] })
      }
    ]
  },
  
  // Item Availability Report
  {
    id: 'item-availability-report',
    name: 'reports.itemAvailabilityReport',
    icon: 'pi-box',
    category: 'inventory',
    description: 'Current stock levels and availability',
    
    dataEndpoint: '/Items/GetAvailabilityData',
    dataMethod: 'POST',
    pdfEndpoint: '/Items/GenerateItemAvailabiltyReport',
    pdfMethod: 'POST',
    
    chartConfig: {
      type: 'bar',
      xField: 'itemName',
      yField: 'availableQuantity',
      title: 'Item Availability'
    },
    
    summaryCards: [
      { key: 'totalItems', label: 'Total Items', format: 'number', color: 'primary' },
      { key: 'availableItems', label: 'Available', format: 'number', color: 'success' },
      { key: 'outOfStockItems', label: 'Out of Stock', format: 'number', color: 'danger' },
      { key: 'lowStockItems', label: 'Low Stock', format: 'number', color: 'warning' }
    ],
    
    columns: [
      { field: 'itemCode', header: 'Item Code', sortable: true, filterable: true },
      { field: 'itemName', header: 'Item Name', sortable: true, filterable: true },
      { field: 'availableQuantity', header: 'Available Qty', sortable: true, type: 'number' },
      { field: 'reservedQuantity', header: 'Reserved Qty', sortable: true, type: 'number' },
      { field: 'unitPrice', header: 'Unit Price', sortable: true, type: 'currency' },
      { field: 'status', header: 'Status', sortable: true, filterable: true, type: 'status' }
    ],
    
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
  
  // Sales Rep Cash Report
  {
    id: 'sales-rep-cash-report',
    name: 'reports.salesRepCashReport',
    icon: 'pi-dollar',
    category: 'financial',
    description: 'Cash in hand summary by sales representative',
    
    dataEndpoint: '/shiftSessions/GetSalesRepCashData',
    dataMethod: 'POST',
    pdfEndpoint: '/shiftSessions/GenerateSalesRepWithCashReport',
    pdfMethod: 'POST',
    
    chartConfig: {
      type: 'bar',
      xField: 'salesRepName',
      yField: 'totalCash',
      title: 'Sales Rep Cash Summary'
    },
    
    summaryCards: [
      { key: 'totalCash', label: 'Total Cash', format: 'currency', color: 'primary' },
      { key: 'totalSalesReps', label: 'Sales Reps', format: 'number', color: 'info' },
      { key: 'avgCashPerRep', label: 'Avg per Rep', format: 'currency', color: 'success' },
      { key: 'activeBranches', label: 'Active Branches', format: 'number', color: 'warning' }
    ],
    
    columns: [
      { field: 'salesRepName', header: 'Sales Rep', sortable: true, filterable: true },
      { field: 'branchName', header: 'Branch', sortable: true, filterable: true },
      { field: 'cashInHand', header: 'Cash in Hand', sortable: true, type: 'currency' },
      { field: 'totalSales', header: 'Total Sales', sortable: true, type: 'currency' },
      { field: 'collectedAmount', header: 'Collected', sortable: true, type: 'currency' },
      { field: 'lastUpdate', header: 'Last Update', sortable: true, type: 'date' }
    ],
    
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
  
  // Item Usability Report
  {
    id: 'item-usability-report',
    name: 'reports.itemUsabilityReport',
    icon: 'pi-chart-pie',
    category: 'inventory',
    description: 'Item usage patterns and trends',
    
    dataEndpoint: '/Invoices/GetItemUsabilityData',
    dataMethod: 'POST',
    pdfEndpoint: '/Invoices/GenerateItemUsabilityFor',
    pdfMethod: 'POST',
    
    chartConfig: {
      type: 'line',
      xField: 'date',
      yField: 'usageCount',
      title: 'Item Usage Trend'
    },
    
    summaryCards: [
      { key: 'totalUsage', label: 'Total Usage', format: 'number', color: 'primary' },
      { key: 'mostUsedItem', label: 'Most Used Item', format: 'text', color: 'success' },
      { key: 'avgDailyUsage', label: 'Avg Daily Usage', format: 'number', color: 'info' },
      { key: 'uniqueItems', label: 'Unique Items', format: 'number', color: 'warning' }
    ],
    
    columns: [
      { field: 'itemCode', header: 'Item Code', sortable: true, filterable: true },
      { field: 'itemName', header: 'Item Name', sortable: true, filterable: true },
      { field: 'usageCount', header: 'Usage Count', sortable: true, type: 'number' },
      { field: 'usageDate', header: 'Usage Date', sortable: true, type: 'date' },
      { field: 'branchName', header: 'Branch', sortable: true, filterable: true },
      { field: 'customerName', header: 'Customer', sortable: true, filterable: true }
    ],
    
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
  
  // Collection Report
  {
    id: 'collection-report',
    name: 'reports.collectionReport',
    icon: 'pi-credit-card',
    category: 'financial',
    description: 'Payment collections and methods analysis',
    
    dataEndpoint: '/Invoices/GetCollectionData',
    dataMethod: 'POST',
    pdfEndpoint: '/Invoices/GenerateCollectionPdf',
    pdfMethod: 'POST',
    
    chartConfig: {
      type: 'doughnut',
      labelField: 'paymentMethod',
      valueField: 'amount',
      title: 'Collections by Payment Method'
    },
    
    summaryCards: [
      { key: 'totalCollections', label: 'Total Collections', format: 'currency', color: 'primary' },
      { key: 'totalTransactions', label: 'Transactions', format: 'number', color: 'success' },
      { key: 'avgTransaction', label: 'Avg Transaction', format: 'currency', color: 'info' },
      { key: 'activeSessions', label: 'Active Sessions', format: 'number', color: 'warning' }
    ],
    
    columns: [
      { field: 'sessionId', header: 'Session #', sortable: true, filterable: true },
      { field: 'customerName', header: 'Customer', sortable: true, filterable: true },
      { field: 'paymentMethod', header: 'Payment Method', sortable: true, filterable: true },
      { field: 'amount', header: 'Amount', sortable: true, type: 'currency' },
      { field: 'collectionDate', header: 'Date', sortable: true, type: 'date' },
      { field: 'branchName', header: 'Branch', sortable: true, filterable: true }
    ],
    
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
        lookupKey: 'branches',
        optionLabel: 'name',
        optionValue: 'id'
      },
      {
        type: 'dropdown',
        name: 'paymentMethodId',
        label: 'reports.paymentMethod',
        required: false,
        endpoint: '/PaymentMethods',
        lookupKey: 'paymentMethods',
        optionLabel: 'name',
        optionValue: 'id'
      },
      {
        type: 'dropdown',
        name: 'sessionId',
        label: 'reports.sessionNumber',
        required: false,
        endpoint: '/Payments/GenerateCollectionPdfLookup',
        lookupKey: 'sessionNumbers',
        optionLabel: 'id',
        optionValue: 'id'
      }
    ]
  },
  
  // Sales Excel Report
  {
    id: 'sales-excel-report',
    name: 'reports.salesExcelReport',
    icon: 'pi-file-excel',
    category: 'sales',
    description: 'Comprehensive sales data export and analysis',
    
    dataEndpoint: '/Invoices/GetSalesData',
    dataMethod: 'POST',
    excelEndpoint: '/Invoices/GetSalesAsExcel',
    excelMethod: 'POST',
    
    chartConfig: {
      type: 'line',
      xField: 'date',
      yField: 'amount',
      title: 'Sales Performance'
    },
    
    summaryCards: [
      { key: 'totalSales', label: 'Total Sales', format: 'currency', color: 'primary' },
      { key: 'totalInvoices', label: 'Total Invoices', format: 'number', color: 'success' },
      { key: 'avgInvoiceValue', label: 'Avg Invoice', format: 'currency', color: 'info' },
      { key: 'activeBranches', label: 'Active Branches', format: 'number', color: 'warning' }
    ],
    
    columns: [
      { field: 'invoiceNumber', header: 'Invoice #', sortable: true, filterable: true },
      { field: 'customerName', header: 'Customer', sortable: true, filterable: true },
      { field: 'branchName', header: 'Branch', sortable: true, filterable: true },
      { field: 'invoiceDate', header: 'Date', sortable: true, type: 'date' },
      { field: 'amount', header: 'Amount', sortable: true, type: 'currency' },
      { field: 'status', header: 'Status', sortable: true, filterable: true, type: 'status' }
    ],
    
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

  // Payments Approval Excel Report (from your original config)
  {
    id: 'payments-approval-excel-report',
    name: 'reports.paymentsApprovalExcelReport',
    icon: 'pi-file-excel',
    category: 'financial',
    description: 'Payment approval workflow and status tracking',
    
    dataEndpoint: '/Invoices/GetPaymentsApprovalData',
    dataMethod: 'POST',
    excelEndpoint: '/Invoices/GetPaymentsApprovelExcelReport',
    excelMethod: 'POST',
    
    chartConfig: {
      type: 'doughnut',
      labelField: 'approvalStatus',
      valueField: 'amount',
      title: 'Payments by Approval Status'
    },
    
    summaryCards: [
      { key: 'totalPayments', label: 'Total Payments', format: 'currency', color: 'primary' },
      { key: 'pendingApproval', label: 'Pending Approval', format: 'currency', color: 'warning' },
      { key: 'approvedPayments', label: 'Approved', format: 'currency', color: 'success' },
      { key: 'rejectedPayments', label: 'Rejected', format: 'currency', color: 'danger' }
    ],
    
    columns: [
      { field: 'paymentId', header: 'Payment ID', sortable: true, filterable: true },
      { field: 'customerName', header: 'Customer', sortable: true, filterable: true },
      { field: 'amount', header: 'Amount', sortable: true, type: 'currency' },
      { field: 'approvalStatus', header: 'Status', sortable: true, filterable: true, type: 'status' },
      { field: 'submittedDate', header: 'Submitted', sortable: true, type: 'date' },
      { field: 'approvedDate', header: 'Approved', sortable: true, type: 'date' },
      { field: 'branchName', header: 'Branch', sortable: true, filterable: true }
    ],
    
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
];

// Helper functions for report configuration
export const getReportById = (id) => {
  return reportConfigs.find(report => report.id === id);
};

export const getReportsByCategory = (category) => {
  if (!category || category === 'all') {
    return reportConfigs;
  }
  return reportConfigs.filter(report => report.category === category);
};

export const getAvailableCategories = () => {
  const categories = [...new Set(reportConfigs.map(r => r.category))];
  return categories.map(cat => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: cat
  }));
};

// Validation helper
export const validateReportConfig = (config) => {
  const errors = [];
  
  if (!config.id) errors.push('Report ID is required');
  if (!config.name) errors.push('Report name is required');
  if (!config.dataEndpoint && !config.pdfEndpoint && !config.excelEndpoint) {
    errors.push('At least one endpoint is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};