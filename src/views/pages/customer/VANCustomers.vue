<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
//import { useVanStore } from '@/stores/vanStore.js';
import { useCustomerStore } from '../../../stores/customerStore';
import apiClient from '../../../api/apiClient';
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
  await getPaymentTerms();
});
// Initialize customers with sample data
const customers = computed(() => customerStore.customers);

const handleSubmitCustomer = (customer: any) => {
  if (selectType.value === 'edit') {
    customerStore.EditCustomerBasedOnBranchType(customer);
  } else {
    customerStore.CreateCustomerBasedOnBranchType(customer);
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
import { C } from '@fullcalendar/core/internal-common';

const mainStore = useMainStore();
const { t, locale } = useI18n();

const rowsPerPage = ref(20);
const currentPage = ref(0);

const onPageChange = (event) => {
  currentPage.value = event.page ?? 0;
};

const onRowsChange = (newRows) => {
  rowsPerPage.value = newRows;
  currentPage.value = 0;
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

const creditLimitDialogVisible = ref(false);
const creditLimitValue = ref(null);
const openCreditLimit = (customer) => {
  var date = {...customer};
  creditLimitValue.value = date.creditLimit;
  creditLimitDialogVisible.value = true;
  selectedCustomer.value = customer;
};

const paymentTermDialogVisible = ref(false);
const openPaymentTerm = (customer) => {
  var date = {...customer};
  paymentTermId.value = date.paymentTermId;
  paymentTermDialogVisible.value = true;
  selectedCustomer.value = customer;
};

const containerClass = computed(() => ({
  rtl: mainStore.isRTL,
  ltr: !mainStore.isRTL
}));

const submitCreditLimit = async () => {
  if(selectedCustomer.value == null || selectedCustomer.value == undefined) return;
  if(!creditLimitValue.value) return;
  try {
    const response = await apiClient.put('/Customers/UpdateCustomerPaymentTermCreditLimit', { 
      creditLimit: creditLimitValue.value,
      isEditCreditLimit: true,
      customerId: selectedCustomer.value.id,
      paymentTermId:0,

    })
    creditLimitDialogVisible.value = false;
    selectedCustomer.value.creditLimit = creditLimitValue.value;
    creditLimitValue.value = null;
    selectedCustomer.value = null;
    console.log('response', response)
  } catch (err) {
    console.log(err)
  }
  
};

const paymentTermId = ref(null);

const submitPaymentTerm = async () => {
  if(selectedCustomer.value == null || selectedCustomer.value == undefined) return;
  if(!paymentTermId.value) return;
  try {
    const response = await apiClient.put('/Customers/UpdateCustomerPaymentTermCreditLimit', { 
      creditLimit: selectedCustomer.value.creditLimit,
      isEditCreditLimit: false,
      customerId: selectedCustomer.value.id,
      paymentTermId: paymentTermId.value,

    })
    paymentTermDialogVisible.value = false;
    selectedCustomer.value.paymentTermId = paymentTermId.value;
    paymentTermId.value = null;
    selectedCustomer.value = null;
    console.log('response', response)
  } catch (err) {
    console.log(err)
  }
  
};

const paymentTerms = ref([]);
const getPaymentTerms = async () => {
  try {
    const response = await apiClient.get(`/PaymentTerms`);
    paymentTerms.value = response.data.data;
  } catch (err) {
    handleError(err, mainStore.loading);
  }
};

</script>

<template>
  <div class="h-full flex flex-column">
    <!-- Header -->

    <div class="px-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex align-items-center justify-content-between mb-6">
          <h1 class="text-900 m-0 text-4xl font-bold">
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
                  <!-- {{ slotProps.data }} -->
                  <div class="font-semibold text-lg">{{ slotProps.data.name }}</div>
                  <div class="text-sm text-gray-500">{{  }} {{ slotProps.data.sapCustomer.replace("WST", "WST-") }}</div>
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
                  <div @click="openCreditLimit(slotProps.data)" class="p-1.5 cursor-pointer text-red-600 hover:bg-red-50 rounded-full">
                    <i class="pi pi-credit-card"></i>
                  </div>

                  <div @click="openPaymentTerm(slotProps.data)" class="p-1.5 cursor-pointer text-red-600 hover:bg-red-50 rounded-full">
                    <i class="pi pi-wallet"></i>
                  </div>

                </div>
              </template>
            </Column>
          </DataTable>

          <!-- Card View -->
          <div v-else>
            <CustomerList :customers="paginatedCustomers" @view-details="handleViewDetails" @edit-customer="handleEditCustomer" @submit-approval="handleSubmitApproval" @approve="handleApprove" @reject="handleReject" />
          </div>

          <Paginator :rows="rowsPerPage" :rowsPerPageOptions="[5, 10, 20, 25, 50]" :totalRecords="filteredCustomers.length" @page="onPageChange" @update:rows="onRowsChange" />

          <!-- ----------------------------------------------------------- -->
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <CustomerForm v-if="showNewCustomerForm" :show="showNewCustomerForm" :action="selectType" :readOnly="selectType == 'view'" :customer="selectedCustomer" @close="showNewCustomerForm = false" @submit="handleSubmitCustomer" />
   
    <Dialog v-model:visible="creditLimitDialogVisible" :breakpoints="{ '640px': '25rem' }" :header="t('Customer.editCreditLimit')" :class="containerClass" :style="{ width: '35rem' }" :modal="true" :closable="true" @hide="creditLimitDialogVisible = false">
        <div class="flex flex-column gap-4 p-4">

        
          <form @submit.prevent="submitCreditLimit">
            <div class="flex flex-column gap-4">
              <div>
                <label class="block font-medium mb-2">{{ t('Customer.name') }}</label>
                <div>{{ selectedCustomer.name }}</div>
              </div>
              
              <div>
                <label class="block font-medium mb-2">{{ t('Customer.Credit_Limit') }}</label>
                <input type="number" class="p-inputtext w-full" min="1" v-model="creditLimitValue">
              </div>

              <div class="mt-6 flex justify-content-end gap-2">
              <button type="button" 
                      @click="creditLimitDialogVisible = false"
                      class="p-button p-button-outlined">
                {{ t('deleteDialog.cancel') }}
              </button>
              <button type="submit"
                      class="p-button">
                {{ t('Customer.editCreditLimit') }}
              </button>
            </div>
            </div>

          
          </form>
        </div>
    </Dialog>

    <Dialog v-model:visible="paymentTermDialogVisible" :breakpoints="{ '640px': '25rem' }" :header="t('Customer.editPaymentTerm')" :class="containerClass" :style="{ width: '35rem' }" :modal="true" :closable="true" @hide="paymentTermDialogVisible = false">
      <div class="flex flex-column gap-4 p-4">
        <form @submit.prevent="submitPaymentTerm">
          <div class="flex flex-column gap-4">
            <div>
              <label class="block font-medium mb-2">{{ t('Customer.name') }}</label>
              <div>{{ selectedCustomer.name }}</div>
            </div>
            
            <label for="paymentTerm" class="mb-3">{{ $t('branchDialog.DefaultPaymentTerm') }}</label>
            <Dropdown
              v-model="paymentTermId"
              :virtualScrollerOptions="{ itemSize: 38 }"
              :options="paymentTerms"
              filter
              :loading="false"
              optionLabel="description"
              :optionValue="(option) => option.id"
              :placeholder="t('branchDialog.paymentTermPlaceholder')"
              class="w-full"
            >
              <template #option="slotProps">
                <div class="flex align-items-center mx-auto gap-3">
                  <div>{{ slotProps.option.description }}</div>
                </div>
              </template>
            </Dropdown>

            <div class="mt-6 flex justify-content-end gap-2">
              <button type="button" 
                      @click="paymentTermDialogVisible = false"
                      class="p-button p-button-outlined">
                {{ t('deleteDialog.cancel') }}
              </button>
              <button type="submit"
                      class="p-button">
                {{ t('Customer.editPaymentTerm') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>

  </div>
</template>

<style scoped>
/* Custom scrollbar styles can be kept or removed as PrimeFlex doesn't provide scrollbar styling */
.translate-y-50 {
  transform: translateY(-50%);
}
</style>
