// src/api/reportService.js

import apiClient from './apiClient';

export const reportService = {
  /**
   * Generate aging report
   * @param {Object} params - Report parameters
   * @param {Date} params.asOfDate - As of date for the report
   * @param {Number} params.branchId - Branch ID
   * @returns {Promise<Blob>} - PDF blob
   */
  generateAgingReport(params) {
    return apiClient({
      url: '/Invoices/GenerateAgingReport',
      method: 'POST',
      data: params,
      responseType: 'blob'
    });
  },

  /**
   * Get branches for the current user
   * @returns {Promise<Array>} - List of branches
   */
  getUserVanSaleInBranch() {
    return apiClient.get('/BusinessEntities/GetUserVanSaleInBranch');
  },

  /**
   * Download a generated report
   * @param {Blob} blob - Report blob
   * @param {String} filename - Filename for download
   */
  downloadReport(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }
};

export default reportService;