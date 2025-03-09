<script setup lang="ts">
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  data: any;
  cards: any;
  viewMode: 'chart' | 'table';
}>();

// Sample collections data

// Chart data
const chartData = computed(() => ({
  labels: props.data.map((item) => item.name),
  datasets: [
    {
      label: t('dashboard.Cash'),
      data: props.data.map((item) => item.cash),
      backgroundColor: '#22c55e'
    },
    {
      label: t('dashboard.Card'),
      data: props.data.map((item) => item.visa),
      backgroundColor: '#3b82f6'
    },
    {
      label: t('dashboard.Bank'),
      data: props.data.map((item) => item.bank),
      backgroundColor: '#8b5cf6'
    }
  ]
}));
const transactionData = computed(() => {
  return props.data;
});
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: true,
      text: t('dashboard.CollectionsbyPaymentMethod')
    }
  },
  scales: {
    x: {
      stacked: true
    },
    y: {
      stacked: true,
      beginAtZero: true
    }
  }
};

const Rtl = localStorage.getItem('Rtl') === 'true';
const formatPrice = (price: number): string => {
  return price.toLocaleString(Rtl ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
</script>

<template>
  <div>
    <!-- Summary Card -->
    <div class="p-grid p-dir-col p-md-dir-row p-align-start p-justify-between">
      <div class="p-col-12">
        <div class="bg-white rounded-lg shadow-sm border p-0">
          <div class="grid mb-6">
            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.TotalCash') }}</div>
                <div class="text-2xl font-bold text-green-600">
                  {{ formatPrice(cards.cash) }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.TotalCard') }}</div>
                <div class="text-2xl font-bold text-blue-600">
                  {{ formatPrice(cards.visa) }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.TotalBank') }}</div>
                <div class="text-2xl font-bold text-purple-600">
                  {{ formatPrice(cards.bank) }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.GrandTotal') }}</div>
                <div class="text-2xl font-bold text-gray-900">
                  {{ formatPrice(cards.cash + cards.visa + cards.bank) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart View -->
    <div v-if="viewMode === 'chart'" class="bg-white border-gray-200 border-round-lg shadow-sm border-1 p-4">
      <div style="height: 400px">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="bg-white border-1 border-gray-200 border-round-lg shadow-sm border overflow-hidden">
      <DataTable :value="transactionData" :paginator="transactionData.lenth > 10" :rows="10" :rowsPerPageOptions="[5, 10, 25]" :currentPageReportTemplate="''" class="border-round-xl">
        <template #empty>
          <div class="flex justify-content-center align-items-center font-bold text-lg">{{ t('dashboard.empty') }}</div>
        </template>

        <Column field="name" :header="t('dashboard.SalesRep')" class="font-normal">
          <template #body="slotProps">
            <div class="flex flex-row align-items-center">
              <span class="font-semibold text-md">{{ slotProps.data.name }}</span>
            </div>
          </template>
        </Column>

        <Column field="cash" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.Cash') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center">
              <span class="font-semibold text-md">{{ slotProps.data.cash }}</span>
            </div>
          </template>
        </Column>

        <Column field="visa" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.Card') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center text-green-600">
              <span class="font-semibold text-md">{{ slotProps.data.visa }}</span>
            </div>
          </template>
        </Column>

        <Column field="bank" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.Bank') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center text-blue-600">
              <span class="font-semibold text-md">{{ slotProps.data.bank }}</span>
            </div>
          </template>
        </Column>

        <Column field="total" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Total') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center text-center text-600 font-medium">
              <span class="font-semibold text-md">{{ slotProps.data.total }}</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styles */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
