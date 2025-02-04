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

// Sample sessions data
const sessionsData = ref([
  {
    salesRep: 'Mohammed Al-Saud',
    sessionDate: '2024-03-20',
    cashAmount: 25000,
    status: 'open'
  },
  {
    salesRep: 'Abdullah Al-Qahtani',
    sessionDate: '2024-03-19',
    cashAmount: 18000,
    status: 'pending'
  },
  {
    salesRep: 'Khalid Al-Otaibi',
    sessionDate: '2024-03-18',
    cashAmount: 22000,
    status: 'open'
  },
  {
    salesRep: 'Fahad Al-Harbi',
    sessionDate: '2024-03-20',
    cashAmount: 20000,
    status: 'pending'
  },
  {
    salesRep: 'Omar Al-Ghamdi',
    sessionDate: '2024-03-17',
    cashAmount: 19000,
    status: 'open'
  }
])

// Chart data
const chartData = computed(() => ({
  labels: sessionsData.value.map(item => item.salesRep),
  datasets: [
    {
      label: 'Cash Amount',
      data: sessionsData.value.map(item => item.cashAmount),
      backgroundColor: sessionsData.value.map(item => 
        item.status === 'open' ? '#ef4444' : '#f59e0b'
      )
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Open Sessions by Sales Rep'
    }
  },
  scales: {
    y: {
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

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

// Check if session is older than 1 day
const isSessionOld = (sessionDate: string): boolean => {
  const today = new Date()
  const session = new Date(sessionDate)
  const diffTime = Math.abs(today.getTime() - session.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 1
}

// Summary calculations
const summary = computed(() => ({
  totalOpen: sessionsData.value.filter(s => s.status === 'open').length,
  totalPending: sessionsData.value.filter(s => s.status === 'pending').length,
  totalAmount: sessionsData.value.reduce((sum, item) => sum + item.cashAmount, 0),
  oldSessions: sessionsData.value.filter(s => isSessionOld(s.sessionDate)).length
}))

const getStatusColor = (status: string) => {
  return status === 'open' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
}
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Open Sessions</div>
        <div class="text-2xl font-bold text-red-600">{{ summary.totalOpen }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Pending Sessions</div>
        <div class="text-2xl font-bold text-orange-600">{{ summary.totalPending }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Total Amount</div>
        <div class="text-2xl font-bold text-gray-900">{{ formatPrice(summary.totalAmount) }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Old Sessions (>1 day)</div>
        <div class="text-2xl font-bold text-red-600">{{ summary.oldSessions }}</div>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cash Amount</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Warning</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="session in sessionsData" :key="session.salesRep">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ session.salesRep }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(session.sessionDate) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                {{ formatPrice(session.cashAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="px-2 py-1 text-xs rounded-full"
                      :class="getStatusColor(session.status)">
                  {{ session.status.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span v-if="isSessionOld(session.sessionDate)" 
                      class="material-icons text-red-500"
                      title="Session is older than 1 day">
                  warning
                </span>
              </td>
            </tr>
          </tbody>
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