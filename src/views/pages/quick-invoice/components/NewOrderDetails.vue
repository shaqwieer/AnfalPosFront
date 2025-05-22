<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOrderStore } from '@/stores/orderStore.ts';
import { usePromoStore } from '@/stores/promoStore.ts';
import { CustomerSearchDialog, InvoiceDialog, PaymentDialog } from '../components';
import { BaseButton } from '@/components/shared';

const orderStore = useOrderStore();
const promoStore = usePromoStore();
const showCustomerSearch = ref(false);
const showInvoiceDialog = ref(false);
const showPaymentDialog = ref(false);
const showPromoDialog = ref(false);
const selectedPromoCode = ref('');
const searchQuery = ref('');

// Create an order object for the payment dialog
const currentOrder = computed(() => ({
  total: orderStore.total,
  items: orderStore.currentOrder.items,
  customer: orderStore.currentOrder.customer
}));

const customerName = computed(() => {
  return orderStore.currentOrder.customer?.name || 'Select Customer';
});

const filteredPromotions = computed(() => {
  return promoStore.promotions.filter((promo) => {
    const query = searchQuery.value.toLowerCase();
    return (!query || promo.name.toLowerCase().includes(query) || (promo.promoCode?.code && promo.promoCode.code.toLowerCase().includes(query))) && promo.status === 'active';
  });
});

const formatPrice = (price?: number) => {
  return typeof price === 'number'
    ? price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : '0.00';
};

const incrementQuantity = (itemId: string) => {
  const item = orderStore.currentOrder.items.find((i) => i.id === itemId);
  if (item) {
    orderStore.updateQuantity(itemId, item.quantity + 1);
  }
};

const decrementQuantity = (itemId: string) => {
  const item = orderStore.currentOrder.items.find((i) => i.id === itemId);
  if (item) {
    orderStore.updateQuantity(itemId, item.quantity - 1);
  }
};

const toggleCustomerSearch = () => {
  showCustomerSearch.value = !showCustomerSearch.value;
};

const handleInvoiceClick = () => {
  showInvoiceDialog.value = true;
};

const handlePaymentClick = () => {
  showPaymentDialog.value = true;
};

const getDiscountText = (item: any) => {
  if (!item.discount) return '';
  return `${item.discount.value}${item.discount.isPercentage ? '%' : '$'} off`;
};

const calculateSavings = (item: any) => {
  const baseTotal = item.basePrice * item.quantity;
  const discountedTotal = orderStore.calculateItemTotal(item);
  return baseTotal - discountedTotal;
};

const applyPromotion = (promotion: any) => {
  // Check if there are items in the cart
  if (orderStore.currentOrder.items.length === 0) {
    alert('Please add items to your cart before applying a promotion');
    return;
  }

  // Create a single context with all items
  const context = {
    items: orderStore.currentOrder.items,
    promoCode: promotion.promoCode?.code
  };

  // Check if promotion is applicable
  if (!promoStore.isPromotionApplicable(promotion, context)) {
    alert('This promotion cannot be applied to your current items');
    return;
  }

  // Calculate and apply the discount
  const discount = promoStore.calculateDiscount(promotion, context);
  if (discount > 0) {
    // For Buy 5 Get 2 Free promotion, apply to TRS-001 items
    if (promotion.id === 'PROMO-015') {
      const trsItems = orderStore.currentOrder.items.filter((item) => item.service.sku === 'TRS-001');
      if (trsItems.length > 0) {
        orderStore.setItemDiscount(trsItems[0].id, {
          type: promotion.name,
          value: discount,
          isPercentage: false
        });
      }
    }
  }

  showPromoDialog.value = false;
  selectedPromoCode.value = '';
  searchQuery.value = '';
};

const handlePromoCodeSubmit = () => {
  if (!selectedPromoCode.value) {
    alert('Please enter a promo code');
    return;
  }

  const promotion = promoStore.promotions.find((p) => p.promoCode?.code === selectedPromoCode.value.toUpperCase() && p.status === 'active');

  if (promotion) {
    applyPromotion(promotion);
  } else {
    alert('Invalid or expired promo code');
  }
};

const clearFilters = () => {
  searchQuery.value = '';
};

const removeAllDiscounts = () => {
  orderStore.currentOrder.items.forEach((item) => {
    orderStore.setItemDiscount(item.id, undefined);
  });
};
</script>

