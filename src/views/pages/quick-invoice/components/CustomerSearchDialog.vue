<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useOrderStore } from '@/stores/orderStore.ts'
import { useCompanyStore } from '@/stores/companyStore.ts'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])

const orderStore = useOrderStore()
const companyStore = useCompanyStore()
const customerType = ref('individual') // 'individual' or 'business'
const searchQuery = ref('')
const showNewCustomerForm = ref(false)
const showVehicleForm = ref(false)
const editingVehicleIndex = ref<number | null>(null)
const selectedVehicleIndex = ref<number | null>(null)

// Form data
const formData = ref<Record<string, any>>({
  vehicles: []
})

// Vehicle form data
const vehicleForm = ref({
  plateNo: '',
  make: '',
  model: '',
  year: '',
  vin: '',
  notes: ''
})

// Initialize form data based on customer fields
const initializeFormData = () => {
  formData.value = {
    vehicles: []
  }
  const fields = companyStore.getCustomerFields(customerType.value as 'individual' | 'business')
  fields.forEach(field => {
    formData.value[field.id] = ''
  })
}

// Watch for customer type changes
watch(customerType, () => {
  initializeFormData()
})

// Get visible fields based on customer type
const visibleFields = computed(() => {
  return companyStore.getCustomerFields(customerType.value as 'individual' | 'business')
})

const customers = ref([
  // TireShop Customers
  {
    id: 1,
    companyId: 'tireshop',
    name: 'Abdullah Mohammed',
    type: 'individual',
    mobile: '+966 50 123 4567',
    email: 'abdullah@example.com',
    plateNo: '123 RYD',
    make: 'Toyota',
    model: 'Camry',
    year: '2023',
    vin: '1HGCM82633A123456'
  },
  {
    id: 2,
    companyId: 'tireshop',
    name: 'Fahad Ahmed',
    type: 'individual',
    mobile: '+966 55 234 5678',
    email: 'fahad@example.com',
    plateNo: '456 RYD',
    make: 'Lexus',
    model: 'ES',
    year: '2024',
    vin: '2HXKM72839B234567'
  },
  {
    id: 3,
    companyId: 'tireshop',
    name: 'Mutlaq Trading Est.',
    type: 'business',
    mobile: '+966 56 345 6789',
    email: 'info@mutlaq.com',
    cr: '1010234567',
    vat: '300000012',
    fleet: 5,
    vehicles: [
      {
        plateNo: '789 RYD',
        make: 'Ford',
        model: 'Transit',
        year: '2023',
        vin: '3FTYR82633C345678'
      },
      {
        plateNo: '790 RYD',
        make: 'Toyota',
        model: 'Hiace',
        year: '2023',
        vin: '4TGHR82633D456789'
      }
    ]
  },
  {
    id: 4,
    companyId: 'tireshop',
    name: 'Othaim Transport Co.',
    type: 'business',
    mobile: '+966 58 456 7890',
    email: 'fleet@othaim.com',
    cr: '1010345678',
    vat: '300000034',
    fleet: 12,
    vehicles: [
      {
        plateNo: '234 RYD',
        make: 'Mercedes',
        model: 'Actros',
        year: '2023',
        vin: '5MBTR82633E567890'
      }
    ]
  },

  // Al Athar Customers
  {
    id: 5,
    companyId: 'alathar',
    name: 'Nasser Ibrahim',
    type: 'individual',
    mobile: '+966 50 567 8901',
    email: 'nasser@example.com',
    membershipNo: 'MEM001',
    birthDate: '1990-05-15',
    preferences: ['Oud', 'Amber']
  },
  {
    id: 6,
    companyId: 'alathar',
    name: 'Sara Khalid',
    type: 'individual',
    mobile: '+966 55 678 9012',
    email: 'sara@example.com',
    membershipNo: 'MEM002',
    birthDate: '1992-08-20',
    preferences: ['Musk', 'Rose']
  },
  {
    id: 7,
    companyId: 'alathar',
    name: 'Jarir Trading Co.',
    type: 'business',
    mobile: '+966 56 789 0123',
    email: 'wholesale@jarir.com',
    cr: '1010456789',
    vat: '300000056',
    sector: 'Retail',
    purchaseLimit: 100000
  },
  {
    id: 8,
    companyId: 'alathar',
    name: 'Nahdi Stores',
    type: 'business',
    mobile: '+966 58 890 1234',
    email: 'orders@nahdi.com',
    cr: '1010567890',
    vat: '300000078',
    sector: 'Pharmacy',
    purchaseLimit: 75000
  }
])

