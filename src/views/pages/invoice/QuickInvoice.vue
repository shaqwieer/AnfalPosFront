<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem, OrderItem, Order, Customer } from './types'

const selectedItems = ref<OrderItem[]>([])
const customerType = ref<'express' | 'commercial'>('express')
const customerName = ref('')
const searchQuery = ref('')
const discountAmount = ref('')
const discountType = ref<'fixed' | 'percentage'>('fixed')
const discountError = ref('')
const selectedCommercialCustomer = ref('')
const companyAddress = ref('')

const commercialCustomers = ref<Customer[]>([
  { id: '1', name: 'Acme Corp', address: '123 Business St' },
  { id: '2', name: 'TechStart Inc', address: '456 Innovation Ave' },
  { id: '3', name: 'Global Traders', address: '789 Market Blvd' },
])

const menuItems = ref<MenuItem[]>([
  {
    id: "1",
    name: "Garlic Bread",
    description: "Freshly baked bread with garlic butter and herbs",
    price: 25.00,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-15%20at%209.10.24%20PM-Y1GVfaII2ikT6z3XAanB72VCYKJAVF.jpeg",
    available: 20,
    sold: 10,
    category: 'appetizer'
  },
  // Add other menu items here...
])

const orders = ref<Order[]>([
  { id: "#12532", customerName: "Vinicius Bayu", status: "cancelled", time: "3 mins", table: "Table 3" },
  { id: "#12533", customerName: "Cheryl Arema", status: "ready", time: "3 mins", table: "Table 3" },
  { id: "#12531", customerName: "Kylian Rex", status: "waiting", time: "12 mins", table: "Table 4" },
  { id: "#12529", customerName: "Rijal Arudam", status: "completed", time: "3 mins", table: "Table 24" },
])

const statusColors = {
  cancelled: "error",
  ready: "success",
  waiting: "warning",
  completed: "info"
}

const addItem = (item: MenuItem) => {
  const index = selectedItems.value.findIndex(i => i.menuItem.id === item.id)
  if (index > -1) {
    selectedItems.value[index].quantity++
  } else {
    selectedItems.value.push({ menuItem: item, quantity: 1 })
  }
  
  const menuIndex = menuItems.value.findIndex(i => i.id === item.id)
  if (menuIndex > -1) {
    menuItems.value[menuIndex].available--
  }
}

const removeItem = (item: MenuItem) => {
  const index = selectedItems.value.findIndex(i => i.menuItem.id === item.id)
  if (index > -1) {
    if (selectedItems.value[index].quantity > 1) {
      selectedItems.value[index].quantity--
    } else {
      selectedItems.value.splice(index, 1)
    }
    
    const menuIndex = menuItems.value.findIndex(i => i.id === item.id)
    if (menuIndex > -1) {
      menuItems.value[menuIndex].available++
    }
  }
}

const subtotal = computed(() => 
  selectedItems.value.reduce((sum, item) => 
    sum + (item.menuItem.price * item.quantity), 0
  )
)

const calculateDiscount = (amount: string, type: 'fixed' | 'percentage', subtotalValue: number) => {
  if (!amount) return 0
  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount)) return 0
  if (type === 'fixed') {
    return Math.min(parsedAmount, subtotalValue)
  } else {
    return Math.min(subtotalValue * (parsedAmount / 100), subtotalValue)
  }
}

const total = computed(() => {
  const discount = calculateDiscount(discountAmount.value, discountType.value, subtotal.value)
  return subtotal.value - discount
})