<template>
  <div class="h-full flex flex-column">
    <!-- Order Header -->
    <div class="p-4 flex align-items-center justify-content-between border-bottom order-header" style="border-color: var(--sap-border)">
      <h2 class="text-xl font-semibold" style="color: var(--sap-text)">
        {{ customerName }}
      </h2>
      <div class="flex align-items-center header-actions">
        <Button text class="p-2 header-btn" @click="toggleCustomerSearch">
          <span class="material-icons text-blue-600">visibility</span>
        </Button>
        <Button text class="p-2 header-btn" @click="showPromoDialog = true">
          <span class="material-icons text-blue-600">local_offer</span>
        </Button>
        <Button text class="p-2 header-btn">
          <span class="material-icons text-blue-600">more_vert</span>
        </Button>
      </div>
    </div>

    <!-- Order Details - Scrollable -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4">
        <!-- Empty State -->
        <div v-if="!orderStore.currentOrder.items.length" class="text-center empty-state">
          <span class="material-icons empty-icon">shopping_cart</span>
          <p class="text-lg font-semibold" style="color: var(--sap-text-secondary)">No items in cart</p>
          <p class="text-md" style="color: var(--sap-text-secondary)">Add items from the service menu</p>
        </div>

        <!-- Items List -->
        <div v-else class="items-list">
          <div v-for="item in orderStore.currentOrder.items" :key="item.id" class="p-4 item-card">
            <!-- Item Header -->
            <div class="flex align-items-start justify-content-between">
              <div class="item-info">
                <div class="flex align-items-center item-title-row">
                  <p class="font-medium text-xl" style="color: var(--sap-text)">{{ item.service.name }}</p>
                  <div v-if="item.discount" class="px-2 discount-badge">
                    {{ getDiscountText(item) }}
                  </div>
                </div>
                <div class="text-md item-subtitle">Selling Price: ${{ formatPrice(item.price) }}</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-lg" style="color: var(--sap-text)">${{ formatPrice(orderStore.calculateItemTotal(item)) }}</div>
                <div v-if="item.discount" class="text-sm savings-text">Saved: ${{ formatPrice(calculateSavings(item)) }}</div>
              </div>
            </div>

            <!-- Quantity Controls -->
            <div class="flex align-items-center justify-content-between mt-4">
              <div class="flex align-items-center quantity-controls">
                <Button text @click="decrementQuantity(item.id)" class="quantity-btn">
                  <span class="material-icons text-sm text-blue-600">remove</span>
                </Button>
                <span class="quantity-display">{{ item.quantity }}</span>
                <Button text @click="incrementQuantity(item.id)" class="quantity-btn">
                  <span class="material-icons text-sm text-blue-600">add</span>
                </Button>
              </div>
              <Button text @click="orderStore.removeItem(item.id)" class="p-2 delete-btn">
                <span class="material-icons">delete</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Summary and Actions -->
    <div class="border-top order-footer" style="border-color: var(--sap-border)">
      <div class="p-4">
        <!-- Order Summary -->
        <div class="summary-section">
          <div class="flex justify-content-between">
            <span style="color: var(--sap-text-secondary)">Subtotal</span>
            <span style="color: var(--sap-text)">${{ formatPrice(orderStore.subtotal) }}</span>
          </div>
          <div class="flex justify-content-between">
            <span style="color: var(--sap-text-secondary)">Tax (15%)</span>
            <span style="color: var(--sap-text)">${{ formatPrice(orderStore.tax) }}</span>
          </div>
          <div class="flex justify-content-between text-xl font-bold pt-2 border-top total-row" style="border-color: var(--sap-border)">
            <span style="color: var(--sap-text)">Total</span>
            <span style="color: var(--sap-text)">${{ formatPrice(orderStore.total) }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 flex flex-column gap-3">
          <Button severity="warning" class="w-full" label="Save as Draft" @click="orderStore.saveDraft">
            <!-- <div class="flex align-items-center justify-content-center"><p>Save as Draft</p></div> -->
          </Button>
          <div class="flex gap-3">
            <Button severity="primary" class="w-full" @click="handleInvoiceClick" label="Invoice">
            </Button>
            <Button severity="success" class="w-full" @click="handlePaymentClick" label="Payment">
              <!-- <div class="flex align-items-center justify-content-center">Payment</div> -->
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <CustomerSearchDialog :show="showCustomerSearch" @close="showCustomerSearch = false" />

    <InvoiceDialog :show="showInvoiceDialog" @close="showInvoiceDialog = false" />

    <PaymentDialog :show="showPaymentDialog" :order="currentOrder" @close="showPaymentDialog = false" />

    <!-- Promo Code Dialog -->
    <div v-if="showPromoDialog" class="fixed promo-dialog-overlay">
      <div class="bg-white promo-dialog">
        <div class="p-4 border-bottom flex align-items-center justify-content-between">
          <h3 class="text-lg font-semibold">Apply Promotion</h3>
          <div class="flex align-items-center dialog-header-actions">
            <button v-if="orderStore.currentOrder.items.some((item) => item.discount)" @click="removeAllDiscounts" class="px-3 remove-discounts-btn">Remove All Discounts</button>
            <button @click="showPromoDialog = false" class="p-2 dialog-close-btn">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div class="promo-content">
            <!-- Manual Promo Code Entry -->
            <div>
              <label class="block text-sm font-medium mb-2">Enter Promo Code</label>
              <div class="flex promo-input-row">
                <input v-model="selectedPromoCode" type="text" class="sap-input flex-1 promo-input" placeholder="Enter promo code" @keyup.enter="handlePromoCodeSubmit" />
                <button @click="handlePromoCodeSubmit" class="px-4 py-2 apply-btn">Apply</button>
              </div>
            </div>

            <!-- Available Promotions -->
            <div>
              <div class="flex align-items-center justify-content-between mb-4">
                <label class="block text-sm font-medium">Available Promotions</label>
                <div class="flex align-items-center search-section">
                  <div class="relative">
                    <input v-model="searchQuery" type="text" class="sap-input search-input" placeholder="Search promotions..." />
                    <button v-if="searchQuery" @click="clearFilters" class="absolute search-clear-btn">
                      <span class="material-icons text-sm">clear</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="promotions-list">
                <div v-for="promo in filteredPromotions" :key="promo.id" class="border promo-card" @click="applyPromotion(promo)">
                  <div class="flex align-items-start justify-content-between">
                    <div>
                      <h4 class="font-medium">{{ promo.name }}</h4>
                      <p class="text-sm promo-description mt-1">{{ promo.description }}</p>
                    </div>
                    <div v-if="promo.promoCode" class="px-3 py-1 promo-code-badge">
                      {{ promo.promoCode.code }}
                    </div>
                  </div>

                  <!-- Promotion Details -->
                  <div class="mt-3 grid promo-details-grid gap-4 text-sm">
                    <div class="flex align-items-center promo-detail">
                      <span class="material-icons promo-icon text-sm">event</span>
                      <span class="promo-detail-text"> Valid until {{ new Date(promo.endDate).toLocaleDateString() }} </span>
                    </div>
                    <div v-if="promo.promoCode?.usageLimit" class="flex align-items-center promo-detail">
                      <span class="material-icons promo-icon text-sm">redeem</span>
                      <span class="promo-detail-text"> {{ promo.promoCode.usageLimit - promo.promoCode.usedCount }} uses remaining </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Header */
.order-header {
  flex-shrink: 0;
}

.header-actions {
  gap: 0.5rem;
}

.header-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.header-btn:hover {
  background-color: #f3f4f6;
}

/* Empty State */
.empty-state {
  padding: 2rem 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  color: #3b82f6;
}

/* Items List */
.items-list {
  gap: 1rem;
}

.item-card {
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.item-card:hover {
  border-color: #3b82f6;
}

.item-info {
  gap: 0.25rem;
}

.item-title-row {
  gap: 0.5rem;
}

.discount-badge {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
  font-size: 0.75rem;
  border-radius: 9999px;
  background-color: #dcfce7;
  color: #166534;
}

.item-subtitle {
  color: #6b7280;
}

.savings-text {
  color: #059669;
}

.quantity-controls {
  gap: 0.5rem;
}

.quantity-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  /* border: 1px solid #d1d5db; */
  transition: all 0.2s;
}

.quantity-btn:hover {
  background-color: #f9fafb;
}

.quantity-display {
  width: 2rem;
  text-align: center;
}

.delete-btn {
  color: #ef4444;
  border-radius: 50%;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #dc2626;
  background-color: #fef2f2;
}

/* Order Footer */
.order-footer {
  flex-shrink: 0;
}

.summary-section {
  gap: 0.5rem;
}

.total-row {
  padding-top: 0.5rem;
}

.action-buttons {
  gap: 0.75rem;
}

.action-buttons-grid {
  grid-template-columns: repeat(2, 1fr);
}

/* Promo Dialog */
.promo-dialog-overlay {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.promo-dialog {
  border-radius: 0.75rem;
  width: 100%;
  max-width: 42rem;
}

.dialog-header-actions {
  gap: 0.5rem;
}

.remove-discounts-btn {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  font-size: 0.875rem;
  color: #dc2626;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.remove-discounts-btn:hover {
  background-color: #fef2f2;
}

.dialog-close-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.dialog-close-btn:hover {
  background-color: #f3f4f6;
}

.promo-content {
  gap: 1.5rem;
}

.promo-input-row {
  gap: 0.5rem;
}

.promo-input {
  text-transform: uppercase;
}

.apply-btn {
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.apply-btn:hover {
  background-color: #1d4ed8;
}

.search-section {
  gap: 0.5rem;
}

.search-input {
  padding-right: 2rem;
}

.search-clear-btn {
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  color: #9ca3af;
  transition: all 0.2s;
}

.search-clear-btn:hover {
  color: #6b7280;
}

.promotions-list {
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.promo-card {
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
  cursor: pointer;
}

.promo-card:hover {
  border-color: #3b82f6;
}

.promo-description {
  color: #6b7280;
}

.promo-code-badge {
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', monospace;
}

.promo-details-grid {
  grid-template-columns: repeat(2, 1fr);
}

.promo-detail {
  gap: 0.5rem;
}

.promo-icon {
  color: #9ca3af;
}

.promo-detail-text {
  color: #6b7280;
}
</style>
