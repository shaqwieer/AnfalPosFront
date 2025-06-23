<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useOrderStore } from '@/stores/orderStore.ts';
import { useCompanyStore } from '@/stores/companyStore.ts';
import { useCustomerSearchStore } from '@/stores/customerSearchStore.js';
import { Calendar } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['close']);

const orderStore = useOrderStore();
const companyStore = useCompanyStore();
const customerSearchStore = useCustomerSearchStore();
const customerType = ref('individual'); // 'individual' or 'business'
const searchQuery = ref('');
const showNewCustomerForm = ref(false);
const showVehicleForm = ref(false);
const editingVehicleIndex = ref<number | null>(null);
const selectedVehicleIndex = ref<number | null>(null);
const searchTimeout = ref<NodeJS.Timeout | null>(null);

// Form data
const formData = ref<Record<string, any>>({
});

// Vehicle form data
const vehicleForm = ref({
  plateNo: '',
  make: '',
  model: '',
  year: '',
  vin: '',
  notes: ''
});

// Initialize form data based on customer fields
const initializeFormData = () => {
  formData.value = {
  };
  const fields = companyStore.getCustomerFields(customerType.value as 'individual' | 'business');
  fields.forEach((field) => {
    formData.value[field.id] = '';
  });
};

// Watch for customer type changes
watch(customerType, async (newType) => {
  initializeFormData();
  // Update search store and trigger new search
  // Switch the flag: individual = true, business = false for isNotBusinessPartner
  customerSearchStore.setCustomerType(newType === 'individual');
  await performSearch();
});

// Watch for search query changes with debounce
watch(searchQuery, (newQuery) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(async () => {
    customerSearchStore.setSearchKey(newQuery);
    await performSearch();
  }, 500); // 500ms debounce
});

// Get visible fields based on customer type
const visibleFields = computed(() => {
  const fields = companyStore.getCustomerFields(customerType.value as 'individual' | 'business');
  console.log('📋 Visible fields for', customerType.value, ':', fields);
  return fields;
});

// Get customers from API store
const apiCustomers = computed(() => customerSearchStore.getCustomers);
const isLoadingCustomers = computed(() => customerSearchStore.isLoading);
const paginationInfo = computed(() => customerSearchStore.getPaginationInfo);

// Search functionality
const performSearch = async () => {
  await customerSearchStore.searchCustomers({
    searchKey: searchQuery.value,
    isNotBusinessPartner: customerType.value === 'individual',
    pageNumber: 1 // Reset to first page on new search
  });
};

// Pagination handlers
const handleNextPage = async () => {
  await customerSearchStore.nextPage();
};

const handlePreviousPage = async () => {
  await customerSearchStore.previousPage();
};

// Use API customers only
const filteredCustomers = computed(() => {
  // Return API customers filtered by type
  return apiCustomers.value.filter((customer: any) => customer.type === customerType.value);
});

const validateForm = () => {
  // Basic validation - ensure we have at least name and phone
  const hasName = formData.value.name && formData.value.name.trim();
  const hasPhone = (formData.value.primaryPhone && formData.value.primaryPhone.trim()) ||
                   (formData.value.phone && formData.value.phone.trim());

  console.log('🔍 Form validation check:', {
    hasName,
    hasPhone,
    nameValue: formData.value.name,
    phoneValue: formData.value.primaryPhone || formData.value.phone,
    allFormData: formData.value
  });

  const isValid = hasName && hasPhone;
  console.log('✅ Form validation result:', isValid);

  return isValid;
};

const addVehicle = () => {
  if (editingVehicleIndex.value !== null) {
    formData.value.vehicles[editingVehicleIndex.value] = { ...vehicleForm.value };
  } else {
    formData.value.vehicles.push({ ...vehicleForm.value });
  }
  closeVehicleForm();
};



const closeVehicleForm = () => {
  showVehicleForm.value = false;
  editingVehicleIndex.value = null;
  vehicleForm.value = {
    plateNo: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    notes: ''
  };
};

