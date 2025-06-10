<script setup>
import { useI18n } from 'vue-i18n';
import { formatCurrency } from '../utils/formatters';

const { t } = useI18n();

defineProps({
  stats: Object,
  transactionType: Object
});
</script>

<template>
  <div class="col-12 mb-4">
    <div class="grid">
      <div class="col-12 md:col-3">
        <div class="card p-4 text-center">
          <div class="text-2xl font-semibold text-blue-600">{{ stats.count }}</div>
          <div class="text-500">{{ t('transactions.totalCount') }}</div>
        </div>
      </div>
      <div class="col-12 md:col-3" v-if="stats.totalAmount !== undefined">
        <div class="card p-4 text-center">
          <div class="text-2xl font-semibold text-green-600">{{ formatCurrency(stats.totalAmount) }}</div>
          <div class="text-500">{{ t('transactions.totalAmount') }}</div>
        </div>
      </div>
      <div class="col-12 md:col-3" v-if="stats.paidAmount !== undefined">
        <div class="card p-4 text-center">
          <div class="text-2xl font-semibold text-teal-600">{{ formatCurrency(stats.paidAmount) }}</div>
          <div class="text-500">{{ t('transactions.paidAmount') }}</div>
        </div>
      </div>
      <div class="col-12 md:col-3" v-if="stats.remainingAmount !== undefined">
        <div class="card p-4 text-center">
          <div class="text-2xl font-semibold text-red-600">{{ formatCurrency(stats.remainingAmount) }}</div>
          <div class="text-500">{{ t('transactions.remainingAmount') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 12px;
}
</style>