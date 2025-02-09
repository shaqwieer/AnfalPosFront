<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SessionDetailsDialog from './SessionDetailsDialog.vue';
import { useSessionStore } from '../../../stores/sessionStore';
import Dropdown from 'primevue/dropdown';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

// Filter states
const selectedSalesReps = ref(null);
const dateFrom = ref('');
const dateTo = ref('');
const selectedStatus = ref('4');
const isDropdownOpen = ref(false);
const showDetailsDialog = ref(false);
const selectedSession = ref();
// const viewMode = (ref < 'table') | ('chart' > 'table');
const viewMode = ref('table');
const sessionStore = useSessionStore();
// Available sales reps
const salesReps = [
  // { id: 'all', name: 'All Sales Reps' },
  { id: 'rep1', name: 'Mohammed Al-Malki' },
  { id: 'rep2', name: 'Abdullah Al-Qahtani' },
  { id: 'rep3', name: 'Khalid Al-Otaibi' },
  { id: 'rep4', name: 'Fahad Al-Harbi' },
  { id: 'rep5', name: 'Omar Al-Ghamdi' }
];

// Status options
const statusOptions = [
  { label: `${t('All')}`, value: '8' },
  { label: `${t('Pending')}`, value: '6' },
  { label: `${t('Closed')}`, value: '5' },
  { label: `${t('Open')}`, value: '4' },
  { label: `${t('Approved')}`, value: '7' }
];

// Updated sample sessions data with more realistic information
const sessions = ref([
  {
    id: 'SES-001',
    salesRep: 'Mohammed Al-Malki',
    sessionDate: '2024-03-20',
    sessionStart: '2024-03-20 08:00:00',
    sessionClose: '2024-03-20 17:00:00',
    cashAmount: 25000.0,
    status: 'IN_APPROVAL',
    hasWarning: false,
    details: {
      cash: 15000.0,
      card: 8000.0,
      bank: 2000.0,
      depositAmount: 25000.0,
      discrepancy: 0.0,
      notes: 'All transactions reconciled. Ready for approval.',
      depositNo: 'DEP-2024-001',
      attachments: ['deposit_slip.pdf', 'daily_summary.pdf']
    }
  },
  {
    id: 'SES-002',
    salesRep: 'Abdullah Al-Qahtani',
    sessionDate: '2024-03-20',
    sessionStart: '2024-03-20 08:30:00',
    sessionClose: null,
    cashAmount: 18500.0,
    status: 'OPEN',
    hasWarning: true,
    details: {
      cash: 12000.0,
      card: 5000.0,
      bank: 1500.0,
      depositAmount: 0.0,
      discrepancy: 0.0,
      notes: 'Session in progress',
      depositNo: '',
      attachments: []
    }
  },
  {
    id: 'SES-003',
    salesRep: 'Khalid Al-Otaibi',
    sessionDate: '2024-03-19',
    sessionStart: '2024-03-19 08:00:00',
    sessionClose: '2024-03-19 17:30:00',
    cashAmount: 32000.0,
    status: 'PENDING',
    hasWarning: true,
    details: {
      cash: 20000.0,
      card: 9000.0,
      bank: 3000.0,
      depositAmount: 32000.0,
      discrepancy: 100.0,
      notes: 'Small discrepancy in cash amount. Needs verification.',
      depositNo: 'DEP-2024-002',
      attachments: ['deposit_slip.pdf']
    }
  },
  {
    id: 'SES-004',
    salesRep: 'Fahad Al-Harbi',
    sessionDate: '2024-03-20',
    sessionStart: '2024-03-20 08:15:00',
    sessionClose: null,
    cashAmount: 15700.0,
    status: 'OPEN',
    hasWarning: false,
    details: {
      cash: 9000.0,
      card: 5200.0,
      bank: 1500.0,
      depositAmount: 0.0,
      discrepancy: 0.0,
      notes: 'Session in progress',
      depositNo: '',
      attachments: []
    }
  },
  {
    id: 'SES-005',
    salesRep: 'Omar Al-Ghamdi',
    sessionDate: '2024-03-19',
    sessionStart: '2024-03-19 08:00:00',
    sessionClose: '2024-03-19 17:00:00',
    cashAmount: 28500.0,
    status: 'IN_APPROVAL',
    hasWarning: false,
    details: {
      cash: 18000.0,
      card: 8500.0,
      bank: 2000.0,
      depositAmount: 28500.0,
      discrepancy: 0.0,
      notes: 'All transactions verified and reconciled.',
      depositNo: 'DEP-2024-003',
      attachments: ['deposit_slip.pdf', 'daily_summary.pdf']
    }
  },
  {
    id: 'SES-006',
    salesRep: 'Mohammed Al-Malki',
    sessionDate: '2024-03-19',
    sessionStart: '2024-03-19 08:00:00',
    sessionClose: '2024-03-19 17:15:00',
    cashAmount: 22000.0,
    status: 'PENDING',
    hasWarning: false,
    details: {
      cash: 14000.0,
      card: 6000.0,
      bank: 2000.0,
      depositAmount: 22000.0,
      discrepancy: 0.0,
      notes: 'Awaiting supervisor review',
      depositNo: 'DEP-2024-004',
      attachments: ['deposit_slip.pdf']
    }
  }
]);

