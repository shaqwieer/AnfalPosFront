<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  data: any;
  cards: any;
  viewMode: 'chart' | 'table';
}>();

// Chart data for sales rep performance
const chartData = computed(() => ({
  labels: props.data.map((rep: any) => rep.name),
  datasets: [
    {
      label: t('dashboard.PlannedVisits'),
      data: props.data.map((rep: any) => rep.planned),
      backgroundColor: '#94a3b8',
      stack: 'Stack 0'
    },
    {
      label: t('dashboard.CompletedVisits'),
      data: props.data.map((rep: any) => rep.completed),
      backgroundColor: '#22c55e',
      stack: 'Stack 1'
    },
    {
      label: t('dashboard.ProductiveVisits'),
      data: props.data.map((rep: any) => rep.productive),
      backgroundColor: '#3b82f6',
      stack: 'Stack 1'
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
      text: t('dashboard.SalesRepVisitPerformance')
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

// Sample transaction data for each sales rep
const transactionData = computed(() => {
  return props.data;
});

// Get status color based on rate
const getStatusColor = (rate: number) => {
  if (rate >= 80) return 'bg-green-100 text-green-800';
  if (rate >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};
</script>

<template>
  <div class="p-0">
    <!-- Summary Cards -->
    <div class="grid mb-6">
      <div class="col-12 p-2 md:col-6 lg:col-3">
        <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
          <div class="text-sm text-gray-500">{{ t('dashboard.TotalPlanned') }}</div>
          <div class="text-2xl font-bold text-gray-900">
            {{ cards.totalPlanned }}
          </div>
        </div>
      </div>

      <div class="col-12 p-2 md:col-6 lg:col-3">
        <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
          <div class="text-sm text-gray-500">{{ t('dashboard.TotalCompleted') }}</div>
          <div class="text-2xl font-bold text-green-600">
            {{ cards.totalCompleted }}
          </div>
        </div>
      </div>

      <div class="col-12 p-2 md:col-6 lg:col-3">
        <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
          <div class="text-sm text-gray-500">{{ t('dashboard.TotalProductive') }}</div>
          <div class="text-2xl font-bold text-blue-600">
            {{ cards.totalProductive }}
          </div>
        </div>
      </div>

      <div class="col-12 p-2 md:col-6 lg:col-3">
        <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
          <div class="text-sm text-gray-500">{{ t('dashboard.AverageCompletionRate') }}</div>
          <div class="text-2xl font-bold text-purple-600">{{ ((cards.totalCompleted / cards.totalPlanned) * 100).toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <!-- Chart View -->
    <!-- 'chart' -->
    <div v-if="viewMode === 'chart'" class="bg-white border-1 border-gray-200 border-round-lg shadow-sm shadow-sm border p-4">
      <div style="height: 400px">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Table View -->

    <div v-else class="card bg-white p-0 round shadow-none border">
      <DataTable :value="transactionData" :paginator="transactionData.lenth > 10" :rows="10" :rowsPerPageOptions="[5, 10, 25]" :currentPageReportTemplate="''">
        <template #empty>
          <div class="flex justify-content-center align-items-center font-bold text-lg">{{ t('dashboard.empty') }}</div>
        </template>

        <Column field="name" :header="t('dashboard.SalesRep')" class="font-normal">
          <template #body="slotProps">
            <div class="flex flex-row align-items-center">
              <span class="font-semibold text-md">{{ slotProps.data.name }}</span>
            </div>
          </template>
        </Column>

        <Column field="planned" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.Planned') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center">
              <span class="font-semibold text-md">{{ slotProps.data.planned }}</span>
            </div>
          </template>
        </Column>

        <Column field="completed" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.Completed') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center text-green-600">
              <span class="font-semibold text-md">{{ slotProps.data.completed }}</span>
            </div>
          </template>
        </Column>

        <Column field="productive" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.Productive') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center text-blue-600">
              <span class="font-semibold text-md">{{ slotProps.data.productive }}</span>
            </div>
          </template>
        </Column>

        <Column field="sales" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Sales') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center text-center text-600 font-medium">
              <span class="font-semibold text-md">{{ slotProps.data.sales }}</span>
            </div>
          </template>
        </Column>
        <Column field="returns" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Returns') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center text-center text-600 font-medium">
              <span class="font-semibold text-md">{{ slotProps.data.returns }}</span>
            </div>
          </template>
        </Column>
        <Column field="collections" class="font-normal">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Collections') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-row justify-content-center align-items-center text-red-600">
              <span class="font-semibold text-md">{{ slotProps.data.collections }}%</span>
            </div>
          </template>
        </Column>
      </DataTable>
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
