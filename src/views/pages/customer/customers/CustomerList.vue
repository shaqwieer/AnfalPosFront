<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import CustomerCard from './CustomerCard.vue';

const router = useRouter();
const props = defineProps<{
  customers: any[];
}>();

const CustomerStatus = {
  Pending: 6,
  Approved: 7,
  Rejected: 8
};

const emit = defineEmits(['view-details', 'submit-approval', 'edit-customer', 'approve', 'reject']);

const showEditDialog = ref(false);
const selectedCustomer = ref(null);


const handleEditCustomer = (customer: any) => {
  emit('edit-customer', customer);
};

const handleSaveCustomer = (updatedCustomer: any) => {
  const index = props.customers.findIndex((c) => c.id === updatedCustomer.id);
  if (index !== -1) {
    props.customers[index] = updatedCustomer;
  }
  showEditDialog.value = false;
  selectedCustomer.value = null;
};

const handleDashboard = (customer: any, event: Event) => {
  event.stopPropagation();
  router.push({
    name: 'customer-dashboard',
    params: { id: customer.id }
  });
};

const handleApprove = (customer: any) => {
  emit('approve', customer);
};

const handleReject = (customer: any) => {
  emit('reject', customer);
};
</script>

<template>
  <div class="flex flex-column gap-4">
    <CustomerCard
      v-for="customer in customers"
      :key="customer.id"
      :customer="customer"
      @view-details="$emit('view-details', customer)"
      @edit-customer="handleEditCustomer"
      @submit-approval="$emit('submit-approval', customer)"
      @approve="handleApprove"
      @reject="handleReject"
    >
      <!-- Add Dashboard Button -->
      <!-- <template #actions>
        <div @click="(e) => handleDashboard(customer, e)" class="p-button p-button-text p-button-primary flex align-items-center gap-1">
          <i class="pi pi-chart-line"></i>
          <span>{{ $t(`Dashboard`) }}</span>
        </div>
      </template> -->
    </CustomerCard>


    <!-- Edit Customer Dialog -->
    <!-- <EditCustomerDialog v-if="showEditDialog" :show="showEditDialog" :customer="selectedCustomer" @close="showEditDialog = false" @save="handleSaveCustomer" /> -->
  </div>
</template>