// Filter customers based on search query, type, and company
const filteredCustomers = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(customer => 
    customer.companyId === companyStore.selectedCompanyId &&
    customer.type === customerType.value &&
    (customer.name.toLowerCase().includes(query) ||
     customer.mobile.includes(query) ||
     (customer.email && customer.email.toLowerCase().includes(query)) ||
     (customer.cr && customer.cr.includes(query)) ||
     (customer.vehicles?.some(v => v.plateNo.toLowerCase().includes(query))))
  )
})

const validateForm = () => {
  const fields = visibleFields.value
  const hasRequiredFields = fields.every(field => !field.required || formData.value[field.id])
  const hasVehicle = formData.value.vehicles.length > 0
  return hasRequiredFields && hasVehicle
}

const addVehicle = () => {
  if (editingVehicleIndex.value !== null) {
    formData.value.vehicles[editingVehicleIndex.value] = { ...vehicleForm.value }
  } else {
    formData.value.vehicles.push({ ...vehicleForm.value })
  }
  closeVehicleForm()
}

const editVehicle = (index: number) => {
  editingVehicleIndex.value = index
  vehicleForm.value = { ...formData.value.vehicles[index] }
  showVehicleForm.value = true
}

const removeVehicle = (index: number) => {
  formData.value.vehicles.splice(index, 1)
}

const closeVehicleForm = () => {
  showVehicleForm.value = false
  editingVehicleIndex.value = null
  vehicleForm.value = {
    plateNo: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    notes: ''
  }
}

const handleSubmit = () => {
  if (!validateForm()) {
    alert('Please fill in all required fields and add at least one vehicle')
    return
  }

  // Create customer object
  const customer = {
    id: customers.value.length + 1,
    companyId: companyStore.selectedCompanyId,
    ...formData.value,
    type: customerType.value
  }

  // Add to customers list
  customers.value.push(customer)

  // Set customer in order store with selected vehicle
  orderStore.setCustomer({
    ...customer,
    selectedVehicle: customer.vehicles[0]
  })
  
  // Reset and close
  resetForm()
  emit('close')
}

const selectCustomer = (customer: any, vehicleIndex: number = 0) => {
  selectedVehicleIndex.value = vehicleIndex
  orderStore.setCustomer({
    ...customer,
    selectedVehicle: customer.vehicles[vehicleIndex]
  })
  emit('close')
}

const resetForm = () => {
  customerType.value = 'individual'
  searchQuery.value = ''
  showNewCustomerForm.value = false
  selectedVehicleIndex.value = null
  initializeFormData()
}

// Initialize form data on component mount
onMounted(() => {
  initializeFormData()
})
</script>

