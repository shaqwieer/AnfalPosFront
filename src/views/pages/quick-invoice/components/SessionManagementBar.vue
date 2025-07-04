<template>
  <div class="session-management-bar">
    <!-- Main Action Bar -->
    <div class="p-3 bg-white border-round session-bar-container" style="border: 1px solid var(--sap-border)">
      <div class="flex align-items-center justify-content-between">
        <!-- Left Side: Session Info -->
        <div class="flex align-items-center gap-4">
          <!-- Session Status -->
          <div class="flex align-items-center gap-2">
            <div class="session-indicator" :class="{ 'session-active': isSessionOpen, 'session-inactive': !isSessionOpen }"></div>
            <span class="font-medium" style="color: var(--sap-text)">
              {{ isSessionOpen ? 'Session Active' : 'Session Closed' }}
            </span>
          </div>

          <!-- Session Duration (if active) -->
          <div v-if="isSessionOpen" class="flex align-items-center gap-2">
            <span class="material-icons text-sm" style="color: var(--sap-text-secondary)">schedule</span>
            <span class="font-mono text-sm" style="color: var(--sap-text-secondary)">
              {{ sessionDuration }}
            </span>
          </div>

          <!-- Cash Journal Info -->
          <div class="flex align-items-center gap-2">
            <span class="material-icons text-green-600 text-sm">account_balance_wallet</span>
            <span class="text-sm" style="color: var(--sap-text-secondary)">
              {{ cashJournal || 'N/A' }} | Balance: ${{ currentCash.toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Right Side: Action Buttons -->
        <div class="flex align-items-center gap-2">
          <!-- Draft Invoices -->
          <Button outlined severity="info" class="session-action-btn w-10rem  border-1 border-300" @click="openDraftInvoicesDialog" v-tooltip.bottom="'Draft Invoices'">
            <div class="flex align-items-center text-center gap-1">
              <!-- <span class="material-icons text-blue-600 text-sm">draft</span> -->
              <span class="w-full ">Draft Invoices</span>
              <span v-if="draftInvoices.length > 0" class="draft-count">{{ draftInvoices.length }}</span>
            </div>
          </Button>
          <Button outlined severity="info" class="session-action-btn w-12.5rem  border-1 border-300 text-center" @click="openNotSyncedInvoicesDialog" v-tooltip.bottom="'Not Synced Invoices'">
            <span class="whitespace-nowrap">Not Synced Invoices</span>
          </Button>
          <!-- Session Actions -->
          <Button v-if="!isSessionOpen" severity="success" @click="showOpenSessionDialog = true" class="session-btn w-12rem ">
            <div class="flex align-items-center gap-2">
              <span class="material-icons text-sm">play_arrow</span>
              <span>Open Session</span>
            </div>
          </Button>

          <Button v-else severity="warning" size="small" @click="prepareCloseSession" :loading="terminalStore.sessionLoading" class="session-btn">
            <div class="flex align-items-center gap-2">
              <span v-if="!terminalStore.sessionLoading" class="material-icons text-sm">stop</span>
              <span>{{ terminalStore.sessionLoading ? 'Loading...' : 'Close Session' }}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>

    <!-- Open Session Dialog -->
    <div v-if="showOpenSessionDialog" class="fixed dialog-overlay">
      <div class="bg-white session-dialog">
        <div class="p-4 border-bottom flex align-items-center justify-content-between">
          <h3 class="text-lg font-semibold">Open New Session</h3>
          <Button text @click="cancelOpenSession" class="p-2 dialog-close-btn">
            <span class="material-icons">close</span>
          </Button>
        </div>

        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Opening Cash Amount</label>
            <div class="relative">
              <span class="absolute cash-symbol">$</span>
              <InputNumber v-model="openingCash" mode="currency" currency="USD" class="w-full cash-input" placeholder="0.00" :min="0" :step="0.01" />
            </div>
            <small class="text-gray-500">Enter the amount of cash in the register at the start of your shift</small>
          </div>

          <div class="flex gap-3 justify-content-end">
            <Button outlined @click="cancelOpenSession" class="px-4 py-2"> Cancel </Button>
            <Button @click="openSession" class="px-4 py-2"> Start Session </Button>
          </div>
        </div>
      </div>

      
    </div>

    <!-- Close Session Dialog -->
    <div v-if="showCloseSessionDialog" class="fixed dialog-overlay">
      <div class="bg-white session-dialog">
        <div class="p-4 border-bottom flex align-items-center justify-content-between">
          <h3 class="text-lg font-semibold">Close Session</h3>
          <Button text @click="cancelCloseSession" class="p-2 dialog-close-btn">
            <span class="material-icons">close</span>
          </Button>
        </div>

        <div class="p-6 session-close-content">
          <!-- Session Summary -->
          <div class="bg-gray-50 p-4 border-round mb-4">
            <h4 class="font-medium mb-3">Session Summary</h4>
            <div class="grid grid-nogutter gap-3">
              <div class="col-12 md:col-6 lg:col-3">
                <div class="text-sm text-gray-600">Started</div>
                <div class="font-medium">{{ formatTime(sessionStartTime!) }}</div>
              </div>
              <div class="col-12 md:col-6 lg:col-3">
                <div class="text-sm text-gray-600">Duration</div>
                <div class="font-medium">{{ sessionDuration }}</div>
              </div>
              <div class="col-12 md:col-6 lg:col-3">
                <div class="text-sm text-gray-600">Opening Cash</div>
                <div class="font-medium">${{ formatPrice(currentCash) }}</div>
              </div>
              <div class="col-12 md:col-6 lg:col-3">
                <div class="text-sm text-gray-600">Expected Cash End</div>
                <div class="font-medium">${{ formatPrice(expectedCashEndAmount) }}</div>
              </div>
              <div class="col-12 md:col-6 lg:col-3">
                <div class="text-sm text-gray-600">Discrepancy Amount</div>
                <div class="font-medium" :class="{ 'text-red-600': discrepancyAmount !== 0, 'text-green-600': discrepancyAmount === 0 }">
                  ${{ formatPrice(discrepancyAmount) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Form Fields Grid -->
          <div class="grid grid-nogutter gap-4 mb-4">
            <!-- Closing Cash -->
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">Closing Cash Amount</label>
              <div class="relative">
                <span class="absolute cash-symbol">$</span>
                <InputNumber v-model="closingCash" mode="currency" currency="USD" class="w-full cash-input" placeholder="0.00" :min="0" :step="0.01" />
              </div>
              <small class="text-gray-500">Count the cash in the register and enter the total amount</small>
            </div>

            <!-- Deposit Number -->
            <div class="col-12 md:col-6">
              <label class="block text-sm font-medium mb-2">Deposit Number</label>
              <InputText v-model="depositNo" class="w-full" placeholder="Enter deposit number" />
              <small class="text-gray-500">Enter a unique deposit number for this session</small>
            </div>

            <!-- Session Notes -->
            <div class="col-12">
              <label class="block text-sm font-medium mb-2">Session Notes</label>
              <textarea v-model="sessionNotes" rows="3" class="w-full p-2 border border-gray-300 rounded-lg" placeholder="Enter any notes about this session..."></textarea>
            </div>

            <!-- Attachment -->
            <div class="col-12">
              <label class="block text-sm font-medium mb-2">Attachment (Optional)</label>
              <input type="file" @change="handleFileUpload" class="w-full p-2 border border-gray-300 rounded-lg" accept="image/*,.pdf,.doc,.docx" />
              <small class="text-gray-500">Upload any supporting documents</small>
            </div>
          </div>

          <!-- Cash Difference -->
          <div v-if="closingCash > 0" class="bg-blue-50 p-4 border-round mb-4">
            <div class="grid grid-nogutter align-items-center">
              <div class="col-12 md:col-6">
                <span class="font-medium text-lg">Cash Difference:</span>
              </div>
              <div class="col-12 md:col-6 text-right">
                <span
                  class="font-bold text-xl"
                  :class="{
                    'text-green-600': closingCash >= expectedCashEndAmount,
                    'text-red-600': closingCash < expectedCashEndAmount
                  }"
                >
                  {{ closingCash >= expectedCashEndAmount ? '+' : '' }}${{ formatPrice(closingCash - expectedCashEndAmount) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 justify-content-end pt-3 border-top">
            <Button outlined @click="cancelCloseSession" class="px-6 py-3" size="large"> Cancel </Button>
            <Button @click="closeSession" severity="warning" class="px-6 py-3" size="large" :loading="terminalStore.sessionLoading">
              <span v-if="!terminalStore.sessionLoading">Close Session</span>
              <span v-else>Closing...</span>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Draft Invoices Dialog -->
    <div v-if="showDraftInvoices" class="fixed dialog-overlay">
      <div class="bg-white draft-dialog">
        <div class="p-4 border-bottom flex align-items-center justify-content-between">
          <h3 class="text-lg font-semibold">Draft Invoices</h3>
          <Button text @click="showDraftInvoices = false" class="p-2 dialog-close-btn">
            <span class="material-icons">close</span>
          </Button>
        </div>

        <div class="p-4">
          <div v-if="loadingDraftInvoices" class="text-center py-8">
            <span class="material-icons text-4xl text-gray-400 mb-2 animate-spin">sync</span>
            <p class="text-gray-500">Loading draft invoices...</p>
          </div>

          <div v-else-if="draftInvoices.length === 0" class="text-center py-8">
            <span class="material-icons text-4xl text-gray-400 mb-2">draft</span>
            <p class="text-gray-500">No draft invoices found</p>
          </div>

          <div v-else class="draft-list">
            <div v-for="invoice in draftInvoices" :key="invoice.id" class="draft-item p-4 border-1 border-gray-200 border-round cursor-pointer" @click="loadDraftInvoice(invoice)">
              <div class="flex align-items-start justify-content-between">
                <div class="flex-1">
                  <div class="flex align-items-center gap-2 mb-2">
                    <span class="font-medium text-blue-600">{{ invoice.uniqueIdentifier }}</span>
                    <span class="text-sm text-gray-500">{{ formatTime(new Date(invoice.createdAt)) }}</span>
                  </div>

                  <div class="flex align-items-center gap-4 mb-2">
                    <div class="flex align-items-center gap-1">
                      <span class="material-icons text-sm text-gray-400">person</span>
                      <span class="text-sm">{{ invoice.customerName }}</span>
                    </div>
                    <div class="flex align-items-center gap-1">
                      <span class="material-icons text-sm text-gray-400">phone</span>
                      <span class="text-sm">{{ invoice.customerPhoneNumber }}</span>
                    </div>
                    <div class="flex align-items-center gap-1">
                      <span class="material-icons text-sm text-gray-400">shopping_cart</span>
                      <span class="text-sm">{{ invoice.items?.length || 0 }} items</span>
                    </div>
                  </div>

                  <div class="font-bold text-lg" style="color: var(--sap-primary)">${{ formatPrice(invoice.finalAmount) }}</div>
                </div>

                <div class="flex flex-column gap-2">
                  <Button text severity="success" class="p-2 publish-btn" @click="publishDraftInvoice(invoice.id, $event)" v-tooltip.left="'Publish Invoice'">
                    <span class="material-icons text-green-500">publish</span>
                  </Button>
                  <Button text severity="info" class="p-2 edit-btn" @click="editDraftInvoice(invoice, $event)" v-tooltip.left="'Edit Draft'">
                    <span class="material-icons text-blue-500">edit</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Synced Invoices Dialog -->
    <div v-if="showNotSyncedInvoices" class="fixed dialog-overlay">
      <div class="bg-white draft-dialog">
        <div class="p-4 border-bottom flex align-items-center justify-content-between">
          <h3 class="text-lg font-semibold">Not Synced Invoices</h3>
          <Button text @click="showNotSyncedInvoices = false" class="p-2 dialog-close-btn">
            <span class="material-icons">close</span>
          </Button>
        </div>

        <div class="p-4">
          <div v-if="loadingNotSyncedInvoices" class="text-center py-8">
            <span class="material-icons text-4xl text-gray-400 mb-2 animate-spin">sync</span>
            <p class="text-gray-500">Loading not synced invoices...</p>
          </div>

          <div v-else-if="notSyncedInvoices.length === 0" class="text-center py-8">
            <span class="material-icons text-4xl text-gray-400 mb-2">cloud_off</span>
            <p class="text-gray-500">No unsynced invoices found</p>
          </div>

          <div v-else class="draft-list">
            <div v-for="invoice in notSyncedInvoices" :key="invoice.id" class="draft-item p-4 border-1 border-gray-200 border-round cursor-pointer" @click="loadNotSyncedInvoice(invoice)">
              <div class="flex align-items-start justify-content-between">
                <div class="flex-1">
                  <div class="flex align-items-center gap-2 mb-2">
                    <span class="font-medium text-orange-600">{{ invoice.uniqueIdentifier }}</span>
                    <span class="text-sm text-gray-500">{{ formatTime(new Date(invoice.createdAt)) }}</span>
                  </div>

                  <div class="flex align-items-center gap-4 mb-2">
                    <div class="flex align-items-center gap-1">
                      <span class="material-icons text-sm text-gray-400">person</span>
                      <span class="text-sm">{{ invoice.customerName }}</span>
                    </div>
                    <div class="flex align-items-center gap-1">
                      <span class="material-icons text-sm text-gray-400">phone</span>
                      <span class="text-sm">{{ invoice.customerPhoneNumber }}</span>
                    </div>
                    <div class="flex align-items-center gap-1">
                      <span class="material-icons text-sm text-gray-400">shopping_cart</span>
                      <span class="text-sm">{{ invoice.items?.length || 0 }} items</span>
                    </div>
                  </div>

                  <div class="font-bold text-lg" style="color: var(--sap-primary)">${{ formatPrice(invoice.finalAmount) }}</div>
                </div>

                <Button text severity="warning" class="p-2 sync-btn" @click="syncInvoice(invoice.id, $event)" v-tooltip.left="'Sync Invoice'">
                  <span class="material-icons text-orange-500">sync</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { BaseButton } from '@/components/shared';
import { useTerminalStore } from '@/stores/terminalStore.js';
import { useOrderStore } from '../../../../stores/orderStore';
import { useToast } from 'primevue/usetoast';
import { invoiceService } from '../../../../api/invoiceService.js';
import { transformInvoiceToOrder } from '../../../../utilities/invoiceTransformer';

// Terminal store
const terminalStore = useTerminalStore();
const orderStore = useOrderStore();
const toast = useToast();

// Session management
const openingCash = ref(0);
const closingCash = ref(0);
const showOpenSessionDialog = ref(false);
const showCloseSessionDialog = ref(false);
const sessionNotes = ref('');
const depositNo = ref('');
const attachmentFile = ref<File | null>(null);

// Session details for closing
const expectedCashEndAmount = ref(0);
const discrepancyAmount = ref(0);
const sessionId = ref(null);

// Use API data for session status
const isSessionOpen = computed(() => terminalStore.isSessionOpened);
const sessionStartTime = computed(() => {
  if (terminalStore.sessionOpenDate) {
    return new Date(terminalStore.sessionOpenDate);
  }
  return null;
});
const currentCash = computed(() => terminalStore.currentCash);
const cashJournal = computed(() => terminalStore.cashJournal);

// Timer management
const currentTime = ref(new Date());
let timerInterval: NodeJS.Timeout | null = null;

// Draft invoices
const showDraftInvoices = ref(false);
const draftInvoices = ref<any[]>([]);
const loadingDraftInvoices = ref(false);

// Not synced invoices
const showNotSyncedInvoices = ref(false);
const notSyncedInvoices = ref<any[]>([]);
const loadingNotSyncedInvoices = ref(false);

const sessionDuration = computed(() => {
  if (!sessionStartTime.value) return '00:00:00';

  // Use currentTime.value instead of new Date() to make it reactive
  const diff = currentTime.value.getTime() - sessionStartTime.value.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Start the timer when component mounts
onMounted(async () => {
  startTimer();
  // Initialize terminal information
  // await terminalStore.initializeTerminal();
  
  // Debug order store
  console.log('Order store initialized:', orderStore);
  console.log('Order store methods:', Object.keys(orderStore));
});

// Clean up timer when component unmounts
onUnmounted(() => {
  stopTimer();
  // Cleanup terminal store
  terminalStore.cleanup();
});

const startTimer = () => {
  if (timerInterval) return; // Prevent multiple intervals
  
  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const formatPrice = (price: number) => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openSession = async () => {
  if (openingCash.value < 0) {
    toast.add({
      severity: 'error',
      summary: 'Invalid Amount',
      detail: 'Opening cash amount cannot be negative',
      life: 5000
    });
    return;
  }

  try {
    await terminalStore.openSession();
    showOpenSessionDialog.value = false;
    openingCash.value = 0;
    console.log('Session opened successfully');
  } catch (error) {
    console.error('Failed to open session:', error);
    toast.add({
      severity: 'error',
      summary: 'Session Open Failed',
      detail: 'Failed to open session. Please try again.',
      life: 5000
    });
  }
};

const prepareCloseSession = async () => {
  try {
    // Show loading state
    console.log('Fetching session details...');

    // Get session details before showing close dialog
    const details = await terminalStore.getSessionDetailsForClosing();

    console.log('Session details received:', details);

    expectedCashEndAmount.value = details.expectedCashEndAmount || 0;
    discrepancyAmount.value = details.discrepancyAmount || 0;
    sessionId.value = details.sessionId || details.id; // Use sessionId if available, fallback to id

    // Generate default deposit number
    depositNo.value = `DEP-${new Date().getTime()}`;

    showCloseSessionDialog.value = true;
  } catch (error) {
    console.error('Failed to get session details:', error);

    // Show more specific error messages
    let errorMessage = 'Failed to get session details. ';
    if (error.message.includes('No active session found')) {
      errorMessage += 'Please ensure a session is open before trying to close it.';
    } else if (error.message.includes('Network Error')) {
      errorMessage += 'Please check your internet connection and try again.';
    } else {
      errorMessage += `Error: ${error.message}`;
    }

    toast.add({
      severity: 'error',
      summary: 'Session Details Error',
      detail: errorMessage,
      life: 7000
    });
  }
};

const closeSession = async () => {
  if (closingCash.value < 0) {
    toast.add({
      severity: 'error',
      summary: 'Invalid Amount',
      detail: 'Closing cash amount cannot be negative',
      life: 5000
    });
    return;
  }

  if (!sessionId.value) {
    toast.add({
      severity: 'error',
      summary: 'Session Error',
      detail: 'Session ID not found. Please try again.',
      life: 5000
    });
    return;
  }

  try {
    const closeParams = {
      shiftSessionId: sessionId.value,
      shiftCashDeposits: {
        depositAmount: closingCash.value,
        depositNo: depositNo.value,
        attachment: attachmentFile.value ? attachmentFile.value.name : ''
      },
      Notes: sessionNotes.value,
      attachment: attachmentFile.value
    };

    await terminalStore.closeSession(closeParams);
    showCloseSessionDialog.value = false;

    // Reset values
    resetCloseSessionForm();

    console.log('Session closed successfully');
  } catch (error) {
    console.error('Failed to close session:', error);
    toast.add({
      severity: 'error',
      summary: 'Session Close Failed',
      detail: 'Failed to close session. Please try again.',
      life: 5000
    });
  }
};

const resetCloseSessionForm = () => {
  closingCash.value = 0;
  sessionNotes.value = '';
  depositNo.value = '';
  attachmentFile.value = null;
  expectedCashEndAmount.value = 0;
  discrepancyAmount.value = 0;
  sessionId.value = null;
};

const openDraftInvoicesDialog = async () => {
  showDraftInvoices.value = true;
  await fetchDraftInvoices();
};

const fetchDraftInvoices = async () => {
  try {
    loadingDraftInvoices.value = true;
    const response = await invoiceService.getDraftInvoices();
    
    if (response.success && response.data) {
      draftInvoices.value = response.data;
    } else {
      draftInvoices.value = [];
      toast.add({
        severity: 'warn',
        summary: 'No Data',
        detail: response.message || 'No draft invoices found',
        life: 3000
      });
    }
  } catch (error) {
    console.error('Error fetching draft invoices:', error);
    draftInvoices.value = [];
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch draft invoices',
      life: 5000
    });
  } finally {
    loadingDraftInvoices.value = false;
  }
};

const loadDraftInvoice = async (invoice: any) => {
  try {
    console.log('Loading draft invoice:', invoice.id);
    
    // Transform API data to order format
    const orderData = transformInvoiceToOrder(invoice);
    
    // Load data into order store
    if (typeof orderStore.loadInvoiceData === 'function') {
      orderStore.loadInvoiceData(orderData);
    } else {
      throw new Error('loadInvoiceData function not found in order store');
    }
    
    // Close dialog
    showDraftInvoices.value = false;
    
    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Draft Loaded',
      detail: `Draft invoice ${invoice.uniqueIdentifier} loaded successfully`,
      life: 3000
    });
  } catch (error) {
    console.error('Error loading draft invoice:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load draft invoice data',
      life: 5000
    });
  }
};

const editDraftInvoice = async (invoice: any, event: Event) => {
  event.stopPropagation();
  
  try {
    console.log('Editing draft invoice:', invoice.id);
    
    // Transform API data to order format
    const orderData = transformInvoiceToOrder(invoice);
    
    // Load data into order store
    if (typeof orderStore.loadInvoiceData === 'function') {
      orderStore.loadInvoiceData(orderData);
    } else {
      throw new Error('loadInvoiceData function not found in order store');
    }
    
    // Close dialog
    showDraftInvoices.value = false;
    
    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Draft Loaded for Editing',
      detail: `Draft invoice ${invoice.uniqueIdentifier} loaded for editing`,
      life: 3000
    });
  } catch (error) {
    console.error('Error loading draft invoice for editing:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load draft invoice for editing',
      life: 5000
    });
  }
};

