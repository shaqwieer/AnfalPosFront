<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOrderStore } from '@/stores/orderStore.ts'
import { useTerminalStore } from '@/stores/terminalStore.js'
import { useToast } from 'primevue/usetoast'
import apiClient from '@/api/apiClient'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])

const orderStore = useOrderStore()
const terminalStore = useTerminalStore()
const toast = useToast()
const isSavingDraft = ref(false)

const invoiceNumber = computed(() => {
  return `#${Math.floor(Math.random() * 90000) + 10000}`
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const dueDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formatPrice = (price: number | string | undefined): string => {
  const num = Number(price)
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 🧾 Function to validate and save draft invoice
const validateAndSaveDraft = () => {
  // 🔍 VALIDATION: Check if session is opened
  if (!terminalStore.isSessionOpened) {
    console.error('❌ INVOICE VALIDATION ERROR - Session not opened:', {
      isSessionOpened: terminalStore.isSessionOpened,
      terminalInfo: terminalStore.getTerminalInfo,
      error: 'Cannot post invoice without an open session',
      timestamp: new Date().toISOString()
    });

    // Show error message to user using PrimeVue Toast
    toast.add({
      severity: 'error',
      summary: 'Session Required',
      detail: 'Cannot post invoice: Session is not opened. Please open a session first.',
      life: 5000
    });
    return false;
  }

  // 🔍 VALIDATION: Check if customer is selected
  if (!orderStore.currentOrder.customer) {
    console.error('❌ INVOICE VALIDATION ERROR - No customer selected:', {
      customer: orderStore.currentOrder.customer,
      order: orderStore.currentOrder,
      error: 'Cannot post invoice without selecting a customer',
      timestamp: new Date().toISOString()
    });

    // Show error message to user using PrimeVue Toast
    toast.add({
      severity: 'error',
      summary: 'Customer Required',
      detail: 'Cannot post invoice: Please select a customer first.',
      life: 5000
    });
    return false;
  }

  // 🔍 VALIDATION: Check if items exist
  if (!orderStore.currentOrder.items || orderStore.currentOrder.items.length === 0) {
    console.error('❌ INVOICE VALIDATION ERROR - No items in order:', {
      items: orderStore.currentOrder.items,
      itemsCount: orderStore.currentOrder.items?.length || 0,
      order: orderStore.currentOrder,
      error: 'Cannot post invoice without items',
      timestamp: new Date().toISOString()
    });

    // Show error message to user using PrimeVue Toast
    toast.add({
      severity: 'error',
      summary: 'Items Required',
      detail: 'Cannot post invoice: Please add items to the order first.',
      life: 5000
    });
    return false;
  }

  // ✅ All validations passed
  console.log('✅ INVOICE VALIDATION PASSED - Proceeding to post invoice:', {
    sessionOpened: terminalStore.isSessionOpened,
    customerSelected: !!orderStore.currentOrder.customer,
    itemsCount: orderStore.currentOrder.items.length,
    isDraft: true,
    timestamp: new Date().toISOString()
  });

  // Save the draft
  saveDraftInvoice();
  return true;
};

// 🧾 Function to save draft invoice to API
const saveDraftInvoice = async () => {
  isSavingDraft.value = true;

  try {
    // 📋 Prepare invoice data according to the required format
    const invoiceData = {
      customerId: orderStore.currentOrder.customer.id,
      isDraft: true, // Always set to true for draft
      items: orderStore.currentOrder.items.map((item) => {
        // Extract SAP item from specifications if available
        const sapItem = item.service.specifications?.['Sap Item'] ||
                       item.service.specifications?.['sapItem'] ||
                       item.service.sku || '';

        // Calculate batch quantities
        const batchForQuantities = [];
        if (item.selectedBatch) {
          batchForQuantities.push({
            batch: item.selectedBatch.batchNumber || item.selectedBatch.batch || 'DEFAULT',
            quantity: item.quantity
          });
        } else {
          // Default batch if no batch selected
          batchForQuantities.push({
            batch: 'DEFAULT',
            quantity: item.quantity
          });
        }

        return {
          id: item.id,
          quantity: item.quantity,
          itemName: item.service.name,
          sapItem: sapItem,
          changedPrice: item.changedPrice || false,
          isFreeProduct: item.isFreeProduct || false,
          price: item.price,
          finalDiscountAmount: item.selectedBatch?.discountAmount ||
                              (item.discount?.isPercentage
                                ? item.price * item.quantity * (item.discount.value / 100)
                                : item.discount?.value || 0),
          batchForQuantities: batchForQuantities,
          existPercentage: item.discount?.isPercentage ? item.discount.value : 0
        };
      })
    };

    // 📊 Console log the prepared data before sending request
    console.log('📋 DRAFT INVOICE DATA PREPARED - Ready to send to API:', {
      invoiceData: invoiceData,
      customerId: invoiceData.customerId,
      customerName: orderStore.currentOrder.customer.name,
      isDraft: true,
      itemsCount: invoiceData.items.length,
      totalItems: invoiceData.items,
      orderTotal: orderStore.total,
      sessionInfo: {
        isSessionOpened: terminalStore.isSessionOpened,
        terminalInfo: terminalStore.getTerminalInfo
      },
      timestamp: new Date().toISOString()
    });

    // 🚀 Send POST request to create draft invoice
    console.log('🚀 SENDING DRAFT INVOICE REQUEST - Saving to API...');

    const response = await apiClient.post('/Invoices/CreateQuickInvoice', invoiceData);

    // ✅ Success response logging
    console.log('✅ DRAFT INVOICE SAVED SUCCESSFULLY - API Response:', {
      response: response,
      responseData: response.data,
      success: response.data?.success,
      message: response.data?.message,
      invoiceId: response.data?.data?.id || response.data?.data?.invoiceId,
      invoiceNumber: response.data?.data?.invoiceNumber,
      isDraft: true,
      customerName: orderStore.currentOrder.customer.name,
      itemsCount: invoiceData.items.length,
      orderTotal: orderStore.total,
      timestamp: new Date().toISOString()
    });

    // Show success message to user using PrimeVue Toast
    toast.add({
      severity: 'success',
      summary: 'Draft Saved',
      detail: 'Draft saved successfully!',
      life: 5000
    });

    // Close dialog but keep the order (don't finalize for drafts)
    emit('close');
    console.log('🔄 DRAFT SAVED - Order kept for further editing');

    return response.data;

  } catch (error) {
    // ❌ Error response logging
    console.error('❌ DRAFT INVOICE SAVING FAILED - API Error:', {
      error: error,
      errorMessage: error.message,
      errorResponse: error.response?.data,
      errorStatus: error.response?.status,
      errorStatusText: error.response?.statusText,
      invoiceData: {
        customerId: orderStore.currentOrder.customer?.id,
        customerName: orderStore.currentOrder.customer?.name,
        itemsCount: orderStore.currentOrder.items.length,
        isDraft: true
      },
      sessionInfo: {
        isSessionOpened: terminalStore.isSessionOpened,
        terminalInfo: terminalStore.getTerminalInfo
      },
      timestamp: new Date().toISOString()
    });

    // Show error message to user using PrimeVue Toast
    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        'Failed to save draft. Please try again.';

    toast.add({
      severity: 'error',
      summary: 'Draft Saving Failed',
      detail: errorMessage,
      life: 7000
    });

    throw error;
  } finally {
    isSavingDraft.value = false;
  }
};
</script>

<template>
  <div v-if="show" class="fixed invoice-overlay">
    <div class="bg-white invoice-dialog flex flex-column">
      <!-- Dialog Header -->
      <div class="p-4 border-bottom flex align-items-center justify-content-between">
        <h2 class="text-xl font-semibold" style="color: var(--sap-text)">Draft Invoice Preview</h2>
        <Button text @click="$emit('close')" class="p-2 dialog-close-btn">
          <span class="material-icons">close</span>
        </Button>
      </div>

      <!-- Invoice Content -->
      <div class="p-2 flex-1 overflow-y-auto">
        <div class="invoice-content">
          <!-- Company Header -->
          <div class="flex justify-content-between align-items-start mb-6">
            <div>
              <div class="flex align-items-center company-header">
                <span class="material-icons text-blue-600">store</span>
                <h1 class="text-2xl font-bold text-blue-600">TireShop POS</h1>
              </div>
              <p class="company-address mt-2">123 Main Street</p>
              <p class="company-address">City, State 12345</p>
              <p class="company-address">+1 (234) 567-8900</p>
            </div>
            <div class="text-right pt-4">
              <h2 class="text-2xl font-bold invoice-title">DRAFT INVOICE</h2>
              <p class="invoice-details mt-2">{{ invoiceNumber }}</p>
              <p class="invoice-details">Issue Date: {{ currentDate }}</p>
              <p class="invoice-details">Due Date: {{ dueDate }}</p>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="grid customer-info-grid gap-8 mb-3">
            <div>
              <h3 class="font-bold customer-section-title mb-2">Bill To:</h3>
              <p class="customer-info-text">{{ orderStore.currentOrder.customer?.name || 'Walk-in Customer' }}</p>
              <p class="customer-info-text">{{ orderStore.currentOrder.customer?.mobile || 'N/A' }}</p>
              <!-- <p class="customer-info-text">{{ orderStore.currentOrder.customer?.vehicles?.[0]?.make }} {{ orderStore.currentOrder.customer?.vehicles?.[0]?.model }} {{ orderStore.currentOrder.customer?.vehicles?.[0]?.year }}</p>
              <p class="customer-info-text">{{ orderStore.currentOrder.customer?.vehicles?.[0]?.plateNo || 'N/A' }}</p> -->
            </div>
            <div v-if="orderStore.currentOrder.customer?.type === 'business'">
              <h3 class="font-bold customer-section-title mb-2">Business Details:</h3>
              <p class="customer-info-text">CR: {{ orderStore.currentOrder.customer?.businessDetails?.cr }}</p>
              <p class="customer-info-text">VAT: {{ orderStore.currentOrder.customer?.businessDetails?.vat }}</p>
            </div>
          </div>

          <!-- Items Table -->
          <table class="w-full mb-8 invoice-table">
            <thead class="border-bottom-1 border-300">
              <tr >
                <th class="py-3 text-left table-header-cell">Item</th>
                <th class="py-3 text-center table-header-cell">Qty</th>
                <th class="py-3 text-right table-header-cell">Price</th>
                <th class="py-3 text-right table-header-cell">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in orderStore.currentOrder.items" :key="item.id" class="border-bottom-1 border-300">
                <td class="py-3 table-cell">{{ item.service.name }}</td>
                <td class="py-3 text-center table-cell">{{ item.quantity }}</td>
                <td class="py-3 text-right table-cell">${{ formatPrice(item.price) }}</td>
                <td class="py-3 text-right table-cell">${{ formatPrice(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals-section">
            <div class="flex justify-content-between py-2">
              <span class="totals-label">Subtotal:</span>
              <span class="totals-value">${{ formatPrice(orderStore.subtotal) }}</span>
            </div>
            <div class="flex justify-content-between py-2">
              <span class="totals-label">Tax (15%):</span>
              <span class="totals-value">${{ formatPrice(orderStore.tax) }}</span>
            </div>
            <div class="flex justify-content-between py-2 border-top font-bold totals-final">
              <span class="totals-final-label">Total:</span>
              <span class="totals-final-value">${{ formatPrice(orderStore.total) }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div class="mt-8 invoice-notes">
            <p class="font-bold mb-2">Notes:</p>
            <p>This is a draft invoice. Thank you for your business! Payment is due within 30 days.</p>
          </div>
        </div>
      </div>

      <!-- Dialog Footer -->
      <div class="p-4 border-top flex justify-content-between">
        <div>
          <button
            class="py-2 px-4 draft-btn mr-3" 
            @click="validateAndSaveDraft()"
            :disabled="isSavingDraft"
          >
            <span v-if="!isSavingDraft" class="material-icons button-icon">draft</span>
            <span v-else class="material-icons button-icon animate-spin">refresh</span>
            <span style="margin-left: -110px;">{{ isSavingDraft ? 'Saving...' : 'Save as Draft' }}</span>
          </button>
                      <button
              class="px-4 py-2 border cancel-btn"
              @click="$emit('close')"
              :disabled="isSavingDraft"
            >
            Cancel
          </button>
        </div>
        <div class="footer-actions flex gap-3">
          <button class="px-4 py-2 action-btn">
            <span class="material-icons button-icon">edit</span>
            Edit
          </button>
          <button class="px-4 py-2 action-btn">
            <span class="material-icons button-icon">print</span>
            Print
          </button>
          <button class="px-4 py-2 download-btn">
            <span class="material-icons button-icon">download</span>
            Download
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dialog Overlay */
.invoice-overlay {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.invoice-dialog {
  border-radius: 0.75rem;
  width: 100%;
  max-width: 64rem;
  max-height: 95vh;
}

.dialog-close-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.dialog-close-btn:hover {
  background-color: #f3f4f6;
}

/* Invoice Content */
.invoice-content {
  max-width: 48rem;
  margin: 0 auto;
}

/* Company Header */
.company-header {
  gap: 0.5rem;
}

.company-address {
  color: #6b7280;
}

.invoice-title {
  color: #1f2937;
}

.invoice-details {
  color: #6b7280;
}

/* Customer Info */
.customer-info-grid {
  grid-template-columns: repeat(2, 1fr);
}

.customer-section-title {
  color: #1f2937;
}

.customer-info-text {
  color: #6b7280;
}

/* Invoice Table */
.invoice-table {
  border-color: #e5e7eb;
}

.table-header {
  border-color: #e5e7eb;
}

.table-header-cell {
  color: #6b7280;
}

.table-row {
  border-color: #e5e7eb;
}

.table-cell {
  color: #1f2937;
}

/* Totals Section */
.totals-section {
  width: 50%;
  margin-left: auto;
}

.totals-label {
  color: #6b7280;
}

.totals-value {
  color: #1f2937;
}

.totals-final {
  border-color: #e5e7eb;
}

.totals-final-label {
  color: #1f2937;
}

.totals-final-value {
  color: #1f2937;
}

/* Notes */
.invoice-notes {
  color: #6b7280;
}

/* Footer Actions */
.footer-actions {
  gap: 0.75rem;
}

.draft-btn {
  background-color: #f59e0b;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.draft-btn:hover {
  background-color: #d97706;
}

.draft-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.post-invoice-btn {
  background-color: #7c3aed;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.post-invoice-btn:hover {
  background-color: #6d28d9;
}

.post-invoice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #f9fafb;
}

.action-btn {
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #e5e7eb;
}

.download-btn {
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.download-btn:hover {
  background-color: #1d4ed8;
}

.button-icon {
  vertical-align: middle;
  margin-right: 0.25rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>