<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVanStore } from '../../../stores/vanStore'
import { useRouter } from 'vue-router'
import VANPOS from '../VANPOS.vue'

const props = defineProps<{
  customer: any
}>()

const router = useRouter()
const vanStore = useVanStore()
const showPOS = ref(false)

// Redirect if no customer data
if (!props.customer) {
  router.push('/van-customers')
}

const visitStatus = ref<'not_started' | 'in_progress' | 'completed'>('not_started')

const startVisit = () => {
  visitStatus.value = 'in_progress'
}

const completeVisit = () => {
  visitStatus.value = 'completed'
}

const goBack = () => {
  router.back()
}

const handleNewOrder = () => {
  router.push('/van-pos')
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div v-if="customer" class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-6">
      <div class="flex align-items-center space-x-4">
        <button @click="goBack" 
                class="p-2 hover:bg-gray-100 rounded-full">
          <span class="material-icons">arrow_back</span>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ customer.name }}</h1>
          <p class="text-sm text-gray-500">{{ customer.id }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-6">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white border-round-lg p-6 border">
          <div class="flex align-items-center justify-content-between">
            <div>
              <div class="text-sm text-blue-600">Credit Limit</div>
              <div class="text-2xl font-bold text-blue-700">
                {{ formatPrice(customer.creditLimit) }}
              </div>
            </div>
            <span class="material-icons text-3xl text-blue-600">account_balance</span>
          </div>
        </div>
        <div class="bg-white border-round-lg p-6 border">
          <div class="flex align-items-center justify-content-between">
            <div>
              <div class="text-sm text-green-600">Available Credit</div>
              <div class="text-2xl font-bold text-green-700">
                {{ formatPrice(customer.creditLimit - customer.balance) }}
              </div>
            </div>
            <span class="material-icons text-3xl text-green-600">savings</span>
          </div>
        </div>
        <div class="bg-white border-round-lg p-6 border">
          <div class="flex align-items-center justify-content-between">
            <div>
              <div class="text-sm text-purple-600">Current Balance</div>
              <div class="text-2xl font-bold text-purple-700">
                {{ formatPrice(customer.balance) }}
              </div>
            </div>
            <span class="material-icons text-3xl text-purple-600">payments</span>
          </div>
        </div>
      </div>

      <!-- Visit Actions -->
      <div class="bg-white border-round-lg border">
        <div class="p-4 border-b">
          <h2 class="text-lg font-medium">Visit Actions</h2>
        </div>
        <div class="p-6">
          <div v-if="visitStatus === 'not_started'" class="text-center">
            <button @click="startVisit"
                    class="px-6 py-3 bg-blue-600 text-white border-round-lg hover:bg-blue-700">
              <span class="material-icons align-middle mr-2">play_arrow</span>
              Start Visit
            </button>
          </div>

          <div v-else-if="visitStatus === 'in_progress'" class="space-y-6">
            <!-- Action Buttons -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button @click="handleNewOrder"
                      class="p-6 bg-blue-50 text-blue-600 border-round-lg hover:bg-blue-100 flex flex-column align-items-center">
                <span class="material-icons text-4xl mb-2">shopping_cart</span>
                <span class="text-lg">New Order</span>
                <span class="text-sm text-blue-500">Create a new sales order</span>
              </button>
              <button class="p-6 bg-orange-50 text-orange-600 border-round-lg hover:bg-orange-100 flex flex-column align-items-center">
                <span class="material-icons text-4xl mb-2">assignment_return</span>
                <span class="text-lg">Return</span>
                <span class="text-sm text-orange-500">Process product returns</span>
              </button>
              <button class="p-6 bg-green-50 text-green-600 border-round-lg hover:bg-green-100 flex flex-column align-items-center">
                <span class="material-icons text-4xl mb-2">payments</span>
                <span class="text-lg">Payment</span>
                <span class="text-sm text-green-500">Collect payment</span>
              </button>
            </div>

            <!-- Complete Visit Button -->
            <div class="text-center">
              <button @click="completeVisit"
                      class="px-6 py-3 bg-green-600 text-white border-round-lg hover:bg-green-700">
                <span class="material-icons align-middle mr-2">check_circle</span>
                Complete Visit
              </button>
            </div>
          </div>

          <div v-else class="text-center text-green-600 py-6">
            <span class="material-icons text-6xl mb-2">task_alt</span>
            <p class="text-xl">Visit Completed</p>
          </div>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Contact Information -->
        <div class="bg-white border-round-lg border">
          <div class="p-4 border-b">
            <h2 class="text-lg font-medium">Contact Information</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex align-items-center space-x-3">
              <span class="material-icons text-gray-400">phone</span>
              <div>
                <div class="font-medium">Mobile</div>
                <div class="text-gray-600">{{ customer.mobile }}</div>
              </div>
            </div>
            <div class="flex align-items-center space-x-3">
              <span class="material-icons text-gray-400">email</span>
              <div>
                <div class="font-medium">Email</div>
                <div class="text-gray-600">{{ customer.email }}</div>
              </div>
            </div>
            <div class="flex align-items-center space-x-3">
              <span class="material-icons text-gray-400">language</span>
              <div>
                <div class="font-medium">Website</div>
                <div class="text-gray-600">{{ customer.website || 'N/A' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Business Information -->
        <div class="bg-white border-round-lg border">
          <div class="p-4 border-b">
            <h2 class="text-lg font-medium">Business Information</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex align-items-center space-x-3">
              <span class="material-icons text-gray-400">business</span>
              <div>
                <div class="font-medium">CR Number</div>
                <div class="text-gray-600">{{ customer.cr }}</div>
              </div>
            </div>
            <div class="flex align-items-center space-x-3">
              <span class="material-icons text-gray-400">receipt</span>
              <div>
                <div class="font-medium">VAT Number</div>
                <div class="text-gray-600">{{ customer.vat }}</div>
              </div>
            </div>
            <div class="flex align-items-center space-x-3">
              <span class="material-icons text-gray-400">location_on</span>
              <div>
                <div class="font-medium">Location</div>
                <div class="text-gray-600">{{ customer.location.address }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="p-6 text-center">
    <p class="text-gray-500">Customer not found</p>
  </div>
</template>