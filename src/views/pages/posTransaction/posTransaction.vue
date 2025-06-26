<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import CustomerFilters from './components/CustomerFilters.vue';
import TransactionTypeSelector from './components/TransactionTypeSelector.vue';
import StatisticsCards from './components/StatisticsCards.vue';
import TransactionsList from './components/TransactionsList.vue';
import TransactionDetail from './components/TransactionDetail.vue';
import { useTransactions } from './composables/useTransactions';
import { useTransactionFilters } from './composables/useTransactionFilters';

const { t } = useI18n();
const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);

// Composables
const {
  selectedTransactionType,
  selectedTransaction,
  transactions,
  transactionDetailVisible,
  transactionTypeStats,
  loading,
  selectTransactionType,
  selectTransaction,
  goBack,
  loadTransactions
} = useTransactions();

const {
  selectedCustomer,
  filters,
  customers,
  isFiltersValid,
  loadCustomers
} = useTransactionFilters();

// Watch for filter changes and reload transactions
import { watch, onMounted } from 'vue';

// Watch for any changes that should trigger transaction loading
// watch([selectedCustomer, selectedTransactionType, () => filters.fromDate, () => filters.toDate], () => {
//   if (selectedCustomer.value && selectedTransactionType.value && isFiltersValid.value) {
//     loadTransactions(selectedTransactionType.value, selectedCustomer.value.id, filters);
//   }
// });

// Handle transaction type selection
const handleTransactionTypeSelect = (type) => {
  selectTransactionType(type);
  // Automatically load transactions if filters are valid
  if (selectedCustomer.value && isFiltersValid.value) {
    loadTransactions(type, selectedCustomer.value.id, filters);
  }
};

// Computed property to determine if transaction type selector should be disabled
const isTransactionTypeSelectorDisabled = computed(() => {
  return !selectedCustomer.value || !filters.fromDate || !filters.toDate;
});

onMounted(() => {
  loadCustomers();
});
</script>

<template>
  <div :class="['grid px-6', { 'rtl-direction': rtl }]">
    <!-- Header Section -->
    <div class="flex flex-column row-gap-5 px-3 lg:flex-row justify-content-between mb-5 lg:mb-0 w-full">
      <div class="lg:col-8 px-0 pt-2">
        <div class="flex align-items-center gap-3 mb-3" v-if="selectedTransactionType">
          <Button icon="pi pi-arrow-left" severity="secondary" text @click="goBack" />
          <h3 class="text-700 text-3xl font-semibold m-0">{{ selectedTransactionType.name }}</h3>
        </div>
        <h3 v-else class="text-700 text-3xl font-semibold">{{ t('transactions.header') }}</h3>
        <p class="text-500 text-lg">
          {{ selectedTransactionType ? selectedTransactionType.description : t('transactions.description') }}
        </p>
      </div>
    </div>

    <!-- Customer Filters with Transaction Type Selector -->
    <CustomerFilters
      v-model:selectedCustomer="selectedCustomer"
      v-model:filters="filters"
      :customers="customers"
      :loading="loading"
    >
      <template #transaction-selector>
        <TransactionTypeSelector
          :selectedType="selectedTransactionType"
          :disabled="isTransactionTypeSelectorDisabled"
          @select="handleTransactionTypeSelect"
        />
      </template>
    </CustomerFilters>

    <!-- Validation Message -->
    <div v-if="!isFiltersValid" class="col-12">
      <div class="card p-4 border-left-3 border-blue-500 bg-blue-50">
        <div class="flex align-items-center gap-3">
          <i class="pi pi-info-circle text-blue-600 text-xl"></i>
          <div>
            <h5 class="text-blue-800 m-0 mb-1">{{ t('transactions.completeFilters') }}</h5>
            <p class="text-blue-600 m-0 text-sm">{{ t('transactions.selectCustomerAndDates') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <StatisticsCards
      v-if="selectedTransactionType && transactionTypeStats && isFiltersValid"
      :stats="transactionTypeStats"
      :transaction-type="selectedTransactionType"
    />

    <!-- Transactions List -->
    <TransactionsList
      v-if="selectedTransactionType && isFiltersValid"
      :transactions="transactions"
      :transaction-type="selectedTransactionType"
      :loading="loading"
      @select="selectTransaction"
      @refresh="() => loadTransactions(selectedTransactionType, selectedCustomer.id, filters)"
    />

    <!-- Transaction Detail Dialog -->
    <TransactionDetail
      v-model:visible="transactionDetailVisible"
      :transaction="selectedTransaction"
      :transaction-type="selectedTransactionType"
    />
  </div>
</template>

<style scoped>
.rtl-direction {
  direction: rtl;
}

/* SAP-like notification styling */
.card.border-left-3 {
  border-left-width: 4px !important;
  border-left-style: solid !important;
}

.bg-blue-50 {
  background-color: #f0f7ff !important;
}

.border-blue-500 {
  border-color: #3b82f6 !important;
}
</style>