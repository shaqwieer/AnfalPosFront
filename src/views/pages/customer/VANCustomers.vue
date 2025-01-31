<script setup lang="ts">
import { ref } from 'vue'
import { useVanStore } from '../../../stores/vanStore'
import CustomerList from './CustomerList.vue'
import CustomerForm from './CustomerForm.vue'
import CustomerDetails from './CustomerDetails.vue'
import EditCustomerDialog from './EditCustomerDialog.vue'
import { vanCustomers } from '../../../data/VANCustomerSampleData'

const vanStore = useVanStore()
const activeTab = ref('active')
const searchQuery = ref('')
const showNewCustomerForm = ref(false)
const selectedCustomer = ref(null)
const showDetails = ref(false)
const showEditDialog = ref(false)
const viewMode = ref<'cards' | 'list'>('cards')

// Initialize customers with sample data
const customers = ref(vanCustomers)

const handleSubmitCustomer = (customer: any) => {
  customers.value = [...customers.value, customer]
  showNewCustomerForm.value = false
  activeTab.value = 'pending'
}

const handleViewDetails = (customer: any) => {
  selectedCustomer.value = customer
  showDetails.value = true
}

const handleEditCustomer = (customer: any) => {
  selectedCustomer.value = customer
  showEditDialog.value = true
}

const handleSaveCustomer = (updatedCustomer: any) => {
  const index = customers.value.findIndex(c => c.id === updatedCustomer.id)
  if (index !== -1) {
    customers.value[index] = updatedCustomer
  }
  showEditDialog.value = false
  selectedCustomer.value = null
}

const handleSubmitApproval = (customer: any) => {
  const index = customers.value.findIndex(c => c.id === customer.id)
  if (index !== -1) {
    customers.value[index] = {
      ...customer,
      status: 'pending',
      approvalStatus: 'pending',
      submittedBy: vanStore.vanInfo.driver,
      submittedDate: new Date().toISOString().split('T')[0]
    }
  }
}

const handleApprove = (customer: any) => {
  const index = customers.value.findIndex(c => c.id === customer.id)
  if (index !== -1) {
    customers.value[index] = {
      ...customer,
      status: 'active',
      approvalStatus: 'approved',
      approvedBy: vanStore.vanInfo.driver,
      approvedDate: new Date().toISOString().split('T')[0]
    }
  }
}

const handleReject = (customer: any) => {
  const index = customers.value.findIndex(c => c.id === customer.id)
  if (index !== -1) {
    customers.value[index] = {
      ...customer,
      status: 'rejected',
      approvalStatus: 'rejected',
      approvedBy: vanStore.vanInfo.driver,
      approvedDate: new Date().toISOString().split('T')[0]
    }
  }
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'cards' ? 'list' : 'cards'
}
</script>

