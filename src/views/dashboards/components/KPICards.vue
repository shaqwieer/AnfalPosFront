<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  yesterdayData: any;
  todayData: any;
  selectedCard: string | null;
}>();

const emit = defineEmits(['select-card']);

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const handleCardClick = (cardType: string) => {
  emit('select-card', props.selectedCard === cardType ? null : cardType);
};
</script>

<template>
  <div class="grid">
    <div style="height: 255px;" class="col-12  md:col-6 lg:col-4 xl:col-2">
      <!-- Visits Card -->
      <div class="h-full surface-card border-round-xl border-1 border-gray-200  border-gray-200 p-4 cursor-pointer transition-all transition-duration-200 hover:shadow-2" :class="{ 'border-primary border-2': selectedCard === 'visits' }" @click="handleCardClick('visits')">
        <div class="flex align-items-center gap-3 mb-4">
          <div class="w-3rem h-3rem border-round-lg bg-blue-50 flex align-items-center justify-content-center">
            <i class="pi pi-shopping-bag text-blue-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-base text-900 m-0 text-900 m-0">Visits</h3>
            <p class="text-sm text-500 m-0">Today's Performance</p>
          </div>
        </div>
        <div class="flex flex-column gap-2">
          <div class="flex align-items-center justify-content-between">
            <span class="text-sm text-500">Planned</span>
            <span class="font-medium">{{ todayData.plannedVisits }}</span>
          </div>
          <div class="flex align-items-center justify-content-between">
            <span class="text-sm text-500">Completed</span>
            <span class="font-medium text-green-600">{{ todayData.completedVisits }}</span>
          </div>
          <div class="flex align-items-center justify-content-between">
            <span class="text-sm text-500">Productive</span>
            <span class="font-medium text-blue-600">{{ todayData.productiveVisits }}</span>
          </div>
        </div>
        <div class="mt-2 pt-2 border-top-1">
          <div class="text-sm text-500">Productivity Rate: {{ Math.round((todayData.productiveVisits / todayData.completedVisits) * 100) }}%</div>
        </div>
      </div>
    </div>

    <div style="height: 255px;" class="col-12 md:col-6 lg:col-4 xl:col-2">
      <!-- Sales Card -->
      <div class="h-full surface-card border-round-xl border-1 border-gray-200  p-4 cursor-pointer transition-all transition-duration-200 hover:shadow-2" :class="{ 'border-primary border-2': selectedCard === 'sales' }" @click="handleCardClick('sales')">
        <div class="flex align-items-center gap-3 mb-4">
          <div class="w-3rem h-3rem border-round-lg bg-green-50 flex align-items-center justify-content-center">
            <i class="pi pi-money-bill text-green-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-base  m-0">Sales</h3>
            <p class="text-sm text-500 m-0">Daily Revenue</p>
          </div>
        </div>
        <div class="flex flex-column gap-3">
          <div class="flex align-items-center justify-content-between">
            <span class="text-sm text-500">Target</span>
            <span class="font-medium text-900">{{ formatPrice(todayData.sales * 1.2) }}</span>
          </div>
          <div class="flex align-items-center justify-content-between">
            <span class="text-sm text-500">Actual</span>
            <span class="font-medium text-green-600">{{ formatPrice(todayData.sales) }}</span>
          </div>
          <div class="surface-200 border-round w-full" style="height: 8px">
            <div class="bg-green-500 h-2 border-round" style="height: 8px" :style="{ width: `${Math.min((todayData.sales / (todayData.sales * 1.2)) * 100, 100)}%` }"></div>
          </div>
          <div class="text-sm text-500 text-right">{{ Math.round((todayData.sales / (todayData.sales * 1.2)) * 100) }}% of target</div>
        </div>
      </div>
    </div>

    <div style="height: 255px;" class="col-12 md:col-6 lg:col-4 xl:col-2">
      <!-- Collections Card -->
      <div class="h-full surface-card border-round-xl border-1 border-gray-200  p-4 cursor-pointer transition-all transition-duration-200 hover:shadow-2" :class="{ 'border-primary border-2': selectedCard === 'collections' }" @click="handleCardClick('collections')">
        <div class="flex align-items-center gap-3 mb-4">
          <div class="w-3rem h-3rem border-round-lg bg-purple-50 flex align-items-center justify-content-center">
            <i class="pi pi-wallet text-purple-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-base  text-900 m-0">Collections</h3>
            <p class="text-sm text-500 m-0">Payment Methods</p>
          </div>
        </div>
        <div class="flex flex-column gap-2">
          <div class="flex align-items-center justify-content-between">
            <span class="text-sm text-500">Cash</span>
            <span class="font-medium">{{ formatPrice(todayData.collections.cash) }}</span>
          </div>
          <div class="flex align-items-center justify-content-between">
            <span class="text-sm text-500">VISA</span>
            <span class="font-medium">{{ formatPrice(todayData.collections.visa) }}</span>
          </div>
          <div class="flex align-items-center justify-content-between">
            <span class="text-sm text-500">Bank</span>
            <span class="font-medium">{{ formatPrice(todayData.collections.bank) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div style="height: 255px;" class="col-12 md:col-6 lg:col-4 xl:col-2">
      <!-- Open Sessions Card -->
      <div class="h-full surface-card border-round-xl border-1 border-gray-200  p-4 cursor-pointer transition-all transition-duration-200 hover:shadow-2" :class="{ 'border-primary border-2': selectedCard === 'sessions' }" @click="handleCardClick('sessions')">
        <div class="flex align-items-center gap-3 mb-4">
          <div class="w-3rem h-3rem border-round-lg bg-orange-50 flex align-items-center justify-content-center">
            <i class="pi pi-building text-orange-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-base text-900 m-0">Open Sessions</h3>
            <p class="text-sm text-500 m-0">Undeposited Cash</p>
          </div>
        </div>
        <div class="text-2xl font-bold text-900">5 Rep</div>
        <div class="text-sm text-500">{{ formatPrice(todayData.openSessions) }}</div>
      </div>
    </div>

    <div style="height: 255px;" class="col-12 md:col-6 lg:col-4 xl:col-2">
      <!-- Overdue Card -->
      <div class="h-full surface-card border-round-xl border-1 border-gray-200  p-4 cursor-pointer transition-all transition-duration-200 hover:shadow-2" :class="{ 'border-primary border-2': selectedCard === 'overdue' }" @click="handleCardClick('overdue')">
        <div class="flex align-items-center gap-3 mb-4">
          <div class="w-3rem h-3rem border-round-lg bg-red-50 flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-base text-900 m-0">Overdue</h3>
            <p class="text-sm text-500 m-0">Aging Buckets</p>
          </div>
        </div>
        <div class="text-2xl font-bold text-900">5 Rep</div>
        <div class="text-sm text-500">50 Cst. SAR 5,000.00</div>
      </div>
    </div>

    <div style="height: 255px;" class="col-12 md:col-6 lg:col-4 xl:col-2">
      <!-- Stock in Vans Card -->
      <div class="h-full surface-card border-round-xl border-1 border-gray-200  p-4 cursor-pointer transition-all transition-duration-200 hover:shadow-2" :class="{ 'border-primary border-2': selectedCard === 'stock' }" @click="handleCardClick('stock')">
        <div class="flex align-items-center gap-3 mb-4">
          <div class="w-3rem h-3rem border-round-lg bg-blue-50 flex align-items-center justify-content-center">
            <i class="pi pi-truck text-blue-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-base text-900 m-0">Stock in Vans</h3>
            <p class="text-sm text-500 m-0">Inventory Status</p>
          </div>
        </div>
        <div class="text-2xl font-bold text-900">5 VANs</div>
        <div class="text-sm text-500">1500 Items</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover\:shadow-2:hover {
  transform: translateY(-2px);
}

.border-2 {
  transition: all 0.2s ease-in-out;
}
</style>
