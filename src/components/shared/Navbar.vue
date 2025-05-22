<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/modules/service-center'
import { useCompanyStore } from '@/stores/companyStore'
import { ReportsMenu } from '@/components/modules/service-center/components'
import CompanySelector from '@/components/CompanySelector.vue'
import {
  BillsDialog,
  OrdersDialog,
  ExpensesDialog,
  InventoryDialog
} from '@/components/modules/service-center/components/dialogs'

const router = useRouter()
const isMenuOpen = ref(false)
const showInventoryDialog = ref(false)
const showOrdersDialog = ref(false)
const showBillsDialog = ref(false)
const showExpensesDialog = ref(false)

const orderStore = useOrderStore()
const companyStore = useCompanyStore()

const invoicedOrdersCount = computed(() => {
  return orderStore.orders.filter(order => order.status === 'pending').length
})

const routes = [
  { path: '/', name: 'Service Center', icon: 'build' },
  { path: '/promo-manager', name: 'Promotions', icon: 'local_offer' }
]

const isCurrentRoute = (path: string) => {
  return router.currentRoute.value.path === path
}

const navigateTo = (path: string) => {
  router.push(path)
  isMenuOpen.value = false
}
</script>

<template>
  <nav class="bg-white shadow-lg mb-4">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8">
          <!-- Company Logo and Name -->
          <CompanySelector />

          <!-- Main Navigation -->
          <div class="hidden md:flex items-center space-x-4">
            <button v-for="route in routes" 
                    :key="route.path"
                    @click="navigateTo(route.path)"
                    class="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
                    :class="isCurrentRoute(route.path) ? 
                      'bg-blue-50 text-blue-600' : 
                      'text-gray-700 hover:text-blue-600'">
              <span class="material-icons">{{ route.icon }}</span>
              <span>{{ route.name }}</span>
            </button>
          </div>
        </div>
        
        <!-- Mobile menu button -->
        <button @click="isMenuOpen = !isMenuOpen" 
                class="md:hidden rounded-md p-2 inline-flex items-center justify-center text-gray-700 hover:text-blue-600 focus:outline-none">
          <span class="material-icons">{{ isMenuOpen ? 'close' : 'menu' }}</span>
        </button>

        <!-- Desktop Actions Menu -->
        <div class="hidden md:flex items-center space-x-8">
          <div class="flex items-center space-x-4">
            <button @click="showOrdersDialog = true" 
                    class="flex items-center space-x-1 text-gray-700 hover:text-blue-600 relative">
              <div class="flex items-center space-x-1">
                <span class="material-icons">receipt_long</span>
                <span>Order List</span>
              </div>
              <div v-if="invoicedOrdersCount > 0"
                   class="absolute -top-2 -right-4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ invoicedOrdersCount }}
              </div>
            </button>
            <button @click="showBillsDialog = true"
                    class="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <span class="material-icons">receipt</span>
              <span>Bills</span>
            </button>
            <button @click="showExpensesDialog = true"
                    class="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <span class="material-icons">payments</span>
              <span>Expenses</span>
            </button>
            <button @click="showInventoryDialog = true"
                    class="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <span class="material-icons">inventory</span>
              <span>Inventory</span>
            </button>
            <ReportsMenu v-if="orderStore.orders.length > 0" />
          </div>
          <div class="flex items-center space-x-4">
            <button class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span class="material-icons">notifications</span>
            </button>
            <div class="w-8 h-8 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-show="isMenuOpen" class="md:hidden py-4 space-y-4">
        <!-- Mobile Navigation -->
        <div class="space-y-2">
          <button v-for="route in routes"
                  :key="route.path"
                  @click="navigateTo(route.path)"
                  class="flex items-center space-x-2 w-full px-4 py-2 rounded-lg transition-colors"
                  :class="isCurrentRoute(route.path) ? 
                    'bg-blue-50 text-blue-600' : 
                    'text-gray-700 hover:text-blue-600'">
            <span class="material-icons">{{ route.icon }}</span>
            <span>{{ route.name }}</span>
          </button>
        </div>

        <div class="border-t pt-4 space-y-2">
          <button @click="showOrdersDialog = true"
                  class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-2 w-full relative">
            <div class="flex items-center space-x-2">
              <span class="material-icons">receipt_long</span>
              <span>Order List</span>
            </div>
            <div v-if="invoicedOrdersCount > 0"
                 class="absolute top-1/2 -translate-y-1/2 left-24 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {{ invoicedOrdersCount }}
            </div>
          </button>
          <button @click="showBillsDialog = true"
                  class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-2 w-full">
            <span class="material-icons">receipt</span>
            <span>Bills</span>
          </button>
          <button @click="showExpensesDialog = true"
                  class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-2 w-full">
            <span class="material-icons">payments</span>
            <span>Expenses</span>
          </button>
          <button @click="showInventoryDialog = true"
                  class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-2 w-full">
            <span class="material-icons">inventory</span>
            <span>Inventory</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <InventoryDialog
      :show="showInventoryDialog"
      @close="showInventoryDialog = false"
    />

    <OrdersDialog
      :show="showOrdersDialog"
      @close="showOrdersDialog = false"
    />

    <BillsDialog
      :show="showBillsDialog"
      @close="showBillsDialog = false"
    />

    <ExpensesDialog
      :show="showExpensesDialog"
      @close="showExpensesDialog = false"
    />
  </nav>
</template>