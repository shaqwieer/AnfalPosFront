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

const CustomerStatus = {
  Pending: 6,
  Approved: 7,
  Rejected: 8
};

const emit = defineEmits(['view-details', 'submit-approval', 'edit-customer', 'approve', 'reject']);

const showEditDialog = ref(false);
const selectedCustomer = ref(null);

const rowsPerPage = ref(10);
const currentPage = ref(0);

const paginatedCustomers = computed(() => {
  if (!props.customers || !Array.isArray(props.customers)) {
    return []; // إذا كان customers غير معرف أو ليس مصفوفة، أعد مصفوفة فارغة
  }

  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return props.customers.slice(start, end);
});

// تحديث الصفحة عند تغيير `Paginator`
const onPageChange = (event: { page: number }) => {
  currentPage.value = event.page ?? 0;
};

// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

const filteredCustomers = computed(() => {
  // return props.customers.filter((customer) => {
  //   const matchesTab =
  //     props.activeTab === 'all' || (props.activeTab === 'approved' && customer.statusName === 'Approved') || (props.activeTab === 'pending' && customer.statusName === 'Pending') || (props.activeTab === 'rejected' && customer.statusName === 'Rejected');

  //   const matchesSearch =
  //     !props.searchQuery ||
  //     customer.name.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
  //     customer.id.toString().toLowerCase().includes(props.searchQuery.toLowerCase()) ||
  //     customer.primaryPhone.includes(props.searchQuery) ||
  //     customer.crNumber?.includes(props.searchQuery);

  //   return matchesTab && matchesSearch;
  // });

  const filtered = props.customers.filter((customer) => {
    const matchesTab =
      props.activeTab === 'all' ||
      (props.activeTab === 'active' && customer.statusId === CustomerStatus.Approved) ||
      (props.activeTab === 'pending' && customer.statusId === CustomerStatus.Pending) ||
      (props.activeTab === 'rejected' && customer.statusId === CustomerStatus.Rejected);

    const matchesSearch =
      !props.searchQuery ||
      customer.name.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
      customer.id.toString().toLowerCase().includes(props.searchQuery.toLowerCase()) ||
      customer.primaryPhone.includes(props.searchQuery) ||
      customer.crNumber?.includes(props.searchQuery);

    return matchesTab && matchesSearch;
  });

  // بعد الفلترة، قم بتطبيق التصفح (pagination)
  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filtered.slice(start, end);
});

const handleEditCustomer = (customer: any) => {
  selectedCustomer.value = customer;
  showEditDialog.value = true;
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
      v-for="customer in filteredCustomers"
      :key="customer.id"
      :customer="customer"
      @view-details="$emit('view-details', customer)"
      @edit-customer="handleEditCustomer"
      @submit-approval="$emit('submit-approval', customer)"
      @approve="handleApprove"
      @reject="handleReject"
    >
      <!-- Add Dashboard Button -->
      <template #actions>
        <div @click="(e) => handleDashboard(customer, e)" class="p-button p-button-text p-button-primary flex align-items-center gap-1">
          <i class="pi pi-chart-line"></i>
          <span>{{ $t(`Dashboard`) }}</span>
        </div>
      </template>
    </CustomerCard>

    <Paginator :rows="rowsPerPage" :totalRecords="props.customers.length" @page="onPageChange" />

    <!-- Edit Customer Dialog -->
    <EditCustomerDialog v-if="showEditDialog" :show="showEditDialog" :customer="selectedCustomer" @close="showEditDialog = false" @save="handleSaveCustomer" />
  </div>
</template>
