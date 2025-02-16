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
const sessionData = computed(() => sessionStore.selectedSession);

const selectedDocument = ref('');
const RejectSession = (session) => {
  const payload = {
    shiftSessionId: sessionData.value.sessionId,
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
const ApproveSessionTransaction = (transationId, transactionType) => {
  const payload = {
    approveId: transationId,
    sessionId: sessionData.value.sessionId,
    isCashDeposit: transactionType === 'Deposits'
  };
  sessionStore.ApproveSessionTransaction(payload);
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
const transactionOptions = ref(['Deposits', 'Transactions']);
const transactionType = ref('Deposits');
onMounted(() => {
  sessionStore.GetSessionDetails(props.session.sessionId);
});
</script>

<template>
  <Dialog modal style="min-width: 80vw" :closable="false" :showHeader="false" contentClass="border-round-lg p-0">
    <div class="flex bg-gray-100">
      <div class="flex flex-column gap-3 w-full p-4 bg-gray-100">
        <div class="flex flex-row justify-content-between w-full">
          <div class="flex flex-column gap-2">
            <span class="font-bold text-xl"
              >{{ 'Session #' + session.sessionId + ' - ' + session.saleName }}<span class="text-red-500">{{ session.isSessionLate ? ' (Late Session)' : '' }}</span></span
            >
            <span class="font-light text-gray-400">{{ session.sessionStartDate + ' - ' + session.sessionEndDate }}</span>
          </div>
          <Button icon="pi pi-times" class="h-3rem w-3rem bg-white text-gray-900 border-1 border-gray-200" @click="closeDialog()" />
        </div>

        <div class="flex flex-row gap-3 w-full">
          <div class="flex flex-column w-full p-3 bg-white border-round-md shadow-1">
            <span class="font-semibold"> Cash </span>
            <span class="text-black font-bold text-2xl"> {{ formatPrice(sessionData.cashCarriedForward + sessionData.cashReceived) }}</span>
          </div>
          <div class="flex flex-column w-full p-3 bg-white border-round-md shadow-1">
            <span class="font-semibold"> Card Payments </span>
            <span class="text-black font-bold text-2xl"> {{ formatPrice(sessionData.cardPayment) }}</span>
          </div>
          <div class="flex flex-column w-full p-3 bg-white border-round-md shadow-1">
            <span class="font-semibold"> Bank Transfers </span>
            <span class="text-black font-bold text-2xl"> {{ formatPrice(sessionData.bankTransfers) }}</span>
          </div>
        </div>
        <div class="flex flex-column w-full gap-2 p-3 bg-white border-round-md shadow-1">
          <span class="font-bold text-xl">Session Summary</span>
          <div class="flex flex-row justify-content-between w-full font-bold">
            <span class="">Cash Carried Forward</span>
            <span>{{ formatPrice(sessionData.cashCarriedForward) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full font-bold">
            <span class="">Cash Recieved</span>
            <span>{{ formatPrice(sessionData.cashReceived) }}</span>
          </div>
          <hr />
          <div class="flex flex-row justify-content-between w-full font-bold">
            <span class="">Total Cash</span>
            <span>{{ formatPrice(sessionData.cashCarriedForward + sessionData.cashReceived) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full font-bold text-red-500">
            <span class="">Expenses</span>
            <span>{{ formatPrice(sessionData.expenses) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full font-bold text-red-500">
            <span class="">Customer Incentive</span>
            <span>{{ formatPrice(sessionData.customerIncentive) }}</span>
          </div>
          <hr />
          <div class="flex flex-row justify-content-between w-full font-bold">
            <span class="">Deposit Amount</span>
            <span>{{ formatPrice(sessionData.depositAmount) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full font-bold">
            <span class="">Discrepancy</span>
            <span>{{ formatPrice(sessionData.cashCarriedForward + sessionData.cashReceived - sessionData.expenses - sessionData.customerIncentive - sessionData.depositAmount) }}</span>
          </div>
          <div class="flex flex-row justify-content-between w-full p-3 align-items-center bg-blue-100 border-round-lg">
            <span class="font-bold text-xl text-blue-700">Session Total</span>
            <span class="font-bold text-2xl text-blue-700">{{ formatPrice(sessionData.sessionTotal) }}</span>
          </div>
        </div>

        <div class="flex flex-column gap-1 w-full p-3 bg-white shadow-1 border-round-md">
          <div class="flex flex-row w-full justify-content-between align-items-center p-1">
            <span class="font-semibold text-lg">Financial Records</span>
            <SelectButton class="flex" v-model="transactionType" :options="transactionOptions" aria-labelledby="basic" />
          </div>
          <DataTable
            v-if="transactionType === 'Deposits'"
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
                <div class="flex align-items-center justify-content-center gap-1">
                  <div
                    v-if="slotProps.data.attachmentUrl"
                    @click="selectedDocument = slotProps.data.attachmentUrl"
                    class="cursor-pointer border-circle border-1 surface-border flex align-items-center justify-content-center w-3rem h-3rem hover:bg-gray-100"
                  >
                    <i class="pi pi-file"></i>
                  </div>
                  <div v-else class="flex w-11 justify-content-center align-items-center bg-white text-sm text-red-600">No Attachment</div>
                  <div
                    v-if="slotProps.data.statusId === 1"
                    @click="ApproveSessionTransaction(slotProps.data.depositNo, 'Deposits')"
                    class="cursor-pointer text-green-500 border-circle border-1 border-green-200 flex align-items-center justify-content-center w-3rem h-3rem hover:bg-green-100"
                  >
                    <i class="pi pi-check-circle"></i>
                  </div>
                </div>
              </template>
            </Column>
          </DataTable>
          <DataTable
            v-else
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
                <div class="flex align-items-center justify-content-center gap-1">
                  <div
                    v-if="slotProps.data.attachmentUrl"
                    @click="selectedDocument = slotProps.data.attachmentUrl"
                    class="cursor-pointer border-circle border-1 surface-border flex align-items-center justify-content-center w-3rem h-3rem hover:bg-gray-100"
                  >
                    <i class="pi pi-file"></i>
                  </div>
                  <div v-else class="flex w-11 justify-content-center align-items-center bg-white text-sm text-red-600">No Attachment</div>
                  <div
                    v-if="slotProps.data.statusId === 1"
                    @click="ApproveSessionTransaction(slotProps.data.id, 'Transactions')"
                    class="cursor-pointer text-green-500 border-circle border-1 border-green-200 flex align-items-center justify-content-center w-3rem h-3rem hover:bg-green-100"
                  >
                    <i class="pi pi-check-circle"></i>
                  </div>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
        <!-- <div class="flex justify-content-end gap-3">
          <Button v-if="session.statusId === 4" class="px-4 py-2 bg-red-600 text-white border-0 hover:bg-red-700" @click="RejectSession(sessionData)">{{ t('Session.Reject') }}</Button>
          <Button v-if="session.statusId === 4" class="px-4 py-2 bg-green-600 text-white border-0 hover:bg-green-700" @click="ApproveSession(sessionData)">{{ t('Session.Approve') }}</Button>
        </div> -->
      </div>
      <div class="flex flex-column gap-1 w-full p-3 shadow-1 border-round-xl bg-white">
        <span class="font-semibold text-2xl">Attachment Preview</span>
        <iframe v-if="selectedDocument" class="w-full" style="height: 90%" :src="selectedDocument" frameborder="0"></iframe>
        <div v-else class="flex flex-column gap-6 w-full justify-content-center align-items-center font-bold text-3xl text-gray-400 bg-gray-100 border-round-md" style="height: 92%">
          <i class="pi pi-image text-gray-400" style="font-size: 6rem"></i>
          No Attachment Selected
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
