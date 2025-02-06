<script setup lang="ts">
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  data: any;
  viewMode: 'chart' | 'table';
}>();

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
});

// Summary calculations
const summary = computed(() => {
  const totalItems = stockData.value.inventory.length;
  const criticalItems = stockData.value.inventory.filter((item) => item.status === 'critical').length;
  const warningItems = stockData.value.inventory.filter((item) => item.status === 'warning').length;
  const normalItems = stockData.value.inventory.filter((item) => item.status === 'normal').length;

  return {
    totalItems,
    criticalItems,
    warningItems,
    normalItems,
    criticalPercentage: (criticalItems / totalItems) * 100,
    warningPercentage: (warningItems / totalItems) * 100,
    normalPercentage: (normalItems / totalItems) * 100
  };
});

// Chart data
const chartData = computed(() => ({
  labels: ['Critical', 'Warning', 'Normal'],
  datasets: [
    {
      data: [summary.value.criticalItems, summary.value.warningItems, summary.value.normalItems],
      backgroundColor: ['#ef4444', '#f59e0b', '#22c55e']
    }
  ]
}));

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
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'normal':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStockLevel = (quantity: number, minStock: number, maxStock: number) => {
  const percentage = (quantity / maxStock) * 100;
  return {
    width: `${percentage}%`,
    color: quantity <= minStock ? 'bg-red-500' : quantity < minStock * 1.5 ? 'bg-yellow-500' : 'bg-green-500'
  };
};
</script>

<template>
  <div>
    <!-- Summary Cards -->

    <div class="p-grid p-dir-col p-md-dir-row p-align-start p-justify-between">
      <div class="p-col-12">
        <div class="bg-white rounded-lg shadow-sm border p-0">
          <div class="grid mb-6">
            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg h-full shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">Open Sessions</div>
                <div class="text-2xl font-bold text-gray-900">
                  {{ summary.totalItems }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">Critical Stock</div>
                <div class="text-2xl font-bold text-red-600">{{ summary.criticalItems }}</div>
                <div class="text-sm text-gray-500">{{ summary.criticalPercentage.toFixed(1) }}%</div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">Warning Stock</div>
                <div class="text-2xl font-bold text-yellow-600">{{ summary.warningItems }}</div>
                <div class="text-sm text-gray-500">{{ summary.warningPercentage.toFixed(1) }}%</div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">Normal Stock</div>
                <div class="text-2xl font-bold text-green-600">{{ summary.normalItems }}</div>
                <div class="text-sm text-gray-500">{{ summary.normalPercentage.toFixed(1) }}%</div>
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
      <div class="p-4 border-b">
        <h3 class="font-medium text-2xl text-gray-900 m-0">{{ stockData.salesRep }} ({{ stockData.van }})</h3>
      </div>

      <DataTable :value="stockData.inventory" :paginator="stockData.inventory.length > 10" :rows="10" :rowsPerPageOptions="[5, 10, 25]" class="">
        <template #empty>
          <div class="flex justify-content-center align-items-center font-bold text-lg">No Data Available</div>
        </template>

        <Column field="code">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-start font-normal">CODE</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-column align-items-start">
              <div class="text-md">{{ slotProps.data.code }}</div>
            </div>
          </template>
        </Column>

        <Column field="name">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-start font-normal">Product</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-column align-items-start text-md">
              {{ slotProps.data.name }}
            </div>
          </template>
        </Column>

        <Column field="category">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-start font-normal">category</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-start">
              <span class="text-start border-round-lg flex justify-content-start align-content-center"> {{ slotProps.data.category }}</span>
            </div>
          </template>
        </Column>

        <Column field="maxStock">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">Stock Level</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md">
              <div class="w-full bg-gray-200 border-round-2xl" style="height: 8px">
                <div
                  style="height: 8px"
                  class="border-round-lg transition-all duration-300"
                  :class="getStockLevel(slotProps.data.quantity, slotProps.data.minStock, slotProps.data.maxStock).color"
                  :style="{ width: getStockLevel(slotProps.data.quantity, slotProps.data.minStock, slotProps.data.maxStock).width }"
                ></div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="quantity">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">quantity</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center">
              <span class="text-center border-round-lg px-2 py-1 flex justify-content-center align-content-center"> {{ slotProps.data.quantity }} Liters </span>
            </div>
          </template>
        </Column>

        <Column field="maxStock">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">Min/Max </span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md">{{ slotProps.data.minStock }} / {{ slotProps.data.maxStock }}</div>
          </template>
        </Column>

        <Column field="status">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">Status</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-sm">
              <span class="px-2 py-1 text-xs border-round-3xl" :class="getStatusColor(slotProps.data.status)">
                {{ slotProps.data.status.toUpperCase() }}
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
