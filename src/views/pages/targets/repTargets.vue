<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import Dropdown from 'primevue/dropdown';

// Sample sales reps data with current balance
const salesReps = ref([
  {
    id: 'rep1',
    name: 'Mohammed Al-Malki',
    creditLimit: 500000,
    currentBalance: 450000,
    targets: {
      sales: Array(12).fill(200000),
      collections: Array(12).fill(180000)
    }
  },
  {
    id: 'rep2',
    name: 'Abdullah Al-Qahtani',
    creditLimit: 400000,
    currentBalance: 250000,
    targets: {
      sales: Array(12).fill(150000),
      collections: Array(12).fill(135000)
    }
  }
]);

const selectedYear = ref(new Date().getFullYear());
const selectedRepId = ref(salesReps.value[0].id); // Default to first rep
const isEditing = ref(false);
const editingData = ref(null);

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1];
});

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Get selected rep data
const selectedRep = computed(() => salesReps.value.find((rep) => rep.id === selectedRepId.value));

// Calculate credit status
const creditStatus = computed(() => {
  if (!selectedRep.value) return null;

  const remaining = selectedRep.value.creditLimit - selectedRep.value.currentBalance;
  const usagePercentage = (selectedRep.value.currentBalance / selectedRep.value.creditLimit) * 100;

  return {
    remaining,
    usagePercentage,
    status: usagePercentage >= 90 ? 'critical' : usagePercentage >= 75 ? 'warning' : 'normal'
  };
});

const formatPrice = (price) => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const startEdit = () => {
  editingData.value = {
    creditLimit: selectedRep.value.creditLimit,
    targets: {
      sales: [...selectedRep.value.targets.sales],
      collections: [...selectedRep.value.targets.collections]
    }
  };
  isEditing.value = true;
};

const saveChanges = () => {
  if (selectedRep.value && editingData.value) {
    selectedRep.value.creditLimit = editingData.value.creditLimit;
    selectedRep.value.targets.sales = [...editingData.value.targets.sales];
    selectedRep.value.targets.collections = [...editingData.value.targets.collections];
  }
  isEditing.value = false;
  editingData.value = null;
};

const cancelEdit = () => {
  isEditing.value = false;
  editingData.value = null;
};

const updateMonthlyTarget = (type, monthIndex, value) => {
  if (editingData.value) {
    editingData.value.targets[type][monthIndex] = parseFloat(value) || 0;
  }
};




const selectedSalesReps = ref<string[]>(['all']);

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
    } else if (!newValue.includes('all') && newValue.length === salesReps.length - 1) {
      // If all individual reps are selected, switch to 'all'
      selectedSalesReps.value = ['all'];
    }
  },
  { deep: true }
);

import { useSalesGoalsStore } from '../../../stores/TargetsStore';

const salesGoalsStore = useSalesGoalsStore();

const businessEntityId = ref(1);
const year = ref(new Date().getFullYear());
const test = ref();
const fetchData = async () => {
  await salesGoalsStore.fetchSalesGoals();
  console.log(salesGoalsStore.salesGoals);
  test.value = salesGoalsStore.salesGoals;
};
</script>

