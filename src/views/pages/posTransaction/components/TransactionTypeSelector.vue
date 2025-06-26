<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  selectedType: Object,
  disabled: Boolean
});

const emit = defineEmits(['select']);

const transactionTypes = ref([
  {
    id: 'invoices',
    name: t('transactions.invoices'),
    icon: 'pi-file',
    endpoint: '/Invoices/GetOrdersBasedOnCustomerTransaction'
  },
  {
    id: 'payments',
    name: t('transactions.payments'),
    icon: 'pi-credit-card',
    endpoint: '/Payments/GetPaymentsForSpecificCustomerTransaction'
  },
  {
    id: 'expenses',
    name: t('transactions.expenses'),
    icon: 'pi-shopping-bag',
    endpoint: '/Expenses/GetExpensesForSpecificCustomerTransaction'
  }
]);

// Local value for SelectButton
const selectedValue = ref(null);

// Watch for changes from parent
watch(() => props.selectedType, (newType) => {
  selectedValue.value = newType;
}, { immediate: true });

// Handle selection change
const onSelectionChange = (value) => {
  emit('select', value);
};
</script>

<template>
    
    <SelectButton 
      v-model="selectedValue"
      :options="transactionTypes" 
      optionLabel="name"
      :disabled="disabled"
      @update:model-value="onSelectionChange"
      class="flex w-full "
    >
        <template #option="{ option }">
            <div class="flex align-items-center gap-2" v-tooltip.top=" option.name ">
                <i :class="['pi', option.icon, 'text-lg']" ></i>
                <span class="hidden xl:block " >{{ option.name }}</span>
            </div>
        </template>
    </SelectButton>
</template>

<style scoped>

</style>