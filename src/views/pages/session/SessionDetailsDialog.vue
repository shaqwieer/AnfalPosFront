<script setup lang="ts">
import { useSessionStore } from '../../../stores/sessionStore';

import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
const { t } = useI18n();

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
const selectedDocument = ref('');
const RejectSession = (session) => {
  const payload = {
    shiftSessionId: session.sessionId,
    statusId: 6
  };
  sessionStore.ApproveSession(payload);
  closeDialog();
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
const Rtl = localStorage.getItem('Rtl') === 'true';
const formatPrice = (price: number | undefined | null): string => {
  return (
    price?.toLocaleString(Rtl ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0.00'
  );
};
const sessionData = computed(() => sessionStore.selectedSession);
onMounted(() => {
  sessionStore.GetSessionDetails(props.session.sessionId);
});
</script>

<template>
  <Dialog modal style="min-width: 70vw" :header="t('Session.Details')">
    <div class="flex">
      <div class="flex flex-column gap-3 w-full">
        <span class="font-bold text-xl"
          >{{ '#' + session.sessionId + ' - ' + session.saleName }}<span class="text-red-500">{{ session.isSessionLate ? ' (Late Session)' : '' }}</span></span
        >
        <span class="font-light text-gray-400">{{ session.sessionStartDate + ' - ' + session.sessionEndDate }}</span>
        <div class="flex flex-column w-full gap-2 p-3 bg-gray-100 border-round-md">
          <span class="font-bold text-lg">Cash Transactions</span>
          <div class="flex flex-row justify-content-between w-full">
            <span class="font-medium">Cash Carried Forward</span>
            <span>{{ formatPrice(sessionData.cashCarriedForward) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full">
            <span class="font-medium">Cash Recieved</span>
            <span>{{ formatPrice(sessionData.cashReceived) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full">
            <span class="font-medium">Total Cash</span>
            <span>{{ formatPrice(sessionData.cashCarriedForward + sessionData.cashReceived) }}</span>
          </div>
          <hr />
          <div class="flex flex-row justify-content-between w-full">
            <span class="font-medium">Expenses</span>
            <span>{{ formatPrice(sessionData.expenses) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full text-red-500">
            <span class="font-medium">Customer Incentive</span>
            <span>{{ '-' + formatPrice(sessionData.customerIncentive) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full text-red-500">
            <span class="font-medium">Remaining Cash</span>
            <span>{{ '-' + formatPrice(sessionData.cashCarriedForward + sessionData.cashReceived - sessionData.expenses - sessionData.customerIncentive) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full">
            <span class="font-medium">Deposit Amount</span>
            <span>{{ formatPrice(sessionData.depositAmount) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full">
            <span class="font-medium">Discrepancy</span>
            <span>{{ formatPrice(sessionData.cashCarriedForward + sessionData.cashReceived - sessionData.expenses - sessionData.customerIncentive - sessionData.depositAmount) }}</span>
          </div>
        </div>
        <div class="flex flex-row gap-3 w-full">
          <div class="flex flex-column w-full p-3 bg-gray-100 border-round-md">
            <span class="font-semibold"> Card Payments </span>
            <span class="text-black font-bold text-2xl"> {{ formatPrice(sessionData.cardPayment) }}</span>
          </div>
          <div class="flex flex-column w-full p-3 bg-gray-100 border-round-md">
            <span class="font-semibold"> Bank Transfers </span>
            <span class="text-black font-bold text-2xl"> {{ formatPrice(sessionData.bankTransfers) }}</span>
          </div>
        </div>
        <div class="flex flex-column w-full p-3 bg-gray-100 border-round-md">
          <span class="font-semibold"> Session Total </span>
          <span class="text-black font-bold text-2xl"> {{ formatPrice(session.sessionTotal) }}</span>
        </div>
        x
        <div class="flex flex-column gap-1 w-full p-3 border-1 border-gray-300 border-round-md">
          <span class="font-semibold text-lg">Deposit Attachments</span>
          <DataTable
            class="surface-card border-round-lg shadow-1 border-1 surface-border"
            :value="sessionData.shiftCashDeposits"
            :paginator="true"
            :rows="5"
            :rowsPerPageOptions="[5, 10, 25]"
            dataKey="id"
            :globalFilterFields="['name', 'id']"
            :currentPageReportTemplate="''"
          >
            <template #empty>
              <div class="flex justify-content-center align-items-center font-bold text-lg">
                {{ 'No Deposits' }}
              </div>
            </template>
            <Column field="depositNo" header="Deposit No." class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ slotProps.data.depositNo }}</div>
              </template>
            </Column>
            <Column field="createdAt" header="Date" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ new Date(slotProps.data.createdAt).toLocaleDateString('en-GB') }}</div>
              </template>
            </Column>
            <Column field="depositAmount" header="Amount" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ formatPrice(slotProps.data.depositAmount) }}</div>
              </template>
            </Column>
            <Column field="attachmentUrl" header="Attachment" class="w-1rem" :sortable="true">
              <template #body="slotProps">
                <div class="flex align-items-center justify-content-center">
                  <div
                    v-if="slotProps.data.attachmentUrl"
                    @click="selectedDocument = slotProps.data.attachmentUrl"
                    class="cursor-pointer border-circle border-1 surface-border flex align-items-center justify-content-center w-3rem h-3rem hover:bg-gray-100"
                  >
                    <i class="pi pi-file"></i>
                  </div>
                  <div v-else class="flex w-11 justify-content-center align-items-center bg-white text-sm text-red-600">No Attachment</div>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
        x
        <div class="flex flex-column gap-1 w-full p-3 border-1 border-gray-300 border-round-md">
          <span class="font-semibold text-lg">Transactions</span>
          <DataTable
            class="surface-card border-round-lg shadow-1 border-1 surface-border"
            :value="sessionData.transactions"
            :paginator="true"
            :rows="5"
            :rowsPerPageOptions="[5, 10, 25]"
            dataKey="id"
            :globalFilterFields="['name', 'id']"
            :currentPageReportTemplate="''"
          >
            <template #empty>
              <div class="flex justify-content-center align-items-center font-bold text-lg">
                {{ 'No Transactions' }}
              </div>
            </template>
            <Column field="id" header="Transaction ID" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ slotProps.data.id }}</div>
              </template>
            </Column>
            <Column field="createdAt" header="Date" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ new Date(slotProps.data.createdAt).toLocaleDateString('en-GB') }}</div>
              </template>
            </Column>
            <Column field="amount" header="Amount" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ formatPrice(slotProps.data.amount) }}</div>
              </template>
            </Column>
            <Column field="attachmentUrl" header="Attachment" class="w-1rem" :sortable="true">
              <template #body="slotProps">
                <div class="flex align-items-center justify-content-center">
                  <div
                    v-if="slotProps.data.attachmentUrl"
                    @click="selectedDocument = slotProps.data.attachmentUrl"
                    class="cursor-pointer border-circle border-1 surface-border flex align-items-center justify-content-center w-3rem h-3rem hover:bg-gray-100"
                  >
                    <i class="pi pi-file"></i>
                  </div>
                  <div v-else class="flex w-11 justify-content-center align-items-center bg-white text-sm text-red-600">No Attachment</div>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
        x
        <div class="flex justify-content-end gap-3">
          <Button v-if="session.statusId === 4" class="px-4 py-2 bg-red-600 text-white border-0 hover:bg-red-700" @click="RejectSession(session)">{{ t('Session.Reject') }}</Button>
          <Button v-if="session.statusId === 4" class="px-4 py-2 bg-green-600 text-white border-0 hover:bg-green-700" @click="ApproveSession(session)">{{ t('Session.Approve') }}</Button>
        </div>
      </div>
      <div class="flex flex-column gap-1 w-full px-3">
        <span class="font-semibold text-2xl">Attachment</span>
        <iframe v-if="selectedDocument" class="w-full" style="height: 90%" :src="selectedDocument" frameborder="0"></iframe>
        <div v-else class="flex w-full h-full justify-content-center align-items-center font-bold text-lg bg-gray-100 border-round-md">
          <div style="height: 95%" class="flex w-11 justify-content-center align-items-center bg-white text-4xl">No Attachment Selected</div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style></style>

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
