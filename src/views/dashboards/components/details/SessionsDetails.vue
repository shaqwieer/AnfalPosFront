<script setup lang="ts">
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps<{
  data: any;
  viewMode: 'chart' | 'table';
}>();

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
]);

// Chart data
const chartData = computed(() => ({
  labels: props.data?.sessionSales?.filter((s) => s.statusId === 4).map((item) => item.saleName),
  datasets: [
    {
      label: 'Cash Amount',
      data: props.data?.sessionSales?.filter((s) => s.statusId === 4).map((item) => item.allAmount),
      backgroundColor: props.data?.sessionSales?.filter((s) => s.statusId === 4).map((item) => (item.statusName === '"Opened"' ? '#ef4444' : '#f59e0b'))
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
      text: t('dashboard.OpenSessionsbySalesRep')
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const Rtl = localStorage.getItem('Rtl') === 'true';
const formatPrice = (price: number): string => {
    if (price === undefined || price === null) {
    return Rtl ? 'SAR 0.00' : '0.00 SAR'; // Return a default value
  }
  return price.toLocaleString(Rtl ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

// Check if session is older than 1 day
const isSessionOld = (sessionDate: string): boolean => {
  const today = new Date();
  const session = new Date(sessionDate);
  const diffTime = Math.abs(today.getTime() - session.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 1;
};

// Summary calculations
const summary = computed(() => ({
  totalOpen: sessionsData.value.filter((s) => s.status === 'open').length,
  totalPending: sessionsData.value.filter((s) => s.status === 'pending').length,
  totalAmount: sessionsData.value.reduce((sum, item) => sum + item.cashAmount, 0),
  oldSessions: sessionsData.value.filter((s) => isSessionOld(s.sessionDate)).length
}));

const getStatusColor = (status: string) => {
  return status === 'Opened' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
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
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.OpenSessions') }}</div>
                <div class="text-2xl font-bold text-red-600">
                  {{ data.openSession }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.PendingSessions') }}</div>
                <div class="text-2xl font-bold text-orange-600">
                  {{ data.pendingSession }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.TotalAmount') }}</div>
                <div class="text-2xl font-bold text-gray-900">
                  {{ formatPrice(data.totalAmount) }}
                </div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.OldSessions') }}</div>
                <div class="text-2xl font-bold text-red-600">
                  {{ data.oldSession }}
                </div>
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
      <DataTable :value="data.sessionSales" :paginator="data.sessionSales.length > 10" :rows="10" :rowsPerPageOptions="[5, 10, 25]" class="">
        <template #empty>
          <div class="flex justify-content-center align-items-center font-bold text-lg">{{ t('dashboard.empty') }}</div>
        </template>

        <!-- Sales Rep Column -->
        <Column field="salesRep" :header="t('dashboard.SalesRep')">
          <template #body="slotProps">
            <div class="flex flex-column align-items-start">
              <div class="font-semibold text-md">{{ slotProps.data.saleName }}</div>
            </div>
          </template>
        </Column>

        <Column field="sessionDate">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.SessionDate') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md text-right">
              {{ slotProps.data?.sessionStartDate }}
            </div>
          </template>
        </Column>

        <!-- Card Column -->
        <Column field="cashAmount">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.CashAmount') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md text-right">
              {{ formatPrice(slotProps.data.allAmount) }}
            </div>
          </template>
        </Column>

        <!-- Bank Column -->
        <Column field="status">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.Status') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center">
              <span :class="getStatusColor(slotProps.data.statusName)" class="text-xs text-center border-round-3xl px-2 py-1 flex justify-content-center align-content-center">
                {{ slotProps.data?.statusName?.toUpperCase() }}
              </span>
            </div>
          </template>
        </Column>

        <Column field="sessionDate">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal">{{ t('dashboard.Warning') }}</span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-column align-items-center font-semibold text-md text-right">
              <span v-if="slotProps.data.isSessionLate" class="material-icons text-red-500" title="Session is older than 1 day">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="fa-xl" />
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
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
