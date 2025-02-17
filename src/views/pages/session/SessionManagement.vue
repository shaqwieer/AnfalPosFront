<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import SessionDetailsDialog from './SessionDetailsDialog.vue';
import { useSessionStore } from '../../../stores/sessionStore';
import { useDebounceFn } from '@vueuse/core';
import Chart from 'primevue/chart';
import { useI18n } from 'vue-i18n';
import MultiSelect from 'primevue/multiselect';
import { useToast } from 'primevue/usetoast';
const { t } = useI18n();
const toast = useToast();

// Filter states
const selectedSalesReps = ref<string[] | null>(null);
const dateTo = ref();
const dateFrom = ref();
const selectedStatus = ref<string[]>(['4', '5', '6', '7']);
const showDetailsDialog = ref<boolean>(false);
const selectedSession = ref();
const changedFilter = ref<boolean>(false);
// const viewMode = (ref < 'table') | ('chart' > 'table');
const viewMode = ref('table');
const sessionStore = useSessionStore();
// Status options
const statusOptions = [
  // { label: `${t('All')}`, value: '8', color: '#FF5733' },
  { label: `${t('Open')}`, value: '4', color: '#188A42' },
  { label: `${t('Closed')}`, value: '5', color: '#FA7B00' },
  { label: `${t('Pending')}`, value: '6', color: '#BC4819' },
  { label: `${t('Approved')}`, value: '7', color: '#3357FF' }
];
// Chart data
const getCashPerSalesRep = computed(() => {
  const statusMap = Object.fromEntries(statusOptions.map(({ label, value, color }) => [parseInt(value), { label, color }]));
  const statusCountObj = sessionStore.sessions.reduce((acc, { statusId }) => {
    const { label, color } = statusMap[statusId] || { label: `Unknown (${statusId})`, color: '#FF5733' };
    acc[label] = acc[label] || { statusName: label, sessionCount: 0, color };
    acc[label].sessionCount += 1;
    return acc;
  }, {});
  return statusOptions.map(({ label, color }) => ({
    statusName: label,
    sessionCount: statusCountObj[label]?.sessionCount || 0, // Default to 0 if no data
    color: color
  }));
});

