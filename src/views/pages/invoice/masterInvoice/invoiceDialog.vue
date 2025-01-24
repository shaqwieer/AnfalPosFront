<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OrderItem, Order, Customer, InvoiceViewItem } from '../types'

interface Props {
  modelValue: boolean
  orderItems: OrderItem[]
  customerName: string
  invoiceNumber: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const isPrinting = ref(false)

const sampleItems: OrderItem[] = [
  {
    id: '1',
   itemName :'test',
    finalDiscountAmount: 10,
    existpercentage: 0,
    quantity: 1,
    price : 10
  }
]

const itemsToUse = computed(() => props.orderItems.length > 0 ? props.orderItems : sampleItems)
const subtotal = computed(() => itemsToUse.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const tax = computed(() => subtotal.value * 0.1) // Assuming 10% tax
const total = computed(() => subtotal.value + tax.value)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handlePost = () => {
  // Implement post functionality here
  console.log("Invoice posted")
  handleClose()
}

const handleReprint = () => {
  isPrinting.value = true
  // Simulate printing process
  setTimeout(() => {
    isPrinting.value = false
    console.log("Invoice reprinted")
  }, 2000)
}

const handleShareWhatsApp = () => {
  console.log("Shared to WhatsApp")
  // Implement WhatsApp sharing functionality here
}
</script>

<template>
  <div v-if="modelValue" class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black-alpha-60 z-50">
    <div class="bg-white border-round-lg shadow-2 w-full max-w-7xl max-h-90vh flex flex-column">
      <!-- Header -->
      <div class="p-4 bg-blue-500 text-white border-round-top-lg">
        <h2 class="text-2xl font-bold m-0">Invoice Preview</h2>
      </div>

      <!-- Content -->
      <div class="flex-grow overflow-y-auto p-4">
        <div class="space-y-4">
          <!-- Header Section -->
          <div class="flex justify-content-between align-items-start">
            <div>
              <h2 class="text-2xl font-bold text-blue-800 mb-2">SAP-Style POS</h2>
              <p class="mb-1">123 Business Street, City, Country</p>
              <p class="mb-1">Phone: (123) 456-7890</p>
              <p class="mb-1">Email: info@sap-style-pos.com</p>
            </div>
            <div class="text-center">
              <div class="w-8rem h-8rem bg-gray-100 mb-2 border-round flex align-items-center justify-content-center">
                QR Code
              </div>
              <p class="text-sm">Scan for digital copy</p>
            </div>
            <div class="text-right">
              <h3 class="text-xl font-bold mb-2">Invoice</h3>
              <p class="mb-1">Invoice Number: {{ invoiceNumber }}</p>
              <p class="mb-1">Date: {{ new Date().toLocaleDateString() }}</p>
            </div>
          </div>

          <!-- Bill To Section -->
          <div class="border-top-1 border-bottom-1 surface-border py-4">
            <h3 class="font-semibold mb-2">Bill To:</h3>
            <p class="mb-1">{{ customerName }}</p>
            <p class="mb-1">Customer Address Line 1</p>
            <p class="mb-1">Customer Address Line 2</p>
            <p class="mb-1">Customer Phone: (098) 765-4321</p>
          </div>

          <!-- Items Table -->
          <div class="surface-ground border-round p-3">
            <table class="w-full">
              <thead>
                <tr class="border-bottom-1 surface-border">
                  <th class="text-left p-2">Item</th>
                  <th class="text-right p-2">Quantity</th>
                  <th class="text-right p-2">Unit Price</th>
                  <th class="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itemsToUse" :key="item.id" class="border-bottom-1 surface-border">
                  <td class="p-2">{{ item.itemName }}</td>
                  <td class="text-right p-2">{{ item.quantity }}</td>
                  <td class="text-right p-2">${{ item.price.toFixed(2) }}</td>
                  <td class="text-right p-2">${{ (item.price * item.quantity).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="flex justify-content-end">
            <div class="w-20rem">
              <div class="flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>${{ tax.toFixed(2) }}</span>
              </div>
              <div class="flex justify-content-between font-bold text-lg">
                <span>Total:</span>
                <span>${{ total.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Terms -->
          <div class="border-top-1 surface-border pt-4">
            <h3 class="font-semibold mb-2">Payment Terms:</h3>
            <p class="mb-1">Payment is due within 30 days</p>
            <p class="mb-1">Please make checks payable to: SAP-Style POS</p>
            <p class="mb-1">Bank transfer details: IBAN: XX XX XXXX XXXX XXXX XXXX XXXX</p>
          </div>

          <!-- Thank You Note -->
          <div class="text-center text-sm text-500">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-top-1 surface-border flex align-items-center justify-content-between">
        <div class="flex gap-2">
          <button 
            class="p-button p-button-outlined flex align-items-center gap-2"
            @click="handleReprint"
          >
            <i class="pi pi-print"></i>
            <span>{{ isPrinting ? 'Printing...' : 'Reprint' }}</span>
          </button>
          <button 
            class="p-button p-button-outlined flex align-items-center gap-2"
            @click="handleShareWhatsApp"
          >
            <i class="pi pi-share-alt"></i>
            <span>Share to WhatsApp</span>
          </button>
        </div>
        <div class="flex gap-2">
          <button 
            class="p-button p-button-outlined"
            @click="handleClose"
          >
            Cancel
          </button>
          <button 
            class="p-button p-button-primary"
            @click="handlePost"
          >
            Post Invoice
          </button>
        </div>
      </div>
    </div>
  </div>
</template>