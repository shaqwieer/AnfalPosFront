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

// Sample stock data for Mohammed Al-Malki
const stockData = ref({
  salesRep: 'Mohammed Al-Malki',
  van: 'VAN-001',
  inventory: [
    {
      code: 'EO-001',
      name: 'ADNOC VOYAGER ULTRA 5W-40',
      quantity: 5,
      minStock: 20,
      maxStock: 100,
      unit: 'Liter',
      category: 'Engine Oil',
      status: 'critical'
    },
    {
      code: 'EO-002',
      name: 'ADNOC VOYAGER PLUS 10W-30',
      quantity: 15,
      minStock: 20,
      maxStock: 100,
      unit: 'Liter',
      category: 'Engine Oil',
      status: 'warning'
    },
    {
      code: 'GO-001',
      name: 'ADNOC GEAR OIL EP 80W-90',
      quantity: 25,
      minStock: 20,
      maxStock: 100,
      unit: 'Liter',
      category: 'Gear Oil',
      status: 'normal'
    }
  ]
})

// Summary calculations
const summary = computed(() => {
  const totalItems = stockData.value.inventory.length
  const criticalItems = stockData.value.inventory.filter(item => item.status === 'critical').length
  const warningItems = stockData.value.inventory.filter(item => item.status === 'warning').length
  const normalItems = stockData.value.inventory.filter(item => item.status === 'normal').length

  return {
    totalItems,
    criticalItems,
    warningItems,
    normalItems,
    criticalPercentage: (criticalItems / totalItems) * 100,
    warningPercentage: (warningItems / totalItems) * 100,
    normalPercentage: (normalItems / totalItems) * 100
  }
})

// Chart data
const chartData = computed(() => ({
  labels: ['Critical', 'Warning', 'Normal'],
  datasets: [{
    data: [summary.value.criticalItems, summary.value.warningItems, summary.value.normalItems],
    backgroundColor: ['#ef4444', '#f59e0b', '#22c55e']
  }]
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
      text: `Stock Status - ${stockData.value.salesRep}`
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return 'bg-red-100 text-red-800'
    case 'warning': return 'bg-yellow-100 text-yellow-800'
    case 'normal': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStockLevel = (quantity: number, minStock: number, maxStock: number) => {
  const percentage = (quantity / maxStock) * 100
  return {
    width: `${percentage}%`,
    color: quantity <= minStock ? 'bg-red-500' : 
           quantity < minStock * 1.5 ? 'bg-yellow-500' : 
           'bg-green-500'
  }
}
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Total Items</div>
        <div class="text-2xl font-bold text-gray-900">{{ summary.totalItems }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Critical Stock</div>
        <div class="text-2xl font-bold text-red-600">{{ summary.criticalItems }}</div>
        <div class="text-sm text-gray-500">{{ summary.criticalPercentage.toFixed(1) }}%</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Warning Stock</div>
        <div class="text-2xl font-bold text-yellow-600">{{ summary.warningItems }}</div>
        <div class="text-sm text-gray-500">{{ summary.warningPercentage.toFixed(1) }}%</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Normal Stock</div>
        <div class="text-2xl font-bold text-green-600">{{ summary.normalItems }}</div>
        <div class="text-sm text-gray-500">{{ summary.normalPercentage.toFixed(1) }}%</div>
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
      <div class="p-4 border-b">
        <h3 class="font-medium text-gray-900">{{ stockData.salesRep }} ({{ stockData.van }})</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock Level</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Min/Max</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in stockData.inventory" :key="item.code">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.code }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-300"
                       :class="getStockLevel(item.quantity, item.minStock, item.maxStock).color"
                       :style="{ width: getStockLevel(item.quantity, item.minStock, item.maxStock).width }">
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                {{ item.quantity }} {{ item.unit }}s
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                {{ item.minStock }}/{{ item.maxStock }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="px-2 py-1 text-xs rounded-full"
                      :class="getStatusColor(item.status)">
                  {{ item.status.toUpperCase() }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
```