const handleSubmit = async () => {
  console.log('🚀 handleSubmit function called!');
  console.log('Walk-in customer creation started');
  console.log('Current form data:', formData.value);
  console.log('Customer type:', customerType.value);


  try {
    // Prepare customer data for walk-in customer API
    const customerData = {
      name: formData.value.name || '',
      primaryPhone: formData.value.primaryPhone || formData.value.phone || '',
      email: formData.value.email || '',
      isBusinessPartner: customerType.value === 'business',
     
    };

    console.log('Creating walk-in customer with detailed data:', customerData);

    // Create walk-in customer via API
    const createdCustomer = await customerSearchStore.createWalkinCustomer(customerData);

    console.log('Walk-in customer created successfully:', createdCustomer);

    // Set customer in order store
    orderStore.setCustomer(createdCustomer);

    // Reset and close
    resetForm();
    emit('close');
  } catch (error) {
    console.error('Error creating walk-in customer:', error);
    console.error('Error details:', error.response?.data || error.message);
    console.error('Form data that failed:', formData.value);
  }
};

const selectCustomer = (customer: any, vehicleIndex: number = 0) => {
  // 👤 CONSOLE LOG: Customer selection details
  console.log('👤 CUSTOMER SELECTED:', {
    selectedCustomer: customer,
    customerId: customer.id,
    customerName: customer.name,
    customerType: customer.type,
    customerMobile: customer.mobile,
    customerVehicles: customer.vehicles,
    selectedVehicleIndex: vehicleIndex,
    selectedVehicle: customer.vehicles[vehicleIndex],
    businessDetails: customer.businessDetails || 'No business details',
    timestamp: new Date().toISOString()
  });

  // 🛒 CONSOLE LOG: Current order state before customer assignment
  console.log('🛒 ORDER STATE BEFORE CUSTOMER ASSIGNMENT:', {
    currentOrder: orderStore.currentOrder,
    existingCustomer: orderStore.currentOrder.customer,
    currentItems: orderStore.currentOrder.items,
    itemsCount: orderStore.currentOrder.items.length
  });

  selectedVehicleIndex.value = vehicleIndex;
  orderStore.setCustomer({
    ...customer,
    selectedVehicle: customer.vehicles[vehicleIndex]
  });

  // 🛒 CONSOLE LOG: Order state after customer assignment
  console.log('🛒 ORDER STATE AFTER CUSTOMER ASSIGNMENT:', {
    updatedOrder: orderStore.currentOrder,
    assignedCustomer: orderStore.currentOrder.customer,
    customerAssigned: !!orderStore.currentOrder.customer,
    orderTotal: orderStore.total
  });

  emit('close');
};




const resetForm = () => {
  customerType.value = 'individual';
  searchQuery.value = '';
  showNewCustomerForm.value = false;
  selectedVehicleIndex.value = null;
  initializeFormData();
};

// Initialize form data and load initial customers on component mount
onMounted(async () => {
  initializeFormData();
  // Load initial customers
  await performSearch();
});

// Watch for dialog show/hide to reset search
watch(() => props.show, (newShow) => {
  if (newShow) {
    customerSearchStore.resetSearch();
    searchQuery.value = '';
  }
});
</script>

