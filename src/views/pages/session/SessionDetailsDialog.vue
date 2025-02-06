<script setup lang="ts">
const props = defineProps<{
  show: boolean
  session: any
}>()

const emit = defineEmits(['close'])

const closeDialog = () => {
  emit('close')
}
</script>

<template>
  <div v-if="show && session"
       class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex">
      <!-- Left Side - Session Details -->
      <div class="flex-1 p-6 border-r overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Session Details</h2>
            <p class="text-sm text-gray-500">{{ session.id }}</p>
          </div>
          <button @click="closeDialog" 
                  class="p-2 hover:bg-gray-100 rounded-full">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Session Info -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p class="text-sm text-gray-500">Session Start</p>
            <p class="font-medium">{{ session.sessionStart }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Session Close</p>
            <p class="font-medium">{{ session.sessionClose }}</p>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cash</label>
            <input type="number" 
                   v-model="session.details.cash"
                   class="w-full rounded-lg border-gray-300"
                   :disabled="session.status === 'IN_APPROVAL'">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Card</label>
            <input type="number" 
                   v-model="session.details.card"
                   class="w-full rounded-lg border-gray-300"
                   :disabled="session.status === 'IN_APPROVAL'">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bank</label>
            <input type="number" 
                   v-model="session.details.bank"
                   class="w-full rounded-lg border-gray-300"
                   :disabled="session.status === 'IN_APPROVAL'">
          </div>
        </div>

        <!-- Deposit Info -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
            <input type="number" 
                   v-model="session.details.depositAmount"
                   class="w-full rounded-lg border-gray-300"
                   :disabled="session.status === 'IN_APPROVAL'">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Discrepancy</label>
            <input type="number" 
                   v-model="session.details.discrepancy"
                   class="w-full rounded-lg border-gray-300"
                   :disabled="session.status === 'IN_APPROVAL'">
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea v-model="session.details.notes"
                    rows="3"
                    class="w-full rounded-lg border-gray-300 resize-none"
                    :disabled="session.status === 'IN_APPROVAL'">
          </textarea>
        </div>

        <!-- Attachments -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
          <div class="border rounded-lg p-4">
            <div v-if="session.details.attachments.length" 
                 class="space-y-2">
              <div v-for="attachment in session.details.attachments"
                   :key="attachment"
                   class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span class="text-sm">{{ attachment }}</span>
                <button class="p-1 hover:bg-gray-200 rounded">
                  <span class="material-icons text-blue-600">download</span>
                </button>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 text-center py-2">
              No attachments
            </div>
          </div>
        </div>

        <!-- Deposit Number -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Deposit No.</label>
          <input type="text" 
                 v-model="session.details.depositNo"
                 class="w-full rounded-lg border-gray-300"
                 :disabled="session.status === 'IN_APPROVAL'">
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button v-if="session.status === 'IN_APPROVAL'"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Reject
          </button>
          <button v-if="session.status === 'IN_APPROVAL'"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Approve
          </button>
        </div>
      </div>

      <!-- Right Side - PDF/Image Viewer -->
      <div class="w-1/2 bg-gray-100 p-6 flex flex-col">
        <h3 class="text-lg font-medium mb-4">Attachments Preview</h3>
        <div class="flex-1 bg-white rounded-lg border flex items-center justify-center">
          <div class="text-center text-gray-500">
            <span class="material-icons text-6xl mb-2">description</span>
            <p>Select an attachment to preview</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dialog animation */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>