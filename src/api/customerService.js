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
  },

  /**
   * Create walk-in customer for POS
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} - Created customer data
   */
  async createWalkinCustomer(customerData) {
    try {
      console.log('Creating walk-in customer with data:', customerData);

      const formData = new FormData();

      // Required fields
      formData.append('Name', customerData.name || '');
      formData.append('PrimaryPhone', customerData.primaryPhone || '');
      formData.append('IsBusinessPartner', customerData.isBusinessPartner ? 'true' : 'false');

      // Optional fields - append empty string if not provided
      formData.append('SapCustomer', customerData.sapCustomer || '');
      formData.append('SwiftCode', customerData.swiftCode || '');
      formData.append('ContactPersonName', customerData.contactPersonName || '');
      formData.append('PreferredTimes', customerData.preferredTimes || '');
      formData.append('Iban', customerData.iban || '');
      formData.append('BankName', customerData.bankName || '');
      formData.append('FinanceNotes', customerData.financeNotes || '');
      formData.append('Position', customerData.position || '');
      formData.append('City', customerData.city || '');
      formData.append('ContactResponsiblePerson', customerData.contactResponsiblePerson || '');
      formData.append('ContactMobileNumber', customerData.contactMobileNumber || '');
      formData.append('Latitude', customerData.latitude || '');
      formData.append('StreetName', customerData.streetName || '');
      formData.append('OrganizationId', customerData.organizationId || '');
      formData.append('District', customerData.district || '');
      formData.append('Longitude', customerData.longitude || '');
      formData.append('RegionId', customerData.regionId || '');
      formData.append('AdditionalNumber', customerData.additionalNumber || '');
      formData.append('VatNumber', customerData.vatNumber || '');
      formData.append('AccountNumber', customerData.accountNumber || '');
      formData.append('PreferredDays', customerData.preferredDays || '');
      formData.append('CrNumber', customerData.crNumber || '');
      formData.append('PostalCode', customerData.postalCode || '');
      formData.append('ContactResponsibleMobile', customerData.contactResponsibleMobile || '');
      formData.append('AdditionalNotes', customerData.additionalNotes || '');
      formData.append('Website', customerData.website || '');
      formData.append('ContactEmail', customerData.contactEmail || '');
      formData.append('Email', customerData.email || '');
      formData.append('BranchId', customerData.branchId || '');
      formData.append('BuildingNumber', customerData.buildingNumber || '');
      formData.append('Industry', customerData.industry || '');

      console.log('Sending FormData to API...');

      const response = await apiClient.post('/Customers/CreateWalkInCustomerForPos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response.data);

      return response.data.data || {};
    } catch (error) {
      console.error('Error creating walk-in customer:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      throw error;
    }
  }
};
