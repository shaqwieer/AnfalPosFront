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

const chartData = computed(() => ({
  labels: props.salesReps.map(rep => rep.name),
  datasets: [
    {
      label: 'Completed Visits',
      data: props.salesReps.map(rep => rep.completedVisits),
      backgroundColor: '#22c55e'
    },
    {
      label: 'Planned Visits',
      data: props.salesReps.map(rep => rep.plannedVisits),
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
      beginAtZero: true,
      stacked: true
    },
    x: {
      stacked: true
    }
  }
}
</script>



<template>
  <div class="surface-card border-round-xl border-1 p-6">
    <h2 class="text-lg font-medium mb-4">Visit Performance</h2>
    
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
            <th class="text-center text-xs font-medium text-500 uppercase p-3">Planned</th>
            <th class="text-center text-xs font-medium text-500 uppercase p-3">Completed</th>
            <th class="text-center text-xs font-medium text-500 uppercase p-3">Missed</th>
            <th class="text-center text-xs font-medium text-500 uppercase p-3">Completion Rate</th>
          </tr>
        </thead>
        <tbody class="surface-ground">
          <tr v-for="rep in salesReps" :key="rep.id" class="border-bottom-1 surface-border">
            <td class="p-3 white-space-nowrap">
              <div class="font-medium text-900">{{ rep.name }}</div>
            </td>
            <td class="p-3 white-space-nowrap text-center">{{ rep.plannedVisits }}</td>
            <td class="p-3 white-space-nowrap text-center text-green-600">{{ rep.completedVisits }}</td>
            <td class="p-3 white-space-nowrap text-center text-red-600">
              {{ rep.plannedVisits - rep.completedVisits }}
            </td>
            <td class="p-3 white-space-nowrap text-center">
              <span class="px-2 py-1 text-xs border-round-full"
                    :class="{
                      'bg-green-50 text-green-800': (rep.completedVisits / rep.plannedVisits) >= 0.8,
                      'bg-yellow-50 text-yellow-800': (rep.completedVisits / rep.plannedVisits) >= 0.6 && (rep.completedVisits / rep.plannedVisits) < 0.8,
                      'bg-red-50 text-red-800': (rep.completedVisits / rep.plannedVisits) < 0.6
                    }">
                {{ Math.round((rep.completedVisits / rep.plannedVisits) * 100) }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>