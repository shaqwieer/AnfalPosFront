<script setup>
import { useI18n } from 'vue-i18n';
import { formatCurrency, formatDate, getTransactionStatusClass, getTransactionIcon } from '../utils/formatters';

const { t } = useI18n();

defineProps({
  transactions: Array,
  transactionType: Object,
  loading: Boolean
});

defineEmits(['select', 'refresh']);
</script>

<template>
  <div class="col-12">
    <div class="card">
      <div class="flex justify-content-between align-items-center p-4 border-bottom-1 surface-border">
        <h4 class="text-xl font-semibold m-0">{{ transactionType.name }}</h4>
        <Button icon="pi pi-refresh" severity="secondary" @click="$emit('refresh')" :loading="loading" />
      </div>

      <div v-if="loading" class="p-4 text-center">
        <ProgressSpinner />
      </div>

      <div v-else-if="!transactions.length" class="p-4 text-center">
        <i class="pi pi-info-circle text-3xl text-500 mb-3"></i>
        <p class="text-500 text-lg">{{ t('transactions.noTransactions') }}</p>
      </div>

      <div v-else class="p-0">
        <!-- Invoice List -->
        <div v-if="transactionType.id === 'invoices'" 
             v-for="transaction in transactions" 
             :key="transaction.id" 
             class="p-4 border-bottom-1 surface-border cursor-pointer hover:surface-hover transition-duration-200"
             @click="$emit('select', transaction)">
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-3">
              <div :class="[getTransactionStatusClass(transaction), 'w-3rem h-3rem border-circle flex align-items-center justify-content-center']">
                <i :class="['pi', getTransactionIcon(transaction), 'text-lg']"></i>
              </div>
              <div>
                <h5 class="m-0 font-semibold">{{ transaction.billingDocId || `#${transaction.id}` }}</h5>
                <p class="m-0 text-500">{{ formatDate(transaction.createdAt) }}</p>
                <Tag :class="getTransactionStatusClass(transaction)" class="mt-1">
                  {{ transaction.invoicePaymentStatus }}
                </Tag>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold">{{ formatCurrency(transaction.finalAmount) }}</div>
              <div class="text-500">{{ t('transactions.paid') }}: {{ formatCurrency(transaction.paidAmount) }}</div>
              <div class="text-500" v-if="transaction.remainingAmount > 0">
                {{ t('transactions.remaining') }}: {{ formatCurrency(transaction.remainingAmount) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Payment List -->
        <div v-else-if="transactionType.id === 'payments'" 
             v-for="transaction in transactions" 
             :key="transaction.id" 
             class="p-4 border-bottom-1 surface-border cursor-pointer hover:surface-hover transition-duration-200"
             @click="$emit('select', transaction)">
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-3">
              <div class="bg-green-100 text-green-700 w-3rem h-3rem border-circle flex align-items-center justify-content-center">
                <i class="pi pi-credit-card text-lg"></i>
              </div>
              <div>
                <h5 class="m-0 font-semibold">#{{ transaction.id }}</h5>
                <p class="m-0 text-500">{{ formatDate(transaction.createdAt) }}</p>
                <div class="flex gap-1 mt-1">
                  <Tag v-for="payment in transaction.payments" :key="payment.paymentMethodName" 
                       class="bg-blue-100 text-blue-700">
                    {{ payment.paymentMethodName }}
                  </Tag>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold text-green-600">{{ formatCurrency(transaction.totalAmount) }}</div>
            </div>
          </div>
        </div>

        <!-- Expense List -->
        <div v-else-if="transactionType.id === 'expenses'" 
             v-for="transaction in transactions" 
             :key="transaction.id" 
             class="p-4 border-bottom-1 surface-border cursor-pointer hover:surface-hover transition-duration-200"
             @click="$emit('select', transaction)">
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-3">
              <div class="bg-orange-100 text-orange-700 w-3rem h-3rem border-circle flex align-items-center justify-content-center">
                <i class="pi pi-shopping-bag text-lg"></i>
              </div>
              <div>
                <h5 class="m-0 font-semibold">{{ transaction.expenseTypeName }}</h5>
                <p class="m-0 text-500">{{ formatDate(transaction.createdAt) }}</p>
                <p class="m-0 text-500" v-if="transaction.description">{{ transaction.description }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold text-orange-600">{{ formatCurrency(transaction.amount) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 12px;
}

.hover:surface-hover:hover {
  background-color: var(--surface-hover);
}
</style>