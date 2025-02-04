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
  salesReps: any[]
}>()

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const chartData = computed(() => ({
  labels: props.salesReps.map(rep => rep.name),
  datasets: [
    {
      label: 'Yesterday',
      data: props.salesReps.map(rep => rep.yesterdaySales),
      backgroundColor: '#9333ea'
    },
    {
      label: 'Today',
      data: props.salesReps.map(rep => rep.todaySales),
      backgroundColor: '#3b82f6'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
</script>

<template>
  <div class="surface-card border-round-xl border-1 p-6">
    <h2 class="text-lg font-medium mb-4">Sales Performance</h2>
    
    <!-- Chart -->
    <div class="h-24rem mb-6">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="surface-100">
          <tr>
            <th class="text-left text-xs font-medium text-500 uppercase p-3">Sales Rep</th>
            <th class="text-right text-xs font-medium text-500 uppercase p-3">Yesterday</th>
            <th class="text-right text-xs font-medium text-500 uppercase p-3">Today</th>
            <th class="text-center text-xs font-medium text-500 uppercase p-3">Top Categories</th>
            <th class="text-center text-xs font-medium text-500 uppercase p-3">Conversion Rate</th>
          </tr>
        </thead>
        <tbody class="surface-ground">
          <tr v-for="rep in salesReps" :key="rep.id" class="border-bottom-1 surface-border">
            <td class="p-3 white-space-nowrap">
              <div class="font-medium text-900">{{ rep.name }}</div>
            </td>
            <td class="p-3 white-space-nowrap text-right">
              {{ formatPrice(rep.yesterdaySales) }}
            </td>
            <td class="p-3 white-space-nowrap text-right">
              {{ formatPrice(rep.todaySales) }}
            </td>
            <td class="p-3 white-space-nowrap">
              <div class="flex flex-wrap gap-2 justify-content-center">
                <span v-for="category in rep.topCategories" 
                      :key="category"
                      class="px-2 py-1 text-xs border-round-full bg-blue-50 text-blue-800">
                  {{ category }}
                </span>
              </div>
            </td>
            <td class="p-3 white-space-nowrap text-center">
              <span class="px-2 py-1 text-xs border-round-full"
                    :class="{
                      'bg-green-50 text-green-800': rep.conversionRate >= 80,
                      'bg-yellow-50 text-yellow-800': rep.conversionRate >= 60 && rep.conversionRate < 80,
                      'bg-red-50 text-red-800': rep.conversionRate < 60
                    }">
                {{ rep.conversionRate }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>