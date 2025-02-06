<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
//import { useVanStore } from '@/stores/vanStore.js';
import { useCustomerStore } from '../../../stores/customerStore';

import CustomerList from './customers/CustomerList.vue';
import CustomerForm from './customers/CustomerForm.vue';
import { vanCustomers } from './customers/VANCustomerSampleData';

//const vanStore = useVanStore();
const customerStore = useCustomerStore();

const activeTab = ref('active');
const searchQuery = ref('');
const showNewCustomerForm = ref(false);
const selectedCustomer = ref(null);
const showEditDialog = ref(false);
// const viewMode = ref<'cards' | 'list'>('cards');
const viewMode = ref<'cards' | 'list'>('list');

onMounted(async () => {
  await customerStore.GetCustomerBasedOnBranchType();
});
// Initialize customers with sample data
const customers = computed(() => customerStore.customers);

const handleSubmitCustomer = (customer: any) => {
  if (selectType.value === 'edit') {
    customerStore.EditCustomerBasedOnBranchType(customer);
  } else {
    customerStore.CreateCustomerBasedOnBranchType(customer);
    customerStore.customers.push(customer);
  }
  // Close the form
  showNewCustomerForm.value = false;
  selectType.value = '';
  // Switch to pending tab since new customers start as pending
  activeTab.value = 'pending';
};

const selectType = ref('');
const handleViewDetails = (customer: any) => {
  selectType.value = 'view';
  selectedCustomer.value = customer;
  showNewCustomerForm.value = true;
};

const handleEditCustomer = (customer: any) => {
  selectType.value = 'edit';
  selectedCustomer.value = customer;
  showNewCustomerForm.value = true;
};

const handleSaveCustomer = (updatedCustomer: any) => {
  const index = customers.value.findIndex((c) => c.id === updatedCustomer.id);
  if (index !== -1) {
    customers.value[index] = updatedCustomer;
  }
  showEditDialog.value = false;
  selectedCustomer.value = null;
};

const handleSubmitApproval = (customer: any) => {
  const index = customers.value.findIndex((c) => c.id === customer.id);
  if (index !== -1) {
    customers.value[index] = {
      ...customer,
      status: 'pending',
      approvalStatus: 'pending',
      //submittedBy: vanStore.vanInfo.driver,
      submittedDate: new Date().toISOString().split('T')[0]
    };
  }
};

const handleApprove = (customer: any) => {
  customerStore.ApproveCustomer(customer);
};

const handleReject = (customer: any) => {
  customerStore.RejectCustomer(customer);
};

const toggleView = () => {
  viewMode.value = viewMode.value === 'cards' ? 'list' : 'cards';
};

import { useI18n } from 'vue-i18n';
import { useMainStore } from '../../../stores/mainStore';

const mainStore = useMainStore();
const { t, locale } = useI18n();

const rowsPerPage = ref(10);
const currentPage = ref(0);

// تحديث الصفحة عند تغيير `Paginator`
const onPageChange = (event: { page: number }) => {
  currentPage.value = event.page ?? 0;
};

const paginatedCustomers = computed(() => {
  if (!filteredCustomers.value || !Array.isArray(filteredCustomers.value)) {
    return []; // إذا كان customers غير معرف أو ليس مصفوفة، أعد مصفوفة فارغة
  }
  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredCustomers.value.slice(start, end);
});

const filteredCustomers = computed(() => {
  return customers.value.filter((customer) => {
    const matchesTab =
      activeTab.value === 'all' || (activeTab.value === 'active' && customer.statusName === 'Approved') || (activeTab.value === 'pending' && customer.statusName === 'Pending') || (activeTab.value === 'rejected' && customer.statusName === 'Rejected');

    const matchesSearch =
      !searchQuery.value ||
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.id.toString().toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.primaryPhone.includes(searchQuery.value) ||
      customer.crNumber?.includes(searchQuery.value);

    return matchesTab && matchesSearch;
  });
});
</script>

