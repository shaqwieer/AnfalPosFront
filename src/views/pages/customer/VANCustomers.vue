<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVanStore } from '@/stores/vanStore.js';
import { useCustomerStore } from '@/stores/customerStore.js';

import CustomerList from './customers/CustomerList.vue';
import CustomerForm from './customers/CustomerForm.vue';
import CustomerDetails from './customers/CustomerDetails.vue';
import EditCustomerDialog from './customers/EditCustomerDialog.vue';
import { vanCustomers } from './customers/VANCustomerSampleData';

const vanStore = useVanStore();
const customerStore = useCustomerStore();

const activeTab = ref('active');
const searchQuery = ref('');
const showNewCustomerForm = ref(false);
const selectedCustomer = ref(null);
const showDetails = ref(false);
const showEditDialog = ref(false);
// const viewMode = ref<'cards' | 'list'>('cards');
const viewMode = ref<'cards' | 'list'>('list');

onMounted(async () => {
  await customerStore.GetCustomerBasedOnBranchType();
});
// Initialize customers with sample data
const customers = computed(() => customerStore.customers);

const handleSubmitCustomer = (customer: any) => {
  // Add the new customer to the list
  customers.value = [...customers.value, customer];

  // Close the form
  showNewCustomerForm.value = false;

  // Switch to pending tab since new customers start as pending
  activeTab.value = 'pending';
};

const handleViewDetails = (customer: any) => {
  selectedCustomer.value = customer;
  showDetails.value = true;
};

const handleEditCustomer = (customer: any) => {
  selectedCustomer.value = customer;
  showEditDialog.value = true;
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
      submittedBy: vanStore.vanInfo.driver,
      submittedDate: new Date().toISOString().split('T')[0]
    };
  }
};

const handleApprove = (customer: any) => {
  const index = customers.value.findIndex((c) => c.id === customer.id);
  if (index !== -1) {
    customers.value[index] = {
      ...customer,
      status: 'active',
      approvalStatus: 'approved',
      approvedBy: vanStore.vanInfo.driver,
      approvedDate: new Date().toISOString().split('T')[0]
    };
  }
};

const handleReject = (customer: any) => {
  const index = customers.value.findIndex((c) => c.id === customer.id);
  if (index !== -1) {
    customers.value[index] = {
      ...customer,
      status: 'rejected',
      approvalStatus: 'rejected',
      approvedBy: vanStore.vanInfo.driver,
      approvedDate: new Date().toISOString().split('T')[0]
    };
  }
};

const toggleView = () => {
  viewMode.value = viewMode.value === 'cards' ? 'list' : 'cards';
};

import { useI18n } from 'vue-i18n';
import apiClientx from '../../../api/apiClient';
import { useMainStore } from '../../../stores/mainStore';

const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);
const containerClass = computed(() => ({
  rtl: mainStore.isRTL,
  ltr: !mainStore.isRTL
}));
const { t, locale } = useI18n();

const CustomerStatus = {
  Pending: 6,
  Approved: 7,
  Rejected: 8
};

//test

// const filteredCustomers = computed(() => {
//   const filtered = customers.value.filter((customer) => {
//     const matchesTab =
//       activeTab.value === 'all' ||
//       (activeTab.value === 'active' && customer.statusId === CustomerStatus.Approved) ||
//       (activeTab.value === 'pending' && customer.statusId === CustomerStatus.Pending) ||
//       (activeTab.value === 'rejected' && customer.statusId === CustomerStatus.Rejected);

//     const matchesSearch =
//       !searchQuery.value || // إذا كان searchQuery فارغًا، يعتبر الشرط صحيحًا
//       customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       customer.id.toString().toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//       customer.primaryPhone.includes(searchQuery.value) ||
//       customer.crNumber?.includes(searchQuery.value);

//     return matchesTab && matchesSearch;
//   });

//   return filtered;

// });