const filteredMenuItems = computed(() =>
  menuItems.value.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const clearInvoiceItems = () => {
  selectedItems.value = []
  menuItems.value = menuItems.value.map(item => ({
    ...item,
    available: item.available + (selectedItems.value.find(i => i.menuItem.id === item.id)?.quantity || 0)
  }))
}

const processTransaction = () => {
  const invoiceDetails = {
    customerType: customerType.value,
    customerName: customerType.value === 'express' ? customerName.value : 
      commercialCustomers.value.find(c => c.id === selectedCommercialCustomer.value)?.name,
    items: selectedItems.value,
    subtotal: subtotal.value,
    discount: calculateDiscount(discountAmount.value, discountType.value, subtotal.value),
    total: total.value
  }
  
  console.log('Processing transaction:', invoiceDetails)
}
</script>

<template>
  <div class="flex flex-column lg:flex-row gap-4 p-4 bg-gray-100 min-h-screen">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <h1 class="text-3xl font-bold text-900">Invoice Manager</h1>
        <Button label="See All Orders" icon="pi pi-chevron-right" iconPos="right" outlined />
      </div>

      <!-- Orders Grid -->
      <div class="grid">
        <div v-for="order in orders" :key="order.id" class="col-12 md:col-6 lg:col-3">
          <Card>
            <template #content>
              <div class="flex justify-content-between">
                <div>
                  <p class="font-semibold text-900">{{ order.customerName }}</p>
                  <p class="text-sm text-600">{{ order.time }} • {{ order.table }}</p>
                </div>
                <span class="text-sm font-medium text-500">{{ order.id }}</span>
              </div>
              <Badge :value="order.status" :severity="statusColors[order.status]" class="mt-2" />
            </template>
          </Card>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="my-4">
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search" />
          <InputText v-model="searchQuery" placeholder="Search menu items..." class="w-full" />
        </span>
      </div>

      <!-- Menu Tabs -->
      <TabView>
        <TabPanel v-for="category in ['appetizer', 'main', 'dessert', 'beverage']" 
                 :key="category"
                 :header="category.charAt(0).toUpperCase() + category.slice(1)">
          <div class="grid">
            <div v-for="item in filteredMenuItems.filter(i => i.category === category)"
                 :key="item.id"
                 class="col-12 lg:col-6">
              <Card>
                <template #content>
                  <div class="flex gap-4">
                    <img :src="item.image" :alt="item.name" class="w-8rem h-8rem border-round" />
                    <div class="flex-1">
                      <h3 class="font-semibold text-lg mb-2">{{ item.name }}</h3>
                      <p class="text-sm text-600 mb-2">{{ item.description }}</p>
                      <div class="flex gap-2 text-sm text-500">
                        <span>{{ item.available }} Available</span>
                        <span>•</span>
                        <span>{{ item.sold }} Sold</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-content-between align-items-center border-top-1 surface-border pt-3 mt-3">
                    <span class="text-lg font-semibold text-primary">${{ item.price.toFixed(2) }}</span>
                    <div class="flex align-items-center gap-2">
                      <Button icon="pi pi-minus" 
                             @click="removeItem(item)"
                             :disabled="!selectedItems.find(i => i.menuItem.id === item.id)?.quantity"
                             severity="danger"
                             outlined />
                      <span class="w-4rem text-center font-medium">
                        {{ selectedItems.find(i => i.menuItem.id === item.id)?.quantity || 0 }}
                      </span>
                      <Button icon="pi pi-plus"
                             @click="addItem(item)"
                             :disabled="item.available === 0"
                             severity="success"
                             outlined />
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <!-- Order Summary Card -->
    <Card class="w-full lg:w-30rem">
      <template #content>
        <!-- Customer Info -->
        <div class="mb-4">
          <h2 class="text-xl font-bold mb-3">Customer Info</h2>
          <div class="flex gap-3 mb-3">
            <div class="flex align-items-center">
              <RadioButton v-model="customerType" value="express" inputId="express" />
              <label for="express" class="ml-2">Express</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton v-model="customerType" value="commercial" inputId="commercial" />
              <label for="commercial" class="ml-2">Commercial</label>
            </div>
          </div>

          <div v-if="customerType === 'express'">
            <InputText v-model="customerName" placeholder="Customer Name" class="w-full" />
          </div>
          <div v-else>
            <Dropdown v-model="selectedCommercialCustomer"
                     :options="commercialCustomers"
                     optionLabel="name"
                     optionValue="id"
                     placeholder="Select Customer"
                     class="w-full mb-2" />
            
            <div v-if="selectedCommercialCustomer === 'new'" class="flex flex-column gap-2">
              <InputText v-model="customerName" placeholder="Company Name" />
              <InputText v-model="companyAddress" placeholder="Company Address" />
              <Button label="Add New Customer" icon="pi pi-plus" />
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="mb-4">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="text-xl font-bold">Order Details</h3>
            <Button icon="pi pi-trash" 
                    label="Clear All"
                    @click="clearInvoiceItems"
                    :disabled="selectedItems.length === 0"
                    severity="danger"
                    text />
          </div>

          <div class="overflow-y-auto max-h-30rem">
            <div v-for="item in selectedItems" :key="item.menuItem.id" class="mb-2 p-3 surface-ground border-round">
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-2">
                  <img :src="item.menuItem.image" :alt="item.menuItem.name" class="w-3rem h-3rem border-round" />
                  <div>
                    <p class="font-medium">{{ item.menuItem.name }}</p>
                    <p class="text-sm text-600">${{ item.menuItem.price.toFixed(2) }} each</p>
                  </div>
                </div>
                <div class="flex align-items-center gap-2">
                  <Button icon="pi pi-minus" 
                         @click="removeItem(item.menuItem)"
                         severity="danger"
                         text />
                  <span class="font-medium">{{ item.quantity }}</span>
                  <Button icon="pi pi-plus"
                         @click="addItem(item.menuItem)"
                         severity="success"
                         text />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="surface-ground p-3 border-round">
          <h3 class="text-lg font-bold mb-3">Order Summary</h3>
          <div class="flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span class="font-medium">${{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-content-between mb-2">
            <span>Discount</span>
            <div class="flex gap-2">
              <InputText v-model="discountAmount" placeholder="Amount" class="w-6rem" />
              <Dropdown v-model="discountType"
                       :options="[{label: '$', value: 'fixed'}, {label: '%', value: 'percentage'}]"
                       optionLabel="label"
                       optionValue="value"
                       class="w-4rem" />
            </div>
          </div>
          <div class="border-top-1 surface-border pt-2 mt-2">
            <div class="flex justify-content-between">
              <span class="font-bold">Total</span>
              <span class="text-xl font-bold text-primary">${{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Process Transaction Button -->
        <Button label="Process Transaction"
                icon="pi pi-shopping-cart"
                @click="processTransaction"
                :disabled="selectedItems.length === 0 || 
                         (customerType === 'express' && !customerName) ||
                         (customerType === 'commercial' && !selectedCommercialCustomer)"
                class="w-full mt-3" />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.p-tabview-nav {
  border: none;
}

.p-tabview-nav-link {
  border: none !important;
}

.p-tabview-selected .p-tabview-nav-link {
  border-bottom: 2px solid var(--primary-color) !important;
}
</style>