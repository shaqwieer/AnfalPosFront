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
      submittedDate: new Date().toISOString().split('T')[0],
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
      approvedDate: new Date().toISOString().split('T')[0],
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
      approvedDate: new Date().toISOString().split('T')[0],
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
          <h1 class="text-900 text-4xl font-bold">Customers</h1>
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

            <button
              @click="showNewCustomerForm = true"
              class="p-button p-button-primary flex align-items-center gap-2"
            >
              <i class="pi pi-plus"></i>
              <span>New Customer</span>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border">
          <div class="border-bottom-1 surface-border">
            <div class="flex">
              <button
                v-for="tab in ['all', 'active', 'pending', 'rejected']"
                :key="tab"
                @click="activeTab = tab"
                class="py-3 px-4 focus:outline-none border-bottom-2 font-medium transition-colors duration-200 capitalize"
                :class="activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-700 hover:text-900'"
              >
                {{ tab }}
              </button>
            </div>
          </div>

          <!-- Search -->
          <div class="p-4">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input
                v-model="searchQuery"
                type="text"
                class="p-inputtext w-full"
                placeholder="Search by name, ID, mobile, CR, or VAT..."
              />
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
          <div
            v-if="viewMode === 'list'"
            class="surface-card border-round-lg shadow-2 border-1 surface-border overflow-hidden"
          >
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Customer
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Contact
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Business Info
                  </th>
                  <th
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                  >
                    Credit Limit
                  </th>
                  <th
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                  >
                    Balance
                  </th>
                  <th
                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="customer in customers"
                  :key="customer.id"
                  class="hover:bg-gray-50 transition-colors"
                >
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
                          currency: 'SAR',
                        }).format(customer.creditLimit)
                      }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="text-sm font-medium">
                      {{
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'SAR',
                        }).format(customer.balance)
                      }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-column align-items-center space-y-1">
                      <span
                        class="px-2 py-1 text-xs rounded-full"
                        :class="{
                          'bg-green-100 text-green-800':
                            customer.status === 'active',
                          'bg-yellow-100 text-yellow-800':
                            customer.status === 'pending',
                          'bg-red-100 text-red-800':
                            customer.status === 'rejected',
                        }"
                      >
                        {{ customer.status }}
                      </span>
                      <span
                        class="px-2 py-1 text-xs rounded-full"
                        :class="{
                          'bg-green-100 text-green-800':
                            customer.approvalStatus === 'approved',
                          'bg-yellow-100 text-yellow-800':
                            customer.approvalStatus === 'pending',
                          'bg-red-100 text-red-800':
                            customer.approvalStatus === 'rejected',
                        }"
                      >
                        {{ customer.approvalStatus }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div
                      class="flex align-items-center justify-content-center space-x-2"
                    >
                      <button
                        @click="handleViewDetails(customer)"
                        class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <i class="pi pi-eye"></i>
                      </button>
                      <button
                        @click="handleEditCustomer(customer)"
                        class="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full"
                      >
                        <i class="pi pi-pencil"></i>
                      </button>
                      <button
                        v-if="customer.status === 'draft'"
                        @click="handleSubmitApproval(customer)"
                        class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <i class="pi pi-send"></i>
                      </button>
                      <template v-if="customer.approvalStatus === 'pending'">
                        <button
                          @click="handleApprove(customer)"
                          class="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                        >
                          <i class="pi pi-check-circle"></i>
                        </button>
                        <button
                          @click="handleReject(customer)"
                          class="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <i class="pi pi-times-circle"></i>
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

    <!-- Dialogs -->
    <CustomerForm
      v-if="showNewCustomerForm"
      :show="showNewCustomerForm"
      @close="showNewCustomerForm = false"
      @submit="handleSubmitCustomer"
    />

    <CustomerDetails
      v-if="showDetails"
      :show="showDetails"
      :customer="selectedCustomer"
      @close="showDetails = false"
    />

    <EditCustomerDialog
      v-if="showEditDialog"
      :show="showEditDialog"
      :customer="selectedCustomer"
      @close="showEditDialog = false"
      @save="handleSaveCustomer"
    />
  </div>
</template>

<style scoped>
/* Custom scrollbar styles can be kept or removed as PrimeFlex doesn't provide scrollbar styling */
</style>