<script setup lang="js">
import { formatPrice, formatDate } from '../../../../utilities/formatting';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  customer: Object
});
const emit = defineEmits(['view-details', 'edit-customer', 'submit-approval', 'approve', 'reject']);

const getStatusColor = (status) => {
  switch (status) {
    case 7:
      return 'bg-green-100 text-green-700';
    case 6:
      return 'bg-yellow-100 text-yellow-700';
    case 8:
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-700';
  }
};

const getApprovalStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-700';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'Rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-700';
  }
};

const handleVisit = (event) => {
  console.log(props.customer);

  event.stopPropagation();
  router.push({
    name: 'customer-visit',
    params: { id: props.customer.id }
  });
};
const test = () => {
  console.log(props.customer);
};
</script>

<template>
  <div class="surface-card border-round-lg shadow-2 border-1 surface-border hover:border-primary transition-colors duration-200">
    <div class="p-4">
      <!-- <div @click="test" style="width: 200px; height: 20px; background: red;"></div> -->

      <!-- Customer Header -->
      <div class="flex align-items-start justify-content-between mb-4">
        <div>
          <div class="flex align-items-center gap-2">
            <span class="font-medium text-900">{{ customer.name }}</span>
            <span class="px-2 py-1 text-xs border-round-lg" :class="getStatusColor(customer.statusId)">
              {{ customer.statusId === 7 ? 'Approved' : status === 6 ? 'Pending' : 'Rejected' }}
            </span>

            <span class="px-2 py-1 text-xs border-round-lg" :class="getApprovalStatusColor(customer.statusName)">
              {{ customer.statusName }}
            </span>
          </div>
          <div class="mt-1 text-sm text-600">CUS-{{ customer.id }}</div>
        </div>

        <div class="text-right">
          <div class="text-sm text-600">Credit Limit</div>
          <div class="font-bold text-primary">SAR {{ formatPrice(customer.creditLimit) }}</div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="flex justify-content-between text-sm">
        <div class="w-full">
          <div class="text-600">Contact</div>
          <div class="font-semibold text-md">{{ customer.contactMobileNumber }}</div>
          <div class="text-sm text-600">{{ customer.email }}</div>
        </div>
        <div class="w-full">
          <div class="text-600 w-full">Business Info</div>
          <div class="font-medium">CR: {{ customer.crNumber }}</div>
          <div class="text-sm text-600">VAT: {{ customer.vatNumber }}</div>
        </div>
      </div>

      <!-- Location -->
      <div class="mt-4">
        <div class="text-sm text-600">Location</div>
        <div class="font-medium">{{ customer.buildingNumber }} {{ customer.streetName }} {{ customer.district }} {{ customer.city }}</div>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-2 border-top-1 surface-border flex align-items-center justify-content-between">
        <div class="text-sm text-600">Created: {{ formatDate(customer.createdAt) }}</div>

        <div class="flex align-items-center gap-2">
          <!-- View Button -->
          <button @click.stop="$emit('view-details', customer)" class="p-button p-button-text p-button-primary flex align-items-center gap-1">
            <i class="pi pi-eye"></i>
            <span>View</span>
          </button>

          <!-- Edit Button -->
          <button @click.stop="$emit('edit-customer', customer)" class="p-button p-button-text flex align-items-center gap-1">
            <i class="pi pi-pencil"></i>
            <span>Edit</span>
          </button>

          <!-- Visit Button -->
          <div @click="handleVisit" class="p-button p-button-text p-button-success flex align-items-center gap-1">
            <i class="pi pi-home"></i>
            <span>Visit</span>
          </div>

          <!-- Slot for additional actions (like Dashboard) -->
          <slot name="actions"></slot>

          <!-- Approval Actions -->
          <template v-if="customer.approvalStatus === 'pending'">
            <button @click.stop="$emit('approve', customer)" class="p-button p-button-text p-button-success flex align-items-center gap-1">
              <i class="pi pi-check-circle"></i>
              <span>Approve</span>
            </button>
            <div @click.stop="$emit('reject', customer)" class="p-button p-button-text p-button-danger flex align-items-center gap-1">
              <i class="pi pi-times-circle"></i>
              <span>Reject</span>
            </div>
          </template>

          <!-- Submit for Approval Button -->
          <button v-if="customer.statusName === 'draft'" @click.stop="$emit('submit-approval', customer)" class="p-button p-button-primary flex align-items-center gap-1">
            <i class="pi pi-send"></i>
            <span>Submit for Approval</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