const publishDraftInvoice = async (invoiceId: string, event: Event) => {
  event.stopPropagation();

  if (confirm('Are you sure you want to publish this draft invoice? This action cannot be undone.')) {
    try {
      console.log('Publishing draft invoice:', invoiceId);
      await invoiceService.publishDraftInvoice(invoiceId);
      
      // Remove from draft list after successful publish
      const index = draftInvoices.value.findIndex((i) => i.id === invoiceId);
      if (index > -1) {
        draftInvoices.value.splice(index, 1);
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Draft invoice published successfully',
        life: 3000
      });
    } catch (error) {
      console.error('Error publishing draft invoice:', error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to publish draft invoice',
        life: 5000
      });
    }
  }
};

const openNotSyncedInvoicesDialog = async () => {
  showNotSyncedInvoices.value = true;
  await fetchNotSyncedInvoices();
};

const fetchNotSyncedInvoices = async () => {
  try {
    loadingNotSyncedInvoices.value = true;
    const response = await invoiceService.getNotSyncedInvoices();
    
    if (response.success && response.data) {
      notSyncedInvoices.value = response.data;
    } else {
      notSyncedInvoices.value = [];
      toast.add({
        severity: 'warn',
        summary: 'No Data',
        detail: response.message || 'No not synced invoices found',
        life: 3000
      });
    }
  } catch (error) {
    console.error('Error fetching not synced invoices:', error);
    notSyncedInvoices.value = [];
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch not synced invoices',
      life: 5000
    });
  } finally {
    loadingNotSyncedInvoices.value = false;
  }
};

