<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useOrderStore } from '@/stores/orderStore.ts'

const props = defineProps<{
  show: boolean,
  order?: any
}>()

const emit = defineEmits(['close'])

const orderStore = useOrderStore()
const selectedMethods = ref<{
  method: string;
  amount: number;
  installments?: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedAmount?: number;
  approvedInstallments?: number;
  mobileNo?: string;
}>([])
const remainingAmount = ref(0)
const isRequestingApproval = ref(false)
const editingMobileNo = ref(false)
const tempMobileNo = ref('')

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: 'payments' },
  { id: 'visa', name: 'VISA', icon: 'credit_card' },
  { id: 'mastercard', name: 'Mastercard', icon: 'credit_card' },
  { id: 'tamara', name: 'Tamara', icon: 'calendar_month', installments: true }
]

const totalAmount = computed(() => {
  return props.order?.total || Number(orderStore.total) || 0
})

// Watch for changes in totalAmount and update remainingAmount
watch(totalAmount, (newTotal) => {
  remainingAmount.value = newTotal
}, { immediate: true })

const addPaymentMethod = (method: string) => {
  if (!selectedMethods.value.some(m => m.method === method)) {
    const mobileNo = method === 'tamara' && props.order?.customer?.mobile 
      ? props.order.customer.mobile 
      : undefined

    selectedMethods.value.push({
      method,
      amount: remainingAmount.value,
      installments: method === 'tamara' ? 3 : undefined,
      approvalStatus: method === 'tamara' ? 'pending' : undefined,
      mobileNo
    })
    updateRemainingAmount()
  }
}

const removePaymentMethod = (index: number) => {
  selectedMethods.value.splice(index, 1)
  updateRemainingAmount()
}

const updateRemainingAmount = () => {
  const paidAmount = selectedMethods.value.reduce((sum, method) => sum + Number(method.amount || 0), 0)
  remainingAmount.value = Math.max(0, totalAmount.value - paidAmount)
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price) + ' SAR'
}

const handleClose = () => {
  selectedMethods.value = []
  remainingAmount.value = totalAmount.value
  editingMobileNo.value = false
  tempMobileNo.value = ''
  emit('close')
}

const startEditMobileNo = (method: any) => {
  tempMobileNo.value = method.mobileNo || ''
  editingMobileNo.value = true
}

const saveMobileNo = (method: any) => {
  if (tempMobileNo.value) {
    method.mobileNo = tempMobileNo.value
    method.approvalStatus = 'pending' // Reset approval status when mobile number changes
  }
  editingMobileNo.value = false
  tempMobileNo.value = ''
}

const requestTamaraApproval = async (method: any) => {
  if (!method.mobileNo) {
    alert('Please provide a mobile number for Tamara verification')
    return
  }

  isRequestingApproval.value = true
  
  try {
    // Simulate API call to Tamara with mobile number verification
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate approval response
    const approved = Math.random() > 0.3 // 70% approval rate
    const approvedAmount = approved ? method.amount : 0
    const approvedInstallments = approved ? method.installments : 0
    
    method.approvalStatus = approved ? 'approved' : 'rejected'
    method.approvedAmount = approvedAmount
    method.approvedInstallments = approvedInstallments
    
    if (approved) {
      method.amount = approvedAmount
      method.installments = approvedInstallments
      updateRemainingAmount()
    }
  } catch (error) {
    console.error('Error requesting Tamara approval:', error)
    method.approvalStatus = 'rejected'
  } finally {
    isRequestingApproval.value = false
  }
}

const processPayment = () => {
  // Handle payment processing here
  console.log('Processing payment:', selectedMethods.value)
  handleClose()
}

