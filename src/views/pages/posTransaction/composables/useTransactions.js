import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export function useTransactions() {
  const { t } = useI18n();
  const mainStore = useMainStore();

  const selectedTransactionType = ref(null);
  const selectedTransaction = ref(null);
  const transactions = ref([]);
  const transactionDetailVisible = ref(false);
  const loading = ref(false);

  const transactionTypeStats = computed(() => {
    if (!selectedTransactionType.value || !transactions.value.length) return null;

    if (selectedTransactionType.value.id === 'invoices') {
      const totalAmount = transactions.value.reduce((sum, inv) => sum + (inv.finalAmount || 0), 0);
      const paidAmount = transactions.value.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
      const remainingAmount = transactions.value.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

      return {
        count: transactions.value.length,
        totalAmount,
        paidAmount,
        remainingAmount
      };
    } else if (selectedTransactionType.value.id === 'payments') {
      const totalAmount = transactions.value.reduce((sum, payment) => sum + (payment.totalAmount || 0), 0);

      return {
        count: transactions.value.length,
        totalAmount
      };
    } else if (selectedTransactionType.value.id === 'expenses') {
      const totalAmount = transactions.value.reduce((sum, expense) => sum + (expense.amount || 0), 0);

      return {
        count: transactions.value.length,
        totalAmount
      };
    }

    return null;
  });

  const selectTransactionType = (type) => {
    selectedTransactionType.value = type;
    transactions.value = [];
    // Reset transaction selection when changing type
    selectedTransaction.value = null;
    transactionDetailVisible.value = false;
  };

  const goBack = () => {
    selectedTransactionType.value = null;
    selectedTransaction.value = null;
    transactionDetailVisible.value = false;
    transactions.value = [];
  };

  const selectTransaction = (transaction) => {
    selectedTransaction.value = transaction;
    transactionDetailVisible.value = true;
  };

  const loadTransactions = async (transactionType, customerId, filters) => {
    if (!customerId || !transactionType) return;
    loading.value = true;
    try {
      const payload = {
        customerId: customerId,
        fromDate: filters.fromDate?.toISOString(),
        toDate: filters.toDate?.toISOString()
        // ianaZone:Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const response = await apiClient.post(transactionType.endpoint, payload);
      if (response.data.success) {
        transactions.value = response.data.data;
      }
    } catch (err) {
      handleError(err, mainStore.loading);
    } finally {
      loading.value = false;
    }
  };

  return {
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
  };
}