const loadNotSyncedInvoice = async (invoice: any) => {
  try {
    console.log('Loading not synced invoice:', invoice.id);
    console.log('Order store:', orderStore);
    console.log('Order store methods:', Object.keys(orderStore));
    
    // Transform API data to order format
    const orderData = transformInvoiceToOrder(invoice);
    console.log('Transformed order data:', orderData);
    console.log('Items in transformed data:', orderData.items);
    console.log('First item name:', orderData.items[0]?.service?.name);
    
    // Load data into order store
    if (typeof orderStore.loadInvoiceData === 'function') {
      orderStore.loadInvoiceData(orderData);
    } else {
      throw new Error('loadInvoiceData function not found in order store');
    }
    
    // Close dialog
    showNotSyncedInvoices.value = false;
    
    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Invoice Loaded',
      detail: `Invoice ${invoice.uniqueIdentifier} loaded successfully`,
      life: 3000
    });
  } catch (error) {
    console.error('Error loading invoice:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load invoice data',
      life: 5000
    });
  }
};

const syncInvoice = async (invoiceId: string, event: Event) => {
  event.stopPropagation();

  if (confirm('Are you sure you want to sync this invoice?')) {
    try {
      console.log('Syncing invoice:', invoiceId);
      await invoiceService.syncInvoice(invoiceId);
      
      // Remove from not synced list after successful sync
      const index = notSyncedInvoices.value.findIndex((i) => i.id === invoiceId);
      if (index > -1) {
        notSyncedInvoices.value.splice(index, 1);
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Invoice synced successfully',
        life: 3000
      });
    } catch (error) {
      console.error('Error syncing invoice:', error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to sync invoice',
        life: 5000
      });
    }
  }
};