const getApprovalStatusColor = (status?: string) => {
  switch (status) {
    case 'approved': return 'text-green-600'
    case 'rejected': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

const validateMobileNo = (value: string) => {
  // Saudi mobile number validation
  return /^\+966 5[0-9] [0-9]{3} [0-9]{4}$/.test(value)
}
</script>

<template>
  <div v-if="show" class="fixed payment-overlay">
    <div class="bg-white payment-dialog flex flex-column">
      <!-- Dialog Header -->
      <div class="p-4 border-bottom flex align-items-center justify-content-between">
        <h2 class="text-xl font-semibold" style="color: var(--sap-text)">Payment</h2>
        <button @click="handleClose" class="p-2 dialog-close-btn">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Dialog Content -->
      <div class="p-6 flex-1 overflow-y-auto">
        <!-- Total Amount -->
        <div class="text-center mb-6">
          <p class="text-sm total-label">Total Amount Due</p>
          <p class="text-3xl font-bold text-blue-600">${{ formatPrice(totalAmount) }}</p>
          <p v-if="remainingAmount > 0" class="text-sm remaining-amount mt-1">
            Remaining: ${{ formatPrice(remainingAmount) }}
          </p>
        </div>

        <!-- Payment Methods Grid -->
        <div class="grid payment-methods-grid gap-4 mb-6">
          <button v-for="method in paymentMethods" 
                  :key="method.id"
                  @click="addPaymentMethod(method.id)"
                  :disabled="selectedMethods.some(m => m.method === method.id)"
                  class="p-4 border payment-method-btn">
            <div class="flex align-items-center payment-method-content">
              <span class="material-icons text-blue-600">{{ method.icon }}</span>
              <span class="font-medium">{{ method.name }}</span>
            </div>
          </button>
        </div>

        <!-- Selected Payment Methods -->
        <div class="selected-methods">
          <div v-for="(method, index) in selectedMethods" 
               :key="index"
               class="p-4 border selected-method-card">
            <div class="flex align-items-center justify-content-between mb-3">
              <div class="flex align-items-center method-header">
                <span class="material-icons text-blue-600">
                  {{ paymentMethods.find(m => m.id === method.method)?.icon }}
                </span>
                <span class="font-medium">
                  {{ paymentMethods.find(m => m.id === method.method)?.name }}
                </span>
              </div>
              <button @click="removePaymentMethod(index)" 
                      class="remove-method-btn">
                <span class="material-icons">delete</span>
              </button>
            </div>

            <div class="method-fields">
              <!-- Regular Payment Fields -->
              <div v-if="method.method !== 'tamara'">
                <label class="block text-sm field-label mb-1">Amount</label>
                <input type="number" 
                       v-model="method.amount"
                       @input="updateRemainingAmount"
                       class="sap-input"
                       :max="totalAmount"
                       step="0.01">
              </div>

              <!-- Tamara Payment Fields -->
              <template v-else>
                <div class="grid tamara-grid gap-4">
                  <div>
                    <label class="block text-sm field-label mb-1">Requested Amount</label>
                    <input type="number" 
                           v-model="method.amount"
                           :disabled="method.approvalStatus === 'approved'"
                           class="sap-input"
                           :max="totalAmount"
                           step="0.01">
                  </div>
                  <div>
                    <label class="block text-sm field-label mb-1">Installments</label>
                    <select v-model="method.installments" 
                            :disabled="method.approvalStatus === 'approved'"
                            class="sap-input">
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                  </div>
                </div>

                <!-- Mobile Number Section -->
                <div class="mt-4">
                  <div class="flex align-items-center justify-content-between mb-1">
                    <label class="block text-sm field-label">Mobile Number</label>
                    <button v-if="!editingMobileNo && method.mobileNo"
                            @click="startEditMobileNo(method)"
                            class="text-sm change-mobile-btn">
                      Change
                    </button>
                  </div>
                  
                  <div v-if="editingMobileNo" class="flex align-items-center mobile-edit-row">
                    <input type="tel"
                           v-model="tempMobileNo"
                           class="sap-input flex-1"
                           placeholder="Enter mobile number"
                           pattern="[+]?\d{10,15}"
                           required>
                    <button @click="saveMobileNo(method)"
                            :disabled="!validateMobileNo(tempMobileNo)"
                            class="px-3 py-2 save-mobile-btn">
                      Save
                    </button>
                  </div>
                  <div v-else-if="method.mobileNo" class="mobile-display">
                    {{ method.mobileNo }}
                  </div>
                  <button v-else
                          @click="startEditMobileNo(method)"
                          class="w-full px-3 py-2 border add-mobile-btn">
                    Add Mobile Number
                  </button>
                </div>

                <!-- Approval Status -->
                <div v-if="method.approvalStatus" 
                     class="flex align-items-center justify-content-between p-3 approval-status mt-4">
                  <div class="flex align-items-center approval-status-content">
                    <span class="material-icons text-sm" 
                          :class="getApprovalStatusColor(method.approvalStatus)">
                      {{ method.approvalStatus === 'approved' ? 'check_circle' : 
                         method.approvalStatus === 'rejected' ? 'cancel' : 'pending' }}
                    </span>
                    <span :class="getApprovalStatusColor(method.approvalStatus)">
                      {{ method.approvalStatus === 'approved' ? 'Approved' :
                         method.approvalStatus === 'rejected' ? 'Rejected' : 'Pending Approval' }}
                    </span>
                  </div>
                  <div v-if="method.approvalStatus === 'approved'" class="text-sm installment-details">
                    {{ method.approvedInstallments }} months × ${{ formatPrice(method.approvedAmount / method.approvedInstallments) }}
                  </div>
                </div>

                <!-- Approval Request Button -->
                <button v-if="method.approvalStatus !== 'approved'"
                        @click="requestTamaraApproval(method)"
                        :disabled="isRequestingApproval || !method.amount || !method.installments || !method.mobileNo"
                        class="w-full py-2 px-4 approval-request-btn mt-4">
                  <span v-if="isRequestingApproval" class="material-icons approval-spinner mr-2">refresh</span>
                  <span v-else class="material-icons mr-2">send</span>
                  {{ isRequestingApproval ? 'Requesting Approval...' : 'Request Approval' }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Dialog Footer -->
      <div class="p-4 border-top flex justify-content-end footer-actions">
        <button @click="handleClose"
                class="px-4 py-2 border cancel-btn">
          Cancel
        </button>
        <button @click="processPayment"
                :disabled="remainingAmount > 0 || selectedMethods.length === 0 || 
                          selectedMethods.some(m => m.method === 'tamara' && m.approvalStatus !== 'approved')"
                class="px-4 py-2 process-payment-btn">
          <span class="material-icons process-icon">payments</span>
          Process Payment
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dialog Overlay */
.payment-overlay {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.payment-dialog {
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

/* Total Amount */
.total-label {
  color: #6b7280;
}

.remaining-amount {
  color: #6b7280;
}

/* Payment Methods Grid */
.payment-methods-grid {
  grid-template-columns: repeat(2, 1fr);
}

.payment-method-btn {
  border-radius: 0.5rem;
  text-align: left;
  transition: all 0.2s;
}

.payment-method-btn:hover:not(:disabled) {
  border-color: #3b82f6;
}

.payment-method-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payment-method-content {
  gap: 0.75rem;
}

/* Selected Methods */
.selected-methods {
  gap: 1rem;
}

.selected-method-card {
  border-radius: 0.5rem;
}

.method-header {
  gap: 0.5rem;
}

.remove-method-btn {
  color: #ef4444;
  transition: all 0.2s;
}

.remove-method-btn:hover {
  color: #dc2626;
}

.method-fields {
  gap: 1rem;
}

.field-label {
  color: #6b7280;
}

/* Tamara Fields */
.tamara-grid {
  grid-template-columns: repeat(2, 1fr);
}

.change-mobile-btn {
  color: #2563eb;
  transition: all 0.2s;
}

.change-mobile-btn:hover {
  color: #1d4ed8;
}

.mobile-edit-row {
  gap: 0.5rem;
}

.save-mobile-btn {
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.save-mobile-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.save-mobile-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mobile-display {
  color: #374151;
}

.add-mobile-btn {
  border-color: #2563eb;
  color: #2563eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.add-mobile-btn:hover {
  background-color: #dbeafe;
}

/* Approval Status */
.approval-status {
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.approval-status-content {
  gap: 0.5rem;
}

.installment-details {
  color: #6b7280;
}

/* Approval Request Button */
.approval-request-btn {
  background-color: #7c3aed;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.approval-request-btn:hover:not(:disabled) {
  background-color: #6d28d9;
}

.approval-request-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.approval-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Footer */
.footer-actions {
  gap: 0.75rem;
}

.cancel-btn {
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #f9fafb;
}

.process-payment-btn {
  background-color: #059669;
  color: white;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.2s;
}

.process-payment-btn:hover:not(:disabled) {
  background-color: #047857;
}

.process-payment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.process-icon {
  vertical-align: middle;
  margin-right: 0.25rem;
}
</style>