<script setup lang="ts">
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  data: any;
  viewMode: 'chart' | 'table';
}>();

// Sample collections data
const collectionsData = ref([
  {
    salesRep: 'Mohammed Al-Saud',
    cash: 25000,
    card: 15000,
    bank: 8000,
    total: 48000
  },
  {
    salesRep: 'Abdullah Al-Qahtani',
    cash: 18000,
    card: 12000,
    bank: 5000,
    total: 35000
  },
  {
    salesRep: 'Khalid Al-Otaibi',
    cash: 22000,
    card: 14000,
    bank: 6000,
    total: 42000
  },
  {
    salesRep: 'Fahad Al-Harbi',
    cash: 20000,
    card: 13000,
    bank: 7000,
    total: 40000
  },
  {
    salesRep: 'Omar Al-Ghamdi',
    cash: 19000,
    card: 11000,
    bank: 4000,
    total: 34000
  }
]);

// Chart data
const chartData = computed(() => ({
  labels: collectionsData.value.map((item) => item.salesRep),
  datasets: [
    {
      label: t('dashboard.Cash'),
      data: collectionsData.value.map((item) => item.cash),
      backgroundColor: '#22c55e'
    },
    {
      label: t('dashboard.Card'),
      data: collectionsData.value.map((item) => item.card),
      backgroundColor: '#3b82f6'
    },
    {
      label: t('dashboard.Bank'),
      data: collectionsData.value.map((item) => item.bank),
      backgroundColor: '#8b5cf6'
    }
  ]
}));

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

// Summary calculations
const summary = computed(() => ({
  totalCash: collectionsData.value.reduce((sum, item) => sum + item.cash, 0),
  totalCard: collectionsData.value.reduce((sum, item) => sum + item.card, 0),
  totalBank: collectionsData.value.reduce((sum, item) => sum + item.bank, 0),
  grandTotal: collectionsData.value.reduce((sum, item) => sum + item.total, 0)
}));
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
                  {{ formatPrice(summary.totalCash) }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.TotalCard') }}</div>
                <div class="text-2xl font-bold text-blue-600">
                  {{ formatPrice(summary.totalCard) }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.TotalBank') }}</div>
                <div class="text-2xl font-bold text-purple-600">
                  {{ formatPrice(summary.totalBank) }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.GrandTotal') }}</div>
                <div class="text-2xl font-bold text-gray-900">
                  {{ formatPrice(summary.grandTotal) }}
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
      <DataTable :value="collectionsData" :paginator="collectionsData.length > 10" :rows="10" :rowsPerPageOptions="[5, 10, 25]" class="">
        <template #empty>
          <div class="flex justify-content-center align-items-center font-bold text-lg">{{ t('dashboard.empty') }}</div>
        </template>

        <!-- Sales Rep Column -->
        <Column field="salesRep" :header="t('dashboard.SalesRep')">
          <template #body="slotProps">
            <div class="flex flex-column align-items-start">
              <div class="font-semibold text-md">{{ slotProps.data.salesRep }}</div>
            </div>
          </template>

          <template #footer="slotProps">
            <div class="flex flex-column align-items-start">
              <div class="font-semibold text-md">{{ t('dashboard.Total') }}</div>
            </div>
          </template>
        </Column>

        <!-- Cash Column -->
        <Column field="cash">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Cash') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md text-green-600 text-right">
              {{ formatPrice(slotProps.data.cash) }}
            </div>
          </template>

          <template #footer="slotProps">
            <div class="flex flex-column align-items-center">
              <div class="font-semibold text-md text-green-600">
                {{ formatPrice(summary.totalCash) }}
              </div>
            </div>
          </template>
        </Column>

        <!-- Card Column -->
        <Column field="card">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Card') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md text-blue-600 text-right">
              {{ formatPrice(slotProps.data.card) }}
            </div>
          </template>

          <template #footer="slotProps">
            <div class="flex flex-column align-items-center">
              <div class="font-semibold text-md text-blue-600">
                {{ formatPrice(summary.totalCard) }}
              </div>
            </div>
          </template>
        </Column>

        <!-- Bank Column -->
        <Column field="bank">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Bank') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md text-right text-purple-600">
              {{ formatPrice(slotProps.data.bank) }}
            </div>
          </template>

          <template #footer="slotProps">
            <div class="flex flex-column align-items-center text-purple-600">
              <div class="font-semibold text-md">{{ formatPrice(summary.totalBank) }}</div>
            </div>
          </template>
        </Column>

        <!-- Total Column -->
        <Column field="total">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Total') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center font-semibold text-md text-right">
              {{ formatPrice(slotProps.data.total) }}
            </div>
          </template>

          <template #footer="slotProps">
            <div class="flex flex-column align-items-center">
              <div class="font-semibold text-md">{{ formatPrice(summary.grandTotal) }}</div>
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
