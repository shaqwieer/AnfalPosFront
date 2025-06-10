<script setup>
import { useI18n } from 'vue-i18n';
import { formatCurrency, formatDate, getTransactionStatusClass } from '../utils/formatters';

const { t } = useI18n();

defineProps({
  visible: Boolean,
  transaction: Object,
  transactionType: Object
});

defineEmits(['update:visible']);
</script>

<template>
  <Dialog :visible="visible"
          :modal="true" :closable="true" :style="{width: '800px'}"  @update:visible="$emit('update:visible', $event)"
          :header="t('transactions.transactionDetails')" >
    <div v-if="transaction" class="p-3">
      <!-- Invoice Details -->
      <div v-if="transactionType?.id === 'invoices'" class="flex flex-column gap-4">
        <div class="grid">
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.invoiceNumber') }}</label>
            <p class="text-lg m-0">{{ transaction.billingDocId || `#${transaction.id}` }}</p>
          </div>
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.status') }}</label>
            <Tag :class="getTransactionStatusClass(transaction)">
              {{ transaction.invoicePaymentStatus }}
            </Tag>
          </div>
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.createdAt') }}</label>
            <p class="text-lg m-0">{{ formatDate(transaction.createdAt) }}</p>
          </div>
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.customer') }}</label>
            <p class="text-lg m-0">{{ transaction.customerName }}</p>
          </div>
        </div>

        <!-- Amount Details -->
        <div class="surface-100 p-3 border-round">
          <h5 class="mt-0 mb-3">{{ t('transactions.amountDetails') }}</h5>
          <div class="grid">
            <div class="col-6">
              <div class="flex justify-content-between mb-2">
                <span>{{ t('transactions.totalAmount') }}:</span>
                <span class="font-semibold">{{ formatCurrency(transaction.totalAmount) }}</span>
              </div>
              <div class="flex justify-content-between mb-2" v-if="transaction.discountTotal">
                <span>{{ t('transactions.discount') }}:</span>
                <span class="font-semibold text-red-500">-{{ formatCurrency(transaction.discountTotal) }}</span>
              </div>
              <div class="flex justify-content-between mb-2" v-if="transaction.taxTotal">
                <span>{{ t('transactions.tax') }} ({{ transaction.taxPercentage }}%):</span>
                <span class="font-semibold">{{ formatCurrency(transaction.taxTotal) }}</span>
              </div>
            </div>
            <div class="col-6">
              <div class="flex justify-content-between mb-2">
                <span>{{ t('transactions.finalAmount') }}:</span>
                <span class="font-semibold text-lg">{{ formatCurrency(transaction.finalAmount) }}</span>
              </div>
              <div class="flex justify-content-between mb-2">
                <span>{{ t('transactions.paidAmount') }}:</span>
                <span class="font-semibold text-green-600">{{ formatCurrency(transaction.paidAmount) }}</span>
              </div>
              <div class="flex justify-content-between mb-2" v-if="transaction.remainingAmount > 0">
                <span>{{ t('transactions.remainingAmount') }}:</span>
                <span class="font-semibold text-red-600">{{ formatCurrency(transaction.remainingAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice Items -->
        <div v-if="transaction.items && transaction.items.length">
          <h5>{{ t('transactions.items') }}</h5>
          <DataTable :value="transaction.items" class="p-datatable-sm">
            <Column field="itemName" :header="t('transactions.itemName')"></Column>
            <Column field="quantity" :header="t('transactions.quantity')"></Column>
            <Column field="price" :header="t('transactions.unitPrice')">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.price) }}
              </template>
            </Column>
            <Column field="totalPrice" :header="t('transactions.total')">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.quantity*slotProps.data.price) }}
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <!-- Payment Details -->
      <div v-else-if="transactionType?.id === 'payments'" class="flex flex-column gap-4">
        <div class="grid">
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.paymentId') }}</label>
            <p class="text-lg m-0">#{{ transaction.id }}</p>
          </div>
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.totalAmount') }}</label>
            <p class="text-lg m-0 font-semibold text-green-600">{{ formatCurrency(transaction.totalAmount) }}</p>
          </div>
          <div class="col-12">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.createdAt') }}</label>
            <p class="text-lg m-0">{{ formatDate(transaction.createdAt) }}</p>
          </div>
        </div>

        <!-- Payment Methods -->
        <div>
          <h5>{{ t('transactions.paymentMethods') }}</h5>
          <div class="grid">
            <div v-for="payment in transaction.payments" :key="payment.paymentMethodName" 
                 class="col-12 md:col-6">
              <div class="surface-100 p-3 border-round">
                <div class="flex justify-content-between align-items-center">
                  <div>
                    <h6 class="m-0">{{ payment.paymentMethodName }}</h6>
                    <p class="m-0 text-500" v-if="payment.paymentMethodArabicName">{{ payment.paymentMethodArabicName }}</p>
                  </div>
                  <span class="font-semibold text-lg">{{ formatCurrency(payment.amount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Details -->
      <div v-else-if="transactionType?.id === 'expenses'" class="flex flex-column gap-4">
        <div class="grid">
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.expenseId') }}</label>
            <p class="text-lg m-0">#{{ transaction.id }}</p>
          </div>
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.expenseType') }}</label>
            <p class="text-lg m-0">{{ transaction.expenseTypeName }}</p>
          </div>
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.amount') }}</label>
            <p class="text-lg m-0 font-semibold text-orange-600">{{ formatCurrency(transaction.amount) }}</p>
          </div>
          <div class="col-6">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.createdAt') }}</label>
            <p class="text-lg m-0">{{ formatDate(transaction.createdAt) }}</p>
          </div>
          <div class="col-12" v-if="transaction.description">
            <label class="block font-semibold text-sm text-500 mb-1">{{ t('transactions.description') }}</label>
            <p class="text-lg m-0">{{ transaction.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end">
        <Button :label="t('transactions.close')" severity="secondary" @click="visible = false" />
      </div>
    </template>
  </Dialog>
</template>