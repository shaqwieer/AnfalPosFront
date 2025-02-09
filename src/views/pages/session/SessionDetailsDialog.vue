<script setup lang="ts">
import InputText from 'primevue/inputtext';
import { useSessionStore } from '../../../stores/sessionStore';
const props = defineProps({
  show: Boolean,
  session: {
    type: Object,
    default: null,
    required: false
  }
});

const emit = defineEmits(['close']);

const sessionStore = useSessionStore();
const RejectSession = (session) => {
  const payload = {
    shifSessionId: session.shifSessionId,
    statusId: 6
  };
  sessionStore.ApproveSession(payload);
};
const ApproveSession = (session) => {
  const payload = {
    shiftSessionId: session.sessionId,
    statusId: 7
  };
  sessionStore.ApproveSession(payload);
  closeDialog();
};
const closeDialog = () => {
  emit('close');
};
</script>

<template>
  <Dialog :header="'Session Details ' + session.saleId" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex">
      <!-- Left Side - Session Details -->
      <div class="flex-1 p-3 border-right-1 border-gray-300 overflow-y-auto">
        <!-- Header -->

        <!-- Session Info -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p class="text-sm text-gray-500">Session Start</p>
            <p class="font-medium">{{ session.sessionStartDate }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Session Close</p>
            <p class="font-medium">{{ session.sessionEndDate }}</p>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cash</label>
            <inputText type="number" v-model="session.cash" class="w-full rounded-lg border-gray-300" :disabled="session.statusName === 'IN_APPROVAL'" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Card</label>
            <inputText type="number" v-model="session.card" class="w-full rounded-lg border-gray-300" :disabled="session.statusName === 'IN_APPROVAL'" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bank</label>
            <inputText type="number" v-model="session.bank" class="w-full rounded-lg border-gray-300" :disabled="session.statusName === 'IN_APPROVAL'" />
          </div>
        </div>

        <!-- Deposit Info -->
        <div class="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
            <inputText type="number" v-model="session.depositAmount" class="w-full rounded-lg border-gray-300" :disabled="session.statusName === 'IN_APPROVAL'" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Discrepancy</label>
            <inputText type="number" v-model="session.discrepancy" class="w-full rounded-lg border-gray-300" :disabled="session.statusName === 'IN_APPROVAL'" />
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <Textarea v-model="session.notes" rows="3" class="w-full rounded-lg border-gray-300 resize-none" :disabled="session.statusName === 'IN_APPROVAL'"> </Textarea>
        </div>

        <!-- Attachments -->
        <div class="mb-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
          <div class="border-1 border-gray-300 border-round-lg p-4">
            <div v-if="session?.details?.attachments.length" class="flex flex-column gap-2">
              <div v-for="attachment in session.details.attachments" :key="attachment" class="flex align-items-center justify-content-between p-2 bg-gray-50 border-round-md">
                <span class="text-sm">{{ attachment }}</span>
                <Button text size="large" icon="pi pi-download"> </Button>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 text-center py-2">No attachments</div>
          </div>
        </div>

        <!-- Deposit Number -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Deposit No.</label>
          <InputText type="text" v-model="session.depositRefCode" class="w-full rounded-lg border-gray-300" :disabled="session.statusName === 'IN_APPROVAL'" />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-content-end gap-3">
          <Button v-if="session.statusName === 'Closed'" class="px-4 py-2 bg-red-600 text-white border-0 hover:bg-red-700" @click="RejectSession(session)">Reject</Button>
          <Button v-if="session.statusName === 'Closed'" class="px-4 py-2 bg-green-600 text-white border-0 hover:bg-green-700" @click="ApproveSession(session)">Approve</Button>
        </div>
      </div>

      <!-- Right Side - PDF/Image Viewer -->
      <div class="w-6 bg-gray-100 p-6 flex flex-column">
        <h3 class="text-lg font-medium mb-4">Attachments Preview</h3>
        <div class="flex-1 bg-white border-1 border-gray-300 border-round-lg flex align-items-center justify-content-center">
          <div class="text-center text-gray-500">
            <i class="pi pi-file text-6xl mb-2"></i>
            <p>Select an attachment to preview</p>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
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
