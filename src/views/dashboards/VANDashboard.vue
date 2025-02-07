<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import KPICards from './components/KPICards.vue';
import VisitsDetails from './components/details/VisitsDetails.vue';
import SalesDetails from './components/details/SalesDetails.vue';
import CollectionsDetails from './components/details/CollectionsDetails.vue';
import SessionsDetails from './components/details/SessionsDetails.vue';
import OverdueDetails from './components/details/OverdueDetails.vue';
import StockDetails from './components/details/StockDetails.vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const totalSalesReps = ref(0);

// Add new ref for filter values
const filterValues = ref({
  salesReps: ['all'],
  dateFrom: '',
  dateTo: ''
});

// Change selectedSalesReps to use a regular array initial value
const selectedSalesReps = ref<string[]>(['all']);
const dateFrom = ref('');
const dateTo = ref('');

// Add new ref for dropdown state
const isDropdownOpen = ref(false);

// Function to toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Function to close dropdown when clicking outside
const closeDropdown = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.sales-rep-dropdown')) {
    isDropdownOpen.value = false;
  }
};

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

// Available sales reps
const availableSalesReps = [
  { id: 'all', name: `${t('dashboard.AllSalesReps')}` },
  { id: 'rep1', name: 'Mohammed Al-Malki' },
  { id: 'rep2', name: 'Abdullah Al-Qahtani' },
  { id: 'rep3', name: 'Khalid Al-Otaibi' },
  { id: 'rep4', name: 'Fahad Al-Harbi' }
];