<template>
  <div class="h-full flex flex-column">
    <!-- Header -->
    <div class="px-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex align-items-center justify-content-between mb-6">
          <h1 class="text-900 text-4xl font-bold">
            {{ t(`Customer.Customers`) }}
          </h1>
          <div class="flex gap-2 align-items-center">
            <!-- View Toggle -->
            <div class="flex gap-2 align-items-center surface-100 border-round-lg p-1">
              <div
                @click="viewMode = 'cards'"
                class="p-2 flex justify-content-center align-items-center border-round-md cursor-pointer transition-colors duration-200"
                :class="viewMode === 'cards' ? 'surface-0 text-blue-600 shadow-1' : 'hover:surface-200'"
                style="width: 35px"
              >
                <i class="pi pi-th-large"></i>
              </div>
              <div
                @click="viewMode = 'list'"
                class="p-2 flex justify-content-center align-items-center border-round-md cursor-pointer transition-colors duration-200"
                :class="viewMode === 'list' ? 'surface-0 text-blue-600 shadow-1' : 'hover:surface-200'"
                style="width: 35px"
              >
                <i class="pi pi-list"></i>
              </div>
            </div>

            <button @click="showNewCustomerForm = true" class="p-button p-button-primary flex align-items-center gap-2">
              <i class="pi pi-plus"></i>
              <span> {{ t(`Customer.New`) }}</span>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border">
          <div class="border-bottom-1 surface-border">
            <!-- v-for="tab in [`${t(`Customer.all`)}`, `${t(`Customer.active`)}`, `${t(`Customer.pending`)}`, `${t(`Customer.rejected`)}`]" -->

            <div class="flex">
              <div
                v-for="tab in ['all', 'active', 'pending', 'rejected']"
                :key="tab"
                @click="activeTab = tab"
                class="py-3 px-4 focus:outline-none cursor-pointer border-bottom-2 font-medium transition-colors duration-200 capitalize"
                :class="activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-700 hover:text-900'"
              >
                {{ t(`Customer.${tab}`) }}
              </div>
            </div>
          </div>

          <!-- Search -->
          <div class="p-4">
            <span class="relative p-input-icon-left w-full">
              <span class="absolute top-50 translate-y-50" style="left: 9px"><i class="pi pi-search"></i></span>
              <input v-model="searchQuery" type="text" class="p-inputtext w-full pl-5" :placeholder="`${t('Customer.placeholder')}`" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer List - Scrollable Area -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto px-6 pb-6">
        <div class="max-w-7xl mx-auto">
          <DataTable class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border" v-if="viewMode === 'list'" :value="paginatedCustomers" dataKey="id" :rows="10" :globalFilterFields="['name', 'id']" :currentPageReportTemplate="''">
            <template #empty>
              <div class="flex justify-content-center align-items-center font-bold text-lg">
                {{ t(`Customer.empty`) }}
              </div></template
            >

            <Column field="name" class="" :sortable="true">
              <template #header>
                <span class="text-lg font-bold"> {{ t('Customer.name') }} </span>
              </template>

              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <div class="font-semibold text-lg">{{ slotProps.data.name }}</div>
                  <div class="text-sm text-gray-500">CUS-{{ slotProps.data.id }}</div>
                </div>
              </template>
            </Column>

            <Column field="Contact" class="">
              <template #header>
                <span class="text-lg font-bold"> {{ t('Customer.Contact') }} </span>
              </template>
              <template #body="slotProps">
                <div class="flex flex-column align-items-start">
                  <span class="text-md">{{ slotProps.data.contactMobileNumber }}</span>
                  <span class="text-md">{{ slotProps.data.email }}</span>
                </div>
              </template>
            </Column>

            <Column field="Business Info" :header="t('Customer.Business_Info')" class="">
              <template #body="slotProps">
                <div class="flex flex-column justify-content-start align-items-start">
                  <div class="text-md">CR: {{ slotProps.data.crNumber }}</div>
                  <div class="text-md">VAT: {{ slotProps.data.vatNumber }}</div>
                </div>
              </template>
            </Column>

            <Column field="Credit Limit" :header="t('Customer.Credit_Limit')" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex flex-column justify-content-start align-items-start">
                  <div class="font-semibold text-md">SAR {{ slotProps.data.creditLimit }}</div>
                </div>
              </template>
            </Column>

            <Column field="Balance" :header="t('Customer.Balance')" class="">
              <template #body="slotProps">
                <div class="flex flex-column justify-content-start align-items-start">
                  <!-- empty -->
                  <div class="font-semibold text-md">SAR {{ slotProps.data.balance ? slotProps.data.balance : '25,000.00' }}</div>
                </div>
              </template>
            </Column>

            <Column field="statusName" :header="t('Customer.Status')" class="">
              <template #body="slotProps">
                <div class="flex flex-column align-items-center space-y-1 gap-2">
                  <!-- <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="{
                      'bg-green-100 text-green-800  border-round-lg': slotProps.data.statusName === 'Approved',
                      'bg-yellow-100 text-yellow-800  border-round-lg': slotProps.data.statusName === 'Pending',
                      'bg-red-100 text-red-800  border-round-lg': slotProps.data.statusName === 'Rejected'
                    }"
                  >
                    {{ slotProps.data.statusName }}
                  </span> -->
                  <span
                    class="px-2 py-0 text-xs border-round-lg"
                    :class="{
                      'bg-green-100 text-green-800  border-round-lg': slotProps.data.statusId === 'Approved',
                      'bg-yellow-100 text-yellow-800  border-round-lg': slotProps.data.statusId === 'Pending',
                      'bg-red-100 text-red-800  border-round-lg': slotProps.data.statusId === 'Rejected'
                    }"
                  >
                    {{ slotProps.data.statusName }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="actions" :header="t('labels.actions')">
              <template #body="slotProps">
                <div class="flex align-items-center gap-3 justify-content-start">
                  <div @click="handleViewDetails(slotProps.data)" class="p-1.5 text-blue-600 hover:bg-blue-50 cursor-pointer rounded-full">
                    <i class="pi pi-eye"></i>
                  </div>

                  <div @click="handleEditCustomer(slotProps.data)" class="p-1.5 text-gray-600 hover:bg-gray-50 cursor-pointer rounded-full">
                    <i class="pi pi-pencil"></i>
                  </div>

                  <!-- v-if="slotProps.data.status === 'draft'" -->
                  <div v-if="slotProps.data.statusId === 8" @click="handleSubmitApproval(slotProps.data)" class="p-1.5 cursor-pointer text-blue-600 hover:bg-blue-50 rounded-full">
                    <i class="pi pi-send"></i>
                  </div>

                  <template v-if="slotProps.data.statusId === 6">
                    <div @click="handleApprove(slotProps.data)" class="p-1.5 cursor-pointer text-green-600 hover:bg-green-50 rounded-full">
                      <i class="pi pi-check-circle"></i>
                    </div>

                    <div @click="handleReject(slotProps.data)" class="p-1.5 cursor-pointer text-red-600 hover:bg-red-50 rounded-full">
                      <i class="pi pi-times-circle"></i>
                    </div>
                  </template>
                </div>
              </template>
            </Column>
          </DataTable>

          <!-- Card View -->
          <div v-else>
            <CustomerList :customers="paginatedCustomers" @view-details="handleViewDetails" @edit-customer="handleEditCustomer" @submit-approval="handleSubmitApproval" @approve="handleApprove" @reject="handleReject" />
          </div>
          <Paginator :rows="rowsPerPage" :totalRecords="customers.length" @page="onPageChange" />

          <!-- ----------------------------------------------------------- -->
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <CustomerForm v-if="showNewCustomerForm" :show="showNewCustomerForm" :action="selectType" :readOnly="selectType == 'view'" :customer="selectedCustomer" @close="showNewCustomerForm = false" @submit="handleSubmitCustomer" />
  </div>
</template>

<style scoped>
/* Custom scrollbar styles can be kept or removed as PrimeFlex doesn't provide scrollbar styling */
.translate-y-50 {
  transform: translateY(-50%);
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  /* background-color: red; */
  /* border-radius: 20px; */
}
</style>
