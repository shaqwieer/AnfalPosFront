<script setup lang="ts">
import { ref, computed } from 'vue'
// import { useVanStore } from '../../../stores/vanStore'
import { useVanStore } from '../../../../stores/vanStore'
import { useRouter } from 'vue-router'

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
      <div class="flex align-items-center gap-4">
        <button @click="goBack" 
                class="p-button p-button-text p-button-rounded">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div>
          <h1 class="text-4xl font-bold text-900">{{ customer.name }}</h1>
          <p class="text-sm text-600">{{ customer.id }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-column gap-6">
      <!-- Quick Stats -->
      <div class="grid">
        <div class="col-12 md:col-4">
          <div class="surface-card border-round-lg p-6 border-1 surface-border">
            <div class="flex align-items-center justify-content-between">
              <div>
                <div class="text-sm text-primary">Credit Limit</div>
                <div class="text-2xl font-bold text-primary-700">
                  {{ formatPrice(customer.creditLimit) }}
                </div>
              </div>
              <i class="pi pi-wallet text-3xl text-primary"></i>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-card border-round-lg p-6 border-1 surface-border">
            <div class="flex align-items-center justify-content-between">
              <div>
                <div class="text-sm text-green-600">Available Credit</div>
                <div class="text-2xl font-bold text-green-700">
                  {{ formatPrice(customer.creditLimit - customer.balance) }}
                </div>
              </div>
              <i class="pi pi-money-bill text-3xl text-green-600"></i>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-card border-round-lg p-6 border-1 surface-border">
            <div class="flex align-items-center justify-content-between">
              <div>
                <div class="text-sm text-purple-600">Current Balance</div>
                <div class="text-2xl font-bold text-purple-700">
                  {{ formatPrice(customer.balance) }}
                </div>
              </div>
              <i class="pi pi-credit-card text-3xl text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Visit Actions -->
      <div class="surface-card border-round-lg border-1 surface-border">
        <div class="p-4 border-bottom-1 surface-border">
          <h2 class="text-xl font-medium text-900">Visit Actions</h2>
        </div>
        <div class="p-6">
          <div v-if="visitStatus === 'not_started'" class="text-center">
            <button @click="startVisit"
                    class="p-button p-button-primary">
              <i class="pi pi-play mr-2"></i>
              Start Visit
            </button>
          </div>

          <div v-else-if="visitStatus === 'in_progress'" class="flex flex-column gap-6">
            <!-- Action Buttons -->
            <div class="grid">
              <div class="col-12 md:col-4">
                <button @click="handleNewOrder"
                        class="p-6 w-full surface-card border-round-lg hover:surface-100 flex flex-column align-items-center gap-2 border-1 surface-border">
                  <i class="pi pi-shopping-cart text-4xl text-primary mb-2"></i>
                  <span class="text-lg text-900">New Order</span>
                  <span class="text-sm text-600">Create a new sales order</span>
                </button>
              </div>
              <div class="col-12 md:col-4">
                <button class="p-6 w-full surface-card border-round-lg hover:surface-100 flex flex-column align-items-center gap-2 border-1 surface-border">
                  <i class="pi pi-replay text-4xl text-orange-500 mb-2"></i>
                  <span class="text-lg text-900">Return</span>
                  <span class="text-sm text-600">Process product returns</span>
                </button>
              </div>
              <div class="col-12 md:col-4">
                <button class="p-6 w-full surface-card border-round-lg hover:surface-100 flex flex-column align-items-center gap-2 border-1 surface-border">
                  <i class="pi pi-dollar text-4xl text-green-500 mb-2"></i>
                  <span class="text-lg text-900">Payment</span>
                  <span class="text-sm text-600">Collect payment</span>
                </button>
              </div>
            </div>

            <!-- Complete Visit Button -->
            <div class="text-center">
              <button @click="completeVisit"
                      class="p-button p-button-success">
                <i class="pi pi-check-circle mr-2"></i>
                Complete Visit
              </button>
            </div>
          </div>

          <div v-else class="text-center text-green-600 py-6">
            <i class="pi pi-check-circle text-6xl mb-2"></i>
            <p class="text-xl">Visit Completed</p>
          </div>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="grid">
        <!-- Contact Information -->
        <div class="col-12 lg:col-6">
          <div class="surface-card border-round-lg border-1 surface-border h-full">
            <div class="p-4 border-bottom-1 surface-border">
              <h2 class="text-xl font-medium text-900">Contact Information</h2>
            </div>
            <div class="p-6 flex flex-column gap-4">
              <div class="flex align-items-center gap-3">
                <i class="pi pi-phone text-600"></i>
                <div>
                  <div class="font-medium text-900">Mobile</div>
                  <div class="text-600">{{ customer.mobile }}</div>
                </div>
              </div>
              <div class="flex align-items-center gap-3">
                <i class="pi pi-envelope text-600"></i>
                <div>
                  <div class="font-medium text-900">Email</div>
                  <div class="text-600">{{ customer.email }}</div>
                </div>
              </div>
              <div class="flex align-items-center gap-3">
                <i class="pi pi-globe text-600"></i>
                <div>
                  <div class="font-medium text-900">Website</div>
                  <div class="text-600">{{ customer.website || 'N/A' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Business Information -->
        <div class="col-12 lg:col-6">
          <div class="surface-card border-round-lg border-1 surface-border h-full">
            <div class="p-4 border-bottom-1 surface-border">
              <h2 class="text-xl font-medium text-900">Business Information</h2>
            </div>
            <div class="p-6 flex flex-column gap-4">
              <div class="flex align-items-center gap-3">
                <i class="pi pi-building text-600"></i>
                <div>
                  <div class="font-medium text-900">CR Number</div>
                  <div class="text-600">{{ customer.cr }}</div>
                </div>
              </div>
              <div class="flex align-items-center gap-3">
                <i class="pi pi-file text-600"></i>
                <div>
                  <div class="font-medium text-900">VAT Number</div>
                  <div class="text-600">{{ customer.vat }}</div>
                </div>
              </div>
              <div class="flex align-items-center gap-3">
                <i class="pi pi-map-marker text-600"></i>
                <div>
                  <div class="font-medium text-900">Location</div>
                  <div class="text-600">{{ customer.location.address }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="p-6 text-center">
    <p class="text-600">Customer not found</p>
  </div>
</template>