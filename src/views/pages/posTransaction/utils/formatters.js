export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR'
  }).format(amount || 0);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const getTransactionStatusClass = (transaction) => {
  switch (transaction.invoicePaymentStatus?.toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-700';
    case 'partial': return 'bg-yellow-100 text-yellow-700';
    case 'unpaid': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export const getTransactionIcon = (transaction) => {
  return transaction.invoicePaymentStatus?.toLowerCase() === 'paid' ? 'pi-check-circle' : 'pi-clock';
};