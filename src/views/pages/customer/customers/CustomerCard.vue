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
    case 'active': return 'bg-green-100 text-green-700'
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-700'
  }
}

const getApprovalStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-700'
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-700'
  }
}

const handleVisit = (event: Event) => {
  console.log(props.customer);
  
  event.stopPropagation()
  router.push({
    name: 'customer-visit',
    params: { id: props.customer.id }
  })
}
</script>

<template>
  <div class="surface-card border-round-lg shadow-2 border-1 surface-border hover:border-primary transition-colors duration-200">
    <div class="p-4">
      <!-- Customer Header -->
      <div class="flex align-items-start justify-content-between mb-4">
        <div>
          <div class="flex align-items-center gap-2">
            <span class="font-medium text-900">{{ customer.name }}</span>
            <span class="px-2 py-1 text-xs border-round-lg"
                  :class="getStatusColor(customer.status)">
              {{ customer.status }}
            </span>
            <span class="px-2 py-1 text-xs border-round-lg"
                  :class="getApprovalStatusColor(customer.approvalStatus)">
              {{ customer.approvalStatus }}
            </span>
          </div>
          <div class="mt-1 text-sm text-600">{{ customer.id }}</div>
        </div>
        <div class="text-right">
          <div class="text-sm text-600">Credit Limit</div>
          <div class="font-bold text-primary">{{ formatPrice(customer.creditLimit) }}</div>
          <div class="text-sm text-600">Balance: {{ formatPrice(customer.balance) }}</div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div class="text-600">Contact</div>
          <div class="font-medium">{{ customer.mobile }}</div>
          <div class="text-sm text-600">{{ customer.email }}</div>
        </div>
        <div>
          <div class="text-600">Business Info</div>
          <div class="font-medium">CR: {{ customer.cr }}</div>
          <div class="text-sm text-600">VAT: {{ customer.vat }}</div>
        </div>
      </div>

      <!-- Location -->
      <div class="mt-4">
        <div class="text-sm text-600">Location</div>
        <div class="font-medium">{{ customer.location.address }}</div>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-top-1 surface-border flex align-items-center justify-content-between">
        <div class="text-sm text-600">
          Created: {{ formatDate(customer.createdDate) }}
        </div>
        <div class="flex align-items-center gap-2">
          <!-- View Button -->
          <button @click.stop="$emit('view-details', customer)"
                  class="p-button p-button-text p-button-primary flex align-items-center gap-1">
            <i class="pi pi-eye"></i>
            <span>View</span>
          </button>

          <!-- Edit Button -->
          <button @click.stop="$emit('edit-customer', customer)"
                  class="p-button p-button-text flex align-items-center gap-1">
            <i class="pi pi-pencil"></i>
            <span>Edit</span>
          </button>

          <!-- Visit Button -->
          <button @click="handleVisit"
                  class="p-button p-button-text p-button-success flex align-items-center gap-1">
            <i class="pi pi-home"></i>
            <span>Visit</span>
          </button>

          <!-- Slot for additional actions (like Dashboard) -->
          <slot name="actions"></slot>

          <!-- Approval Actions -->
          <template v-if="customer.approvalStatus === 'pending'">
            <button @click.stop="$emit('approve', customer)"
                    class="p-button p-button-text p-button-success flex align-items-center gap-1">
              <i class="pi pi-check-circle"></i>
              <span>Approve</span>
            </button>
            <button @click.stop="$emit('reject', customer)"
                    class="p-button p-button-text p-button-danger flex align-items-center gap-1">
              <i class="pi pi-times-circle"></i>
              <span>Reject</span>
            </button>
          </template>

          <!-- Submit for Approval Button -->
          <button v-if="customer.status === 'draft'"
                  @click.stop="$emit('submit-approval', customer)"
                  class="p-button p-button-primary flex align-items-center gap-1">
            <i class="pi pi-send"></i>
            <span>Submit for Approval</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>