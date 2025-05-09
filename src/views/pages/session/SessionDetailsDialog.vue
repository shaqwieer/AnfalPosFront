<script setup lang="ts">
import { useSessionStore } from '../../../stores/sessionStore';
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
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
    sessionId: sessionData.value.id,
    isCashDeposit: transactionType === 'Deposits'
  };
  sessionStore.ApproveSessionTransaction(payload);
};
const statusOptions = [
  { label: `${t('Pending')}`, value: '1', color: '#BC4819' },
  { label: `${t('Approved')}`, value: '2', color: '#3357FF' },
  { label: 'Reconciled', value: '3', color: '#FA7B00' }
];
const getStatusColor = (status) => {
  switch (status) {
    case 1:
      return 'bg-orange-100 text-orange-800';
    case 2:
      return 'bg-blue-100 text-blue-800';
    case 3:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
const getSessionStatusColor = (status) => {
  switch (status) {
    case 4:
      return 'bg-blue-100 text-blue-800';
    case 5:
      return 'bg-yellow-100 text-yellow-800';
    case 6:
      return 'bg-orange-100 text-orange-800';
    case 7:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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
const transactionOptions = ref(['Deposits', 'Transactions', 'Expenses']);
const transactionType = ref('Deposits');
onMounted(() => {
  sessionStore.GetSessionDetails(props.session.sessionId);
});

// Excel export functionality
const exportToExcel = () => {
  let dataToExport = [];
  let fileName = `Session_${props.session.sessionId}_${transactionType.value}`;
  
  if (transactionType.value === 'Deposits') {
    dataToExport = sessionData.value.shiftCashDeposits.map(item => ({
      'Deposit No.': item.depositNo,
      'SAP Doc': item.sapFinancialDoc,
      'Date': new Date(item.createdAt).toLocaleDateString('en-GB'),
      'Amount': formatPriceRaw(item.depositAmount),
      'Status': statusOptions.find(option => option.value == item.statusId)?.label || ''
    }));
  } else if (transactionType.value === 'Transactions') {
    dataToExport = sessionData.value.transactions.map(item => ({
      'Transaction ID': item.id,
      'SAP Doc': item.sapFinancialDoc,
      'Date': new Date(item.createdAt).toLocaleDateString('en-GB'),
      'Amount': formatPriceRaw(item.amount),
      'Payment Method': item.paymentMethodName,
      'Status': statusOptions.find(option => option.value == item.statusId)?.label || ''
    }));
  } else if (transactionType.value === 'Expenses') {
    dataToExport = sessionData.value.expensesInSession.map(item => ({
      'Expense Type': item.expenseType,
      'SAP Doc': item.sapFinancialDoc,
      'Date': new Date(item.createdAt).toLocaleDateString('en-GB'),
      'Amount': formatPriceRaw(item.depositAmount)
    }));
  }
  
  if (dataToExport.length === 0) {
    alert(`No ${transactionType.value.toLowerCase()} data to export`);
    return;
  }
  
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, transactionType.value);
  
  // Add session summary at the top if needed
  if (sessionData.value) {
    const summaryWorksheet = XLSX.utils.aoa_to_sheet([
      [`Session #${sessionData.value.sessionId}`],
      ['Date', sessionData.value.sessionStartDate + ' - ' + sessionData.value.sessionEndDate],
      [''],
      ['Cash', formatPriceRaw(sessionData.value.cashCarriedForward + sessionData.value.cashReceived)],
      ['Card Payments', formatPriceRaw(sessionData.value.cardPayment)],
      ['Bank Transfers', formatPriceRaw(sessionData.value.bankTransfers)],
      [''],
      ['Session Total', formatPriceRaw(sessionData.value.sessionTotal)]
    ]);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
  }
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Format price for Excel (without currency symbol)
const formatPriceRaw = (price: number | undefined | null): number => {
  return price || 0;
};
</script>

<template>
  <Dialog modal style="min-width: 80vw; min-height: 90vh" :closable="false" :showHeader="false" contentClass="border-round-lg p-0">
    <div class="flex bg-gray-100">
      <div class="flex flex-column gap-3 w-full p-4 bg-gray-100 overflow-auto" style="height: 90vh">
        <div class="flex flex-row justify-content-between w-full">
          <div class="flex flex-column gap-2">
            <span class="font-bold text-xl flex gap-2 align-items-center"
              >{{ 'Session #' + session.sessionId + ' - ' + session.saleName }}<span class="text-red-500">{{ session.isSessionLate ? ' (Late Session)' : '' }}</span>
              <span class="px-2 py-1 flex w-fit text-sm font-semibold border-round-xl" :class="getSessionStatusColor(session.statusId)">
                {{ session.statusName }}
              </span>
            </span>
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
            <div class="flex justify-content-between align-items-center w-full">
              <span class="font-semibold text-lg">Financial Records</span>
              <div class="flex gap-2">
                <SelectButton class="flex" v-model="transactionType" :options="transactionOptions" aria-labelledby="basic" />
                <Button 
                  icon="pi pi-file-excel" 
                  class="p-button-success" 
                  @click="exportToExcel()" 
                  :disabled="(transactionType === 'Deposits' && !sessionData.shiftCashDeposits?.length) || 
                            (transactionType === 'Transactions' && !sessionData.transactions?.length) || 
                            (transactionType === 'Expenses' && !sessionData.expensesInSession?.length)"
                  tooltip="Export to Excel"
                />
              </div>
            </div>
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
            <Column field="sapFinancialDoc" header="SAP Doc" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ slotProps.data.sapFinancialDoc }}</div>
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

            <Column field="statusId" header="Status" class="" :sortable="true">
              <template #body="slotProps">
                <span class="px-2 py-1 flex w-fit text-sm font-semibold border-round-xl" :class="getStatusColor(slotProps.data.statusId)">
                  {{ statusOptions.find((option) => option.value == slotProps.data.statusId)?.label }}
                </span>
              </template>
            </Column>
            <Column field="attachmentUrl" header="Attachments" class="w-1rem" :sortable="true">
              <template #body="slotProps">
                <div class="flex align-items-center justify-content-center gap-1">
                  <div
                    v-if="slotProps.data.attachmentUrl"
                    @click="selectedDocument = slotProps.data.attachmentUrl"
                    class="cursor-pointer border-circle border-1 surface-border flex align-items-center justify-content-center w-3rem h-3rem hover:bg-gray-100"
                  >
                    <i class="pi pi-file"></i>
                  </div>
                  <!-- <div v-else class="flex w-11 justify-content-center align-items-center bg-white text-sm text-red-600">No Attachment</div> -->
                  <div
                    v-if="slotProps.data.statusId === 1 && props.session.statusId !== 4"
                    @click="ApproveSessionTransaction(slotProps.data.id, 'Deposits')"
                    class="cursor-pointer text-green-500 border-circle border-1 border-green-200 flex align-items-center justify-content-center w-3rem h-3rem hover:bg-green-100"
                  >
                    <i class="pi pi-check-circle"></i>
                  </div>
                </div>
              </template>
            </Column>
          </DataTable>
          <DataTable
            v-else-if="transactionType === 'Transactions'"
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
            <Column field="sapFinancialDoc" header="SAP Doc" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ slotProps.data.sapFinancialDoc }}</div>
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
            <Column field="paymentMethodName" header="PaymentMethodName" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{slotProps.data.paymentMethodName}}</div>
              </template>
            </Column>
            <Column field="statusId" header="Status" class="" :sortable="true">
              <template #body="slotProps">
                <span class="px-2 py-1 flex w-fit text-sm font-semibold border-round-xl" :class="getStatusColor(slotProps.data.statusId)">
                  {{ statusOptions.find((option) => option.value == slotProps.data.statusId)?.label }}
                </span>
              </template>
            </Column>
            <Column field="attachmentUrl" header="Attachments" class="w-1rem" :sortable="true">
              <template #body="slotProps">
                <div class="flex align-items-center justify-content-center gap-1">
                  <div
                    v-if="slotProps.data.attachmentUrl"
                    @click="selectedDocument = slotProps.data.attachmentUrl"
                    class="cursor-pointer border-circle border-1 surface-border flex align-items-center justify-content-center w-3rem h-3rem hover:bg-gray-100"
                  >
                    <i class="pi pi-file"></i>
                  </div>
                  <!-- <div v-else class="flex w-11 justify-content-center align-items-center bg-white text-sm text-red-600">No Attachment</div> -->
                  <div
                    v-if="slotProps.data.statusId === 1 && props.session.statusId !== 4&&slotProps.data.paymentMethodName !== 'Cash'"
                    @click="ApproveSessionTransaction(slotProps.data.id, 'Transactions')"
                    class="cursor-pointer text-green-500 border-circle border-1 border-green-200 flex align-items-center justify-content-center w-3rem h-3rem hover:bg-green-100"
                  >
                    <i class="pi pi-check-circle"></i>
                  </div>
                </div>
              </template>
            </Column>
          </DataTable>
          <DataTable
            v-else-if="transactionType === 'Expenses'"
            class="surface-card border-round-lg shadow-1 border-1 surface-border"
            :value="sessionData.expensesInSession"
            :paginator="true"
            :rows="5"
            :rowsPerPageOptions="[5, 10, 25]"
            dataKey="id"
            :globalFilterFields="['expenseType', 'sapFinancialDoc']"
            :currentPageReportTemplate="''"
          >
            <template #empty>
              <div class="flex justify-content-center align-items-center font-bold text-lg">
                {{ 'No Expenses' }}
              </div>
            </template>
            <Column field="expenseType" header="Expense Type" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ slotProps.data.expenseType }}</div>
              </template>
            </Column>
            <Column field="sapFinancialDoc" header="SAP Doc" class="" :sortable="true">
              <template #body="slotProps">
                <div class="flex text-lg">{{ slotProps.data.sapFinancialDoc }}</div>
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
            <Column field="attachmentUrl" header="Attachments" class="w-1rem" :sortable="true">
              <template #body="slotProps">
                <div class="flex align-items-center justify-content-center gap-1">
                  <div
                    v-if="slotProps.data.attachmentUrl"
                    @click="selectedDocument = slotProps.data.attachmentUrl"
                    class="cursor-pointer border-circle border-1 surface-border flex align-items-center justify-content-center w-3rem h-3rem hover:bg-gray-100"
                  >
                    <i class="pi pi-file"></i>
                  </div>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
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