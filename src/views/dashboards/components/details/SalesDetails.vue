```vue
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

// View mode state
const selectedView = ref('product') // 'product', 'invoice', 'category'

// Chart data for each view
const chartData = computed(() => {
  if (!props.data) return null

  switch (selectedView.value) {
    case 'product':
      return {
        labels: props.data.salesReps.flatMap(rep => rep.topProducts.map(p => p.name)),
        datasets: [{
          label: 'Sales Value',
          data: props.data.salesReps.flatMap(rep => rep.topProducts.map(p => p.value)),
          backgroundColor: '#3b82f6'
        }]
      }
    case 'category':
      return {
        labels: props.data.summary.topCategories.map(cat => cat.name),
        datasets: [{
          label: 'Sales Value',
          data: props.data.summary.topCategories.map(cat => cat.sales),
          backgroundColor: '#3b82f6'
        }]
      }
    default:
      return {
        labels: props.data.performance.hourly.map(h => h.hour),
        datasets: [{
          label: 'Sales Value',
          data: props.data.performance.hourly.map(h => h.value),
          backgroundColor: '#3b82f6'
        }]
      }
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Sales Analysis'
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

const getGrowthColor = (growth: number) => {
  if (growth > 0) return 'text-green-600'
  if (growth < 0) return 'text-red-600'
  return 'text-gray-600'
}

const getGrowthIcon = (growth: number) => {
  if (growth > 0) return 'trending_up'
  if (growth < 0) return 'trending_down'
  return 'remove'
}
</script>

<template>
  <div v-if="data">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Total Sales</div>
        <div class="text-2xl font-bold text-gray-900">{{ formatPrice(data.summary.totalSales) }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Total Orders</div>
        <div class="text-2xl font-bold text-blue-600">{{ data.summary.totalOrders }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Avg Order Value</div>
        <div class="text-2xl font-bold text-green-600">{{ formatPrice(data.summary.avgOrderValue) }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Target Achievement</div>
        <div class="text-2xl font-bold text-purple-600">{{ data.summary.targetAchievement }}%</div>
      </div>
    </div>

    <!-- View Selector -->
    <div class="mb-6">
      <div class="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
        <button v-for="view in ['product', 'category', 'hourly']"
                :key="view"
                @click="selectedView = view"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                :class="selectedView === view ? 
                  'bg-white text-blue-600 shadow' : 
                  'text-gray-600 hover:text-gray-900'">
          By {{ view.charAt(0).toUpperCase() + view.slice(1) }}
        </button>
      </div>
    </div>

    <!-- Chart View -->
    <div v-if="viewMode === 'chart' && chartData" class="bg-white rounded-lg shadow-sm border p-6">
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
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Target</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Achievement</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="rep in data.salesReps" :key="rep.name">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ rep.name }}</div>
                <div class="text-sm text-gray-500">
                  Top Product: {{ rep.topProducts[0].name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">{{ rep.orders }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">{{ formatPrice(rep.totalSales) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">{{ formatPrice(rep.target) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                <span class="px-2 py-1 text-xs rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': rep.achievement >= 90,
                        'bg-yellow-100 text-yellow-800': rep.achievement >= 75 && rep.achievement < 90,
                        'bg-red-100 text-red-800': rep.achievement < 75
                      }">
                  {{ rep.achievement }}%
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">{{ formatPrice(rep.avgOrderValue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
```