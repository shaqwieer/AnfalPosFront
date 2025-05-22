<script setup lang="ts">
import { ref, computed } from 'vue';
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

// Overdue data from props
const overdueData = computed(() => props.data || []);

// Chart data
const chartData = computed(() => {
  const salesRepData = {};

  // Initialize data structure
  overdueData.value.forEach((item) => {
    if (!salesRepData[item.salesRep]) {
      salesRepData[item.salesRep] = {
        '0-30 Days': 0,
        '31-60 Days': 0,
        '61-90 Days': 0,
        '91-120 Days': 0,
        '120+ Days': 0
      };
    }

    // Map aging categories to chart categories
    const agingCategory = item.aging + ' Days';
    // For the 120+ category, we need to handle it specially
    const chartCategory = item.aging === '120+' ? '120+ Days' : agingCategory;

    // Add amount to the appropriate category
    salesRepData[item.salesRep][chartCategory] += item.amount;
  });

  console.log(salesRepData);

  return {
    labels: Object.keys(salesRepData),
    datasets: [
      {
        label: t('dashboard.0-30Days'),
        data: Object.values(salesRepData).map((data) => data['0-30 Days']),
        backgroundColor: '#199e0b'
      },
      {
        label: t('dashboard.31-60Days'),
        data: Object.values(salesRepData).map((data) => data['31-60 Days']),
        backgroundColor: '#f59e0b'
      },
      {
        label: t('dashboard.61-90Days'),
        data: Object.values(salesRepData).map((data) => data['61-90 Days']),
        backgroundColor: '#f97316'
      },
      {
        label: t('dashboard.91-120Days'),
        data: Object.values(salesRepData).map((data) => data['91-120 Days']),
        backgroundColor: '#dc2626'
      },
      {
        label: t('dashboard.120Days'),
        data: Object.values(salesRepData).map((data) => data['120+ Days']),
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
  const total0_30 = overdueData.value.filter((item) => item.aging === '0-30').reduce((sum, item) => sum + item.amount, 0);

  const total31_60 = overdueData.value.filter((item) => item.aging === '31-60').reduce((sum, item) => sum + item.amount, 0);

  const total61_90 = overdueData.value.filter((item) => item.aging === '61-90').reduce((sum, item) => sum + item.amount, 0);

  const total91_120 = overdueData.value.filter((item) => item.aging === '91-120').reduce((sum, item) => sum + item.amount, 0);

  const total120Plus = overdueData.value.filter((item) => item.aging === '120+').reduce((sum, item) => sum + item.amount, 0);

  return {
    total0_30,
    total31_60,
    total61_90,
    total91_120,
    total120Plus,
    totalOverdue: total0_30 + total31_60 + total61_90 + total91_120 + total120Plus,
    totalInvoices: overdueData.value.length,
    totalCustomers: new Set(overdueData.value.map((item) => item.customer)).size,
    totalSalesReps: new Set(overdueData.value.map((item) => item.salesRep)).size
  };
});

const getAgingColor = (category: string) => {
  switch (category) {
    case '0-30':
      return 'bg-green-100 text-green-800';
    case '31-60':
      return 'bg-yellow-100 text-yellow-800';
    case '61-90':
      return 'bg-orange-100 text-orange-800';
    case '91-120':
      return 'bg-red-100 text-red-800';
    case '120+':
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script>

<template>
  <div>
    <!-- Summary Cards -->

    <!-- <div class="p-grid p-dir-col p-md-dir-row p-align-start p-justify-between">
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
    </div> -->

    <!-- Chart View -->

    <div v-if="viewMode === 'chart'" class="bg-white border-gray-200 border-round-lg shadow-sm border-1 p-4">
      <div style="height: 400px">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="bg-white border-1 border-gray-200 border-round-lg shadow-sm border overflow-hidden">
      <DataTable :value="props.data" :paginator="props.data.length > 10" :rows="5" :rowsPerPageOptions="[5, 10, 25]" class="">
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
        </Column>

        <Column field="customer" :header="t('dashboard.customer')">
          <template #body="slotProps">
            <div class="flex flex-column align-items-start text-md">
              {{ slotProps.data.customer }}
            </div>
          </template>
        </Column>

        <Column field="invoice" :header="t('dashboard.invoice')">
          <template #body="slotProps">
            <div class="flex flex-column align-items-start text-md">
              {{ slotProps.data.invoice }}
            </div>
          </template>

          <template #footer>
            <div class="flex flex-column align-items-start">
              <div class="font-semibold text-md">{{ overdueData.length }} {{ t('dashboard.invoices') }}</div>
            </div>
          </template>
        </Column>

        <Column field="date" :header="t('dashboard.date')">
          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md">
              {{ formatDate(slotProps.data.date) }}
            </div>
          </template>
        </Column>

        <Column field="amount" :header="t('dashboard.Amount')">
          <template #body="slotProps">
            <div class="flex flex-column align-items-center font-semibold text-md">
              {{ formatPrice(slotProps.data.amount) }}
            </div>
          </template>

          <template #footer>
            <div class="flex flex-column align-items-center">
              <div class="font-semibold text-md">{{ formatPrice(summary.totalOverdue) }}</div>
            </div>
          </template>
        </Column>

        <Column field="days" :header="t('dashboard.Days')">
          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md">
              {{ slotProps.data.days }}
            </div>
          </template>
        </Column>

        <Column field="aging" :header="t('dashboard.Aging')">
          <template #body="slotProps">
            <div class="flex flex-column align-items-center text-md">
              <span class="px-2 py-1 text-xs border-round-xl" :class="getAgingColor(slotProps.data.aging)">
                {{ slotProps.data.aging }}
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
