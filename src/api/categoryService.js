import apiClient from './apiClient';

export const categoryService = {
  /**
   * Get categories for items from the API
   * @returns {Promise<Array>} - List of categories
   */
  async getCategoriesForItems() {
    try {
      const response = await apiClient.get('/Items/GetCategoriesForItems');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get items for quick invoice based on category
   * @param {string} category - The category to fetch items for
   * @returns {Promise<Array>} - List of items/products
   */
  async getItemsForQuickInvoiceBasedOnCategory(category) {
    try {
      const response = await apiClient.post('/Items/GetItemsForQuickInvoiceBasedOnCategory', {
        categoryName: category
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching items for category:', category, error);
      throw error;
    }
  }
};
