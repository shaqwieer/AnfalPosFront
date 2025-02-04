<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  data: any
  viewMode: 'chart' | 'table'
}>()

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
])

// Chart data
const chartData = computed(() => ({
  labels: collectionsData.value.map(item => item.salesRep),
  datasets: [
    {
      label: 'Cash',
      data: collectionsData.value.map(item => item.cash),
      backgroundColor: '#22c55e'
    },
    {
      label: 'Card',
      data: collectionsData.value.map(item => item.card),
      backgroundColor: '#3b82f6'
    },
    {
      label: 'Bank',
      data: collectionsData.value.map(item => item.bank),
      backgroundColor: '#8b5cf6'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: true,
      text: 'Collections by Payment Method'
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
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Summary calculations
const summary = computed(() => ({
  totalCash: collectionsData.value.reduce((sum, item) => sum + item.cash, 0),
  totalCard: collectionsData.value.reduce((sum, item) => sum + item.card, 0),
  totalBank: collectionsData.value.reduce((sum, item) => sum + item.bank, 0),
  grandTotal: collectionsData.value.reduce((sum, item) => sum + item.total, 0)
}))
</script>

<template>
  <div>
    <!-- Summary Card -->
    <div class="p-grid p-dir-col p-md-dir-row p-align-start p-justify-between mb-6">
      <div class="p-col-12">
        <div class="bg-white rounded-lg shadow-sm border p-4">
          <div class="grid grid-cols-4 gap-4">
            <div>
              <div class="text-sm text-gray-500">Total Cash</div>
              <div class="text-2xl font-bold text-green-600">
                {{ formatPrice(summary.totalCash) }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Total Card</div>
              <div class="text-2xl font-bold text-blue-600">
                {{ formatPrice(summary.totalCard) }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Total Bank</div>
              <div class="text-2xl font-bold text-purple-600">
                {{ formatPrice(summary.totalBank) }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Grand Total</div>
              <div class="text-2xl font-bold text-gray-900">
                {{ formatPrice(summary.grandTotal) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  

    <!-- Chart View -->
    <div v-if="viewMode === 'chart'" class="bg-white rounded-lg shadow-sm border p-6">
      <div class="h-[400px]">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Rep</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cash</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Card</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bank</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in collectionsData" :key="item.salesRep">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.salesRep }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                {{ formatPrice(item.cash) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                {{ formatPrice(item.card) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600">
                {{ formatPrice(item.bank) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                {{ formatPrice(item.total) }}
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                {{ formatPrice(summary.totalCash) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                {{ formatPrice(summary.totalCard) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-purple-600">
                {{ formatPrice(summary.totalBank) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                {{ formatPrice(summary.grandTotal) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
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