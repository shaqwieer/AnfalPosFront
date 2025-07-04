import apiClient from './apiClient';

export const invoiceService = {
  /**
   * Get not synced invoices
   * @returns {Promise<Object>} - Not synced invoices data
   */
  async getNotSyncedInvoices() {
    try {
      const response = await apiClient.get('/Invoices/GetNotSyncedInvoices');
      return response.data;
    } catch (error) {
      console.error('Error fetching not synced invoices:', error);
      throw error;
    }
  },

  /**
   * Sync a specific invoice
   * @param {string} invoiceId - The invoice ID to sync
   * @returns {Promise<Object>} - Sync response
   */
  async syncInvoice(invoiceId) {
    try {
      const response = await apiClient.post(`/Invoices/SyncInvoice/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error syncing invoice:', error);
      throw error;
    }
  },

  /**
   * Get draft invoices
   * @returns {Promise<Object>} - Draft invoices data
   */
  async getDraftInvoices() {
    try {
      const response = await apiClient.get('/Invoices/GetDraftInvoices');
      return response.data;
    } catch (error) {
      console.error('Error fetching draft invoices:', error);
      throw error;
    }
  },

  /**
   * Publish a draft invoice (convert to published invoice)
   * @param {string} invoiceId - The draft invoice ID to publish
   * @returns {Promise<Object>} - Publish response
   */
  async publishDraftInvoice(invoiceId) {
    try {
      const response = await apiClient.post(`/Invoices/PublishDraftInvoice/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error publishing draft invoice:', error);
      throw error;
    }
  }
}; 