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

// Sample overdue data
const overdueData = ref([
  {
    salesRep: 'Mohammed Al-Saud',
    customer: 'Al-Futtaim Auto Services',
    invoice: 'INV-001',
    date: '2024-02-15',
    amount: 25000,
    days: 35,
    category: '30-60'
  },
  {
    salesRep: 'Abdullah Al-Qahtani',
    customer: 'Quick Service Center',
    invoice: 'INV-002',
    date: '2024-01-20',
    amount: 18000,
    days: 62,
    category: '60-90'
  },
  {
    salesRep: 'Khalid Al-Otaibi',
    customer: 'Premium Auto Care',
    invoice: 'INV-003',
    date: '2023-12-15',
    amount: 22000,
    days: 95,
    category: '90+'
  },
  {
    salesRep: 'Mohammed Al-Saud',
    customer: 'Auto Zone Services',
    invoice: 'INV-004',
    date: '2024-02-20',
    amount: 15000,
    days: 30,
    category: '30-60'
  },
  {
    salesRep: 'Abdullah Al-Qahtani',
    customer: 'Car Care Center',
    invoice: 'INV-005',
    date: '2023-12-10',
    amount: 20000,
    days: 100,
    category: '90+'
  }
]);

// Chart data
const chartData = computed(() => {
  const salesRepData = {};
  overdueData.value.forEach((item) => {
    if (!salesRepData[item.salesRep]) {
      salesRepData[item.salesRep] = {
        '30-60': 0,
        '60-90': 0,
        '90+': 0
      };
    }
    salesRepData[item.salesRep][item.category] += item.amount;
  });

  return {
    labels: Object.keys(salesRepData),
    datasets: [
      {
        label: t('dashboard.30-60Days'),
        data: Object.values(salesRepData).map((data) => data['30-60']),
        backgroundColor: '#f59e0b'
      },
      {
        label: t('dashboard.60-90Days'),
        data: Object.values(salesRepData).map((data) => data['60-90']),
        backgroundColor: '#f97316'
      },
      {
        label: t('dashboard.90Days'),
        data: Object.values(salesRepData).map((data) => data['90+']),
        backgroundColor: '#ef4444'
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: true,
      text: t('dashboard.OverdueAnalysisbySalesRep')
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

const Rtl = localStorage.getItem('Rtl') === 'true';
const formatPrice = (price: number): string => {
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

// Summary calculations
const summary = computed(() => {
  const total30_60 = overdueData.value.filter((item) => item.category === '30-60').reduce((sum, item) => sum + item.amount, 0);

  const total60_90 = overdueData.value.filter((item) => item.category === '60-90').reduce((sum, item) => sum + item.amount, 0);

  const total90Plus = overdueData.value.filter((item) => item.category === '90+').reduce((sum, item) => sum + item.amount, 0);

  return {
    total30_60,
    total60_90,
    total90Plus,
    totalOverdue: total30_60 + total60_90 + total90Plus,
    totalInvoices: overdueData.value.length,
    totalCustomers: new Set(overdueData.value.map((item) => item.customer)).size,
    totalSalesReps: new Set(overdueData.value.map((item) => item.salesRep)).size
  };
});

// const totalSalesReps = defineModel();
// totalSalesReps.value = overdueData.value.length;

const getAgingColor = (category: string) => {
  switch (category) {
    case '30-60':
      return 'bg-yellow-100 text-yellow-800';
    case '60-90':
      return 'bg-orange-100 text-orange-800';
    case '90+':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script>

<template>
  <div>
    <!-- Summary Cards -->

    <div class="p-grid p-dir-col p-md-dir-row p-align-start p-justify-between">
      <div class="p-col-12">
        <div class="bg-white border-round-lg shadow-sm border p-0">
          <div class="grid mb-6">
            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.30-60Days') }}</div>
                <div class="text-2xl font-bold text-yellow-600">{{ formatPrice(summary.total30_60) }}</div>
                <div class="text-sm text-gray-500">{{ overdueData.filter((i) => i.category === '30-60').length }} {{ t('dashboard.invoices') }}</div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.60-90Days') }}</div>
                <div class="text-2xl font-bold text-orange-600">{{ formatPrice(summary.total60_90) }}</div>
                <div class="text-sm text-gray-500">{{ overdueData.filter((i) => i.category === '60-90').length }} {{ t('dashboard.invoices') }}</div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.90Days') }}</div>
                <div class="text-2xl font-bold text-red-600">{{ formatPrice(summary.total90Plus) }}</div>
                <div class="text-sm text-gray-500">{{ overdueData.filter((i) => i.category === '90+').length }} {{ t('dashboard.invoices') }}</div>
              </div>
            </div>

            <div class="col-12 p-2 md:col-6 lg:col-3">
              <div class="border-1 border-round-lg shadow-sm border-1 border-gray-200 p-4">
                <div class="text-sm text-gray-500">{{ t('dashboard.TotalOverdue') }}</div>
                <div class="text-2xl font-bold text-gray-900">{{ formatPrice(summary.totalOverdue) }}</div>
                <div class="text-sm text-gray-500">{{ summary.totalInvoices }} {{ t('dashboard.invoices') }}</div>
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
      <DataTable :value="overdueData" :paginator="overdueData.length > 10" :rows="10" :rowsPerPageOptions="[5, 10, 25]" class="">
        <template #empty>
          <div class="flex justify-content-center align-items-center font-bold text-lg">No Data Available</div>
        </template>

        <!-- Sales Rep Column -->
        <Column field="salesRep" :header="t('dashboard.SalesRep')">
          <template #body="slotProps">
            <div class="flex flex-column align-items-start">
              <div class="font-semibold text-md">{{ slotProps.data.salesRep }}</div>
            </div>
          </template>

          <template #footer="slotProps">
            <div class="flex flex-column align-items-start">
              <div class="font-semibold text-md">{{ t('dashboard.Total') }} ({{ summary.totalSalesReps }} {{ t('dashboard.SalesReps') }} )</div>
            </div>
          </template>
        </Column>

        <Column field="customer">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-start font-normal"> {{ t('dashboard.customer') }} </span>
            </div>
          </template>

          <template #body="slotProps">
            <div class="flex flex-column align-items-start text-md">
              {{ slotProps.data.customer }}
            </div>
          </template>

          <template #footer="slotProps">
            <div class="flex flex-column align-items-start">
              <div class="font-semibold text-md">{{ summary.totalCustomers }} {{ t('dashboard.Customers') }}</div>
            </div>
          </template>
        </Column>

        <Column field="invoice">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-start font-normal"> {{ t('dashboard.invoice') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-start text-md">
              {{ slotProps.data.invoice }}
            </div>
          </template>

          <template #footer="slotProps">
            <div class="flex flex-column align-items-start">
              <div class="font-semibold text-md">{{ summary.totalInvoices }} {{ t('dashboard.invoices') }}</div>
            </div>
          </template>
        </Column>

        <Column field="date">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.date') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md">
              {{ slotProps.data.date }}
            </div>
          </template>
        </Column>

        <Column field="amount">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Amount') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center font-semibold text-md">
              {{ slotProps.data.amount }}
            </div>
          </template>

          <template #footer="slotProps">
            <div class="flex flex-column align-items-center">
              <div class="font-semibold text-md">{{ formatPrice(summary.totalOverdue) }}</div>
            </div>
          </template>
        </Column>

        <Column field="days">
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Days') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md">
              {{ slotProps.data.days }}
            </div>
          </template>
        </Column>

        <Column>
          <template #header="slotProps">
            <div class="w-full">
              <span class="text-md flex justify-content-center font-normal"> {{ t('dashboard.Aging') }}</span>
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md">
              <span class="px-2 py-1 text-xs border-round-xl" :class="getAgingColor(slotProps.data.category)"> {{ slotProps.data.category }} {{ t('dashboard.Days') }} </span>
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
