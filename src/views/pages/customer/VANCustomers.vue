<script setup lang="ts">
import { ref } from 'vue';
import { useVanStore } from '../../../stores/vanStore';
import CustomerList from './customers/CustomerList.vue';
import CustomerForm from './customers/CustomerForm.vue';
import CustomerDetails from './customers/CustomerDetails.vue';
import EditCustomerDialog from './customers/EditCustomerDialog.vue';
import { vanCustomers } from './customers/VANCustomerSampleData';

const vanStore = useVanStore();
const activeTab = ref('active');
const searchQuery = ref('');
const showNewCustomerForm = ref(false);
const selectedCustomer = ref(null);
const showDetails = ref(false);
const showEditDialog = ref(false);
const viewMode = ref<'cards' | 'list'>('cards');

// Initialize customers with sample data
const customers = ref(vanCustomers);

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
</script>

<template>
  <div class="h-full flex flex-column">
    <!-- Header -->
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex align-items-center justify-content-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Customers</h1>
          <div class="flex gap-2 align-items-center space-x-4">
            <!-- View Toggle -->
            <div class="flex gap-2 align-items-center bg-gray-100 border-round-lg p-1">
              <div
                @click="viewMode = 'cards'"
                style="width: 35px"
                class="p-2 flex justify-content-center align-items-center border-round-md border-0 transition-colors"
                :class="viewMode === 'cards' ? 'bg-white text-blue-600 shadow' : 'hover:bg-gray-50'"
              >
                <span class="material-icons flex justify-content-center align-items-center">
                  <font-awesome-icon :icon="['fas', 'border-all']" style="font-size: 20px" />
                </span>
              </div>
              <div
                @click="viewMode = 'list'"
                style="width: 35px"
                class="p-2 flex !transition-none justify-content-center align-items-center border-round-md transition-colors"
                :class="viewMode === 'list' ? 'bg-white text-blue-600 shadow' : 'hover:bg-gray-50'"
              >
                <span class="material-icons flex justify-content-center align-items-center !transition-none">
                  <font-awesome-icon :icon="['fas', 'list']" style="font-size: 20px" class="!transition-none" />
                </span>
              </div>
            </div>

            <div @click="showNewCustomerForm = true" class="px-4 py-2 bg-blue-600 text-white border-round-lg hover:bg-blue-700">
              <span class="material-icons align-middle mr-1">
                <font-awesome-icon :icon="['fas', 'plus']" />
              </span>
              New Customer
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="bg-white border-round-lg shadow-3 border-1  mb-6   bg-white rounded-lg shadow-sm border hover:border-blue-500 transition-all duration-200 ">
          <div class="border-b px-4">
            <div class="flex space-x-4">
              <button
                v-for="tab in ['all', 'active', 'pending', 'rejected']"
                :key="tab"
                @click="activeTab = tab"
                class="py-3 px-4 focus:outline-none border-b-2 transition-colors capitalize"
                :class="activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent'"
              >
                {{ tab }}
              </button>
            </div>
          </div>

          <!-- Search -->
          <div class="p-4">
            <div class="relative">
              <input v-model="searchQuery" type="text" class="w-full pl-10 pr-4 py-2 border-round-lg border-1" placeholder="Search by name, ID, mobile, CR, or VAT..." />
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> search </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer List - Scrollable Area -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div class="max-w-7xl mx-auto">
          <!-- List View -->
          <div v-if="viewMode === 'list'" class="bg-white border-round-lg shadow-3 border-1 overflow-hidden">
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
                    <div class="font-medium text-gray-900">{{ customer.name }}</div>
                    <div class="text-sm text-gray-500">{{ customer.id }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm">{{ customer.mobile }}</div>
                    <div class="text-sm text-gray-500">{{ customer.email }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm">CR: {{ customer.cr }}</div>
                    <div class="text-sm">VAT: {{ customer.vat }}</div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="text-sm font-medium">{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(customer.creditLimit) }}</div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="text-sm font-medium">{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(customer.balance) }}</div>
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
                        <span class="material-icons text-sm">visibility</span>
                      </button>
                      <button @click="handleEditCustomer(customer)" class="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full">
                        <span class="material-icons text-sm">edit</span>
                      </button>
                      <button v-if="customer.status === 'draft'" @click="handleSubmitApproval(customer)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full">
                        <span class="material-icons text-sm">send</span>
                      </button>
                      <template v-if="customer.approvalStatus === 'pending'">
                        <button @click="handleApprove(customer)" class="p-1.5 text-green-600 hover:bg-green-50 rounded-full">
                          <span class="material-icons text-sm">check_circle</span>
                        </button>
                        <button @click="handleReject(customer)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-full">
                          <span class="material-icons text-sm">cancel</span>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

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
        </div>
      </div>
    </div>

    <!-- Customer Form Dialog -->
    <CustomerForm v-if="showNewCustomerForm" :show="showNewCustomerForm" @close="showNewCustomerForm = false" @submit="handleSubmitCustomer" />

    <!-- Customer Details Dialog -->
    <CustomerDetails v-if="showDetails" :show="showDetails" :customer="selectedCustomer" @close="showDetails = false" />

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
</style>
