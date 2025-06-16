import apiClient from './apiClient';

export const customerService = {
  /**
   * Get customers for POS with pagination
   * @param {Object} params - Search parameters
   * @param {number} params.pageNumber - Page number (1-based)
   * @param {number} params.pageSize - Number of items per page
   * @param {boolean} params.isNotBusinessPartner - Filter for business partners
   * @param {string} [params.searchKey] - Optional search key
   * @returns {Promise<Object>} - Paginated customer data
   */
  async getCustomerForPosPaginated(params) {
    try {
      const requestBody = {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        isNotBusinessPartner: params.isNotBusinessPartner || false
      };

      // Add search key if provided
      if (params.searchKey && params.searchKey.trim()) {
        requestBody.searchKey = params.searchKey.trim();
      }

      const response = await apiClient.post('/Customers/GetCustomerForPosPaginated', requestBody);
      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }
};
