<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SessionDetailsDialog from './SessionDetailsDialog.vue';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Filter states
const selectedSalesReps = ref(['all']);
const dateFrom = ref('');
const dateTo = ref('');
const selectedStatus = ref('all');
const isDropdownOpen = ref(false);
const showDetailsDialog = ref(false);
const selectedSession = ref(null);
const viewMode = ref<'table' | 'chart'>('table');

// Available sales reps
const salesReps = [
  { id: 'all', name: 'All Sales Reps' },
  { id: 'rep1', name: 'Mohammed Al-Malki' },
  { id: 'rep2', name: 'Abdullah Al-Qahtani' },
  { id: 'rep3', name: 'Khalid Al-Otaibi' },
  { id: 'rep4', name: 'Fahad Al-Harbi' },
  { id: 'rep5', name: 'Omar Al-Ghamdi' }
];

// Status options
const statusOptions = [
  { id: 'all', name: 'All Status' },
  { id: 'OPEN', name: 'Open' },
  { id: 'PENDING', name: 'Pending' },
  { id: 'IN_APPROVAL', name: 'In Approval' }
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
  return sessions.value;
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
const viewSessionDetails = (session: any) => {
  selectedSession.value = session;
  showDetailsDialog.value = true;
};

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'bg-red-100 text-red-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'IN_APPROVAL':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Watch for 'all' selection
watch(
  selectedSalesReps,
  (newValue) => {
    if (newValue.includes('all') && newValue.length > 1) {
      selectedSalesReps.value = ['all'];
    } else if (newValue.length === 0) {
      selectedSalesReps.value = ['all'];
    } else if (!newValue.includes('all') && newValue.length === salesReps.length - 1) {
      selectedSalesReps.value = ['all'];
    }
  },
  { deep: true }
);

// Handle individual selection
const handleSalesRepSelection = (repId: string) => {
  if (repId === 'all') {
    selectedSalesReps.value = ['all'];
  } else {
    if (selectedSalesReps.value.includes('all')) {
      selectedSalesReps.value = [repId];
    } else {
      const index = selectedSalesReps.value.indexOf(repId);
      if (index === -1) {
        selectedSalesReps.value.push(repId);
      } else {
        selectedSalesReps.value.splice(index, 1);
      }
    }
  }
};

// Initialize with current date range
const initializeDateRange = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  dateFrom.value = firstDayOfMonth.toISOString().split('T')[0];
  dateTo.value = today.toISOString().split('T')[0];
};

// Initialize date range on component mount
initializeDateRange();
</script>

<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Session Management</h1>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Sales Rep Multi-select Dropdown -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Sales Representatives</label>
            <div class="relative">
              <button @click="toggleDropdown" class="w-full bg-white border rounded-lg px-4 py-2 text-left flex items-center justify-between">
                <span class="truncate">
                  {{ selectedSalesReps.includes('all') ? 'All Sales Reps' : selectedSalesReps.length + ' Selected' }}
                </span>
                <span class="material-icons text-gray-400 text-xl">
                  {{ isDropdownOpen ? 'expand_less' : 'expand_more' }}
                </span>
              </button>

              <!-- Dropdown Menu -->
              <div v-if="isDropdownOpen" class="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                <div class="py-1 max-h-60 overflow-auto">
                  <label v-for="rep in salesReps" :key="rep.id" class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" :checked="selectedSalesReps.includes(rep.id)" @change="handleSalesRepSelection(rep.id)" class="h-4 w-4 text-blue-600 rounded border-gray-300" />
                    <span class="ml-3 text-gray-700">{{ rep.name }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input type="date" v-model="dateFrom" class="w-full rounded-lg border-gray-300" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input type="date" v-model="dateTo" :min="dateFrom" class="w-full rounded-lg border-gray-300" />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="selectedStatus" class="w-full rounded-lg border-gray-300">
              <option v-for="status in statusOptions" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <!-- Open Sessions -->
        <div class="bg-white border-round-lg shadow-sm border-1 p-4">
          <div class="text-sm text-gray-500">Open Sessions</div>
          <div class="text-2xl font-bold text-red-600">
            {{ filteredSessions.filter((s) => s.status === 'OPEN').length }}
          </div>
        </div>

        <!-- Pending Sessions -->
        <div class="bg-white border-round-lg shadow-sm border-1 p-4">
          <div class="text-sm text-gray-500">Pending Sessions</div>
          <div class="text-2xl font-bold text-yellow-600">
            {{ filteredSessions.filter((s) => s.status === 'PENDING').length }}
          </div>
        </div>

        <!-- Total Amount -->
        <div class="bg-white border-round-lg shadow-sm border-1 p-4">
          <div class="text-sm text-gray-500">Total Amount</div>
          <div class="text-2xl font-bold text-gray-900">
            {{ formatPrice(filteredSessions.reduce((sum, session) => sum + session.cashAmount, 0)) }}
          </div>
        </div>

        <!-- Old Sessions -->
        <div class="bg-white border-round-lg shadow-sm border-1 p-4">
          <div class="text-sm text-gray-500">Old Sessions (>1 day)</div>
          <div class="text-2xl font-bold text-red-600">
            {{
              filteredSessions.filter((s) => {
                const sessionDate = new Date(s.sessionDate);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - sessionDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 1;
              }).length
            }}
          </div>
        </div>
      </div>

      <!-- Sessions View -->
      <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <!-- View Toggle Header -->
        <div class="p-4 border-b flex items-center justify-between">
          <h2 class="text-lg font-medium">Sessions</h2>
          <div class="flex items-center space-x-2">
            <button @click="toggleViewMode" class="p-2 rounded-lg hover:bg-gray-100 transition-colors" :title="viewMode === 'table' ? 'Switch to Chart View' : 'Switch to Table View'">
              <span class="material-icons">
                {{ viewMode === 'table' ? 'bar_chart' : 'table_rows' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Chart View -->
        <div v-if="viewMode === 'chart'" class="p-6">
          <div class="h-[400px]">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Table View -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Rep</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session Date</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cash Amount</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Warning</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="session in filteredSessions" :key="session.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ session.salesRep }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ session.sessionDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  {{ formatPrice(session.cashAmount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span class="px-2 py-1 text-xs rounded-full" :class="getStatusColor(session.status)">
                    {{ session.status === 'IN_APPROVAL' ? 'In Approval' : session.status === 'OPEN' ? 'Open' : session.status === 'PENDING' ? 'Pending' : session.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span v-if="session.hasWarning" class="material-icons text-red-500" title="Session requires attention"> warning </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button @click="viewSessionDetails(session)" class="p-2 hover:bg-gray-100 rounded-full" title="View Details">
                    <span class="material-icons text-blue-600">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Session Details Dialog -->
      <SessionDetailsDialog :show="showDetailsDialog" :session="selectedSession" @close="showDetailsDialog = false" />
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
