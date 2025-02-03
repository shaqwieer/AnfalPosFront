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

const rowsPerPage = ref(10);
const currentPage = ref(0);

const paginatedCustomers = computed(() => {
  if (!props.customers || !Array.isArray(props.customers)) {
    return []; // إذا كان customers غير معرف أو ليس مصفوفة، أعد مصفوفة فارغة
  }

  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return props.customers.slice(start, end);

  // return [
  //   {
  //     accountNumber: 'SA1234567890123456789012',
  //     additionalNotes: 'Preferred customer',
  //     additionalNumber: '987654',
  //     altitude: '250',
  //     bankName: 'Al Rajhi Bank',
  //     buildingNumber: '123',
  //     city: 'Riyadh',
  //     contactEmail: 'contact@example.com',
  //     contactMobileNumber: '+966500000001',
  //     contactPersonName: 'Ali Ahmed',
  //     crNumber: '1010101010',
  //     createdAt: '2025-01-05T16:18:21.272344Z',
  //     creditLimit: 50000,
  //     district: 'Olaya',
  //     email: 'customer1@example.com',
  //     financeNotes: 'Payment on hold',
  //     iban: 'SA0380000000608010167519',
  //     id: 1,
  //     industry: 'Retail',
  //     isBusinessPartner: true,
  //     latitude: '24.7136',
  //     name: 'شركة الراجحي للتجارة',
  //     paymentTerm: 'Net 30',
  //     position: 'CEO',
  //     postalCode: '11564',
  //     preferredDays: 'Sunday, Wednesday',
  //     primaryPhone: '+966501107103',
  //     sapCustomer: 'L2S001',
  //     statusId: 7,
  //     statusName: 'Approved',
  //     streetName: 'King Fahd Road',
  //     swiftCode: 'RJHISARI',
  //     uniqueIdentifier: 'f776030a-39f1-42b5-8c42-9550c94cad05',
  //     vatNumber: '300000123456003',
  //     website: 'https://www.alrajhi.com'
  //   },
  //   {
  //     accountNumber: 'SA9876543210987654321098',
  //     additionalNotes: 'High priority',
  //     additionalNumber: '654321',
  //     altitude: '300',
  //     bankName: 'Saudi National Bank',
  //     buildingNumber: '456',
  //     city: 'Jeddah',
  //     contactEmail: 'info@business.com',
  //     contactMobileNumber: '+966512345678',
  //     contactPersonName: 'Mohammed Saeed',
  //     crNumber: '2020202020',
  //     createdAt: '2025-02-10T10:10:10.123456Z',
  //     creditLimit: 75000,
  //     district: 'Al Hamra',
  //     email: 'customer2@example.com',
  //     financeNotes: 'Eligible for discount',
  //     iban: 'SA6543210987654321098765',
  //     id: 2,
  //     industry: 'Manufacturing',
  //     isBusinessPartner: true,
  //     latitude: '21.4858',
  //     name: 'مصنع جدة للمنتجات',
  //     paymentTerm: 'Net 45',
  //     position: 'Finance Manager',
  //     postalCode: '21442',
  //     preferredDays: 'Monday, Thursday',
  //     primaryPhone: '+966512345678',
  //     sapCustomer: 'L2S002',
  //     statusId: 8,
  //     statusName: 'Rejected',
  //     streetName: 'Prince Sultan Street',
  //     swiftCode: 'SNBKSARI',
  //     uniqueIdentifier: 'a123456b-78cd-90ef-12gh-3456ijklmnop',
  //     vatNumber: '400000654321007',
  //     website: 'https://www.jeddahfactory.com'
  //   },
  //   {
  //     accountNumber: 'SA98765432123423423421098',
  //     additionalNotes: 'Hiasgh priority',
  //     additionalNumber: '654234321',
  //     altitude: '300',
  //     bankName: 'Saudi Nati ank',
  //     buildingNumber: '456',
  //     city: 'Jeddah',
  //     contactEmail: 'info@business.com',
  //     contactMobileNumber: '+966512345678',
  //     contactPersonName: 'Mohammed Saeed',
  //     crNumber: '2020202020',
  //     createdAt: '2025-02-10T10:10:10.123456Z',
  //     creditLimit: 75000,
  //     district: 'Al Hamra',
  //     email: 'customer2@example.com',
  //     financeNotes: 'Eligible for discount',
  //     iban: 'SA6543210987654321098765',
  //     id: 3,
  //     industry: 'Manufacturing',
  //     isBusinessPartner: true,
  //     latitude: '21.4858',
  //     name: 'مصنع جدة للمنتجات',
  //     paymentTerm: 'Net 45',
  //     position: 'Finance Manager',
  //     postalCode: '21442',
  //     preferredDays: 'Monday, Thursday',
  //     primaryPhone: '+966512345678',
  //     sapCustomer: 'L2S002',
  //     statusId: 6,
  //     statusName: 'Pending',
  //     streetName: 'Prince Sultan Street',
  //     swiftCode: 'SNBKSARI',
  //     uniqueIdentifier: 'a123456b-78cd-90ef-12gh-3456ijklmnop',
  //     vatNumber: '400000654321007',
  //     website: 'https://www.jeddahfactory.com'
  //   }
  // ];
});

// تحديث الصفحة عند تغيير `Paginator`
const onPageChange = (event: { page: number }) => {
  currentPage.value = event.page ?? 0;
};
const filteredCustomers = computed(() => {
  return paginatedCustomers.value.filter((customer) => {
    const matchesTab = props.activeTab === 'all' || (props.activeTab === 'active' && customer.statusName === 'Approved') || (props.activeTab === 'pending' && customer.statusName === 'Pending')|| (props.activeTab === 'rejected' && customer.statusName === 'Rejected');

    const matchesSearch =
      !props.searchQuery ||
      customer.name.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
      customer.id.toString().toLowerCase().includes(props.searchQuery.toLowerCase()) ||
      customer.primaryPhone.includes(props.searchQuery) ||
      customer.crNumber?.includes(props.searchQuery);

    return matchesTab && matchesSearch;
  });
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
          <span>Dashboard</span>
        </div>
      </template>
    </CustomerCard>

    <Paginator :rows="rowsPerPage" :totalRecords="props.customers.length" @page="onPageChange" />

    <!-- Edit Customer Dialog -->
    <EditCustomerDialog v-if="showEditDialog" :show="showEditDialog" :customer="selectedCustomer" @close="showEditDialog = false" @save="handleSaveCustomer" />
  </div>
</template>
