```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  data: any;
  viewMode: 'chart' | 'table';
}>();

// View mode state
const selectedView = ref('product'); // 'product', 'invoice', 'category'

// Chart data for each view
const chartData = computed(() => {
  if (!props.data) return null;

  switch (selectedView.value) {
    case 'product':
      return {
        labels: props.data.salesReps.flatMap((rep) => rep.topProducts.map((p) => p.name)),
        datasets: [
          {
            label: 'Sales Value',
            data: props.data.salesReps.flatMap((rep) => rep.topProducts.map((p) => p.value)),
            backgroundColor: '#3b82f6'
          }
        ]
      };
    case 'category':
      return {
        labels: props.data.summary.topCategories.map((cat) => cat.name),
        datasets: [
          {
            label: 'Sales Value',
            data: props.data.summary.topCategories.map((cat) => cat.sales),
            backgroundColor: '#3b82f6'
          }
        ]
      };
    default:
      return {
        labels: props.data.performance.hourly.map((h) => h.hour),
        datasets: [
          {
            label: 'Sales Value',
            data: props.data.performance.hourly.map((h) => h.value),
            backgroundColor: '#3b82f6'
          }
        ]
      };
  }
});

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
};

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const getGrowthColor = (growth: number) => {
  if (growth > 0) return 'text-green-600';
  if (growth < 0) return 'text-red-600';
  return 'text-gray-600';
};

const getGrowthIcon = (growth: number) => {
  if (growth > 0) return 'trending_up';
  if (growth < 0) return 'trending_down';
  return 'remove';
};
</script>

<template>
  <div v-if="data">
    <!-- Summary Cards -->

    <div class="grid mb-6">
      <div class="col-12 p-2 md:col-6 lg:col-3">
        <div class="border-1 border-round shadow-sm border-1 border-gray-200 p-4">
          <div class="text-sm text-gray-500">Total Sales</div>
          <div class="text-2xl font-bold text-gray-900">{{ formatPrice(data.summary.totalSales) }}</div>
        </div>
      </div>

      <div class="col-12 p-2 md:col-6 lg:col-3">
        <div class="border-1 border-round shadow-sm border-1 border-gray-200 p-4">
          <div class="text-sm text-gray-500">Total Orders</div>
          <div class="text-2xl font-bold text-blue-600">{{ data.summary.totalOrders }}</div>
        </div>
      </div>

      <div class="col-12 p-2 md:col-6 lg:col-3">
        <div class="border-1 border-round shadow-sm border-1 border-gray-200 p-4">
          <div class="text-sm text-gray-500">Avg Order Value</div>
          <div class="text-2xl font-bold text-green-600">{{ formatPrice(data.summary.avgOrderValue) }}</div>
        </div>
      </div>

      <div class="col-12 p-2 md:col-6 lg:col-3">
        <div class="border-1 border-round shadow-sm border-1 border-gray-200 p-4">
          <div class="text-sm text-gray-500">Target Achievement</div>
          <div class="text-2xl font-bold text-purple-600">{{ data.summary.targetAchievement }}%</div>
        </div>
      </div>
    </div>

    <!-- View Selector -->
    <div class="mb-6">
      <div class="inline-flex border-round border-1 gap-2 border-gray-200 p-1 bg-gray-50">
        <div
          v-for="view in ['product', 'category', 'hourly']"
          :key="view"
          @click="selectedView = view"
          style="height: 36px"
          class="flex justify-content-center align-items-center w-8rem border-round cursor-pointer border-gray-200 text-sm font-bold transition-colors"
          :class="selectedView === view ? 'bg-white text-blue-600 border-1 shadow-1' : 'text-gray-600 hover:text-gray-900'"
        >
          By {{ view.charAt(0).toUpperCase() + view.slice(1) }}
        </div>
      </div>
    </div>

    <!-- Chart View -->
    <div v-if="viewMode === 'chart' && chartData" class="bg-white border-gray-200 border-round shadow-sm border-1 p-6">
      <div style="height: 400px" class="">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="bg-white border-1 border-gray-200 border-round shadow-sm border overflow-hidden">
      <DataTable :value="data.salesReps" :paginator="data.salesReps.lenth > 10" :rows="10" :rowsPerPageOptions="[5, 10, 25]" :currentPageReportTemplate="''">
        <template #empty>
          <div class="flex justify-content-center align-items-center font-bold text-lg">test</div>
        </template>

        <Column field="name" header="Sales Rep" class="font-normal">
          <template #body="slotProps">
            <div class="flex flex-column align-items-start">
              <div class="font-semibold text-md">{{ slotProps.data.name }}</div>
              <div class="text-sm text-gray-500">Top Product: {{ slotProps.data.topProducts[0].name }}</div>
            </div>
          </template>
        </Column>

        <Column field="orders" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">Orders</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center">
              <span class="text-md">{{ slotProps.data.orders }}</span>
            </div>
          </template>
        </Column>

        <Column field="totalSales" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">Total Sales </span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center">
              <span class="text-md"> {{ formatPrice(slotProps.data.totalSales) }}</span>
            </div>
          </template>
        </Column>

        <Column field="target" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">Target</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center">
              <span class="text-md">{{ formatPrice(slotProps.data.target) }} </span>
            </div>
          </template>
        </Column>

        <Column field="achievement" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">Achievement</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center">
              <span class="text-sm px-2 py-1 border-round-2xl bg-yellow-100 text-xs text-yellow-800">{{ slotProps.data.achievement }}%</span>
            </div>
          </template>
        </Column>

        <Column field="avgOrderValue" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">Avg Order Value </span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center">
              <span class="text-md">{{ formatPrice(slotProps.data.avgOrderValue) }}</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