<template>
  <div class="p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex align-items-center justify-content-between mb-6">
        <h1 class="text-2xl font-bold text-900">Sales Rep Targets</h1>
        <div class="flex align-items-center gap-4">
          <!-- Sales Rep Selection -->
          <Dropdown v-model="selectedRepId" :options="salesReps" optionLabel="name" optionValue="id" placeholder="Select a Sales Rep" class="w-full md:w-14rem" />

          <!-- Year Selection -->
          <Dropdown v-model="selectedYear" :options="years" placeholder="Select a Year" class="w-full md:w-14rem" />
        </div>
      </div>

      <!-- Main Content -->
      <div v-if="selectedRep" class="surface-card border-round-xl border-1 surface-border p-4">
        <!-- Rep Header -->
        <div class="flex align-items-center justify-content-between">
          <div class="flex flex-column gap-2">
            <h3 class="text-lg font-semibold text-900">{{ selectedRep.name }}</h3>
            <!-- Credit Limit Info -->
            <div class="flex align-items-center gap-6">
              <div class="text-sm">
                <span class="text-500">Credit Limit:</span>
                <span class="ml-1 font-bold">{{ formatPrice(selectedRep.creditLimit) }}</span>
              </div>
              <div class="text-sm">
                <span class="text-500">Current Balance:</span>
                <span class="ml-1 font-bold">{{ formatPrice(selectedRep.currentBalance) }}</span>
              </div>
              <div class="text-sm flex align-items-center gap-2">
                <span class="text-500">Remaining:</span>
                <span
                  class="font-bold"
                  :class="{
                    'text-red-600': creditStatus.status === 'critical',
                    'text-yellow-600': creditStatus.status === 'warning',
                    'text-green-600': creditStatus.status === 'normal'
                  }"
                >
                  {{ formatPrice(creditStatus.remaining) }}
                </span>
                <!-- Warning Icon -->
                <span
                  v-if="creditStatus.status !== 'normal'"
                  class="material-icons text-lg"
                  :class="{
                    'text-red-500': creditStatus.status === 'critical',
                    'text-yellow-500': creditStatus.status === 'warning'
                  }"
                >
                  <font-awesome-icon :icon="['fas', `${creditStatus.status === 'critical' ? 'circle-exclamation' : ''}`]" />
                </span>
              </div>
            </div>
            <!-- Credit Usage Progress Bar -->
            <div style="height: 6px" class="w-full surface-200 border-round-full border-round-3xl mt-1">
              <div
                style="height: 6px"
                class="border-round-3xl transition-all transition-duration-300"
                :class="{
                  'bg-red-500': creditStatus.status === 'critical',
                  'bg-yellow-500': creditStatus.status === 'warning',
                  'bg-green-500': creditStatus.status === 'normal'
                }"
                :style="{ width: `${creditStatus.usagePercentage}%` }"
              ></div>
            </div>
          </div>
          <div v-if="!isEditing" @click="startEdit" class="px-4 py-2 bg-blue-600 cursor-pointer text-white border-round-lg hover:bg-blue-700 transition-colors">Edit Targets</div>
        </div>

        <!-- View Mode -->

        <div v-if="!isEditing" class="overflow-x-auto mt-4 border-round-lg border-1 border-gray-200">
          <DataTable :value="months" :paginator="months.length > 10" :rows="10" :rowsPerPageOptions="[5, 10, 25]" class="">
            <template #empty>
              <div class="flex justify-content-center align-items-center font-bold text-lg">No Data Available</div>
            </template>

            <Column field="" header="#">
              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md">
                    {{ slotProps.index + 1 }}
                  </div>
                </div>
              </template>

              <template #footer="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md text-green-600"></div>
                </div>
              </template>
            </Column>

            <Column header="Month" field="month">
              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md">
                    {{ slotProps.data }}
                  </div>
                </div>
              </template>

              <template #footer="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md text-green-600">Total</div>
                </div>
              </template>
            </Column>

            <Column header="Sales Target" field="month">
              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md">
                    {{ formatPrice(selectedRep.targets.sales[slotProps.index]) }}
                  </div>
                </div>
              </template>

              <template #footer="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md text-green-600">
                    {{ formatPrice(selectedRep.targets.sales.reduce((a, b) => a + b, 0)) }}
                  </div>
                </div>
              </template>
            </Column>

            <Column header="Collection Target" field="month">
              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md">
                    {{ formatPrice(selectedRep.targets.collections[slotProps.index]) }}
                  </div>
                </div>
              </template>

              <template #footer="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md text-green-600">
                    {{ formatPrice(selectedRep.targets.collections.reduce((a, b) => a + b, 0)) }}
                  </div>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Edit Mode -->
        <div v-else class="flex flex-column gap-6 mt-4">
          <!-- Credit Limit Input -->
          <div>
            <label class="block text-sm font-bold text-700 mb-1">Credit Limit</label>
            <div class="relative border-round-lg">
              <span style="transform: translateY(50%); bottom: 50%; left: 9px" class="absolute text-500">SAR</span>
              <input type="number" v-model="editingData.creditLimit" style="height: 42px" class="pl-6 pr-4 py-2 w-full outline-none border-round-lg border-1 surface-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <!-- Monthly Targets Edit -->
          <!-- <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="surface-100">
                <tr>
                  <th class="px-6 py-3 text-center text-xs font-medium text-500 uppercase">#</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-500 uppercase">Month</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-500 uppercase">Sales Target</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-500 uppercase">Collection Target</th>
                </tr>
              </thead>
              <tbody class="surface-card">
                <tr v-for="(month, index) in months" :key="month" class="border-b-1 surface-border">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-500">{{ index + 1 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-900">{{ month }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      :value="editingData.targets.sales[index]"
                      @input="updateMonthlyTarget('sales', index, $event.target.value)"
                      class="w-full text-right border-round-lg border-1 surface-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      :value="editingData.targets.collections[index]"
                      @input="updateMonthlyTarget('collections', index, $event.target.value)"
                      class="w-full text-right border-round-lg border-1 surface-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                </tr>
              </tbody>
              <tfoot class="surface-100">
                <tr>
                  <td class="px-6 py-4"></td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-900">Total</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-900">
                    {{ formatPrice(editingData.targets.sales.reduce((a, b) => a + b, 0)) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-900">
                    {{ formatPrice(editingData.targets.collections.reduce((a, b) => a + b, 0)) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div> -->

          <DataTable :value="months" :paginator="months.length > 10" :rows="10" :rowsPerPageOptions="[5, 10, 25]" class="">
            <template #empty>
              <div class="flex justify-content-center align-items-center font-bold text-lg">No Data Available</div>
            </template>

            <Column field="" header="#">
              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md">
                    {{ slotProps.index + 1 }}
                  </div>
                </div>
              </template>

              <template #footer="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md text-green-600"></div>
                </div>
              </template>
            </Column>

            <Column header="Month" field="month">
              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md">
                    {{ slotProps.data }}
                  </div>
                </div>
              </template>

              <template #footer="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md text-green-600">Total</div>
                </div>
              </template>
            </Column>

            <Column header="Sales Target" field="month">
              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <input
                    type="number"
                    v-model="selectedRep.targets.sales[slotProps.index]"
                    @input="updateMonthlyTarget('sales', slotProps.index, selectedRep.targets.sales[slotProps.index])"
                    class="p-2 w-full outline-none border-0 h-full text-right border-round-lg border-1 surface-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </template>

              <template #footer="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md text-green-600">
                    {{ formatPrice(selectedRep.targets.sales.reduce((a, b) => a + b, 0)) }}
                  </div>
                </div>
              </template>
            </Column>

            <Column header="Collection Target" field="month">
              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <input
                    type="number"
                    v-model="selectedRep.targets.collections[slotProps.index]"
                    @input="updateMonthlyTarget('collections', slotProps.index, selectedRep.targets.sales[slotProps.index])"
                    class="p-2 w-full outline-none text-right border-round-lg border-1 surface-border focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </template>

              <template #footer="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="text-md text-green-600">
                    {{ formatPrice(selectedRep.targets.collections.reduce((a, b) => a + b, 0)) }}
                  </div>
                </div>
              </template>
            </Column>
          </DataTable>

          <!-- Action Buttons -->
          <div class="flex justify-content-end gap-3">
            <div @click="cancelEdit" class="cursor-pointer px-4 py-2 border-1 surface-border border-round-lg hover:surface-100 transition-colors">Cancel</div>
            <div @click="saveChanges" class="cursor-pointer px-4 py-2 bg-blue-600 text-white border-round-lg hover:bg-blue-700 transition-colors">Save Changes</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom number input styles */
input[type='number'] {
  -moz-appearance: textfield;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
