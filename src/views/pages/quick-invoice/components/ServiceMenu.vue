<script setup lang="ts">
/**
 * 🔍 CONSOLE LOGGING ANALYSIS FOR POS SYSTEM
 *
 * This component includes comprehensive console logging to track:
 *
 * 📦 ITEMS ARRAY TRACKING:
 * - Items are stored in: orderStore.currentOrder.items
 * - Each item contains: id, service (product details), quantity, price, discount, selectedBatch
 * - Console logs show items array before and after each addition/modification
 *
 * 👤 CUSTOMER DATA TRACKING:
 * - Customer is stored in: orderStore.currentOrder.customer
 * - Customer object contains: id, name, type, mobile, vehicles, businessDetails
 * - Console logs show customer info whenever items are selected or modified
 *
 * 🛍️ ITEM SELECTION TRACKING:
 * - When user clicks on an item, console shows:
 *   * Selected product details (name, sku, price, category)
 *   * Current customer information
 *   * Items array before and after addition
 *   * Batch information for batch-managed items
 *
 * 🏷️ BATCH MANAGEMENT:
 * - For batch-managed items, additional logging shows:
 *   * Selected batch details (batch number, quantity, dates)
 *   * Final pricing with discounts
 *   * Batch-specific item data
 *
 * 📊 ORDER TOTALS:
 * - Console shows updated totals after each change:
 *   * Subtotal, tax, and total amounts
 *   * Item count and complete order state
 *
 * Console log prefixes:
 * 🛍️ = Item selection
 * 👤 = Customer data
 * 📦 = Items array
 * 🏷️ = Batch management
 * 🏪 = Order store operations
 * ➕/➖ = Quantity changes
 * 🗑️ = Item removal
 * 📊 = Order totals/summary
 */

import { ref, computed, onMounted } from 'vue';
import { useOrderStore } from '../../../../stores/orderStore.ts';
import { useCompanyStore } from '../../../../stores/companyStore.ts';
import { useCategoryStore } from '../../../../stores/categoryStore.js';
import apiClient from '../../../../api/apiClient';

const searchQuery = ref('');
const isCardView = ref(true);
const showBatchDialog = ref(false);
const showProductInfo = ref(false);
const selectedProduct = ref<any>(null);
const selectedBatch = ref<any>(null);

// 💰 Track SAP price loading states for each product
const sapPriceLoading = ref(new Set());
const sapPricesLoaded = ref(new Set());

const companyStore = useCompanyStore();
const categoryStore = useCategoryStore();

const categories = computed(() => categoryStore.getCategories);
const selectedCategory = ref('');

// Initialize categories from API and set default selection
onMounted(async () => {
  await categoryStore.initializeCategories();
  // Set the first category as selected by default after categories are loaded
  if (categories.value.length > 0) {
    selectedCategory.value = categories.value[0];
    // Fetch items for the default category
    await categoryStore.fetchItemsByCategory(selectedCategory.value);
  }
});

// Watch for category changes to fetch items
const watchSelectedCategory = computed(() => {
  if (selectedCategory.value && selectedCategory.value !== categoryStore.getCurrentCategory) {
    categoryStore.fetchItemsByCategory(selectedCategory.value);
  }
  return selectedCategory.value;
});

const orderStore = useOrderStore();

// Form data for batch selection
const batchForm = ref({
  sellingPrice: 0,
  discountType: 'none',
  discountValue: 0
});

// Use API-fetched items instead of hardcoded services
const services = computed(() => categoryStore.getItems);

const filteredServices = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return services.value.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(query) ||
                         service.nameAr?.toLowerCase().includes(query) ||
                         service.sku.toLowerCase().includes(query);

    // Since items are already filtered by category from the API,
    // we only need to filter by search query
    return matchesSearch;
  });
});

const calculateFinalPrice = computed(() => {
  if (!batchForm.value.sellingPrice) return 0;

  if (batchForm.value.discountType === 'none') {
    return batchForm.value.sellingPrice;
  }

  if (batchForm.value.discountType === 'percentage') {
    const discount = batchForm.value.sellingPrice * (batchForm.value.discountValue / 100);
    return batchForm.value.sellingPrice - discount;
  }

  return Math.max(0, batchForm.value.sellingPrice - batchForm.value.discountValue);
});

const toggleView = () => {
  isCardView.value = !isCardView.value;
};

