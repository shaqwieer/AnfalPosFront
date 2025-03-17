<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref('stock')
const searchQuery = ref('')
const selectedBranch = ref('all')
const showTransferForm = ref(false)
const selectedProduct = ref(null)
const dateFrom = ref('')
const dateTo = ref('')
const locationFrom = ref('')
const locationTo = ref('')
const requestNo = ref('')

// Sample data
const branches = [
  { id: 'main', name: 'Main Branch' },
  { id: 'north', name: 'North Branch' },
  { id: 'south', name: 'South Branch' },
  { id: 'east', name: 'East Branch' }
]

const inventory = ref([
  {
    code: 'TRS-001',
    name: 'Tire Rotation Service Kit',
    category: 'Service Kits',
    mainStock: 45,
    branchStock: {
      north: 15,
      south: 20,
      east: 10
    },
    unit: 'Kit',
    minStock: 10,
    maxStock: 50,
    reorderPoint: 20,
    batches: [
      {
        id: 'b1',
        batchNumber: 'BATCH-001',
        quantity: 50,
        manufactureDate: '2024-01-15',
        expiryDate: '2025-01-15'
      }
    ]
  }
])

const transferRequests = ref([
  {
    id: 'TR001',
    itemCode: 'TRS-001',
    itemName: 'Tire Rotation Service Kit',
    fromBranch: 'Main Branch',
    toBranch: 'North Branch',
    quantity: 5,
    status: 'pending',
    date: '2024-03-15',
    urgency: 'high'
  }
])

const closedRequests = ref([
  {
    id: 'TR001',
    requestNo: 'REQ-2024-001',
    itemCode: 'TRS-001',
    itemName: 'Tire Rotation Service Kit',
    fromBranch: 'Main Branch',
    toBranch: 'North Branch',
    quantity: 5,
    status: 'completed',
    requestDate: '2024-02-15',
    completionDate: '2024-02-16',
    requestedBy: 'John Doe',
    approvedBy: 'Jane Smith',
    notes: 'Urgent request for branch restocking'
  }
])

const filteredInventory = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return inventory.value.filter(item => 
    (item.code.toLowerCase().includes(query) ||
     item.name.toLowerCase().includes(query)) &&
    (selectedBranch.value === 'all' || selectedBranch.value === 'main' || 
     item.branchStock[selectedBranch.value] !== undefined)
  )
})

const filteredClosedRequests = computed(() => {
  return closedRequests.value.filter(request => {
    const matchesDateRange = (!dateFrom.value || request.requestDate >= dateFrom.value) &&
                            (!dateTo.value || request.requestDate <= dateTo.value)
    
    const matchesLocations = (!locationFrom.value || request.fromBranch.includes(locationFrom.value)) &&
                            (!locationTo.value || request.toBranch.includes(locationTo.value))
    
    const matchesRequestNo = !requestNo.value || 
                            request.requestNo.toLowerCase().includes(requestNo.value.toLowerCase())
    
    return matchesDateRange && matchesLocations && matchesRequestNo
  })
})

const getStockLevel = (current: number, min: number, max: number) => {
  if (current <= min) return 'critical'
  if (current <= max * 0.3) return 'low'
  if (current >= max * 0.9) return 'high'
  return 'normal'
}

const createTransferRequest = (item: any) => {
  selectedProduct.value = item
  showTransferForm.value = true
}

const submitTransferRequest = (formData: any) => {
  // Handle transfer request submission
  console.log('Transfer request submitted:', formData)
  showTransferForm.value = false
  selectedProduct.value = null
}

const handleClose = () => {
  showTransferForm.value = false
  selectedProduct.value = null
}

