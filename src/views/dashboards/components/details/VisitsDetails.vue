<script setup lang="ts">
import { computed } from 'vue'
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

// Chart data for sales rep performance
const chartData = computed(() => ({
  labels: props.data.salesReps.map((rep: any) => rep.name),
  datasets: [
    {
      label: 'Planned Visits',
      data: props.data.salesReps.map((rep: any) => rep.planned),
      backgroundColor: '#94a3b8',
      stack: 'Stack 0'
    },
    {
      label: 'Completed Visits',
      data: props.data.salesReps.map((rep: any) => rep.completed),
      backgroundColor: '#22c55e',
      stack: 'Stack 1'
    },
    {
      label: 'Productive Visits',
      data: props.data.salesReps.map((rep: any) => rep.productive),
      backgroundColor: '#3b82f6',
      stack: 'Stack 1'
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
      text: 'Sales Rep Visit Performance'
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

// Sample transaction data for each sales rep
const transactionData = computed(() => {
  return props.data.salesReps.map((rep: any) => ({
    ...rep,
    transactions: {
      sales: Math.floor(Math.random() * 10) + 5, // 5-15 sales transactions
      returns: Math.floor(Math.random() * 3), // 0-2 return transactions
      collections: Math.floor(Math.random() * 5) + 3 // 3-7 collection transactions
    }
  }))
})

// Get status color based on rate
const getStatusColor = (rate: number) => {
  if (rate >= 80) return 'bg-green-100 text-green-800'
  if (rate >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Total Planned</div>
        <div class="text-2xl font-bold text-gray-900">
          {{ data.summary.totalPlanned }}
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Total Completed</div>
        <div class="text-2xl font-bold text-green-600">
          {{ data.summary.totalCompleted }}
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Total Productive</div>
        <div class="text-2xl font-bold text-blue-600">
          {{ data.summary.totalProductive }}
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Average Completion Rate</div>
        <div class="text-2xl font-bold text-purple-600">
          {{ ((data.summary.totalCompleted / data.summary.totalPlanned) * 100).toFixed(1) }}%
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
    <div v-else class="bg-white rounded-lg shadow-sm border">
      <div class="max-h-[400px] overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales Rep
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Planned
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productive
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Return
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Collection
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="rep in transactionData" :key="rep.name">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ rep.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                {{ rep.planned }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                {{ rep.completed }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                {{ rep.productive }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                {{ rep.transactions.sales }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                {{ rep.transactions.returns }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-600 font-medium">
                {{ rep.transactions.collections }}
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
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>