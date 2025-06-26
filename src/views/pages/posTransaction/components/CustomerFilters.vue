<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps({
  selectedCustomer: Object,
  customers: Array,
  loading: Boolean
});

var filters = defineModel('filters');

defineEmits(['update:selectedCustomer']);

// Helper function to get customer initials
const getCustomerInitials = (name) => {
  if (!name) return '?';

  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    return words[0].substring(0, 2).toUpperCase();
  }
};

const onDateSelect = (selectedDate, key) => {
  if (!selectedDate) return;
  filters[key].value = selectedDate.setHours(12, 0, 0, 0);
};
</script>

<template>
  <div class="col-12 mb-4">
    <div class="card p-4">
      <div class="grid">
        <!-- Customer Selection -->
        <div class="col-12 md:col-4">
          <label class="block font-medium mb-2">{{ t('transactions.customer') }} *</label>
          <Dropdown
            :model-value="selectedCustomer"
            @update:model-value="$emit('update:selectedCustomer', $event)"
            :options="customers"
            optionLabel="name"
            :placeholder="t('transactions.selectCustomer')"
            class="w-full h-3rem"
            filter
            :filterFields="['name', 'sapCustomer']"
            :loading="loading"
          >
            <!-- Selected Value Template -->
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center gap-2">
                <!-- Customer Info -->
                <div class="flex flex-column">
                  <span class="font-medium text-base text-900">{{ slotProps.value.name }} {{ slotProps.value.sapCustomer }}</span>
                </div>
              </div>
              <span v-else class="text-500">
                {{ slotProps.placeholder }}
              </span>
            </template>

            <!-- Option Template -->
            <template #option="slotProps">
              <div class="flex align-items-center gap-3 p-2 hover:surface-hover border-round transition-duration-200">
                <!-- Customer Avatar/Initial -->
                <div class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle" style="width: 32px; height: 32px; font-size: 12px; font-weight: bold">
                  {{ getCustomerInitials(slotProps.option.name) }}
                </div>

                <!-- Customer Details -->
                <div class="flex flex-column">
                  <span class="font-medium text-900">{{ slotProps.option.name }}</span>
                  <div class="flex align-items-center gap-2 mt-1">
                    <span class="text-500 text-sm" v-if="slotProps.option.sapCustomer">
                      <i class="pi pi-id-card text-xs mr-1"></i>
                      {{ slotProps.option.sapCustomer }}
                    </span>
                    <span class="text-500 text-sm" v-if="slotProps.option.phoneNumber">
                      <i class="pi pi-phone text-xs mr-1"></i>
                      {{ slotProps.option.phoneNumber }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </Dropdown>
        </div>

        <!-- Date Range -->
        <div class="col-12 md:col-4">
          <label class="block font-medium mb-2">{{ t('transactions.fromDate') }} *</label>
          <Calendar v-model="filters.fromDate" @date-select="(e) => onDateSelect(e, 'fromDate')" dateFormat="yy-mm-dd" class="w-full" />
        </div>

        <div class="col-12 md:col-4">
          <label class="block font-medium mb-2">{{ t('transactions.toDate') }} *</label>
          <Calendar v-model="filters.toDate" @date-select="(e) => onDateSelect(e, 'toDate')" dateFormat="yy-mm-dd" class="w-full" />
        </div>

        <!-- Transaction Type Selector - SAP Style -->
        <div class="col-12 md:col-4">
          <label class="block font-medium mb-2">{{ t('transactions.transactionType') }} *</label>
          <slot name="transaction-selector"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-dropdown-label) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

:deep(.p-calendar .p-inputtext) {
  width: 100%;
}
</style>