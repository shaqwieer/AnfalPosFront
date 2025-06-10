<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineEmits(['select']);

const transactionTypes = ref([
  {
    id: 'invoices',
    name: t('transactions.invoices'),
    icon: 'pi-file',
    color: 'bg-blue-100',
    textColor: 'text-blue-700',
    description: t('transactions.invoicesDescription'),
    endpoint: '/Invoices/GetOrdersBasedOnCustomerTransaction'
  },
  {
    id: 'payments',
    name: t('transactions.payments'),
    icon: 'pi-money-bill',
    color: 'bg-green-100',
    textColor: 'text-green-700',
    description: t('transactions.paymentsDescription'),
    endpoint: '/Payments/GetPaymentsForSpecificCustomerTransaction'
  },
  {
    id: 'expenses',
    name: t('transactions.expenses'),
    icon: 'pi-shopping-cart',
    color: 'bg-orange-100',
    textColor: 'text-orange-700',
    description: t('transactions.expensesDescription'),
    endpoint: '/Expenses/GetExpensesForSpecificCustomerTransaction'
  }
]);
</script>

<template>
  <div class="grid" style="min-width: 100%">
    <div v-for="type in transactionTypes" :key="type.id" class="col-12 lg:col-4">
      <div class="card mb-4 cursor-pointer shadow-2 hover:shadow-5 transition-duration-200" 
           @click="$emit('select', type)">
        <div class="flex flex-column p-6 h-full">
          <div class="flex align-items-center mb-4">
            <div :class="[type.color, 'w-4rem h-4rem border-circle flex align-items-center justify-content-center mr-4']">
              <i :class="['pi', type.icon, type.textColor, 'text-2xl']"></i>
            </div>
            <h3 :class="['font-semibold text-2xl m-0', type.textColor]">{{ type.name }}</h3>
          </div>
          
          <p class="line-height-3 text-500 my-3 text-lg">{{ type.description }}</p>
          
          <div class="flex justify-content-end mt-auto">
            <Button icon="pi pi-arrow-right" :class="[type.textColor, 'p-button-rounded p-button-text']" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-3px);
}
</style>