const clearFilters = () => {
  dateFrom.value = ''
  dateTo.value = ''
  locationFrom.value = ''
  locationTo.value = ''
  requestNo.value = ''
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-6">
      <h1 class="text-2xl font-bold">Service Inventory</h1>
    </div>

    <!-- Tabs -->
    <div class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border">
          <div class="border-bottom-1 surface-border">

            <div class="flex">
              <div
                v-for="tab in ['stock', 'transfers', 'history']"
                :key="tab"
                @click="activeTab = tab"
                class="py-3 px-4 focus:outline-none cursor-pointer border-bottom-2 font-medium transition-colors duration-200 capitalize"
                :class="activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-700 hover:text-900'"
              >
              {{ tab }}
              </div>
            </div>
          </div>

      <!-- Content Area -->
      <div class="p-4">
        <!-- Stock Overview Tab -->
        <div v-if="activeTab === 'stock'" class="flex flex-column gap-6">
          <!-- Filters -->
          <div class="flex flex-column sm:flex-row gap-4">
            
            <div class="flex-1 relative">
              <span class="relative p-input-icon-left w-full">
              <span class="absolute top-50 translate-y-50" style="left: 9px"><i class="pi pi-search"></i></span>
              <input v-model="searchQuery" type="text" class="p-inputtext w-full pl-5" placeholder="Search by code or name..." />
            </span>
            </div>
            <div class="w-12rem">
              <select v-model="selectedBranch" class="p-inputtext w-full">
                <option value="all">All Branches</option>
                <option value="main">Main Branch</option>
                <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Inventory Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="surface-100">
                <tr>
                  <th class="text-left p-3 font-medium">Material</th>
                  <th class="text-left p-3 font-medium">Category</th>
                  <th class="text-left p-3 font-medium">Stock Level</th>
                  <th class="text-left p-3 font-medium">Branch Stock</th>
                  <th class="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody class="surface-ground">
                <tr v-for="item in filteredInventory" :key="item.code" class="surface-card">
                  <td class="p-3">
                    <div class="flex align-items-start">
                      <div>
                        <div class="font-medium">{{ item.name }}</div>
                        <div class="text-500">{{ item.code }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-3">
                    <span class="border-round-xl px-2 py-1 text-xs font-medium"
                          :class="{
                            'bg-purple-100 text-purple-800': item.category === 'Service Kits',
                            'bg-blue-100 text-blue-800': item.category === 'Tools',
                            'bg-green-100 text-green-800': item.category === 'Supplies'
                          }">
                      {{ item.category }}
                    </span>
                  </td>
                  <td class="p-3">
                    <div class="flex align-items-center gap-2">
                      <span class="w-1rem h-1rem border-circle"
                            :class="{
                              'bg-red-500': getStockLevel(item.mainStock, item.minStock, item.maxStock) === 'critical',
                              'bg-yellow-500': getStockLevel(item.mainStock, item.minStock, item.maxStock) === 'low',
                              'bg-green-500': getStockLevel(item.mainStock, item.minStock, item.maxStock) === 'normal',
                              'bg-blue-500': getStockLevel(item.mainStock, item.minStock, item.maxStock) === 'high'
                            }">
                      </span>
                      <span>{{ item.mainStock }} {{ item.unit }}s</span>
                    </div>
                    <div class="text-500 text-sm">
                      Min: {{ item.minStock }} | Max: {{ item.maxStock }}
                    </div>
                  </td>
                  <td class="p-3">
                    <div class="flex flex-column gap-1">
                      <div v-for="(stock, branch) in item.branchStock" 
                           :key="branch"
                           class="flex align-items-center justify-content-between">
                        <span class="text-500">{{ branches.find(b => b.id === branch)?.name }}:</span>
                        <span class="font-medium">{{ stock }} {{ item.unit }}s</span>
                      </div>
                    </div>
                  </td>
                  <td class="p-3">
                    <button @click="createTransferRequest(item)"
                            class="p-button p-button-text p-button-primary">
                      Request Transfer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Transfer Requests Tab -->
        <div v-if="activeTab === 'transfers'" class="flex flex-column gap-4">
          <div v-for="request in transferRequests" 
               :key="request.id"
               class="surface-card p-4 border-round border-1 hover:border-primary transition-duration-200">
            <div class="flex align-items-start justify-content-between">
              <div>
                <div class="flex align-items-center gap-2">
                  <span class="text-500">{{ request.id }}</span>
                  <span class="border-round-xl px-2 py-1 text-xs font-medium"
                        :class="{
                          'bg-yellow-100 text-yellow-800': request.status === 'pending',
                          'bg-green-100 text-green-800': request.status === 'approved',
                          'bg-red-100 text-red-800': request.status === 'rejected'
                        }">
                    {{ request.status }}
                  </span>
                  <span class="border-round-xl px-2 py-1 text-xs font-medium"
                        :class="{
                          'bg-red-100 text-red-800': request.urgency === 'high',
                          'bg-yellow-100 text-yellow-800': request.urgency === 'medium',
                          'bg-blue-100 text-blue-800': request.urgency === 'low'
                        }">
                    {{ request.urgency }} priority
                  </span>
                </div>
                <h3 class="font-medium mt-2">{{ request.itemName }}</h3>
                <div class="text-500">{{ request.itemCode }}</div>
              </div>
              <div class="text-right">
                <div class="text-500">{{ request.date }}</div>
              </div>
            </div>
            
            <div class="mt-4 flex align-items-center justify-content-between">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-arrow-right text-500"></i>
                <div>
                  <div class="text-500">From: {{ request.fromBranch }}</div>
                  <div class="text-500">To: {{ request.toBranch }}</div>
                </div>
              </div>
              <div class="text-xl font-medium">{{ request.quantity }} units</div>
            </div>

            <div class="mt-4 flex justify-content-end gap-2" v-if="request.status === 'pending'">
              <button class="p-button p-button-danger p-button-outlined">
                Reject
              </button>
              <button class="p-button p-button-success">
                Approve
              </button>
            </div>
          </div>
        </div>

        <!-- Transfer History Tab -->
        <div v-if="activeTab === 'history'" class="flex flex-column gap-6">
          <!-- Filters -->
          <div class="grid">
            <!-- Date Range -->
            <div class="col-12 md:col-4 lg:col-4">
              <label class="block font-medium mb-2">Date Range</label>
              <div class="flex gap-2">
                <input type="date" v-model="dateFrom" class="p-inputtext flex-1" placeholder="From">
                <input type="date" v-model="dateTo" class="p-inputtext flex-1" placeholder="To">
              </div>
            </div>

            <!-- Location Range -->
            <div class="col-12 md:col-4 lg:col-4">
              <label class="block font-medium mb-2">Location</label>
              <div class="flex gap-2">
                <select v-model="locationFrom" class="p-inputtext flex-1">
                  <option value="">From Location</option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.name">
                    {{ branch.name }}
                  </option>
                </select>
                <select v-model="locationTo" class="p-inputtext flex-1">
                  <option value="">To Location</option>
                  <option v-for="branch in branches" :key="branch.id" :value="branch.name">
                    {{ branch.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Request Number -->
            <div class="col-12 md:col-4 lg:col-4">
              <label class="block font-medium mb-2">Request Number</label>
              <div class="flex gap-2">
                <input type="text" v-model="requestNo" class="p-inputtext flex-1" 
                       placeholder="Search by request number">
                <button @click="clearFilters"
                        class="p-button p-button-outlined">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- History List -->
          <div class="flex flex-column gap-4">
            <div v-for="request in filteredClosedRequests" 
                 :key="request.id"
                 class="surface-card p-4 border-round border-1 hover:border-primary transition-duration-200">
              <div class="flex align-items-start justify-content-between">
                <div>
                  <div class="flex align-items-center gap-2">
                    <span class="text-500">{{ request.requestNo }}</span>
                    <span class="border-round-xl px-2 py-1 text-xs font-medium"
                          :class="{
                            'bg-green-100 text-green-800': request.status === 'completed',
                            'bg-red-100 text-red-800': request.status === 'cancelled'
                          }">
                      {{ request.status }}
                    </span>
                  </div>
                  <h3 class="font-medium mt-2">{{ request.itemName }}</h3>
                  <div class="text-500">{{ request.itemCode }}</div>
                </div>
                <div class="text-right text-500">
                  <div>Requested: {{ formatDate(request.requestDate) }}</div>
                  <div>Completed: {{ formatDate(request.completionDate) }}</div>
                </div>
              </div>
              
              <div class="mt-4 grid">
                <div class="col-12 md:col-6 flex flex-column gap-1">
                  <div class="text-500">From: {{ request.fromBranch }}</div>
                  <div class="text-500">To: {{ request.toBranch }}</div>
                  <div class="text-500">Quantity: {{ request.quantity }} units</div>
                </div>
                <div class="col-12 md:col-6 flex flex-column gap-1">
                  <div class="text-500">Requested by: {{ request.requestedBy }}</div>
                  <div class="text-500">Approved by: {{ request.approvedBy }}</div>
                </div>
              </div>

              <div class="mt-4 text-600 surface-100 p-3 border-round">
                <span class="font-medium">Notes:</span> {{ request.notes }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transfer Request Form Dialog -->
    <div v-if="showTransferForm && selectedProduct" 
         class="fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center bg-black-alpha-50">
      <div class="surface-card border-round-xl w-full max-w-30rem">
        <div class="p-4 border-bottom-1 flex align-items-center justify-content-between">
          <h3 class="text-xl font-medium">Create Transfer Request</h3>
          <button @click="showTransferForm = false" class="p-button p-button-text p-button-rounded">
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <div class="p-4">
          <form @submit.prevent="submitTransferRequest">
            <div class="flex flex-column gap-4">
              <div>
                <label class="block font-medium mb-2">Item</label>
                <div>{{ selectedProduct.name }}</div>
                <div class="text-500">{{ selectedProduct.code }}</div>
              </div>
              
              <div>
                <label class="block font-medium mb-2">From Branch</label>
                <select class="p-inputtext w-full">
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-medium mb-2">To Branch</label>
                <select class="p-inputtext w-full">
                  <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-medium mb-2">Quantity</label>
                <input type="number" class="p-inputtext w-full" min="1" :max="selectedProduct.mainStock">
              </div>

              <div>
                <label class="block font-medium mb-2">Urgency</label>
                <select class="p-inputtext w-full">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label class="block font-medium mb-2">Notes</label>
                <textarea class="p-inputtext w-full" rows="3"></textarea>
              </div>
            </div>

            <div class="mt-6 flex justify-content-end gap-2">
              <button type="button" 
                      @click="showTransferForm = false"
                      class="p-button p-button-outlined">
                Cancel
              </button>
              <button type="submit"
                      class="p-button">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styles can be kept or removed as PrimeFlex doesn't provide scrollbar styling */
.translate-y-50 {
  transform: translateY(-50%);
}
</style>