<template>
  <div v-if="show" class="fixed dialog-overlay">
    <div class="bg-white dialog-container flex flex-column">
      <!-- Dialog Header -->
      <div class="p-4 border-bottom flex align-items-center justify-content-between">
        <h2 class="text-xl font-semibold">{{ showNewCustomerForm ? 'New Customer' : 'Customer Search' }}</h2>
        <button @click="emit('close')" class="p-2 dialog-close-btn">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Dialog Content -->
      <div class="p-6 flex-1 overflow-y-auto">
        <!-- Customer Type Selection -->
        <div class="flex customer-type-selection mb-6">
          <label class="flex align-items-center customer-type-option">
            <input type="radio" 
                   v-model="customerType"
                   value="individual" 
                   class="form-radio text-blue-600">
            <span>Individual Customer</span>
          </label>
          <label class="flex align-items-center customer-type-option">
            <input type="radio" 
                   v-model="customerType"
                   value="business" 
                   class="form-radio text-blue-600">
            <span>Business Customer</span>
          </label>
        </div>

        <!-- Search or Create Toggle -->
        <div v-if="!showNewCustomerForm" class="search-section">
          <!-- Search Input -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              class="sap-input w-full search-input"
              :placeholder="`Search ${customerType} customers...`"
            />
            <span class="material-icons absolute search-icon">
              search
            </span>
          </div>

          <!-- Search Results -->
          <div class="customer-results">
            <div v-for="customer in filteredCustomers" 
                 :key="customer.id"
                 class="p-4 border customer-card">
              <div class="flex align-items-center justify-content-between">
                <div>
                  <h3 class="font-medium">{{ customer.name }}</h3>
                  <p class="text-sm customer-mobile">{{ customer.mobile }}</p>
                </div>
                <div class="text-right">
                  <span class="px-2 py-1 text-xs customer-type-badge" 
                        :class="customer.type === 'business' ? 'business-badge' : 'individual-badge'">
                    {{ customer.type }}
                  </span>
                </div>
              </div>
              
              <!-- Additional Details -->
              <div class="mt-2 grid customer-details-grid gap-2 text-sm customer-details">
                <!-- Business Details -->
                <template v-if="customer.type === 'business'">
                  <div v-if="customer.cr">CR: {{ customer.cr }}</div>
                  <div v-if="customer.vat">VAT: {{ customer.vat }}</div>
                  <div v-if="customer.fleet">Fleet Size: {{ customer.fleet }}</div>
                </template>
              </div>

              <!-- Vehicles Grid -->
              <div v-if="customer.vehicles?.length" class="mt-4 grid vehicles-grid gap-3">
                <div v-for="(vehicle, index) in customer.vehicles"
                     :key="vehicle.plateNo"
                     class="p-3 vehicle-card"
                     @click="selectCustomer(customer, index)">
                  <div class="flex align-items-center justify-content-between mb-1">
                    <span class="font-medium text-blue-600">{{ vehicle.plateNo }}</span>
                    <span class="text-xs vehicle-year">{{ vehicle.year }}</span>
                  </div>
                  <div class="text-sm vehicle-details">{{ vehicle.make }} {{ vehicle.model }}</div>
                  <div class="text-xs vehicle-vin mt-1">VIN: {{ vehicle.vin }}</div>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-if="searchQuery && !filteredCustomers.length" 
                 class="text-center no-results">
              No customers found
            </div>

            <!-- Create New Customer Button -->
            <button @click="showNewCustomerForm = true"
                    class="w-full py-3 border-2 create-customer-btn">
              <span class="material-icons create-icon">add_circle</span>
              Create New Customer
            </button>
          </div>
        </div>

        <!-- New Customer Form -->
        <form v-else @submit.prevent="handleSubmit" class="customer-form">
          <div class="grid form-grid gap-6">
            <template v-for="field in visibleFields" :key="field.id">
              <div v-if="!field.id.startsWith('vehicle')"
                   :class="{ 'form-field-full': field.type === 'multiselect' }">
                <label :for="field.id" class="block text-sm font-medium form-label mb-1">
                  {{ field.label }}
                  <span v-if="field.required" class="required-asterisk">*</span>
                </label>

                <!-- Text Input -->
                <input v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number'"
                       v-model="formData[field.id]"
                       :type="field.type"
                       :id="field.id"
                       :required="field.required"
                       class="sap-input">

                <!-- Date Input -->
                <input v-else-if="field.type === 'date'"
                       v-model="formData[field.id]"
                       type="date"
                       :id="field.id"
                       :required="field.required"
                       class="sap-input">

                <!-- Select Input -->
                <select v-else-if="field.type === 'select'"
                        v-model="formData[field.id]"
                        :id="field.id"
                        :required="field.required"
                        class="sap-input">
                  <option value="">Select {{ field.label }}</option>
                  <!-- Add options based on field -->
                </select>
              </div>
            </template>
          </div>

          <!-- Vehicles Section -->
          <div class="border-top pt-4 vehicles-section">
            <div class="flex align-items-center justify-content-between mb-4">
              <h3 class="text-lg font-medium">Vehicles</h3>
              <button type="button"
                      @click="showVehicleForm = true"
                      class="px-3 add-vehicle-btn">
                <span class="material-icons add-vehicle-icon">add</span>
                Add Vehicle
              </button>
            </div>

            <!-- Vehicles List -->
            <div class="vehicles-list">
              <div v-for="(vehicle, index) in formData.vehicles"
                   :key="index"
                   class="p-3 border vehicle-item">
                <div class="flex align-items-center justify-content-between mb-2">
                  <span class="font-medium text-blue-600">{{ vehicle.plateNo }}</span>
                  <div class="flex align-items-center vehicle-actions">
                    <button type="button"
                            @click="editVehicle(index)"
                            class="vehicle-edit-btn">
                      <span class="material-icons text-sm">edit</span>
                    </button>
                    <button type="button"
                            @click="removeVehicle(index)"
                            class="vehicle-delete-btn">
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
                <div class="text-sm vehicle-details">{{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}</div>
                <div class="text-xs vehicle-vin mt-1">VIN: {{ vehicle.vin }}</div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-content-end form-actions pt-6">
            <button type="button"
                    @click="showNewCustomerForm = false"
                    class="px-4 py-2 border form-back-btn">
              Back to Search
            </button>
            <button type="submit"
                    class="px-4 py-2 form-submit-btn">
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Vehicle Form Dialog -->
    <div v-if="showVehicleForm" 
         class="fixed vehicle-dialog-overlay">
      <div class="bg-white vehicle-dialog p-6">
        <div class="flex align-items-center justify-content-between mb-6">
          <h3 class="text-xl font-semibold">
            {{ editingVehicleIndex !== null ? 'Edit' : 'Add' }} Vehicle
          </h3>
          <button @click="closeVehicleForm" class="p-2 dialog-close-btn">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form @submit.prevent="addVehicle" class="vehicle-form">
          <div class="grid vehicle-form-grid gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Plate Number</label>
              <input v-model="vehicleForm.plateNo" required type="text" class="sap-input">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Year</label>
              <input v-model="vehicleForm.year" required type="text" class="sap-input">
            </div>
          </div>
          <div class="grid vehicle-form-grid gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Make</label>
              <input v-model="vehicleForm.make" required type="text" class="sap-input">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Model</label>
              <input v-model="vehicleForm.model" required type="text" class="sap-input">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">VIN</label>
            <input v-model="vehicleForm.vin" required type="text" class="sap-input">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Notes</label>
            <textarea v-model="vehicleForm.notes" rows="2" class="sap-input"></textarea>
          </div>

          <div class="flex justify-content-end vehicle-form-actions pt-4">
            <button type="button"
                    @click="closeVehicleForm"
                    class="px-4 py-2 border vehicle-cancel-btn">
              Cancel
            </button>
            <button type="submit"
                    class="px-4 py-2 vehicle-save-btn">
              {{ editingVehicleIndex !== null ? 'Update' : 'Add' }} Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dialog Overlay */
.dialog-overlay {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.dialog-container {
  border-radius: 0.75rem;
  width: 100%;
  max-width: 42rem;
  max-height: 90vh;
}

.dialog-close-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.dialog-close-btn:hover {
  background-color: #f3f4f6;
}

/* Customer Type Selection */
.customer-type-selection {
  gap: 1rem;
}

.customer-type-option {
  gap: 0.5rem;
  cursor: pointer;
}

/* Search Section */
.search-section {
  gap: 1rem;
}

.search-input {
  padding-left: 2.5rem;
}

.search-icon {
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

/* Customer Results */
.customer-results {
  gap: 0.75rem;
}

.customer-card {
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.customer-card:hover {
  border-color: #3b82f6;
}

.customer-mobile {
  color: #6b7280;
}

.customer-type-badge {
  border-radius: 9999px;
}

.business-badge {
  background-color: #f3e8ff;
  color: #7c3aed;
}

.individual-badge {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.customer-details-grid {
  grid-template-columns: repeat(2, 1fr);
}

.customer-details {
  color: #6b7280;
}

/* Vehicles Grid */
.vehicles-grid {
  grid-template-columns: repeat(2, 1fr);
}

.vehicle-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.vehicle-card:hover {
  background-color: #f3f4f6;
}

.vehicle-year {
  color: #6b7280;
}

.vehicle-details {
  color: #6b7280;
}

.vehicle-vin {
  color: #6b7280;
}

/* No Results */
.no-results {
  padding: 2rem 0;
  color: #6b7280;
}

/* Create Customer Button */
.create-customer-btn {
  border-style: dashed;
  border-radius: 0.5rem;
  text-align: center;
  transition: all 0.2s;
}

.create-customer-btn:hover {
  border-color: #3b82f6;
  color: #2563eb;
}

.create-icon {
  vertical-align: middle;
  margin-right: 0.5rem;
}

/* Customer Form */
.customer-form {
  gap: 1.5rem;
}

.form-grid {
  grid-template-columns: repeat(2, 1fr);
}

.form-field-full {
  grid-column: span 2;
}

.form-label {
  color: #374151;
}

.required-asterisk {
  color: #ef4444;
}

/* Vehicles Section */
.vehicles-section {
  padding-top: 1rem;
}

.add-vehicle-btn {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  font-size: 0.875rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.add-vehicle-btn:hover {
  background-color: #1d4ed8;
}

.add-vehicle-icon {
  vertical-align: middle;
  font-size: 0.875rem;
  margin-right: 0.25rem;
}

.vehicles-list {
  gap: 0.75rem;
}

.vehicle-item {
  border-radius: 0.5rem;
}

.vehicle-actions {
  gap: 0.5rem;
}

.vehicle-edit-btn {
  padding: 0.375rem;
  color: #2563eb;
  border-radius: 50%;
  transition: all 0.2s;
}

.vehicle-edit-btn:hover {
  background-color: #dbeafe;
}

.vehicle-delete-btn {
  padding: 0.375rem;
  color: #ef4444;
  border-radius: 50%;
  transition: all 0.2s;
}

.vehicle-delete-btn:hover {
  background-color: #fef2f2;
}

/* Form Actions */
.form-actions {
  gap: 0.75rem;
}

.form-back-btn {
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.form-back-btn:hover {
  background-color: #f9fafb;
}

.form-submit-btn {
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.form-submit-btn:hover {
  background-color: #1d4ed8;
}

/* Vehicle Dialog */
.vehicle-dialog-overlay {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.vehicle-dialog {
  border-radius: 0.75rem;
  width: 100%;
  max-width: 32rem;
}

.vehicle-form {
  gap: 1rem;
}

.vehicle-form-grid {
  grid-template-columns: repeat(2, 1fr);
}

.vehicle-form-actions {
  gap: 0.75rem;
}

.vehicle-cancel-btn {
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.vehicle-cancel-btn:hover {
  background-color: #f9fafb;
}

.vehicle-save-btn {
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.vehicle-save-btn:hover {
  background-color: #1d4ed8;
}
</style>