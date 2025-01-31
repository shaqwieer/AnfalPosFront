<script setup lang="ts">
import { formatPrice, formatDate } from '../../../../utilities/formatting'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  customer: {
    id: string
    name: string
    type: string
    mobile: string
    email: string
    cr: string
    vat: string
    buildingNumber: string
    streetName: string
    district: string
    city: string
    postalCode: string
    additionalNumber: string
    creditLimit: number
    balance: number
    status: string
    approvalStatus: string
    approvedBy?: string
    approvedDate?: string
    createdBy: string
    createdDate: string
    location: {
      lat: number
      lng: number
      address: string
    }
  }
}>()

const emit = defineEmits(['view-details', 'edit-customer', 'submit-approval', 'approve', 'reject'])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getApprovalStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const handleVisit = (event: Event) => {
  event.stopPropagation()
  router.push({
    name: 'customer-visit',
    params: { id: props.customer.id }
  })
}
</script>

<template>
  <div class="bg-white border-round-lg shadow-3 border hover:border-blue-500 transition-all duration-200">
    <div class="p-4">
      <!-- Customer Header -->
      <div class="flex items-start justify-content-between mb-4">
        <div>
          <div class="flex align-items-center space-x-2">
            <span class="font-medium text-gray-900">{{ customer.name }}</span>
            <span class="px-2 py-0.5 text-xs rounded-full"
                  :class="getStatusColor(customer.status)">
              {{ customer.status }}
            </span>
            <span class="px-2 py-0.5 text-xs rounded-full"
                  :class="getApprovalStatusColor(customer.approvalStatus)">
              {{ customer.approvalStatus }}
            </span>
          </div>
          <div class="mt-1 text-sm text-gray-500">{{ customer.id }}</div>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500">Credit Limit</div>
          <div class="font-bold text-blue-600">{{ formatPrice(customer.creditLimit) }}</div>
          <div class="text-sm text-gray-500">Balance: {{ formatPrice(customer.balance) }}</div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div class="text-gray-500">Contact</div>
          <div class="font-medium">{{ customer.mobile }}</div>
          <div class="text-sm text-gray-500">{{ customer.email }}</div>
        </div>
        <div>
          <div class="text-gray-500">Business Info</div>
          <div class="font-medium">CR: {{ customer.cr }}</div>
          <div class="text-sm text-gray-500">VAT: {{ customer.vat }}</div>
        </div>
      </div>

      <!-- Location -->
      <div class="mt-4">
        <div class="text-sm text-gray-500">Location</div>
        <div class="font-medium">{{ customer.location.address }}</div>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t flex align-items-center justify-content-between">
        <div class="text-sm text-gray-500">
          Created: {{ formatDate(customer.createdDate) }}
        </div>
        <div class="flex align-items-center space-x-3">
          <!-- View Button -->
          <button @click.stop="$emit('view-details', customer)"
                  class="px-3 py-1.5 text-blue-600 hover:bg-blue-50 border-round-lg flex align-items-center space-x-1">
            <span class="material-icons text-sm">visibility</span>
            <span>View</span>
          </button>

          <!-- Edit Button -->
          <button @click.stop="$emit('edit-customer', customer)"
                  class="px-3 py-1.5 text-gray-600 hover:bg-gray-50 border-round-lg flex align-items-center space-x-1">
            <span class="material-icons text-sm">edit</span>
            <span>Edit</span>
          </button>

          <!-- Visit Button -->
          <button @click="handleVisit"
                  class="px-3 py-1.5 text-green-600 hover:bg-green-50 border-round-lg flex align-items-center space-x-1">
            <span class="material-icons text-sm">store</span>
            <span>Visit</span>
          </button>

          <!-- Slot for additional actions (like Dashboard) -->
          <slot name="actions"></slot>

          <!-- Approval Actions -->
          <template v-if="customer.approvalStatus === 'pending'">
            <button @click.stop="$emit('approve', customer)"
                    class="px-3 py-1.5 text-green-600 hover:bg-green-50 border-round-lg flex align-items-center space-x-1">
              <span class="material-icons text-sm">check_circle</span>
              <span>Approve</span>
            </button>
            <button @click.stop="$emit('reject', customer)"
                    class="px-3 py-1.5 text-red-600 hover:bg-red-50 border-round-lg flex align-items-center space-x-1">
              <span class="material-icons text-sm">cancel</span>
              <span>Reject</span>
            </button>
          </template>

          <!-- Submit for Approval Button -->
          <button v-if="customer.status === 'draft'"
                  @click.stop="$emit('submit-approval', customer)"
                  class="px-4 py-2 bg-blue-600 text-white border-round-lg hover:bg-blue-700">
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  </div>
</template>