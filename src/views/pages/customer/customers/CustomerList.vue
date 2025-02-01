<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import CustomerCard from './CustomerCard.vue';
import EditCustomerDialog from './EditCustomerDialog.vue';

const router = useRouter();
const props = defineProps<{
  customers: any[];
  activeTab: string;
  searchQuery: string;
}>();

const emit = defineEmits(['view-details', 'submit-approval', 'edit-customer', 'approve', 'reject']);

const showEditDialog = ref(false);
const selectedCustomer = ref(null);

const filteredCustomers = computed(() => {
  return props.customers.filter((customer) => {
    const matchesTab =
      props.activeTab === 'all' || (props.activeTab === 'active' && customer.status === 'active') || (props.activeTab === 'pending' && customer.status === 'pending') || (props.activeTab === 'rejected' && customer.status === 'rejected');

    const matchesSearch =
      !props.searchQuery ||
      customer.name.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
      customer.mobile.includes(props.searchQuery) ||
      customer.cr?.includes(props.searchQuery) ||
      customer.vat?.includes(props.searchQuery);

    return matchesTab && matchesSearch;
  });
});

const handleEditCustomer = (customer: any) => {
  selectedCustomer.value = customer;
  showEditDialog.value = true;
};

const handleSaveCustomer = (updatedCustomer: any) => {
  // Find and update the customer in the list
  const index = props.customers.findIndex((c) => c.id === updatedCustomer.id);
  if (index !== -1) {
    props.customers[index] = updatedCustomer;
  }
  showEditDialog.value = false;
  selectedCustomer.value = null;
};

const handleDashboard = (customer: any, event: Event) => {
  event.stopPropagation(); // Prevent card click event
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
  <div class="space-y-4 overflow-y-auto custom-scrollbar">
    <CustomerCard
      v-for="customer in filteredCustomers"
      :key="customer.id"
      :customer="customer"
      class="mb-5 shadow-none rounded-lg border-1 border-gray-200"
      @view-details="$emit('view-details', customer)"
      @edit-customer="handleEditCustomer"
      @submit-approval="$emit('submit-approval', customer)"
      @approve="handleApprove"
      @reject="handleReject"
    >
      <!-- Add Dashboard Button -->
      <template #actions>
        <div @click="(e) => handleDashboard(customer, e)" class="px-3 py-1.5 text-blue-600 hover:bg-blue-50 border-round-lg flex align-items-center space-x-1">
          <span class="material-icons text-sm">
            <font-awesome-icon :icon="['fas', 'table-columns']" />
          </span>
          <span>Dashboard</span>
        </div>
      </template>
    </CustomerCard>

    <!-- Edit Customer Dialog -->
    <EditCustomerDialog v-if="showEditDialog" :show="showEditDialog" :customer="selectedCustomer" @close="showEditDialog = false" @save="handleSaveCustomer" />
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}

/* Ensure smooth scrolling */
.space-y-4 {
  scroll-behavior: smooth;
}

/* Add padding to bottom to ensure last card is fully visible */
.space-y-4 {
  padding-bottom: 1rem;
}

/* Improve touch scrolling on mobile */
@media (hover: none) {
  .custom-scrollbar {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