<template>
  <div v-if="show" class="fixed dialog-overlay">
    <div class="bg-white dialog-container flex flex-column">
      <!-- Dialog Header -->
      <div class="p-4 border-bottom flex align-items-center justify-content-between">
        <h2 class="text-xl font-semibold">{{ showNewCustomerForm ? 'Create Walk-in Customer' : 'Customer Search' }}</h2>
        <Button text @click="emit('close')" class="p-2 dialog-close-btn">
          <span class="material-icons">close</span>
        </Button>
      </div>

      <!-- Dialog Content -->
      <div class="p-6 flex-1 overflow-y-auto">
        <!-- Customer Type Selection -->
        <div class="flex customer-type-selection mb-6">
          <label class="flex align-items-center customer-type-option">
            <input type="radio" v-model="customerType" value="individual" class="form-radio text-blue-600" />
            <span class="font-medium pt-1">Individual Customer</span>
          </label>
          <label class="flex align-items-center customer-type-option">
            <input type="radio" v-model="customerType" value="business" class="form-radio text-blue-600" />
            <span class="font-medium pt-1">Business Customer</span>
          </label>
        </div>

        <!-- Search or Create Toggle -->
        <div v-if="!showNewCustomerForm" class="search-section">
          <!-- Search Input -->
          <div class="relative">
            <InputText v-model="searchQuery" type="text" class="sap-input w-full mb-2" :placeholder="`Search ${customerType} customers...`" />
          </div>

          <!-- Loading Indicator -->
          <div v-if="isLoadingCustomers" class="flex align-items-center justify-content-center p-8">
            <div class="flex flex-column align-items-center gap-3">
              <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--sap-primary)"></i>
              <p class="text-lg" style="color: var(--sap-text-secondary)">Loading customers...</p>
            </div>
          </div>

          <!-- Search Results -->
          <div v-else class="customer-results flex flex-column">
            <div v-for="customer in filteredCustomers" :key="customer.id" class="p-4 border-1 border-400 hover:border-blue-400 customer-card cursor-pointer" @click="selectCustomer(customer, 0)">
              <div class="flex align-items-center justify-content-between">
                <div>
                  <h3 class="font-medium text-xl p-1 m-0">{{ customer.name }}</h3>
                  <p class="text-md customer-mobile">{{ customer.mobile }}</p>
                </div>
                <div class="text-right">
                  <span class="px-2 py-1 text-xs customer-type-badge font-semibold" :class="customer.type === 'business' ? 'business-badge' : 'individual-badge'">
                    {{ customer.type }}
                  </span>
                </div>
              </div>

              <!-- Additional Details -->
              <div class="mt-2 flex gap-2 text-sm customer-details">
                <!-- Business Details -->
                <template v-if="customer.type === 'business'">
                  <v-col>
                  <div class="w-16rem" v-if="customer.cr">CR: {{ customer.cr }}</div>
                  <div class="w-16rem" v-if="customer.vat">VAT: {{ customer.vat }}</div>
                  <div class="w-16rem" v-if="customer.fleet">Fleet Size: {{ customer.fleet }}</div>
                  <div class="w-16rem" v-if="customer.sapCustomer">Sap Customer: {{ customer.sapCustomer }}</div>
                  <div class="w-16rem" v-if="customer.city">City: {{ customer.city }}</div>
                  <div class="w-16rem" v-if="customer.regionName">Region: {{ customer.regionName }}</div>
                </v-col>
                </template>
              </div>

              <!-- Vehicles Grid -->
              <!-- <div v-if="customer.vehicles?.length" class="mt-4 grid vehicles-grid gap-3">
                <div v-for="(vehicle, index) in customer.vehicles" :key="vehicle.plateNo" class="p-3 vehicle-card" @click="selectCustomer(customer, index)">
                  <div class="flex align-items-center justify-content-between mb-1">
                    <span class="font-medium text-blue-600">{{ vehicle.plateNo }}</span>
                    <span class="text-xs vehicle-year">{{ vehicle.year }}</span>
                  </div>
                  <div class="text-sm vehicle-details">{{ vehicle.make }} {{ vehicle.model }}</div>
                  <div class="text-xs vehicle-vin mt-1">VIN: {{ vehicle.vin }}</div>
                </div>
              </div> -->
            </div>

            <!-- No Results -->
            <div v-if="!isLoadingCustomers && searchQuery && !filteredCustomers.length" class="text-center no-results">No customers found</div>

            <!-- Pagination Controls -->
            <div v-if="!isLoadingCustomers && paginationInfo.totalPages > 1" class="flex align-items-center justify-content-between p-3 border-1 border-300 border-round-lg pagination-controls">
              <div class="flex align-items-center gap-2">
                <span class="text-sm text-gray-600">
                  Page {{ paginationInfo.currentPage }} of {{ paginationInfo.totalPages }}
                  ({{ paginationInfo.totalCount }} total customers)
                </span>
              </div>
              <div class="flex align-items-center gap-2">
                <Button
                  :disabled="!paginationInfo.hasPreviousPage"
                  @click="handlePreviousPage"
                  size="small"
                  outlined
                  class="pagination-btn"
                >
                  <span class="material-icons">chevron_left</span>
                </Button>
                <Button
                  :disabled="!paginationInfo.hasNextPage"
                  @click="handleNextPage"
                  size="small"
                  outlined
                  class="pagination-btn"
                >
                  <span class="material-icons">chevron_right</span>
                </Button>
              </div>
            </div>

            <!-- Create New Customer Button -->
            <button @click="showNewCustomerForm = true; console.log('🎯 Opening customer form, current formData:', formData)" class="w-full py-3 border-1 border-solid border-blue-400 text-blue-600 border-round-lg hover:border-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100">
              <span class="material-icons create-icon">person_add</span>
              Create Walk-in Customer
            </button>
          </div>
        </div>

        <!-- New Customer Form -->
        <form v-else @submit.prevent="handleSubmit" class="customer-form">
          <div class="grid form-grid gap-6">
            <template v-for="field in visibleFields" :key="field.id">
              <div v-if="!field.id.startsWith('vehicle')" :class="{ 'form-field-full': field.type === 'multiselect' }">
                <label :for="field.id" class="block text-sm font-medium form-label mb-1">
                  {{ field.label }}
                  <span v-if="field.required" class="required-asterisk">*</span>
                </label>

                <!-- Text Input -->
                <InputText v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number'" v-model="formData[field.id]" :type="field.type" :id="field.id" :required="field.required" class="sap-input" />

                <!-- Date Input -->
                <Calendar v-else-if="field.type === 'date'" showIcon :showOnFocus="false" v-model="formData[field.id]" :id="field.id" :required="field.required" class="sap-input w-10rem" />

                <!-- Select Input -->
                <select v-else-if="field.type === 'select'" v-model="formData[field.id]" :id="field.id" :required="field.required" class="sap-input p-2 border-1 border-300 border-round-lg">
                  <option value="">Select {{ field.label }}</option>
                  <!-- Add options based on field -->
                </select>
              </div>
            </template>
          </div>

          <!-- Vehicles Section -->
          <!-- <div class="border-top pt-4 vehicles-section">
            <div class="flex align-items-center justify-content-between mb-4">
              <h3 class="text-lg font-medium">Vehicles</h3>
              <button type="button" @click="showVehicleForm = true" class="px-3 add-vehicle-btn cursor-pointer">
                <span class="material-icons add-vehicle-icon">add</span>
                Add Vehicle
              </button>
            </div> -->

            <!-- Vehicles List -->
            <!-- <div class="vehicles-list">
              <div v-for="(vehicle, index) in formData.vehicles" :key="index" class="p-3 border vehicle-item">
                <div class="flex align-items-center justify-content-between mb-2">
                  <span class="font-medium text-blue-600">{{ vehicle.plateNo }}</span>
                  <div class="flex align-items-center vehicle-actions">
                    <button type="button" @click="editVehicle(index)" class="vehicle-edit-btn">
                      <span class="material-icons text-sm">edit</span>
                    </button>
                    <button type="button" @click="removeVehicle(index)" class="vehicle-delete-btn">
                      <span class="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
                <div class="text-sm vehicle-details">{{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}</div>
                <div class="text-xs vehicle-vin mt-1">VIN: {{ vehicle.vin }}</div>
              </div>
            </div>
          </div> -->

          <!-- Form Actions -->
          <div class="flex justify-content-end form-actions pt-6">
            <button type="button" @click="showNewCustomerForm = false" class="px-4 py-2 border-200 cursor-pointer form-back-btn">Back to Search</button>
            <button type="submit" class="px-4 py-2 cursor-pointer form-submit-btn" @click="console.log('Submit button clicked')">Create Walk-in Customer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Vehicle Form Dialog -->
    <div v-if="showVehicleForm" class="fixed vehicle-dialog-overlay">
      <div class="bg-white vehicle-dialog p-6">
        <div class="flex align-items-center justify-content-between mb-6">
          <h3 class="text-xl font-semibold">{{ editingVehicleIndex !== null ? 'Edit' : 'Add' }} Vehicle</h3>
          <Button text @click="closeVehicleForm" class="p-2 dialog-close-btn">
            <span class="material-icons">close</span>
          </Button>
        </div>

        <form @submit.prevent="addVehicle" class="flex flex-column gap-4">
          <div class="flex gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Plate Number</label>
              <InputText v-model="vehicleForm.plateNo" required type="text" class="sap-input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Year</label>
              <InputText v-model="vehicleForm.year" required type="text" class="sap-input" />
            </div>
          </div>
          <div class="flex gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Make</label>
              <InputText v-model="vehicleForm.make" required type="text" class="sap-input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Model</label>
              <InputText v-model="vehicleForm.model" required type="text" class="sap-input" />
            </div>
          </div>
          <div class="flex gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">VIN</label>
              <InputText v-model="vehicleForm.vin" required type="text" class="sap-input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Notes</label>
              <textarea v-model="vehicleForm.notes" rows="2" class="sap-input"></textarea>
            </div>
          </div>

          <div class="flex justify-content-end vehicle-form-actions pt-4">
            <button type="button" @click="closeVehicleForm" class="px-4 py-2 border vehicle-cancel-btn">Cancel</button>
            <button type="submit" class="px-4 py-2 vehicle-save-btn">{{ editingVehicleIndex !== null ? 'Update' : 'Add' }} Vehicle</button>
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

/* Pagination Controls */
.pagination-controls {
  background-color: #f9fafb;
  margin-top: 1rem;
}

.pagination-btn {
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
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
  max-width: 40rem;
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