const filteredCustomers = computed(() => {
  const filtered = customers.value.filter((customer) => {
    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'active' && customer.statusId === CustomerStatus.Approved) ||
      (activeTab.value === 'pending' && customer.statusId === CustomerStatus.Pending) ||
      (activeTab.value === 'rejected' && customer.statusId === CustomerStatus.Rejected);

    const matchesSearch =
      !searchQuery.value ||
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.id.toString().toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.primaryPhone.includes(searchQuery.value) ||
      customer.crNumber?.includes(searchQuery.value);

    return matchesTab && matchesSearch;
  });

  return filtered;
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
          <!-- List View -->
          <!-- <div v-if="viewMode === 'list'" class="surface-card border-round-lg shadow-2 border-1 surface-border overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Info</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit Limit</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">
                      {{ customer.name }}
                    </div>
                    <div class="text-sm text-gray-500">{{ customer.id }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm">{{ customer.mobile }}</div>
                    <div class="text-sm text-gray-500">
                      {{ customer.email }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm">CR: {{ customer.cr }}</div>
                    <div class="text-sm">VAT: {{ customer.vat }}</div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="text-sm font-medium">
                      {{
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'SAR'
                        }).format(customer.creditLimit)
                      }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="text-sm font-medium">
                      {{
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'SAR'
                        }).format(customer.balance)
                      }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-column align-items-center space-y-1">
                      <span
                        class="px-2 py-1 text-xs rounded-full"
                        :class="{
                          'bg-green-100 text-green-800': customer.status === 'active',
                          'bg-yellow-100 text-yellow-800': customer.status === 'pending',
                          'bg-red-100 text-red-800': customer.status === 'rejected'
                        }"
                      >
                        {{ customer.status }}
                      </span>
                      <span
                        class="px-2 py-1 text-xs rounded-full"
                        :class="{
                          'bg-green-100 text-green-800': customer.approvalStatus === 'approved',
                          'bg-yellow-100 text-yellow-800': customer.approvalStatus === 'pending',
                          'bg-red-100 text-red-800': customer.approvalStatus === 'rejected'
                        }"
                      >
                        {{ customer.approvalStatus }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex align-items-center justify-content-center space-x-2">
                      <button @click="handleViewDetails(customer)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full">
                        <i class="pi pi-eye"></i>
                      </button>
                      <button @click="handleEditCustomer(customer)" class="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full">
                        <i class="pi pi-pencil"></i>
                      </button>
                      <button v-if="customer.status === 'draft'" @click="handleSubmitApproval(customer)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full">
                        <i class="pi pi-send"></i>
                      </button>
                      <template v-if="customer.approvalStatus === 'pending'">
                        <button @click="handleApprove(customer)" class="p-1.5 text-green-600 hover:bg-green-50 rounded-full">
                          <i class="pi pi-check-circle"></i>
                        </button>
                        <button @click="handleReject(customer)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-full">
                          <i class="pi pi-times-circle"></i>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div> -->

          <!-- ----------------------------------------------------------- -->
          <DataTable
            class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border"
            v-if="viewMode === 'list'"
            :value="filteredCustomers"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :globalFilterFields="['name', 'id']"
            :paginatorTemplate="
              mainStore.isRTL ? 'RowsPerPageDropdown NextPageLink LastPageLink  PageLinks FirstPageLink PrevPageLink  CurrentPageReport ' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
            "
            :rowsPerPageOptions="[5, 10, 25]"
            :currentPageReportTemplate="''"
          >
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
                      'bg-green-100 text-green-800  border-round-lg': slotProps.data.statusId === CustomerStatus.Approved,
                      'bg-yellow-100 text-yellow-800  border-round-lg': slotProps.data.statusId === CustomerStatus.Pending,
                      'bg-red-100 text-red-800  border-round-lg': slotProps.data.statusId === CustomerStatus.Rejected
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
            <CustomerList
              :customers="customers"
              :active-tab="activeTab"
              :search-query="searchQuery"
              @view-details="handleViewDetails"
              @edit-customer="handleEditCustomer"
              @submit-approval="handleSubmitApproval"
              @approve="handleApprove"
              @reject="handleReject"
            />
          </div>

          <!-- ----------------------------------------------------------- -->
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <CustomerForm v-if="showNewCustomerForm" :show="showNewCustomerForm" @close="showNewCustomerForm = false" @submit="handleSubmitCustomer" />

    <CustomerDetails v-if="showDetails" :show="showDetails" :customer="selectedCustomer" @close="showDetails = false" />

    <EditCustomerDialog v-if="showEditDialog" :show="showEditDialog" :customer="selectedCustomer" @close="showEditDialog = false" @save="handleSaveCustomer" />
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
