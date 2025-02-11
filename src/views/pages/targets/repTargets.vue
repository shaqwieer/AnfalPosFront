<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import Dropdown from 'primevue/dropdown';
import { useSalesGoalsStore } from '../../../stores/TargetsStore';
import apiClient from '@/api/apiClient';
import { useMainStore } from '@/stores/mainStore';
const mainStore = useMainStore();
const salesGoalsStore = useSalesGoalsStore();

const selectedYear = ref(new Date().getFullYear());
const selectedRepId = ref();
const creditLimit = ref(0);
const availableCredit = ref(0);
const currentBalance = ref(0);
const isEditing = ref(false);
const editingData = ref(null);
const errorMessage = ref('');

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1];
});

const months = ref([
  { name: 'January', id: 1 },
  { name: 'February', id: 2 },
  { name: 'March', id: 3 },
  { name: 'April', id: 4 },
  { name: 'May', id: 5 },
  { name: 'June', id: 6 },
  { name: 'July', id: 7 },
  { name: 'August', id: 8 },
  { name: 'September', id: 9 },
  { name: 'October', id: 10 },
  { name: 'November', id: 11 },
  { name: 'December', id: 12 }
]);

const selectedRep = ref(null);
const editedTargets = ref(null);

const creditStatus = computed(() => {
  if (!selectedRep.value) return null;
  const remaining = creditLimit.value - currentBalance.value;
  const usagePercentage = (currentBalance.value / creditLimit.value) * 100;

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
  isEditing.value = true;
  editedTargets.value = JSON.parse(JSON.stringify(selectedRep.value));
  errorMessage.value = ''; // Clear any previous error messages
};

const validateCredit = () => {
  const remaining = creditLimit.value - currentBalance.value;
  if (remaining < 0) {
    errorMessage.value = 'Cannot save: Credit limit would result in negative remaining credit';
    return false;
  }
  errorMessage.value = '';
  return true;
};

const isAtLeastOneTargetHasValue = () => {
  return selectedRep.value.some(t => t.salesTarget > 0 || t.collectionTarget > 0);
};

const saveChanges = async () => {
  
  try {
    if (!validateCredit()) {
      return; // Stop if validation fails
    }

    const atLeastOneTargetHasValue = isAtLeastOneTargetHasValue();
    if (!atLeastOneTargetHasValue) {
      errorMessage.value = 'Cannot save: At least one of Collection Target or Sales Target must have a value';
      return;
    }

    // Format data according to backend DTO structure
    const formData = {
      businessEntityId: selectedRepId.value,
      creditLimit: parseFloat(creditLimit.value),
      salesGoalsMonthly: months.value.map(month => ({
        id: selectedRep.value.find(t => t.month === month.id)?.id || 0,
        month: month.id,
        year: selectedYear.value,
        salesTarget: parseFloat(selectedRep.value.find(t => t.month === month.id)?.salesTarget || 0),
        collectionTarget: parseFloat(selectedRep.value.find(t => t.month === month.id)?.collectionTarget || 0)
      }))
    };

    try {
        const response = await apiClient.post('/SalesGoals/UpdateSalesGoalMonthlyData', formData);
        mainStore.loading.setNotificationInfo('success', response.data.message);
        isEditing.value = false;
          editedTargets.value = null;
          errorMessage.value = '';
          await fetchData(); // Refresh data after save

      } catch (err) {
        this.error = handleError(err, this.loading);
      }
 
  } catch (error) {
    console.error('Failed to save changes:', error);
    errorMessage.value = 'Failed to save changes. Please try again.';
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  editedTargets.value = null;
  errorMessage.value = '';
};

const updateTarget = (monthId, field, value) => {
  const target = selectedRep.value.find(t => t.month === monthId);
  if (target) {
    target[field] = parseFloat(value) || 0;
  } else {
    // Create new target if it doesn't exist
    selectedRep.value.push({
      id: 0,
      month: monthId,
      year: selectedYear.value,
      salesTarget: field === 'salesTarget' ? parseFloat(value) || 0 : 0,
      collectionTarget: field === 'collectionTarget' ? parseFloat(value) || 0 : 0
    });
  }
};

const businessEntityId = ref(1);
const year = ref(new Date().getFullYear());

const fetchData = async () => {
  await salesGoalsStore.fetchSalesGoals({ businessEntityId: selectedRepId.value, year: selectedYear.value });
  selectedRep.value = salesGoalsStore.salesGoals.filter((rep) => rep.businessEntityId == selectedRepId.value);
  creditLimit.value = salesGoalsStore.creditLimit;
  availableCredit.value = salesGoalsStore.availableCredit;
  currentBalance.value = salesGoalsStore.currentBalance;
};

watch(
  [selectedRepId, selectedYear],
  () => {
    fetchData();
  },
  { deep: true }
);

onMounted(() => {
  salesGoalsStore.GetSalesReps().then(() => {
    selectedRepId.value = salesGoalsStore.salesReps[0].id;
    fetchData();
  });
});
</script>

<template>
  <div class="p-6" @click="testx()">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex align-items-center justify-content-between mb-6">
        <h1 class="text-2xl font-bold text-900">Sales Rep Targets</h1>
        <div class="flex align-items-center gap-4">
          <Dropdown v-model="selectedRepId" :options="salesGoalsStore.salesReps" optionLabel="name" optionValue="id" placeholder="Select a Sales Rep" class="w-full md:w-14rem" />
          <Dropdown v-model="selectedYear" :options="years" placeholder="Select a Year" class="w-full md:w-14rem" />
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 border-round-lg">
        {{ errorMessage }}
      </div>

      <!-- Main Content -->
      <div v-if="selectedRep" class="surface-card border-round-xl border-1 surface-border p-4">
        <div class="flex align-items-center justify-content-between"> 
          <div class="flex flex-column gap-2">
            <h3 class="text-lg font-semibold text-900">{{ salesGoalsStore.salesReps.find((rep) => rep.id === selectedRepId)?.name }}</h3>
            <div class="flex align-items-center gap-6">
              <div class="text-sm">
                <span class="text-500">Credit Limit:</span>
                <span class="ml-1 font-bold">
                  <input 
                    v-if="isEditing" 
                    type="number"
                    step="0.01"
                    min="0"
                    v-model="creditLimit"
                    @input="validateCredit"
                    class="w-32 p-2 border-round-lg border-1 surface-border"
                    :class="{ 'border-red-500': errorMessage }"
                  />
                  <span v-else>{{ formatPrice(creditLimit) }}</span>
                </span>
              </div>
              <div class="text-sm">
                <span class="text-500">Current Balance:</span>
                <span class="ml-1 font-bold">{{ formatPrice(currentBalance) }}</span>
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
              </div>
            </div>
            <div style="height: 6px" class="w-full surface-200 border-round-full border-round-3xl mt-1">
              <div
                style="height: 6px"
                class="border-round-3xl transition-all transition-duration-300"
                :class="{
                  'bg-red-500': creditStatus.status === 'critical',
                  'bg-yellow-500': creditStatus.status === 'warning',
                  'bg-green-500': creditStatus.status === 'normal'
                }"
                :style="{ width: `${Math.min(creditStatus.usagePercentage, 100)}%` }"
              ></div>
            </div>
          </div>
          <div  class="flex justify-content-end gap-3 mt-4">
          <button v-if="isEditing"
            @click="cancelEdit" 
            class="p-button p-button-warning"
          >
            Cancel
          </button>
          <button 
            @click="isEditing ? saveChanges() : startEdit()" 
            class="p-button p-button-primary"
           
          >
            {{ isEditing ? 'Save Targets' : 'Edit Targets' }}
          </button>
        </div>
        </div>

        

        <div class="overflow-x-auto mt-4 border-round-lg border-1 border-gray-200">
          <DataTable :value="months">
            <Column field="" header="#">
              <template #body="slotProps">
                {{ slotProps.index + 1 }}
              </template>
            </Column>
            
            <Column header="Month" field="name" />
            
            <Column header="Sales Target">
              <template #body="slotProps">
                <template v-if="isEditing">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    :value="selectedRep.find(t => t.month === slotProps.data.id)?.salesTarget"
                    @input="updateTarget(slotProps.data.id, 'salesTarget', $event.target.value)"
                    class="w-full p-2 border-round-lg border-1 surface-border"
                  />
                </template>
                <template v-else>
                  {{ formatPrice(selectedRep.find(t => t.month === slotProps.data.id)?.salesTarget || 0) }}
                </template>
              </template>
              <template #footer>
                <strong>{{ formatPrice(selectedRep.reduce((sum, item) => sum + (item.salesTarget || 0), 0)) }}</strong>
              </template>
            </Column>
            
            <Column header="Collection Target">
              <template #body="slotProps">
                <template v-if="isEditing">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    :value="selectedRep.find(t => t.month === slotProps.data.id)?.collectionTarget"
                    @input="updateTarget(slotProps.data.id, 'collectionTarget', $event.target.value)"
                    class="w-full p-2 border-round-lg border-1 surface-border"
                  />
                </template>
                <template v-else>
                  {{ formatPrice(selectedRep.find(t => t.month === slotProps.data.id)?.collectionTarget || 0) }}
                </template>
              </template>
              <template #footer>
                <strong>{{ formatPrice(selectedRep.reduce((sum, item) => sum + (item.collectionTarget || 0), 0)) }}</strong>
              </template>
            </Column>
          </DataTable>
        </div>

    
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='number'] {
  -moz-appearance: textfield;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>