// Filtered sessions
const filteredSessions = computed(() => {
  return sessionStore.sessions;
  // .filter((session) => {
  //     const matchesSalesRep =
  //         selectedSalesReps.value.includes("all") ||
  //         selectedSalesReps.value.includes(session.salesRep);
  //     const matchesStatus =
  //         selectedStatus.value === "all" ||
  //         session.status === selectedStatus.value;
  //     const matchesDate =
  //         (!dateFrom.value || session.sessionDate >= dateFrom.value) &&
  //         (!dateTo.value || session.sessionDate <= dateTo.value);

  //     return matchesSalesRep && matchesStatus && matchesDate;
  // });
});

// Summary calculations
const summary = computed(() => ({
  totalOpen: sessions.value.filter((s) => s.status === 'OPEN').length,
  totalPending: sessions.value.filter((s) => s.status === 'PENDING').length,
  totalAmount: sessions.value.reduce((sum, session) => sum + session.cashAmount, 0),
  oldSessions: sessions.value.filter((s) => {
    const sessionDate = new Date(s.sessionDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - sessionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 1;
  }).length
}));

// Chart data
const chartData = computed(() => ({
  labels: filteredSessions.value.map((session) => session.salesRep),
  datasets: [
    {
      label: 'Cash Amount',
      data: filteredSessions.value.map((session) => session.cashAmount),
      backgroundColor: filteredSessions.value.map((session) => (session.status === 'OPEN' ? '#ef4444' : session.status === 'PENDING' ? '#f59e0b' : '#3b82f6'))
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
      text: 'Sessions by Sales Rep'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Toggle view mode
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'table' ? 'chart' : 'table';
};

// View session details
const viewSessionDetails = (session) => {
  selectedSession.value = session;
  showDetailsDialog.value = true;
};

const Rtl = localStorage.getItem('Rtl') === 'true';
const formatPrice = (price: number | undefined | null): string => {
  return price.toLocaleString(Rtl ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 4:
      return 'bg-red-100 text-red-800';
    case 5:
      return 'bg-yellow-100 text-yellow-800';
    case 6:
      return 'bg-blue-100 text-blue-800';
    case 7:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
// const initializeDateRange = () => {
//   const today = new Date();
//   const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//   dateFrom.value = firstDayOfMonth.toISOString().split('T')[0];
//   dateTo.value = today.toISOString().split('T')[0];
// };

const initializeDateRange = () => {
  var today = new Date();

  let nextday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  dateFrom.value = firstDayOfMonth.toISOString().split('T')[0];
  dateTo.value = nextday.toISOString().split('T')[0];
};

const applyFilters = () => {};
// Initialize date range on component mount
initializeDateRange();
const getSessions = async () => {
  const formData = new FormData();
  formData.append('StatusId', selectedStatus.value == '8' ? '' : selectedStatus.value);
  formData.append('SalesRepId', selectedSalesReps.value);
  formData.append('StartDate', new Date(dateFrom.value).toDateString());
  formData.append('EndDate', new Date(dateTo.value).toDateString());
  await sessionStore.GetSessions(formData);
};
watch(
  [selectedStatus, selectedSalesReps, dateFrom, dateTo],
  () => {
    getSessions();
  },
  { deep: true }
);
onMounted(async () => {
  sessionStore.GetSalesReps().then(() => {
    selectedSalesReps.value = sessionStore.salesReps[0].id;
    getSessions();
  });
});
</script>

<template>
  <div class="lg:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 p-2">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('Session.SessionManagement') }}</h1>
      </div>

      <!-- Filters -->
      <div class="p-2">
        <div class="bg-white row-gap-3 border-round-lg shadow-1 border p-4 mb-4 grid gap-0 w-full align-items-end justify-content-between">
          <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
            <div class="h-full surface-card cursor-pointer">
              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('Session.SalesRepresentatives') }}</label>
                <Dropdown v-model="selectedSalesReps" :options="sessionStore.sessionData.sales" filter optionLabel="name" optionValue="id" placeholder="Select Sales Reps" :maxSelectedLabels="3" class="w-full h-44px" />
              </div>
            </div>
          </div>

          <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
            <div class="h-full surface-card cursor-pointer transition-all transition-duration-200">
              <div class="w-full">
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('Session.FromDate') }}</label>
                <Calendar v-model="dateFrom" showIcon iconDisplay="input" class="w-full h-44px" />
              </div>
            </div>
          </div>

          <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
            <div class="h-full surface-card cursor-pointer">
              <div class="w-full">
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('Session.ToDate') }}</label>
                <Calendar v-model="dateTo" showIcon iconDisplay="input" class="w-full h-44px" />
              </div>
            </div>
          </div>

          <div class="col-12 sm:col-6 lg:col-3 xl:col-2 p-0 sm:px-2 xl:p-2">
            <div class="h-full surface-card cursor-pointer">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"> {{ t('Session.Status') }}</label>
                <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Select a Status" class="w-full h-44px flex" />
              </div>
            </div>
          </div>

          <div class="col-12 xl:col-1 p-0 sm:px-2 xl:p-2">
            <div class="w-full xl:w-fit surface-card cursor-pointer">
              <div class="align-self-end w-full xl:w-fit">
                <Button size="small" icon="pi pi-filter" :label="t('Filter')" class="p-button-outlined w-full xl:w-fit h-44px" @click="applyFilters" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid mb-4 p-2 sm:p-0 row-gap-2">
        <!-- Open Sessions -->
        <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
          <div class="bg-white border-round-lg shadow-1 border-gray-200 border-1 p-4 h-full surface-card">
            <div class="text-sm text-gray-500">{{ t('Session.OpenSessions') }}</div>
            <div class="text-2xl font-bold text-red-600">
              {{ sessionStore.sessionData?.openSession }}
            </div>
          </div>
        </div>

        <!-- Pending Sessions -->
        <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
          <div class="bg-white border-round-lg shadow-1 border-gray-200 border-1 p-4 h-full surface-card">
            <div class="text-sm text-gray-500">{{ t('Session.PendingSessions') }}</div>
            <div class="text-2xl font-bold text-yellow-600">
              {{ sessionStore.sessionData?.pendingSession }}
            </div>
          </div>
        </div>

        <!-- Total Amount -->
        <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
          <div class="bg-white border-round-lg shadow-1 border-gray-200 border-1 p-4 h-full surface-card">
            <div class="text-sm text-gray-500">{{ t('Session.TotalAmount') }}</div>
            <div class="text-2xl font-bold text-gray-900">{{ formatPrice(Number(sessionStore.sessionData?.totalAmount)) }}</div>
          </div>
        </div>

        <!-- Old Sessions -->
        <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
          <div class="bg-white border-round-lg shadow-1 border-gray-200 border-1 p-4 h-full surface-card">
            <div class="text-sm text-gray-500">{{ t('Session.OldSessions') }}</div>
            <div class="text-2xl font-bold text-red-600">
              {{ sessionStore.sessionData?.oldSession }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sessions View -->
      <div class="p-2">
        <div class="bg-white border-round-lg shadow-1 border-1 border-gray-200 overflow-hidden">
          <!-- View Toggle Header -->
          <div class="p-4 border-b flex align-items-center justify-content-between">
            <span class="text-xl font-medium"> {{ t('Sessions') }}</span>
            <div class="flex items-center space-x-2">
              <Button @click="toggleViewMode" class="p-1 rounded-lg hover:bg-gray-100 transition-colors" size="large" text :icon="viewMode === 'chart' ? 'pi pi-table' : 'pi pi-chart-bar'"> </Button>
            </div>
          </div>

          <!-- Chart View -->
          <div v-if="viewMode === 'chart'" class="p-6">
            <div class="h-30rem">
              <Bar :data="chartData" :options="chartOptions" />
            </div>
          </div>

          <DataTable
            class="surface-card border-round-lg shadow-1 border-1 surface-border"
            v-else
            :value="filteredSessions"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 25]"
            dataKey="id"
            :globalFilterFields="['name', 'id']"
            :currentPageReportTemplate="''"
          >
            <template #empty>
              <div class="flex justify-content-center align-items-center font-bold text-lg">
                {{ t('Session.empty') }}
              </div>
            </template>
            <Column field="salesRep" class="" :sortable="true">
              <template #header>
                <span class="text-lg font-bold"> {{ t('Session.SalesRep') }}</span>
              </template>

              <template #body="slotProps">
                <div class="font-semibold flex text-lg">{{ slotProps.data.saleName }}</div>
              </template>
            </Column>
            <Column field="sessionStartDate" class="">
              <template #header>
                <span class="text-lg font-bold"> {{ t('Session.SessionDate') }} </span>
              </template>
              <template #body="slotProps">
                <span class="text-md flex">{{ slotProps.data.sessionStartDate }}</span>
              </template>
            </Column>
            <Column field="cashAmount" class="">
              <template #header>
                <span class="text-lg flex font-bold"> {{ t('Session.CashAmount') }} </span>
              </template>

              <template #body="slotProps">
                <div class="text-md flex">{{ slotProps.data.allAmount }}</div>
              </template>
            </Column>
            <Column field="Credit Limit" class="" :sortable="true">
              <template #header>
                <span class="text-lg flex font-bold"> {{ t('Status') }} </span>
              </template>

              <template #body="slotProps">
                <span class="px-2 py-1 flex w-fit text-xs border-round-3xl" :class="getStatusColor(slotProps.data.statusId)">
                  {{ slotProps.data.statusName }}
                </span>
              </template>
            </Column>
            <Column field="isSessionLate" :header="t('Warning')" class="text-center">
              <template #body="slotProps">
                <icon v-if="slotProps.data.isSessionLate" class="pi flex pi-exclamation-triangle text-red-500"></icon>
              </template>
            </Column>
            <Column field="statusName" :header="t('Status')" class="">
              <template #body="slotProps">
                <Button @click="viewSessionDetails(slotProps.data)" class="p-2 hover:bg-gray-100 rounded-full" size="large" text icon="pi pi-eye" title="View Details"> </Button>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <!-- Session Details Dialog -->
      <SessionDetailsDialog v-if="showDetailsDialog" v-model:visible="showDetailsDialog" :session="selectedSession" @close="showDetailsDialog = false" />
    </div>
  </div>
</template>

<style scoped>
.h-44px {
  height: 44px !important;
}
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

/* Checkbox styles */
input[type='checkbox'] {
  cursor: pointer;
}

input[type='checkbox']:checked {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* Date input styles */
input[type='date'] {
  min-height: 42px;
}

/* Dialog animation */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

.grid {
  margin-right: 0rem;
  margin-left: 0rem;
  margin-top: 0rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