// 💰 Function to fetch item price from SAP
const fetchPriceFromSap = async (materialSapCode: string) => {
  try {
    console.log('💰 SAP PRICE REQUEST - Fetching price for:', {
      materialSapCode: materialSapCode,
      requestBody: { materialSapCode: materialSapCode },
      apiEndpoint: '/Items/GetPriceForSpecificItemFromSap',
      timestamp: new Date().toISOString()
    });

    const response = await apiClient.post('/Items/GetPriceForSpecificItemFromSap', {
      materialSapCode: materialSapCode
    });

    console.log('💰 SAP PRICE RESPONSE - Complete API Response:', {
      materialSapCode: materialSapCode,
      fullResponse: response,
      responseStatus: response.status,
      responseHeaders: response.headers,
      responseData: response.data,
      dataStructure: {
        success: response.data?.success,
        message: response.data?.message,
        data: response.data?.data,
        statusCode: response.data?.statusCode
      },
      priceDetails: {
        price: response.data?.data?.price,
        isCustomerSpecific: response.data?.data?.isCustomerSpecific,
        canEditPrice: response.data?.data?.canEditPrice,
        selectBatch: response.data?.data?.selectBatch,
        batches: response.data?.data?.batches,
        batchCount: response.data?.data?.batches?.length || 0
      },
      timestamp: new Date().toISOString()
    });

    // Additional validation logging
    if (response.data?.data?.price === 100) {
      console.warn('⚠️ SAP PRICE WARNING - Price is exactly 100:', {
        materialSapCode: materialSapCode,
        possibleIssues: [
          'Default/fallback price being returned',
          'Material code not found in SAP',
          'SAP system returning test data',
          'Material code format incorrect'
        ],
        responseData: response.data
      });
    }

    return response.data;
  } catch (error) {
    console.error('❌ SAP PRICE ERROR - Failed to fetch price:', {
      materialSapCode: materialSapCode,
      error: error,
      errorMessage: error.message,
      errorResponse: error.response?.data,
      errorStatus: error.response?.status,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

const handleProductClick = async (product: any) => {
  // 🔍 Debug product data structure first
  debugProductData(product);

  // Console log the selected product/item data when user clicks on an item
  console.log('🛍️ ITEM SELECTED:', {
    productData: product,
    itemName: product.name,
    itemSku: product.sku,
    itemPrice: product.price,
    itemCategory: product.category,
    isBatchManaged: product.batchManaged,
    timestamp: new Date().toISOString()
  });

  // Console log current customer information when item is selected
  console.log('👤 CURRENT CUSTOMER:', {
    customer: orderStore.currentOrder.customer,
    customerId: orderStore.currentOrder.customer?.id || 'No customer selected',
    customerName: orderStore.currentOrder.customer?.name || 'No customer selected',
    customerType: orderStore.currentOrder.customer?.type || 'No customer selected',
    customerMobile: orderStore.currentOrder.customer?.mobile || 'No customer selected'
  });

  // Console log current items array before adding new item
  console.log('📦 CURRENT ITEMS ARRAY (BEFORE):', {
    itemsArray: orderStore.currentOrder.items,
    itemsCount: orderStore.currentOrder.items.length,
    totalValue: orderStore.total
  });

  // 💰 Fetch current price from SAP before proceeding
  let updatedProduct = { ...product };
  try {
    if (product.sku) {
      // Mark this product as loading SAP price
      sapPriceLoading.value.add(product.sku);

      console.log('💰 FETCHING SAP PRICE - Starting price fetch for item:', {
        itemName: product.name,
        itemSku: product.sku,
        currentPrice: product.price,
        productData: product,
        specifications: product.specifications,
        sapItemFromSpecs: product.specifications?.['Sap Item'] || product.specifications?.['sapItem'],
        materialCodeToSend: product.sku,
        allProductProperties: Object.keys(product)
      });

      // Check if we should use a different field for SAP material code
      const materialSapCode = product.specifications?.['Sap Item'] ||
                             product.specifications?.['sapItem'] ||
                             product.materialCode ||
                             product.sapCode ||
                             product.sku;

      console.log('💰 MATERIAL CODE SELECTION:', {
        selectedMaterialCode: materialSapCode,
        availableOptions: {
          'specifications.Sap Item': product.specifications?.['Sap Item'],
          'specifications.sapItem': product.specifications?.['sapItem'],
          'materialCode': product.materialCode,
          'sapCode': product.sapCode,
          'sku': product.sku
        },
        finalChoice: materialSapCode
      });

      const sapPriceResponse = await fetchPriceFromSap(materialSapCode);

      if (sapPriceResponse.success && sapPriceResponse.data) {
        // Update product with SAP price and batch information
        updatedProduct.price = sapPriceResponse.data.price;
        updatedProduct.basePrice = sapPriceResponse.data.price;
        updatedProduct.canEditPrice = sapPriceResponse.data.canEditPrice;
        updatedProduct.isCustomerSpecific = sapPriceResponse.data.isCustomerSpecific;

        // Update batch information if available
        if (sapPriceResponse.data.selectBatch && sapPriceResponse.data.batches) {
          updatedProduct.batchManaged = true;
          updatedProduct.batches = sapPriceResponse.data.batches.map((batch: any) => ({
            id: `${product.sku}-${batch.batch}`,
            batchNumber: batch.batch,
            quantity: batch.quantity,
            expiryDate: batch.expiryDate,
            manufactureDate: batch.expiryDate // Using expiry as manufacture for now
          }));
        }

        console.log('💰 SAP PRICE UPDATED - Product price updated from SAP:', {
          itemName: product.name,
          itemSku: product.sku,
          originalPrice: product.price,
          updatedPrice: updatedProduct.price,
          priceChanged: product.price !== updatedProduct.price,
          canEditPrice: updatedProduct.canEditPrice,
          isCustomerSpecific: updatedProduct.isCustomerSpecific,
          batchManaged: updatedProduct.batchManaged,
          batchCount: updatedProduct.batches?.length || 0,
          updatedProduct: updatedProduct
        });

        // 🔄 UPDATE ITEM PRICE IN CATEGORY STORE (THIS UPDATES THE GRID)
        const updatedStoreItem = categoryStore.updateItemPrice(product.sku, sapPriceResponse.data);
        if (updatedStoreItem) {
          console.log('✅ GRID ITEM UPDATED - Price updated in store and grid:', {
            itemSku: product.sku,
            newPrice: updatedStoreItem.price,
            gridWillReflectNewPrice: true
          });

          // Use the updated item from store for further processing
          updatedProduct = updatedStoreItem;
        }

        // Mark price as loaded from SAP
        sapPricesLoaded.value.add(product.sku);
      }

      // Remove from loading state
      sapPriceLoading.value.delete(product.sku);
    }
  } catch (error) {
    console.warn('⚠️ SAP PRICE FETCH FAILED - Continuing with original price:', {
      itemName: product.name,
      itemSku: product.sku,
      originalPrice: product.price,
      error: error.message
    });

    // Remove from loading state and mark as loaded (even if failed)
    sapPriceLoading.value.delete(product.sku);
    sapPricesLoaded.value.add(product.sku);
    // Continue with original product if SAP fetch fails
  }

  if (updatedProduct.batchManaged && updatedProduct.batches?.length > 0) {
    selectedProduct.value = updatedProduct;
    batchForm.value.sellingPrice = updatedProduct.price;
    showBatchDialog.value = true;

    console.log('🏷️ BATCH MANAGED ITEM - Opening batch selection dialog:', {
      availableBatches: updatedProduct.batches,
      batchCount: updatedProduct.batches?.length || 0,
      updatedPrice: updatedProduct.price
    });
  } else {
    // Add item to cart for non-batch managed items
    orderStore.addItem(updatedProduct);

    // Console log items array after adding the item
    console.log('📦 CURRENT ITEMS ARRAY (AFTER):', {
      itemsArray: orderStore.currentOrder.items,
      itemsCount: orderStore.currentOrder.items.length,
      totalValue: orderStore.total,
      lastAddedItem: orderStore.currentOrder.items[orderStore.currentOrder.items.length - 1]
    });
  }
};

const showProductDetails = (product: any, event: Event) => {
  event.stopPropagation();
  selectedProduct.value = product;
  showProductInfo.value = true;
};

const selectBatch = (batch: any) => {
  selectedBatch.value = batch;
};

const addToCart = () => {
  if (selectedProduct.value && selectedBatch.value) {
    const product = {
      ...selectedProduct.value,
      price: batchForm.value.sellingPrice,
      selectedBatch: selectedBatch.value
    };

    // Add discount if applicable
    if (batchForm.value.discountType !== 'none') {
      product.discount = {
        type: batchForm.value.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount',
        value: batchForm.value.discountValue,
        isPercentage: batchForm.value.discountType === 'percentage'
      };
    }

    // Console log batch-managed item details before adding to cart
    console.log('🏷️ BATCH ITEM BEING ADDED TO CART:', {
      productData: product,
      selectedBatch: selectedBatch.value,
      finalPrice: batchForm.value.sellingPrice,
      discountApplied: batchForm.value.discountType !== 'none' ? product.discount : 'No discount',
      batchNumber: selectedBatch.value.batchNumber,
      batchQuantity: selectedBatch.value.quantity
    });

    // Console log current customer for batch items
    console.log('👤 CUSTOMER FOR BATCH ITEM:', {
      customer: orderStore.currentOrder.customer,
      customerId: orderStore.currentOrder.customer?.id || 'No customer selected'
    });

    // Console log items array before adding batch item
    console.log('📦 ITEMS ARRAY BEFORE BATCH ADD:', {
      itemsArray: orderStore.currentOrder.items,
      itemsCount: orderStore.currentOrder.items.length
    });

    orderStore.addItem(product);

    // Console log items array after adding batch item
    console.log('📦 ITEMS ARRAY AFTER BATCH ADD:', {
      itemsArray: orderStore.currentOrder.items,
      itemsCount: orderStore.currentOrder.items.length,
      totalValue: orderStore.total,
      lastAddedItem: orderStore.currentOrder.items[orderStore.currentOrder.items.length - 1]
    });

    closeBatchDialog();
  }
};

const closeBatchDialog = () => {
  showBatchDialog.value = false;
  selectedProduct.value = null;
  selectedBatch.value = null;
  batchForm.value = {
    sellingPrice: 0,
    discountType: 'none',
    discountValue: 0
  };
};

const closeProductInfo = () => {
  showProductInfo.value = false;
  selectedProduct.value = null;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// 💰 Helper function to check if price should be shown
const shouldShowPrice = (service: any): boolean => {
  return sapPricesLoaded.value.has(service.sku);
};

// 💰 Helper function to check if price is loading
const isPriceLoading = (service: any): boolean => {
  return sapPriceLoading.value.has(service.sku);
};

// � Debug function to analyze product data structure
const debugProductData = (product: any) => {
  console.log('🔍 PRODUCT DATA ANALYSIS:', {
    productName: product.name,
    productSku: product.sku,
    fullProductObject: product,
    specifications: product.specifications,
    possibleSapCodes: {
      'sku': product.sku,
      'specifications.Sap Item': product.specifications?.['Sap Item'],
      'specifications.sapItem': product.specifications?.['sapItem'],
      'materialCode': product.materialCode,
      'sapCode': product.sapCode,
      'sapMaterialCode': product.sapMaterialCode,
      'materialSapCode': product.materialSapCode
    },
    allKeys: Object.keys(product),
    specificationsKeys: product.specifications ? Object.keys(product.specifications) : 'No specifications'
  });
};
</script>

<template>
  <div class="h-full mt-3">
    <div class="sap-card h-full border-round">
      <!-- Search Bar -->
      <div class="p-4 border-bottom" style="border-color: var(--sap-border)">
        <div class="relative">
          <InputText v-model="searchQuery" type="text" class="sap-input w-full" placeholder="Search by product name or SKU..." />
          <span class="material-icons search-icon" style="color: var(--sap-text-secondary)">search</span>
        </div>

        <!-- Categories with View Toggle -->
        <div class="bg-gray-100 border-round mt-3">
          <div class="flex align-items-center justify-content-between p-2">
            <div class="flex flex-nowrap category-pills overflow-x-auto">
              <button
                v-for="category in categories"
                :key="category"
                @click="selectedCategory = category"
                :class="{
                  'category-pill': true,
                  active: selectedCategory === category,
                  'cursor-pointer': true
                }"
              >
                {{ category }}
              </button>
            </div>
            <button @click="toggleView" class="sap-button-secondary p-2 view-toggle ml-3 cursor-pointer">
              <span class="material-icons">{{ isCardView ? 'view_list' : 'grid_view' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Products/Services View -->
      <div class="p-3 pb-8 overflow-y-auto products-container" :class="isCardView ? 'grid' : 'flex-column gap-2'">
        <!-- Loading indicator -->
        <div v-if="categoryStore.isItemsLoading" class="flex align-items-center justify-content-center p-8">
          <div class="flex flex-column align-items-center gap-3">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--sap-primary)"></i>
            <p class="text-lg" style="color: var(--sap-text-secondary)">Loading products...</p>
          </div>
        </div>

        <!-- No items message -->
        <div v-else-if="!categoryStore.isItemsLoading && filteredServices.length === 0" class="flex align-items-center justify-content-center p-8">
          <div class="flex flex-column align-items-center gap-3">
            <span class="material-icons" style="font-size: 3rem; color: var(--sap-text-secondary)">inventory_2</span>
            <p class="text-lg" style="color: var(--sap-text-secondary)">No products found for this category</p>
          </div>
        </div>

        <!-- Products list -->
        <div v-else v-for="service in filteredServices" :key="service.id" :class="isCardView ? 'col-12 lg:col-6 xl:col-4' : 'flex-1'">
          <!-- Card View -->
          <div v-if="isCardView" class="service-card cursor-pointer" @click="handleProductClick(service)">
            <div class="flex flex-column">
              <div class="relative mb-4 card-image-container">
                <img :src="service.image" :alt="service.name" class="w-full card-image" />
                <!-- Moved info button to top left and batch tag to top right -->
                <div class="absolute card-info-btn">
                  <Button text @click="showProductDetails(service, $event)" class="p-1 bg-white rounded-full">
                    <span class="material-icons text-blue-600">info</span>
                  </Button>
                </div>
                <div class="absolute card-batch-tag">
                  <span v-if="service.batchManaged" class="sap-tag p-1 border-round bg-purple-100 text-purple-800"> Batch Managed </span>
                </div>
              </div>
              <div class="flex justify-content-between">
                <!-- SKU -->
                <div class="flex align-items-center gap-2">
                  <span class="material-icons text-sm" style="color: var(--sap-text-secondary)">qr_code</span>
                  <span class="text-sm" style="color: var(--sap-text-secondary)">{{ service.sku }}</span>
                </div>
                <!-- Unit -->
                <div class="flex align-items-center gap-2">
                  <span class="material-icons text-sm" style="color: var(--sap-text-secondary)">category</span>
                  <span class="text-sm" style="color: var(--sap-text-secondary)">{{ service.unit }}</span>
                </div>
              </div>

              <!-- Product Name -->
              <div class="flex align-items-center gap-2">
                <span class="material-icons text-sm pt-1" style="color: var(--sap-text-secondary)">inventory_2</span>
                <h3 class="text-lg font-bold group-hover:text-blue-600 transition-colors" style="color: var(--sap-text)">
                  {{ service.name }}
                </h3>
              </div>
              <div class="flex justify-content-between">
                <!-- Size -->
                <div class="flex align-items-center gap-2">
                  <span class="material-icons text-sm" style="color: var(--sap-text-secondary)">straighten</span>
                  <span class="text-sm" style="color: var(--sap-text-secondary)">{{ service.size }}</span>
                </div>
                <!-- Price -->
                <div class="flex align-items-center gap-2 justify-content-end">
                  <span class="material-icons text-sm" style="color: var(--sap-primary)">payments</span>
                  <!-- Show loading spinner while fetching SAP price -->
                  <div v-if="isPriceLoading(service)" class="flex align-items-center gap-2">
                    <i class="pi pi-spin pi-spinner" style="font-size: 1rem; color: var(--sap-primary)"></i>
                    <span class="text-sm" style="color: var(--sap-text-secondary)">Loading price...</span>
                  </div>
                  <!-- Show price only after SAP price is loaded -->
                  <span v-else-if="shouldShowPrice(service)" class="font-bold text-lg" style="color: var(--sap-primary)">
                    ${{ formatPrice(service.price) }}
                  </span>
                  <!-- Show placeholder when price not yet loaded -->
                  <span v-else class="text-sm" style="color: var(--sap-text-secondary)">
                    Click to get price
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="bg-white py-2 px-2 list-item flex align-items-center justify-content-between" @click="handleProductClick(service)">
            <div class="flex align-items-center gap-1">
              <!-- Image -->
              <img :src="service.image" :alt="service.name" class="list-image mr-4" />
              <!-- SKU and Name -->
              <div class="flex flex-column list-content py-2">
                <div class="flex align-items-center gap-1">
                  <span class="material-icons text-md" style="color: var(--sap-text-secondary)">qr_code</span>
                  <span class="text-md font-medium" style="color: var(--sap-text-secondary)">{{ service.sku }}</span>
                </div>
                <div class="flex align-items-center gap-1">
                  <span class="material-icons text-md" style="color: var(--sap-text-secondary)">inventory_2</span>
                  <p class="font-semibold text-lg list-title" style="color: var(--sap-text)">{{ service.name }}</p>
                </div>
              </div>
            </div>
            <div class="flex justify-content-between align-items-center gap-3">
              <!-- Unit and Size -->
              <div class="flex align-items-center gap-2">
                <span class="material-icons text-sm" style="color: var(--sap-text-secondary)">category</span>
                <span class="text-sm" style="color: var(--sap-text-secondary)">{{ service.unit }}</span>
              </div>
              <div class="flex align-items-center gap-2">
                <span class="material-icons text-sm" style="color: var(--sap-text-secondary)">straighten</span>
                <span class="text-sm" style="color: var(--sap-text-secondary)">{{ service.size }}</span>
              </div>

              <!-- Info Button, Price and Batch Status -->
              <Button text @click="showProductDetails(service, $event)" class="p-2 list-info-btn">
                <span class="material-icons text-blue-600">info</span>
              </Button>
              <span v-if="service.batchManaged" class="sap-tag bg-purple-100 p-1 border-round text-purple-800"> Batch Managed </span>
              <!-- Price section for list view -->
              <div class="flex align-items-center gap-1">
                <span class="material-icons text-sm" style="color: var(--sap-primary)">payments</span>
                <!-- Show loading spinner while fetching SAP price -->
                <div v-if="isPriceLoading(service)" class="flex align-items-center gap-2">
                  <i class="pi pi-spin pi-spinner" style="font-size: 1rem; color: var(--sap-primary)"></i>
                  <span class="text-sm" style="color: var(--sap-text-secondary)">Loading...</span>
                </div>
                <!-- Show price only after SAP price is loaded -->
                <span v-else-if="shouldShowPrice(service)" class="font-bold text-lg" style="color: var(--sap-primary)">
                  ${{ formatPrice(service.price) }}
                </span>
                <!-- Show placeholder when price not yet loaded -->
                <span v-else class="text-sm" style="color: var(--sap-text-secondary)">
                  Click to get price
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch Selection Dialog -->
    <div v-if="showBatchDialog && selectedProduct" class="fixed dialog-overlay">
      <div class="bg-white dialog-container">
        <!-- Dialog Header -->
        <div class="p-4 border-bottom flex align-items-center justify-content-between">
          <div>
            <h2 class="text-xl font-bold" style="color: var(--sap-text)">
              {{ selectedProduct.name }}
            </h2>
            <p class="text-md text-gray-600">{{ selectedProduct.sku }}</p>
          </div>
          <Button text @click="closeBatchDialog" class="p-2 dialog-close-btn">
            <span class="material-icons">close</span>
          </Button>
        </div>

        <!-- Dialog Content -->
        <div class="flex dialog-content" style="border-color: var(--sap-border)">
          <!-- Left Side: Batch Selection -->
          <div class="dialog-left p-6">
            <h3 class="text-lg font-semibold mb-2">Available Batches</h3>
            <div class="flex flex-column gap-2 overflow-y-auto">
              <div v-for="batch in selectedProduct.batches" :key="batch.id" class="p-4 border-1 border-gray-200 hover:border-blue-400 batch-item" :class="{ 'batch-selected': selectedBatch?.id === batch.id }" @click="selectBatch(batch)">
                <!-- Batch Header -->
                <div class="flex align-items-center justify-content-between mb-2">
                  <div class="flex align-items-center gap-2">
                    <span class="material-icons text-blue-600">inventory</span>
                    <span class="font-medium" style="color: var(--sap-text)">
                      {{ batch.batchNumber }}
                    </span>
                  </div>
                  <span
                    class="sap-tag border-round p-1"
                    :class="{
                      'bg-green-100 text-green-800': batch.quantity > 20,
                      'bg-yellow-100 text-yellow-800': batch.quantity <= 20 && batch.quantity > 5,
                      'bg-red-100 text-red-800': batch.quantity <= 5
                    }"
                  >
                    {{ batch.quantity }} available
                  </span>
                </div>

                <!-- Batch Details -->
                <div class="flex justify-content-between gap-2 text-sm mt-3" style="color: var(--sap-text-secondary)">
                  <div class="flex align-items-center gap-2">
                    <span class="material-icons text-sm">event</span>
                    <span>Mfg: {{ formatDate(batch.manufactureDate) }}</span>
                  </div>
                  <div class="flex align-items-center gap-2">
                    <span class="material-icons text-sm">event_busy</span>
                    <span>Exp: {{ formatDate(batch.expiryDate) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side: Pricing -->
          <div class="dialog-right p-6">
            <h3 class="text-lg font-semibold mb-4">Pricing Details</h3>

            <!-- Base Price -->
            <div class="pricing-base-container bg-gray-200 p-4 mb-6">
              <div class="flex align-items-center justify-content-between">
                <label class="text-md font-medium pricing-label">Base Price</label>
                <span class="font-bold text-lg">${{ formatPrice(selectedProduct.price) }}</span>
              </div>
            </div>

            <!-- Selling Price -->
            <div class="mb-6">
              <label class="block text-md font-semibold pricing-label mb-2">Selling Price</label>
              <InputNumber mode="currency" currency="SAR" v-model="batchForm.sellingPrice" class="w-full" min="0" />
            </div>

            <!-- Discount Section -->
            <div class="mb-6 flex flex-column gap-2">
              <label class="block text-md font-medium pricing-label mb-2">Apply Discount</label>
              <div class="flex gap-2">
                <select v-model="batchForm.discountType" class="w-full border-gray-200 border-round p-1">
                  <option value="none">No Discount</option>
                  <option value="amount">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
                <div v-if="batchForm.discountType !== 'none'" class="relative">
                  <InputNumber v-model="batchForm.discountValue" class="w-full" :placeholder="batchForm.discountType === 'percentage' ? 'Enter %' : 'Enter amount'" step="0.01" min="0" />
                  <span class="absolute discount-symbol">
                    {{ batchForm.discountType === 'percentage' ? '%' : '$' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Final Price Summary -->
            <div v-if="batchForm.discountType !== 'none'" class="pricing-summary p-4 mb-6">
              <div class="pricing-summary-content">
                <div class="flex justify-content-between text-sm">
                  <span class="pricing-summary-label text-md">Original Price</span>
                  <span class="text-md">${{ formatPrice(batchForm.sellingPrice) }}</span>
                </div>
                <div class="flex justify-content-between text-sm">
                  <span class="pricing-summary-label text-md">Discount</span>
                  <span class="pricing-discount text-md"> -${{ formatPrice(batchForm.sellingPrice - calculateFinalPrice) }} </span>
                </div>
                <div class="flex justify-content-between font-bold pricing-total">
                  <span class="text-md">Final Price</span>
                  <span class="text-md">${{ formatPrice(calculateFinalPrice) }}</span>
                </div>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <Button @click="addToCart" :disabled="!selectedBatch" class="w-full py-3 add-to-cart-btn flex align-items-center justify-content-center gap-2">
              <span class="material-icons">shopping_cart</span>
              <span>Add to Cart</span>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Info Dialog -->
    <div v-if="showProductInfo && selectedProduct" class="fixed dialog-overlay">
      <div class="bg-white product-info-dialog flex flex-column">
        <!-- Dialog Header -->
        <div class="p-4 pb-2 border-bottom flex align-items-center justify-content-between">
          <h2 class="text-xl font-semibold" style="color: var(--sap-text)">
            {{ selectedProduct.name }}
          </h2>
          <Button text @click="closeProductInfo" class="p-2 dialog-close-btn">
            <span class="material-icons">close</span>
          </Button>
        </div>

        <!-- Product Details -->
        <div class="p-3 overflow-y-auto">
          <!-- Product Image -->
          <div class="relative product-image-container mb-6">
            <img :src="selectedProduct.image" :alt="selectedProduct.name" class="w-full h-full product-detail-image" />
          </div>

          <!-- Basic Info -->
          <div class="flex gap-4 mb-6">
            <div class="flex align-items-center gap-2 w-6">
              <span class="material-icons text-blue-600">qr_code</span>
              <div>
                <div class="text-sm product-label">SKU</div>
                <div class="font-medium">{{ selectedProduct.sku }}</div>
              </div>
            </div>
            <div class="flex align-items-center gap-2 w-6">
              <span class="material-icons text-blue-600">payments</span>
              <div>
                <div class="text-sm product-label">Price</div>
                <div class="font-medium">${{ formatPrice(selectedProduct.price) }}</div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Description</h3>
            <p class="product-description">{{ selectedProduct.description }}</p>
          </div>

          <!-- Features -->
          <div class="mb-6">
            <h3 class="text-lg font-medium mb-2">Features</h3>
            <ul class="feature-list flex flex-column align-items-start gap-2 pl-0">
              <div v-for="feature in selectedProduct.features" :key="feature" class="flex gap-1">
                <span class="material-icons text-green-600 text-sm pt-1">check_circle</span>
                <span class="product-description">{{ feature }}</span>
              </div>
            </ul>
          </div>

          <!-- Specifications -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Specifications</h3>
            <div class="grid">
              <div v-for="(value, key) in selectedProduct.specifications" :key="key" class="flex align-items-start gap-2 col-6 mb-3">
                <span class="material-icons text-blue-600 text-sm">info</span>
                <div class="flex-1">
                  <div class="text-sm product-label">{{ key }}</div>
                  <div class="font-medium">{{ value }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Batch Information (if applicable) -->
          <div v-if="selectedProduct.batchManaged" class="mb-6">
            <h3 class="text-lg font-medium mb-2">Batch Information</h3>
            <div class="flex flex-column gap-2 overflow-y-auto">
              <div v-for="batch in selectedProduct.batches" :key="batch.id" class="p-4 border-1 border-gray-200 hover:border-blue-400 batch-item" :class="{ 'batch-selected': selectedBatch?.id === batch.id }" @click="selectBatch(batch)">
                <!-- Batch Header -->
                <div class="flex align-items-center justify-content-between mb-2">
                  <div class="flex align-items-center gap-2">
                    <span class="material-icons text-blue-600">inventory</span>
                    <span class="font-medium" style="color: var(--sap-text)">
                      {{ batch.batchNumber }}
                    </span>
                  </div>
                  <span
                    class="sap-tag border-round p-1"
                    :class="{
                      'bg-green-100 text-green-800': batch.quantity > 20,
                      'bg-yellow-100 text-yellow-800': batch.quantity <= 20 && batch.quantity > 5,
                      'bg-red-100 text-red-800': batch.quantity <= 5
                    }"
                  >
                    {{ batch.quantity }} available
                  </span>
                </div>

                <!-- Batch Details -->
                <div class="flex justify-content-between gap-2 text-sm mt-3" style="color: var(--sap-text-secondary)">
                  <div class="flex align-items-center gap-2">
                    <span class="material-icons text-sm">event</span>
                    <span>Mfg: {{ formatDate(batch.manufactureDate) }}</span>
                  </div>
                  <div class="flex align-items-center gap-2">
                    <span class="material-icons text-sm">event_busy</span>
                    <span>Exp: {{ formatDate(batch.expiryDate) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dialog Footer -->
        <div class="p-4 border-top flex justify-content-end gap-3">
          <Button outlined @click="closeProductInfo" class="px-4 bg-white py-2 border border-gray-300 dialog-footer-btn"> <p class="text-gray-900 m-0">Close</p> </Button>
          <Button
            @click="
              handleProductClick(selectedProduct);
              closeProductInfo();
            "
            class="px-4 py-2"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sap-input {
  min-width: 120px;
}

/* Search */
.search-input {
  padding-right: 2.5rem;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}

/* Categories */
.category-container {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  overflow-x: auto;
}

.category-pills {
  gap: 0.75rem;
}

.category-pill {
  padding: 0.5rem 1rem;
  border-radius: 3rem;
  border: none;
  background: transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.category-pill.active {
  background-color: var(--sap-primary);
  color: white;
}

.category-pill:hover:not(.active) {
  background-color: #e5e7eb;
}

.view-toggle {
  border-radius: 0.5rem;
}

/* Products Container */
.products-container {
  height: calc(100% - 140px);
}

.card-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.list-container {
  gap: 0.5rem;
}

/* Service Cards */
.service-card {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  transition: all 0.3s;
}

.service-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-image-container {
  overflow: hidden;
  border-radius: 0.75rem;
}

.card-image {
  height: 8rem;
  object-fit: cover;
  transform: scale(1);
  transition: transform 0.3s;
}

.service-card:hover .card-image {
  transform: scale(1.05);
}

.card-info-btn {
  top: 0.75rem;
  left: 0.75rem;
}

.card-batch-tag {
  top: 0.75rem;
  right: 0.75rem;
}

.info-button {
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.info-button:hover {
  background-color: #dbeafe;
}

.card-details-grid {
  grid-template-columns: repeat(2, 1fr);
}

.card-name-section {
  grid-column: span 2;
}

/* List View */
.list-item {
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.list-item:hover {
  border-color: #3b82f6;
}

.list-image {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  object-fit: cover;
}

.list-content {
  min-width: 0;
}

.list-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-details {
  gap: 1.5rem;
}

.list-info-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.list-info-btn:hover {
  background-color: #dbeafe;
}

/* Dialog Styles */
.dialog-overlay {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.dialog-container {
  border-radius: 0.75rem;
  width: 100%;
  max-width: 64rem;
}

.dialog-subtitle {
  color: #6b7280;
}

.dialog-close-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.dialog-close-btn:hover {
  background-color: #f3f4f6;
}

.dialog-content {
  border-left: 1px solid;
}

.dialog-left {
  width: 50%;
}

.dialog-right {
  width: 50%;
}

.batch-list {
  gap: 0.75rem;
}

.batch-item {
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.batch-item:hover {
  border-color: #3b82f6;
}

.batch-selected {
  border-color: #3b82f6 !important;
  background-color: #dbeafe;
}

.batch-details-grid {
  grid-template-columns: repeat(2, 1fr);
}

.pricing-base-container {
  /* background-color: #f9fafb; */
  border-radius: 0.5rem;
}

.pricing-label {
  color: #374151;
}

.pricing-currency-symbol {
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.pricing-input {
  padding-left: 2rem;
}

.discount-grid {
  grid-template-columns: repeat(2, 1fr);
}

.discount-input {
  padding-right: 2rem;
}

.discount-symbol {
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.pricing-summary {
  background-color: #dbeafe;
  border-radius: 0.5rem;
}

.pricing-summary-content {
  gap: 0.5rem;
}

.pricing-summary-label {
  color: #6b7280;
}

.pricing-discount {
  color: #059669;
}

.pricing-total {
  padding-top: 0.5rem;
  border-top: 1px solid #93c5fd;
}

.add-to-cart-btn {
  /* background-color: #2563eb; */
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
  gap: 0.5rem;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.add-to-cart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Product Info Dialog */
.product-info-dialog {
  border-radius: 0.75rem;
  width: 100%;
  max-width: 42rem;
  max-height: 90vh;
}

.product-image-container {
  height: 12rem;
  border-radius: 0.75rem;
  overflow: hidden;
}

.product-detail-image {
  object-fit: cover;
}

.product-basic-grid {
  grid-template-columns: repeat(2, 1fr);
}

.product-label {
  color: #6b7280;
}

.product-description {
  color: #6b7280;
}

.feature-list {
  gap: 0.5rem;
}

.product-specs-grid {
  grid-template-columns: repeat(2, 1fr);
}

.batch-info-list {
  gap: 0.75rem;
}

.batch-info-item {
  border-radius: 0.5rem;
}

.batch-info-details {
  grid-template-columns: repeat(2, 1fr);
}

.dialog-footer-btn {
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.dialog-footer-btn:hover {
  background-color: #f9fafb;
}

.dialog-footer-primary {
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.dialog-footer-primary:hover {
  background-color: #1d4ed8;
}
</style>
