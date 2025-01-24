<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Order } from '../types'

interface Props {
  orders?: Order[]
  view: 'list' | 'grid'
}

const props = withDefaults(defineProps<Props>(), {
  orders: () => [],
})

const emit = defineEmits<{
  (e: 'viewOrder', order: Order): void
  (e: 'viewChange', view: 'list' | 'grid'): void
}>()

const handleViewOrder = (order: Order) => {
  emit('viewOrder', order)
}

const handleViewChange = (newView: 'list' | 'grid') => {
  emit('viewChange', newView)
}
</script>

<template>
  <div>
    <!-- View Toggle -->
    <div class="mb-4 flex justify-content-end">
      <div class="flex border-1 border-round overflow-hidden">
        <button
          class="p-2 transition-colors transition-duration-150 flex align-items-center justify-content-center"
          :class="{
            'bg-primary text-white': view === 'list',
            'surface-ground': view !== 'list',
            'hover:surface-100': view !== 'list'
          }"
          @click="handleViewChange('list')"
        >
          <i class="pi pi-list text-sm"></i>
        </button>
        <button
          class="p-2 transition-colors transition-duration-150 flex align-items-center justify-content-center"
          :class="{
            'bg-primary text-white': view === 'grid',
            'surface-ground': view !== 'grid',
            'hover:surface-100': view !== 'grid'
          }"
          @click="handleViewChange('grid')"
        >
          <i class="pi pi-th-large text-sm"></i>
        </button>
      </div>
    </div>

    <div class="overflow-auto">
      <!-- List View -->
      <div v-if="view === 'list'" class="surface-card border-round p-3">
        <table class="w-full">
          <thead>
            <tr class="border-bottom-1 surface-border">
              <th class="text-left p-3">Order ID</th>
              <th class="text-left p-3">Customer</th>
              <th class="text-left p-3">Date</th>
              <th class="text-right p-3">Total</th>
              <th class="text-center p-3">Status</th>
              <th class="text-center p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id" class="border-bottom-1 surface-border">
              <td class="p-3">{{ order.id }}</td>
              <td class="p-3">{{ order.customerName }}</td>
              <td class="p-3">{{ order.date }}</td>
              <td class="p-3 text-right">${{ order.total.toFixed(2) }}</td>
              <td class="p-3">
                <div class="flex justify-content-center">
                  <span
                    class="text-xs px-2 py-1 border-round"
                    :class="{
                      'bg-green-100 text-green-900': order.status === 'Completed',
                      'bg-yellow-100 text-yellow-900': order.status !== 'Completed'
                    }"
                  >
                    {{ order.status }}
                  </span>
                </div>
              </td>
              <td class="p-3">
                <div class="flex justify-content-center">
                  <button
                    class="p-button p-button-sm flex align-items-center gap-2"
                    @click="handleViewOrder(order)"
                  >
                    <i class="pi pi-eye"></i>
                    <span>View</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Grid View -->
      <div
        v-else
        class="grid grid-nogutter md:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <div
          v-for="order in orders"
          :key="order.id"
          class="surface-card border-round shadow-1 hover:shadow-3 cursor-pointer transition-all transition-duration-150"
        >
          <div class="p-4">
            <!-- Icon -->
            <div class="flex align-items-center justify-content-center w-4rem h-4rem bg-green-100 border-circle mb-3 mx-auto">
              <i class="pi pi-file-edit text-green-600 text-2xl"></i>
            </div>

            <!-- Order Details -->
            <h3 class="font-medium text-lg text-center mb-2">Order {{ order.id }}</h3>
            <p class="text-sm text-600 text-center mb-1">{{ order.customerName }}</p>
            <p class="text-sm text-600 text-center mb-1">{{ order.date }}</p>
            <p class="text-sm font-medium text-center mb-2">${{ order.total.toFixed(2) }}</p>

            <!-- Status Badge -->
            <div class="flex justify-content-center mb-3">
              <span
                class="text-xs px-2 py-1 border-round"
                :class="{
                  'bg-green-100 text-green-900': order.status === 'Completed',
                  'bg-yellow-100 text-yellow-900': order.status !== 'Completed'
                }"
              >
                {{ order.status }}
              </span>
            </div>

            <!-- View Button -->
            <button
              class="p-button w-full flex align-items-center justify-content-center gap-2"
              @click="handleViewOrder(order)"
            >
              <i class="pi pi-eye"></i>
              <span>View Order Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>