<template>
  <div class="h-full flex flex-column">
    <!-- Header -->
    <div class="p-6">
      <div class="w-full">
        <div class="flex align-items-center justify-content-between mb-6">
          <h1 class="text-3xl font-bold text-900">Customers</h1>
          <div class="flex align-items-center gap-4">
            <!-- View Toggle -->
            <div class="flex align-items-center surface-100 border-round p-1">
              <button @click="viewMode = 'cards'"
                      class="p-2 border-round transition-duration-200"
                      :class="viewMode === 'cards' ? 'surface-0 text-blue-600 shadow-1' : 'hover:surface-200'">
                <span class="material-icons">grid_view</span>
              </button>
              <button @click="viewMode = 'list'"
                      class="p-2 border-round transition-duration-200"
                      :class="viewMode === 'list' ? 'surface-0 text-blue-600 shadow-1' : 'hover:surface-200'">
                <span class="material-icons">view_list</span>
              </button>
            </div>
            
            <button @click="showNewCustomerForm = true"
                    class="px-4 py-2 bg-blue-600 text-white border-round hover:bg-blue-700 transition-duration-200">
              <span class="material-icons align-middle mr-2">add</span>
              New Customer
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="surface-0 border-round shadow-1 border-1 mb-6">
          <div class="border-bottom-1">
            <div class="flex gap-4">
              <button v-for="tab in ['all', 'active', 'pending', 'rejected']"
                      :key="tab"
                      @click="activeTab = tab"
                      class="py-3 px-4 focus:outline-none border-bottom-2 transition-duration-200 text-transform-capitalize"
                      :class="activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent'">
                {{ tab }}
              </button>
            </div>
          </div>

          <!-- Search -->
          <div class="p-4">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                class="w-full pl-7 pr-4 py-2 border-round border-1"
                placeholder="Search by name, ID, mobile, CR, or VAT..."
              />
              <span class="material-icons absolute left-2 top-50 -mt-2 text-500">
                search
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer List - Scrollable Area -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div class="w-full">
          <!-- List View -->
          <div v-if="viewMode === 'list'" class="surface-0 border-round shadow-1 border-1 overflow-hidden">
            <table class="w-full">
              <thead class="surface-100">
                <tr>
                  <th class="text-left text-xs font-medium text-700 uppercase px-6 py-3">Customer</th>
                  <th class="text-left text-xs font-medium text-700 uppercase px-6 py-3">Contact</th>
                  <th class="text-left text-xs font-medium text-700 uppercase px-6 py-3">Business Info</th>
                  <th class="text-right text-xs font-medium text-700 uppercase px-6 py-3">Credit Limit</th>
                  <th class="text-right text-xs font-medium text-700 uppercase px-6 py-3">Balance</th>
                  <th class="text-center text-xs font-medium text-700 uppercase px-6 py-3">Status</th>
                  <th class="text-center text-xs font-medium text-700 uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody class="surface-0">
                <tr v-for="customer in customers" :key="customer.id"
                    class="hover:surface-100 transition-duration-200 border-bottom-1">
                  <td class="px-6 py-4">
                    <div class="font-medium text-900">{{ customer.name }}</div>
                    <div class="text-sm text-600">{{ customer.id }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm">{{ customer.mobile }}</div>
                    <div class="text-sm text-600">{{ customer.email }}</div>
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
                    <div class="flex flex-column align-items-center gap-1">
                      <span class="px-2 py-1 text-xs border-round-2xl"
                            :class="{
                              'bg-green-100 text-green-800': customer.status === 'active',
                              'bg-yellow-100 text-yellow-800': customer.status === 'pending',
                              'bg-red-100 text-red-800': customer.status === 'rejected'
                            }">
                        {{ customer.status }}
                      </span>
                      <span class="px-2 py-1 text-xs border-round-2xl"
                            :class="{
                              'bg-green-100 text-green-800': customer.approvalStatus === 'approved',
                              'bg-yellow-100 text-yellow-800': customer.approvalStatus === 'pending',
                              'bg-red-100 text-red-800': customer.approvalStatus === 'rejected'
                            }">
                        {{ customer.approvalStatus }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex align-items-center justify-content-center gap-2">
                      <button @click="handleViewDetails(customer)"
                              class="p-2 text-blue-600 hover:surface-100 border-round-full transition-duration-200">
                        <span class="material-icons text-sm">visibility</span>
                      </button>
                      <button @click="handleEditCustomer(customer)"
                              class="p-2 text-700 hover:surface-100 border-round-full transition-duration-200">
                        <span class="material-icons text-sm">edit</span>
                      </button>
                      <button v-if="customer.status === 'draft'"
                              @click="handleSubmitApproval(customer)"
                              class="p-2 text-blue-600 hover:surface-100 border-round-full transition-duration-200">
                        <span class="material-icons text-sm">send</span>
                      </button>
                      <template v-if="customer.approvalStatus === 'pending'">
                        <button @click="handleApprove(customer)"
                                class="p-2 text-green-600 hover:surface-100 border-round-full transition-duration-200">
                          <span class="material-icons text-sm">check_circle</span>
                        </button>
                        <button @click="handleReject(customer)"
                                class="p-2 text-red-600 hover:surface-100 border-round-full transition-duration-200">
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
    <CustomerForm
      v-if="showNewCustomerForm"
      :show="showNewCustomerForm"
      @close="showNewCustomerForm = false"
      @submit="handleSubmitCustomer"
    />

    <!-- Customer Details Dialog -->
    <CustomerDetails
      v-if="showDetails"
      :show="showDetails"
      :customer="selectedCustomer"
      @close="showDetails = false"
    />

    <!-- Edit Customer Dialog -->
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
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--surface-200) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--surface-200);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--surface-300);
}
</style>