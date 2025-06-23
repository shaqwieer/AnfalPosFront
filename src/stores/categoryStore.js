import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { categoryService } from '@/api/categoryService';
import { useLoadingStore } from './loaderStore';
import { handleError } from '@/utilities/errorHandler';

export const useCategoryStore = defineStore('category', () => {
  // State
  const categories = ref([]);
  const items = ref([]);
  const currentCategory = ref('');
  const loading = ref(false);
  const itemsLoading = ref(false);
  const error = ref(null);
  const loadingStore = useLoadingStore();

  // Getters
  const getCategories = computed(() => categories.value);
  const getItems = computed(() => items.value);
  const getCurrentCategory = computed(() => currentCategory.value);
  const isLoading = computed(() => loading.value);
  const isItemsLoading = computed(() => itemsLoading.value);
  const hasError = computed(() => error.value !== null);

  // Helper function to transform API items to service structure
  const transformApiItemToService = (apiItem) => {
    return {
      id: apiItem.id,
      sku: apiItem.sapItem || `ITEM-${apiItem.id}`,
      name: apiItem.name,
      nameAr: apiItem.arabicName,
      unit: apiItem.baseUnit || 'Unit',
      size: 'Standard', // API doesn't provide size, using default
      price: apiItem.price || 0, // Now using actual price from API
      image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c', // Default image
      category: apiItem.itemGroup,
      batchManaged: apiItem.isBatchManaged || false, // Now using actual batch management status
      description: `${apiItem.name} - SAP Item: ${apiItem.sapItem}`,
      features: [
        'High quality product',
        'Reliable performance',
        'Industry standard'
      ],
      specifications: {
        'SAP Item': apiItem.sapItem,
        'Plant': apiItem.sapPlant,
        'Base Unit': apiItem.baseUnit,
        'Stock': apiItem.totalStock?.toString() || '0',
        'Status': apiItem.outOfStock ? 'Out of Stock' : 'Available',
        'Batch Managed': apiItem.isBatchManaged ? 'Yes' : 'No'
      },
      totalStock: apiItem.totalStock,
      outOfStock: apiItem.outOfStock
    };
  };

  // Actions
  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;

    try {
      const fetchedCategories = await categoryService.getCategoriesForItems();
      categories.value = fetchedCategories;
      return fetchedCategories;
    } catch (err) {
      error.value = handleError(err, loadingStore);
      // Fallback to default categories if API fails
      categories.value = ['Quick Service', 'Tire Service'];
      console.warn('Failed to fetch categories from API, using fallback categories');
    } finally {
      loading.value = false;
    }
  };

  const fetchItemsByCategory = async (category) => {
    if (!category) return [];

    itemsLoading.value = true;
    error.value = null;
    currentCategory.value = category;

    try {
      const fetchedItems = await categoryService.getItemsForQuickInvoiceBasedOnCategory(category);
      const transformedItems = fetchedItems.map(transformApiItemToService);
      items.value = transformedItems;
      return transformedItems;
    } catch (err) {
      error.value = handleError(err, loadingStore);
      // Fallback to empty array if API fails
      items.value = [];
      console.warn('Failed to fetch items for category:', category, 'using empty array');
    } finally {
      itemsLoading.value = false;
    }
  };

  // Initialize categories on store creation
  const initializeCategories = async () => {
    if (categories.value.length === 0) {
      await fetchCategories();
    }
  };

  // Update item price after SAP fetch
  const updateItemPrice = (itemSku, sapPriceData) => {
    const itemIndex = items.value.findIndex(item => item.sku === itemSku);
    if (itemIndex !== -1) {
      const item = items.value[itemIndex];

      console.log('🔄 UPDATING ITEM PRICE IN STORE:', {
        itemSku: itemSku,
        oldPrice: item.price,
        newPrice: sapPriceData.price,
        sapPriceData: sapPriceData,
        itemIndex: itemIndex
      });

      // Update the item with SAP data
      items.value[itemIndex] = {
        ...item,
        price: sapPriceData.price,
        basePrice: sapPriceData.price,
        canEditPrice: sapPriceData.canEditPrice,
        isCustomerSpecific: sapPriceData.isCustomerSpecific,
        batchManaged: sapPriceData.selectBatch || item.batchManaged,
        // Update specifications with SAP data
        specifications: {
          ...item.specifications,
          'SAP Price': sapPriceData.price.toString(),
          'Customer Specific': sapPriceData.isCustomerSpecific ? 'Yes' : 'No',
          'Can Edit Price': sapPriceData.canEditPrice ? 'Yes' : 'No',
          'Last Updated': new Date().toISOString()
        }
      };

      // Update batch information if available
      if (sapPriceData.selectBatch && sapPriceData.batches) {
        items.value[itemIndex].batches = sapPriceData.batches.map((batch) => ({
          id: `${itemSku}-${batch.batch}`,
          batchNumber: batch.batch,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
          manufactureDate: batch.expiryDate // Using expiry as manufacture for now
        }));
      }

      console.log('✅ ITEM PRICE UPDATED IN STORE:', {
        itemSku: itemSku,
        updatedItem: items.value[itemIndex],
        newPrice: items.value[itemIndex].price
      });

      return items.value[itemIndex];
    } else {
      console.warn('⚠️ ITEM NOT FOUND IN STORE:', {
        itemSku: itemSku,
        availableItems: items.value.map(item => ({ sku: item.sku, name: item.name }))
      });
      return null;
    }
  };

  return {
    // State
    categories,
    items,
    currentCategory,
    loading,
    itemsLoading,
    error,

    // Getters
    getCategories,
    getItems,
    getCurrentCategory,
    isLoading,
    isItemsLoading,
    hasError,

    // Actions
    fetchCategories,
    fetchItemsByCategory,
    initializeCategories,
    updateItemPrice
  };
});