// Watch for 'all' selection - FIXED to prevent recursion
watch(
  selectedSalesReps,
  (newValue) => {
    if (newValue.includes('all') && newValue.length > 1) {
      // If 'all' is selected along with other options, only keep 'all'
      selectedSalesReps.value = ['all'];
    } else if (newValue.length === 0) {
      // If nothing is selected, default to 'all'
      selectedSalesReps.value = ['all'];
    } else if (!newValue.includes('all') && newValue.length === availableSalesReps.length - 1) {
      // If all individual reps are selected, switch to 'all'
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
    // Remove 'all' if it's currently selected
    if (selectedSalesReps.value.includes('all')) {
      selectedSalesReps.value = [repId];
    } else {
      // Toggle the selection of the individual rep
      const index = selectedSalesReps.value.indexOf(repId);
      if (index === -1) {
        selectedSalesReps.value.push(repId);
      } else {
        selectedSalesReps.value.splice(index, 1);
      }
    }
  }
};

// Add function to handle search
const handleSearch = () => {
  selectedSalesReps.value = [...filterValues.value.salesReps];
  dateFrom.value = filterValues.value.dateFrom;
  dateTo.value = filterValues.value.dateTo;
};

// Sample data for yesterday
const yesterdayData = ref({
  visits: 45,
  sales: 25000,
  collections: {
    cash: 15000,
    visa: 8000,
    bank: 2000
  },
  openSessions: 5000
});

// Sample data for today
const todayData = ref({
  plannedVisits: 150,
  completedVisits: 112,
  productiveVisits: 98,
  sales: 185000,
  targetSales: 220000,
  salesBreakdown: {
    byCategory: [
      { category: 'Engine Oil', amount: 85000, target: 100000 },
      { category: 'Gear Oil', amount: 45000, target: 55000 },
      { category: 'Brake Fluid', amount: 35000, target: 40000 },
      { category: 'Coolant', amount: 20000, target: 25000 }
    ],
    byRegion: [
      { region: 'Riyadh North', amount: 75000, target: 90000 },
      { region: 'Riyadh South', amount: 55000, target: 65000 },
      { region: 'Riyadh East', amount: 35000, target: 40000 },
      { region: 'Riyadh West', amount: 20000, target: 25000 }
    ]
  },
  collections: {
    cash: 120000,
    visa: 50000,
    bank: 15000
  },
  openSessions: 80000,
  overdue: {
    days30: 150000,
    days60: 80000,
    days90plus: 50000
  }
});

// Sample sales reps data with 10 reps
const salesReps = ref([
  {
    id: 'rep1',
    name: 'Mohammed Al-Malki',
    plannedVisits: 18,
    completedVisits: 15,
    productiveVisits: 13,
    sales: 25000,
    collections: 22000,
    openSessions: 3000
  }
  // ... other sales reps data
]);

// Card details data
const cardDetails = ref({
  visits: {
    summary: {
      totalPlanned: todayData.value.plannedVisits,
      totalCompleted: todayData.value.completedVisits,
      totalProductive: todayData.value.productiveVisits,
      avgDuration: 45, // minutes
      conversionRate: 85 // percentage
    },
    salesReps: [
      {
        name: 'Mohammed Al-Malki',
        planned: 18,
        completed: 15,
        productive: 13,
        avgDuration: 42,
        conversionRate: 87,
        visitDetails: [
          { customer: 'Al-Futtaim Auto Services', time: '09:00', status: 'completed', duration: 45, result: 'order' },
          { customer: 'Quick Service Center', time: '10:15', status: 'completed', duration: 35, result: 'order' },
          { customer: 'Premium Auto Care', time: '11:30', status: 'completed', duration: 40, result: 'no-order' },
          { customer: 'Auto Zone Services', time: '14:00', status: 'in-progress', duration: 0, result: 'pending' },
          { customer: 'Car Care Center', time: '15:30', status: 'planned', duration: 0, result: 'pending' }
        ]
      },
      {
        name: 'Abdullah Al-Qahtani',
        planned: 15,
        completed: 12,
        productive: 10,
        avgDuration: 38,
        conversionRate: 83,
        visitDetails: [
          { customer: 'Elite Auto Service', time: '09:30', status: 'completed', duration: 40, result: 'order' },
          { customer: 'Master Mechanics', time: '10:45', status: 'completed', duration: 35, result: 'order' },
          { customer: 'Pro Auto Care', time: '13:00', status: 'completed', duration: 30, result: 'no-order' },
          { customer: 'Speed Auto Center', time: '14:30', status: 'in-progress', duration: 0, result: 'pending' }
        ]
      },
      {
        name: 'Khalid Al-Otaibi',
        planned: 16,
        completed: 14,
        productive: 12,
        avgDuration: 41,
        conversionRate: 86,
        visitDetails: [
          { customer: 'Royal Auto Care', time: '08:30', status: 'completed', duration: 45, result: 'order' },
          { customer: 'Star Auto Service', time: '10:00', status: 'completed', duration: 40, result: 'order' },
          { customer: 'Premier Auto Center', time: '11:15', status: 'completed', duration: 35, result: 'order' },
          { customer: 'Golden Auto Care', time: '14:00', status: 'in-progress', duration: 0, result: 'pending' }
        ]
      },
      {
        name: 'Fahad Al-Harbi',
        planned: 14,
        completed: 11,
        productive: 9,
        avgDuration: 39,
        conversionRate: 82,
        visitDetails: [
          { customer: 'Diamond Auto Service', time: '09:15', status: 'completed', duration: 40, result: 'order' },
          { customer: 'Crown Auto Care', time: '10:30', status: 'completed', duration: 35, result: 'no-order' },
          { customer: 'Expert Auto Center', time: '13:30', status: 'completed', duration: 30, result: 'order' },
          { customer: 'Supreme Auto Service', time: '15:00', status: 'planned', duration: 0, result: 'pending' }
        ]
      }
    ],
    performance: {
      hourly: [
        { hour: '08:00', completed: 5, productive: 4 },
        { hour: '09:00', completed: 8, productive: 7 },
        { hour: '10:00', completed: 10, productive: 8 },
        { hour: '11:00', completed: 7, productive: 6 },
        { hour: '12:00', completed: 4, productive: 3 },
        { hour: '13:00', completed: 6, productive: 5 },
        { hour: '14:00', completed: 8, productive: 7 },
        { hour: '15:00', completed: 5, productive: 4 }
      ],
      byRegion: [
        { region: 'Riyadh North', planned: 45, completed: 38, productive: 32 },
        { region: 'Riyadh South', planned: 35, completed: 28, productive: 24 },
        { region: 'Riyadh East', planned: 40, completed: 32, productive: 28 },
        { region: 'Riyadh West', planned: 30, completed: 24, productive: 20 }
      ]
    }
  },
  sales: {
    summary: {
      totalSales: 185000,
      totalOrders: 145,
      avgOrderValue: 1275.86,
      targetAchievement: 84.1, // percentage
      topCategories: [
        { name: 'Engine Oil', sales: 85000, target: 100000, growth: 12 },
        { name: 'Gear Oil', sales: 45000, target: 55000, growth: 8 },
        { name: 'Brake Fluid', sales: 35000, target: 40000, growth: -3 },
        { name: 'Coolant', sales: 20000, target: 25000, growth: 15 }
      ]
    },
    salesReps: [
      {
        name: 'Mohammed Al-Malki',
        orders: 42,
        totalSales: 55000,
        target: 65000,
        achievement: 84.6,
        avgOrderValue: 1309.52,
        topProducts: [
          { name: 'ADNOC VOYAGER ULTRA 5W-40', quantity: 180, value: 21600 },
          { name: 'ADNOC VOYAGER PLUS 10W-30', quantity: 150, value: 12750 }
        ],
        hourlyPerformance: [
          { hour: '08:00', orders: 5, value: 6500 },
          { hour: '09:00', orders: 8, value: 10400 },
          { hour: '10:00', orders: 10, value: 13000 },
          { hour: '11:00', orders: 7, value: 9100 },
          { hour: '12:00', orders: 4, value: 5200 },
          { hour: '13:00', orders: 6, value: 7800 },
          { hour: '14:00', orders: 8, value: 10400 },
          { hour: '15:00', orders: 5, value: 6500 }
        ]
      },
      {
        name: 'Abdullah Al-Qahtani',
        orders: 35,
        totalSales: 42000,
        target: 50000,
        achievement: 84,
        avgOrderValue: 1200,
        topProducts: [
          { name: 'ADNOC VOYAGER ULTRA 5W-40', quantity: 150, value: 18000 },
          { name: 'ADNOC GEAR OIL EP 80W-90', quantity: 120, value: 10200 }
        ],
        hourlyPerformance: [
          { hour: '08:00', orders: 4, value: 4800 },
          { hour: '09:00', orders: 6, value: 7200 },
          { hour: '10:00', orders: 8, value: 9600 },
          { hour: '11:00', orders: 5, value: 6000 },
          { hour: '12:00', orders: 3, value: 3600 },
          { hour: '13:00', orders: 5, value: 6000 },
          { hour: '14:00', orders: 7, value: 8400 },
          { hour: '15:00', orders: 4, value: 4800 }
        ]
      },
      {
        name: 'Khalid Al-Otaibi',
        orders: 38,
        totalSales: 48000,
        target: 55000,
        achievement: 87.3,
        avgOrderValue: 1263.16,
        topProducts: [
          { name: 'ADNOC VOYAGER ULTRA 5W-40', quantity: 160, value: 19200 },
          { name: 'ADNOC VOYAGER PLUS 10W-30', quantity: 140, value: 11900 }
        ],
        hourlyPerformance: [
          { hour: '08:00', orders: 5, value: 6300 },
          { hour: '09:00', orders: 7, value: 8800 },
          { hour: '10:00', orders: 9, value: 11400 },
          { hour: '11:00', orders: 6, value: 7600 },
          { hour: '12:00', orders: 4, value: 5000 },
          { hour: '13:00', orders: 5, value: 6300 },
          { hour: '14:00', orders: 8, value: 10100 },
          { hour: '15:00', orders: 5, value: 6300 }
        ]
      },
      {
        name: 'Fahad Al-Harbi',
        orders: 30,
        totalSales: 40000,
        target: 50000,
        achievement: 80,
        avgOrderValue: 1333.33,
        topProducts: [
          { name: 'ADNOC VOYAGER ULTRA 5W-40', quantity: 140, value: 16800 },
          { name: 'ADNOC GEAR OIL EP 80W-90', quantity: 110, value: 9350 }
        ],
        hourlyPerformance: [
          { hour: '08:00', orders: 3, value: 4000 },
          { hour: '09:00', orders: 5, value: 6700 },
          { hour: '10:00', orders: 7, value: 9300 },
          { hour: '11:00', orders: 4, value: 5300 },
          { hour: '12:00', orders: 3, value: 4000 },
          { hour: '13:00', orders: 4, value: 5300 },
          { hour: '14:00', orders: 6, value: 8000 },
          { hour: '15:00', orders: 3, value: 4000 }
        ]
      }
    ],
    performance: {
      hourly: [
        { hour: '08:00', orders: 17, value: 21600 },
        { hour: '09:00', orders: 26, value: 33100 },
        { hour: '10:00', orders: 34, value: 43300 },
        { hour: '11:00', orders: 22, value: 28000 },
        { hour: '12:00', orders: 14, value: 17800 },
        { hour: '13:00', orders: 20, value: 25400 },
        { hour: '14:00', orders: 29, value: 36900 },
        { hour: '15:00', orders: 17, value: 21600 }
      ],
      byRegion: [
        { region: 'Riyadh North', orders: 65, value: 82000, target: 95000 },
        { region: 'Riyadh South', orders: 45, value: 57000, target: 65000 },
        { region: 'Riyadh East', orders: 35, value: 44000, target: 50000 },
        { region: 'Riyadh West', orders: 25, value: 32000, target: 40000 }
      ]
    }
  }
});

// Selected card and view mode state
const selectedCard = ref<string | null>(null);
const viewMode = ref<'chart' | 'table'>('chart');

// Handle card selection
const handleCardSelect = (cardType: string | null) => {
  selectedCard.value = cardType;
};

// Toggle view mode
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'chart' ? 'table' : 'chart';
};