const chartData = computed(() => ({
  labels: getCashPerSalesRep.value.map((rep) => rep.statusName),
  datasets: [
    {
      label: 'Sessions',
      data: getCashPerSalesRep.value.map((rep) => rep.sessionCount),
      backgroundColor: getCashPerSalesRep.value.map((rep) => rep.color)
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
      text: 'Sessions for Sales Rep'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
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
  return (
    price?.toLocaleString(Rtl ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0.00'
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 4:
      return 'bg-blue-100 text-blue-800';
    case 5:
      return 'bg-yellow-100 text-yellow-800';
    case 6:
      return 'bg-orange-100 text-orange-800';
    case 7:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
const getRowClass = (data) => {
  return data.isSessionLate ? 'bg-red-100' : '';
};

const applyFilters = () => {
  getSessions();
};
const getSessions = useDebounceFn(
  async () => {
    const formData = new FormData();
    if (selectedSalesReps.value.length === 0 || selectedStatus.value.length === 0) {
      toast.add({ severity: 'error', detail: 'برجاء اختيار حالة ومندوب', life: 3000 });
      changedFilter.value = false;
      return;
    }
    selectedStatus.value.forEach((element, index) => {
      formData.append(`StatusIds[${index}]`, element);
    });
    selectedSalesReps.value.forEach((element, index) => {
      formData.append(`SalesRepIds[${index}]`, element);
    });
    formData.append('StartDate', new Date(dateFrom.value).toDateString());
    formData.append('EndDate', new Date(dateTo.value).toDateString());

    await sessionStore.GetSessions(formData);
    changedFilter.value = false;
  },
  300,
  { maxWait: 1500 }
);

watch(
  [selectedStatus, selectedSalesReps, dateFrom, dateTo],
  () => {
    changedFilter.value = true;
  },
  { deep: true }
);
onMounted(() => {
  sessionStore.GetSalesReps().then(() => {
    selectedSalesReps.value = sessionStore.salesReps.map((rep) => rep.id);
    getSessions();
  });
  const currentDate = new Date();
  dateTo.value = new Date(currentDate.toISOString());
  const pastDate = new Date();
  pastDate.setDate(currentDate.getDate() - 7);
  dateFrom.value = new Date(pastDate.toISOString());
});
</script>

<template>
  <div class="">
    <div class="max-w-7xl mx-auto">
      <!-- Filters -->
      <div class="px-3">
        <div class="bg-white row-gap-3 border-round-lg border-1 border-gray-300 p-4 grid gap-0 w-full align-items-end justify-content-between">
          <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
            <div class="h-full surface-card cursor-pointer">
              <div class="relative">
                <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('Session.SalesRepresentatives') }}</label>
                <MultiSelect v-model="selectedSalesReps" :options="sessionStore.salesReps" filter optionLabel="name" optionValue="id" placeholder="Select Sales Reps" :maxSelectedLabels="3" class="w-full h-3rem" />
              </div>
            </div>
          </div>

          <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
            <div class="h-full surface-card cursor-pointer transition-all transition-duration-200">
              <div class="w-full">
                <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('Session.FromDate') }}</label>
                <Calendar v-model="dateFrom" showIcon iconDisplay="input" class="w-full h-3rem" />
              </div>
            </div>
          </div>

          <div class="col-12 sm:col-6 lg:col-3 xl:col-3 p-0 sm:px-2 xl:p-2">
            <div class="h-full surface-card cursor-pointer">
              <div class="w-full">
                <label class="block text-sm font-semibold text-gray-700 mb-1">{{ t('Session.ToDate') }}</label>
                <Calendar v-model="dateTo" showIcon iconDisplay="input" class="w-full h-3rem" />
              </div>
            </div>
          </div>

          <div class="col-12 sm:col-6 lg:col-3 xl:col-2 p-0 sm:px-2 xl:p-2">
            <div class="h-full surface-card cursor-pointer">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"> {{ t('Session.Status') }}</label>
                <MultiSelect v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Select a Status" class="w-full h-3rem flex" />
              </div>
            </div>
          </div>

          <div class="col-12 xl:col-1 p-0 sm:px-2 xl:p-2">
            <div class="w-full xl:w-fit surface-card cursor-pointer">
              <div class="align-self-end w-full xl:w-fit">
                <Button size="small" icon="pi pi-filter" :label="t('Filter')" :disabled="!changedFilter" class="w-full xl:w-fit h-3rem" @click="applyFilters" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid p-2">
        <!-- Open Sessions -->
        <div class="col-12 md:col-12 lg:col-4 xl:col-3 xl:p-2">
          <div class="bg-blue-50 border-round-lg shadow-1 border-blue-200 border-1 pl-4 pt-4 pr-3 pb-3 h-full flex flex-row justify-content-between">
            <div>
              <div class="text-md font-medium text-blue-500">{{ t('Session.OpenSessions') }}</div>
              <div class="text-3xl font-bold text-blue-500">
                {{ sessionStore.sessionData?.openSession }}
              </div>
            </div>
            <div class="flex flex-column w-6 justify-content-end">
              <div className="flex align-items-center justify-content-between">
                <div className="flex align-items-center gap-2">
                  <i class="pi pi-check-circle text-green-600 text-lg" />
                  <span className="text-green-600 font-semibold text-lg">On Track</span>
                </div>
                <span className="font-semibold text-green-600 text-lg">{{ sessionStore.sessionData?.openSession - sessionStore.sessionData?.oldSession }}</span>
              </div>
              <div className="flex align-items-center justify-content-between">
                <div className="flex align-items-center gap-2">
                  <i class="pi pi-exclamation-circle text-orange-500 text-lg" />
                  <span className="text-orange-500 text-lg font-semibold">Late</span>
                </div>
                <span className="font-semibold text-orange-500 text-lg">{{ sessionStore.sessionData?.oldSession }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-4 xl:col-2 xl:p-2">
          <div class="bg-yellow-50 border-round-lg shadow-1 border-yellow-200 border-1 p-4 h-full">
            <div class="text-md font-medium text-yellow-600">{{ 'Closed Sessions' }}</div>
            <div class="text-3xl font-bold text-yellow-600">
              {{ sessionStore.sessionData?.closedSession }}
            </div>
          </div>
        </div>

        <!-- Pending Sessions -->

        <div class="col-12 md:col-6 lg:col-4 xl:col-2 xl:p-2">
          <div class="bg-orange-50 border-round-lg shadow-1 border-orange-200 border-1 p-4 h-full">
            <div class="text-md font-medium text-orange-600">{{ t('Session.PendingSessions') }}</div>
            <div class="text-3xl font-bold text-orange-600">
              {{ sessionStore.sessionData?.pendingSession }}
            </div>
          </div>
        </div>

        <!-- Old Sessions -->

        <div class="col-12 md:col-6 lg:col-6 xl:col-2 xl:p-2">
          <div class="bg-green-50 border-round-lg border-green-400 border-1 p-4 h-full">
            <div class="text-md font-medium text-green-600">{{ 'Approved Sessions' }}</div>
            <div class="text-3xl font-bold text-green-700">
              {{ sessionStore.sessionData?.approvedSession }}
            </div>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-6 xl:col-3 xl:p-2">
          <div class="bg-purple-50 border-round-lg shadow-1 border-purple-200 border-1 p-4 h-full">
            <div class="text-md font-medium text-purple-500">{{ t('Session.TotalAmount') }}</div>
            <div class="text-3xl font-bold text-purple-500">{{ formatPrice(Number(sessionStore.sessionData?.totalAmount)) }}</div>
          </div>
        </div>
      </div>
      <!-- Sessions View -->

      <div class="bg-white border-round-lg border-1 border-gray-300 overflow-hidden mx-3">
        <!-- View Toggle Header -->
        <div class="p-4 border-b flex align-items-center justify-content-between">
          <span class="text-xl font-medium"> {{ t('Sessions') }}</span>
          <div class="flex items-center space-x-2">
            <Button @click="toggleViewMode" class="p-1 rounded-lg hover:bg-gray-100 transition-colors" size="large" text :icon="viewMode === 'chart' ? 'pi pi-table' : 'pi pi-chart-bar'"> </Button>
          </div>
        </div>
        <!-- Chart View -->
        <div v-if="viewMode === 'chart'" class="px-6">
          <div class="h-27rem">
            <Chart type="bar" class="h-full" :data="chartData" :options="chartOptions" />
          </div>
        </div>
        <DataTable
          class="surface-card border-round-lg shadow-1 border-1 surface-border"
          v-else
          :value="sessionStore.sessions"
          :paginator="true"
          :rows="5"
          :rowsPerPageOptions="[5, 10, 25]"
          dataKey="id"
          :globalFilterFields="['name', 'id']"
          :currentPageReportTemplate="''"
          :rowClass="getRowClass"
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
              <div class="flex text-lg">{{ slotProps.data.saleName }}</div>
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
              <div class="text-md font-semibold flex">{{ formatPrice(slotProps.data.allAmount) }}</div>
            </template>
          </Column>
          <Column field="Credit Limit" class="" :sortable="true">
            <template #header>
              <span class="text-lg flex font-bold"> {{ t('Status') }} </span>
            </template>

            <template #body="slotProps">
              <span class="px-2 py-1 flex w-fit text-sm font-semibold border-round-xl" :class="getStatusColor(slotProps.data.statusId)">
                {{ slotProps.data.statusName }}
              </span>
            </template>
          </Column>
          <Column field="isSessionLate" :header="'Late Session'" headerClass="" class="w-12rem">
            <template #body="slotProps">
              <div class="flex align-items-center justify-content-center text-center w-5rem">
                <i v-if="slotProps.data.isSessionLate" class="pi flex pi-exclamation-triangle text-red-500 text-center text-2xl" />
                <!-- <i v-else class="pi flex pi-check-circle text-green-500 text-center text-2xl" /> -->
              </div>
            </template>
          </Column>
          <Column field="statusName" :header="t('Actions')" class="w-8rem">
            <template #body="slotProps">
              <Button @click="viewSessionDetails(slotProps.data)" class="p-1 hover:bg-gray-100 rounded-full" size="large" text r icon="pi pi-eye" title="View Details"> </Button>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Session Details Dialog -->
    <SessionDetailsDialog v-if="showDetailsDialog" v-model:visible="showDetailsDialog" :session="selectedSession" @close="showDetailsDialog = false" />
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
