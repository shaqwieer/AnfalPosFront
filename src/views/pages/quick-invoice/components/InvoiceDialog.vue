<script setup lang="ts">
import { computed } from 'vue'
import { useOrderStore } from '@/stores/orderStore.ts'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])

const orderStore = useOrderStore()

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
</script>

<template>
  <div v-if="show" class="fixed invoice-overlay">
    <div class="bg-white invoice-dialog flex flex-column">
      <!-- Dialog Header -->
      <div class="p-4 border-bottom flex align-items-center justify-content-between">
        <h2 class="text-xl font-semibold" style="color: var(--sap-text)">Invoice Preview</h2>
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
              <h2 class="text-2xl font-bold invoice-title">INVOICE</h2>
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
              <p class="customer-info-text">{{ orderStore.currentOrder.customer?.vehicles?.[0]?.make }} {{ orderStore.currentOrder.customer?.vehicles?.[0]?.model }} {{ orderStore.currentOrder.customer?.vehicles?.[0]?.year }}</p>
              <p class="customer-info-text">{{ orderStore.currentOrder.customer?.vehicles?.[0]?.plateNo || 'N/A' }}</p>
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
            <p>Thank you for your business! Payment is due within 30 days.</p>
          </div>
        </div>
      </div>

      <!-- Dialog Footer -->
      <div class="p-4 border-top flex justify-content-between">
        <div>
          <button class="px-4 py-2 post-invoice-btn mr-3">
            <span class="material-icons button-icon">post_add</span>
            Post Invoice
          </button>
          <button class="px-4 py-2 border cancel-btn"
                  @click="$emit('close')">
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
</style>