const cancelOpenSession = () => {
  showOpenSessionDialog.value = false;
  openingCash.value = 0;
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    attachmentFile.value = file;
  }
};

const cancelCloseSession = () => {
  showCloseSessionDialog.value = false;
  resetCloseSessionForm();
};
</script>

<style scoped>
.session-management-bar {
  position: relative;
}

.session-bar-container {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.session-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  transition: all 0.3s;
}

.session-active {
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.session-inactive {
  background-color: #ef4444;
}

.session-action-btn {
  border-radius: 0.5rem;
  transition: all 0.2s;
  position: relative;
}

.session-action-btn:hover {
  background-color: #f3f4f6;
}

.draft-count {
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  position: absolute;
  top: -0.1rem;
  right: -0.1rem;
}

.session-btn {
  border-radius: 0.5rem;
  transition: all 0.2s;
}

/* Dialog Styles */
.dialog-overlay {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.session-dialog {
  border-radius: 0.75rem;
  width: 100%;
  max-width: 50rem;
  max-height: 90vh;
  overflow-y: auto;
}

.draft-dialog {
  border-radius: 0.75rem;
  width: 100%;
  max-width: 36rem;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-close-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.dialog-close-btn:hover {
  background-color: #f3f4f6;
}

.cash-symbol {
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 10;
}

.cash-input {
  padding-left: 2rem;
}

.session-close-content {
  max-height: 70vh;
  overflow-y: auto;
}

.session-close-content .grid {
  margin-bottom: 0;
}

.session-close-content .col-12,
.session-close-content .col-6 {
  padding: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .session-dialog {
    max-width: 95vw;
    margin: 1rem;
  }

  .session-close-content {
    padding: 1rem !important;
  }
}

@media (min-width: 1200px) {
  .session-dialog {
    max-width: 60rem;
  }
}

.draft-list {
  gap: 0.75rem;
  max-height: 60vh;
  overflow-y: auto;
}

.draft-item {
  transition: all 0.2s;
}

.draft-item:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.delete-draft-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.delete-draft-btn:hover {
  background-color: #fef2f2;
}

.publish-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.publish-btn:hover {
  background-color: #f0fdf4;
}

.edit-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.edit-btn:hover {
  background-color: #eff6ff;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sync-btn {
  border-radius: 50%;
  transition: all 0.2s;
}

.sync-btn:hover {
  background-color: #fff7ed;
}
</style>