// Update filteredData to use selectedSalesReps array
const filteredData = computed(() => {
  let data = { ...todayData.value };

  // Filter by sales reps if not "all" selected
  if (!selectedSalesReps.value.includes('all')) {
    // Apply sales rep filtering logic here
    // This is a placeholder for actual filtering logic
  }

  // Filter by date range
  if (dateFrom.value && dateTo.value) {
    // Apply date range filtering logic here
    // This is a placeholder for actual filtering logic
  }

  return data;
});

// Initialize with current date range
const initializeDateRange = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  filterValues.value.dateFrom = firstDayOfMonth.toISOString().split('T')[0];
  filterValues.value.dateTo = today.toISOString().split('T')[0];

  // Initialize actual filter values
  dateFrom.value = filterValues.value.dateFrom;
  dateTo.value = filterValues.value.dateTo;
};

// Initialize date range on component mount
initializeDateRange();

const Rtl = localStorage.getItem('Rtl');

const DetailsSectionTitle = computed(() => {
  // return `${Rtl.value ?  : (selectedCard.value.charAt(0).toUpperCase() + selectedCard.value.slice(1) )}${} 'Details'`;
  return 'test  ';
});
</script>

<template>
  <div class="">
    <div class="max-w-7xl mx-auto">
      <!-- Header with Filters -->
      <div class="mb-6">
        <div class="flex align-items-center justify-content-between mb-4">
          <h1 class="text-2xl font-bold text-900">{{ t('dashboard.VANSalesDashboard') }}</h1>
          <div class="text-sm text-500">
            {{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </div>
        </div>

        <!-- Filters -->
        <div class="surface-card border-round p-4 border-1 border-gray-200">
          <div class="grid">
            <!-- Sales Rep Multi-select Dropdown -->
            <div class="col-12 md:col-4 sales-rep-dropdown">
              <label class="block text-md font-medium text-700 mb-1">{{ t('dashboard.Sales_Representatives') }}</label>
              <div class="relative">
                <button @click.stop="toggleDropdown" class="w-full h-3rem border-1 border-gray-200 surface-card border-1 border-round px-4 py-2 text-left flex align-items-center justify-content-between">
                  <span class="text-overflow-ellipsis">
                    {{ filterValues.salesReps.includes('all') ? `${t('dashboard.AllSalesReps')}` : filterValues.salesReps.length + ' Selected' }}
                  </span>
                  <i :class="['pi', isDropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down', 'text-500']"></i>
                </button>

                <!-- Dropdown Menu -->
                <div v-if="isDropdownOpen" class="border-1 border-gray-200 absolute w-full mt-1 surface-card border-1 border-round shadow-2">
                  <div class="py-1 overflow-auto" style="max-height: 15rem">
                    <label v-for="rep in availableSalesReps" :key="rep.id" class="flex align-items-center px-4 py-2 hover:surface-hover cursor-pointer">
                      <div class="p-checkbox p-component">
                        <input type="checkbox" :checked="filterValues.salesReps.includes(rep.id)" @change="handleSalesRepSelection(rep.id)" class="p-checkbox-box" />
                      </div>
                      <span class="ml-3 text-700">{{ rep.name }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Date Range -->
            <div class="col-12 md:col-4">
              <label class="block text-md font-medium text-700 mb-1"> {{ t('dashboard.FromDate') }}</label>
              <input type="date" v-model="filterValues.dateFrom" class="w-full border-none" />
            </div>
            <div class="col-12 md:col-4">
              <label class="block text-md font-medium text-700 mb-1">{{ t('dashboard.ToDate') }}</label>
              <input type="date" v-model="filterValues.dateTo" :min="filterValues.dateFrom" class="w-full border-none" />
            </div>
          </div>

          <!-- Search Button -->
          <div class="mt-4 flex justify-content-end">
            <button @click="handleSearch" class="p-button p-component px-4 py-2 bg-primary text-white border-round flex align-items-center gap-2">
              <i class="pi pi-search"></i>
              <span>{{ t('dashboard.Search') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <KPICards :yesterday-data="yesterdayData" :today-data="filteredData" :selected-card="selectedCard" v-model="totalSalesReps" @select-card="handleCardSelect" class="mb-6" />

      <!-- Details Section -->
      <div v-if="selectedCard" class="surface-card border-round-xl border-1 p-4 border-gray-200">
        <div class="flex align-items-center justify-content-between mb-5 mt-3">
          <h2 class="text-2xl m-0 font-medium">{{ selectedCard.charAt(0).toUpperCase() + selectedCard.slice(1) }} Details</h2>

          <div class="flex align-items-center gap-2">
            <div @click="toggleViewMode" class="p-2 cursor-pointer border-round hover:surface-hover">
              <font-awesome-icon :icon="['fas', viewMode === 'chart' ? 'table' : 'chart-simple']" class="text-xl" />
            </div>
            <div @click="selectedCard = null" class="p-2 flex justify-content-center align-items-center cursor-pointer border-round hover:surface-hover">
              <i class="pi pi-times text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Dynamic Details Component -->
        <VisitsDetails v-if="selectedCard === 'visits' && cardDetails.visits" :data="cardDetails.visits" :view-mode="viewMode" class="" />
        <SalesDetails v-if="selectedCard === 'sales' && cardDetails.sales" :data="cardDetails.sales" :view-mode="viewMode" />
        <CollectionsDetails v-if="selectedCard === 'collections'" :data="cardDetails.collections" :view-mode="viewMode" />
        <SessionsDetails v-if="selectedCard === 'sessions'" :data="cardDetails.sessions" :view-mode="viewMode" />
        <OverdueDetails v-if="selectedCard === 'overdue'" :data="cardDetails.overdue" :view-mode="viewMode" v-model="totalSalesReps" />
        <StockDetails v-if="selectedCard === 'stock'" :data="cardDetails.stock" :view-mode="viewMode" />
      </div>
    </div>
  </div>
</template>

<style>
.grid {
  margin-right: -0.5rem;
  margin-left: -0.5rem;
  margin-top: -0.5rem;
}
</style>

<style scoped>
/* PrimeFlex overrides */
.p-checkbox {
  width: 1.25rem;
  height: 1.25rem;
}

.p-checkbox .p-checkbox-box {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 4px;
  border: 1px solid var(--surface-300);
}

.p-checkbox .p-checkbox-box.p-highlight {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

/* Date input styles */
input[type='date'] {
  min-height: 42px;
  padding: 0.5rem;
}

/* Custom scrollbar */
.sales-rep-dropdown .overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.sales-rep-dropdown .overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.sales-rep-dropdown .overflow-auto::-webkit-scrollbar-thumb {
  background-color: var(--surface-300);
  border-radius: 3px;
}

.sales-rep-dropdown .overflow-auto::-webkit-scrollbar-thumb:hover {
  background-color: var(--surface-400);
}
</style>
