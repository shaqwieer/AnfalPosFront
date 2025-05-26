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
        </div>

        <!-- Right Side: Action Buttons -->
        <div class="flex align-items-center gap-2">
          <!-- Draft Invoices -->
          <Button outlined severity="info" class="session-action-btn w-10rem  border-1 border-300" @click="showDraftInvoices = true" v-tooltip.bottom="'Draft Invoices'">
            <div class="flex align-items-center text-center gap-1">
              <!-- <span class="material-icons text-blue-600 text-sm">draft</span> -->
              <span class="w-full ">Draft Invoices</span>
              <span v-if="draftInvoices.length > 0" class="draft-count">{{ draftInvoices.length }}</span>
            </div>
          </Button>

          <!-- Session Actions -->
          <Button v-if="!isSessionOpen" severity="success" @click="showOpenSessionDialog = true" class="session-btn w-12rem ">
            <div class="flex align-items-center gap-2">
              <span class="material-icons text-sm">play_arrow</span>
              <span>Open Session</span>
            </div>
          </Button>

          <Button v-else severity="warning" size="small" @click="showCloseSessionDialog = true" class="session-btn">
            <div class="flex align-items-center gap-2">
              <span class="material-icons text-sm">stop</span>
              <span>Close Session</span>
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

        <div class="p-6">
          <!-- Session Summary -->
          <div class="bg-gray-50 p-4 border-round mb-4">
            <h4 class="font-medium mb-3">Session Summary</h4>
            <div class="grid grid-nogutter gap-3">
              <div class="col-6">
                <div class="text-sm text-gray-600">Started</div>
                <div class="font-medium">{{ formatTime(sessionStartTime!) }}</div>
              </div>
              <div class="col-6">
                <div class="text-sm text-gray-600">Duration</div>
                <div class="font-medium">{{ sessionDuration }}</div>
              </div>
              <div class="col-6">
                <div class="text-sm text-gray-600">Opening Cash</div>
                <div class="font-medium">${{ formatPrice(openingCash) }}</div>
              </div>
            </div>
          </div>

          <!-- Closing Cash -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Closing Cash Amount</label>
            <div class="relative">
              <span class="absolute cash-symbol">$</span>
              <InputNumber v-model="closingCash" mode="currency" currency="USD" class="w-full cash-input" placeholder="0.00" :min="0" :step="0.01" />
            </div>
            <small class="text-gray-500">Count the cash in the register and enter the total amount</small>
          </div>

          <!-- Cash Difference -->
          <div v-if="closingCash > 0" class="bg-blue-50 p-3 border-round mb-4">
            <div class="flex justify-content-between align-items-center">
              <span class="font-medium">Cash Difference:</span>
              <span
                class="font-bold text-lg"
                :class="{
                  'text-green-600': closingCash >= openingCash,
                  'text-red-600': closingCash < openingCash
                }"
              >
                {{ closingCash >= openingCash ? '+' : '' }}${{ formatPrice(closingCash - openingCash) }}
              </span>
            </div>
          </div>

          <div class="flex gap-3 justify-content-end">
            <Button outlined @click="cancelCloseSession" class="px-4 py-2"> Cancel </Button>
            <Button @click="closeSession" severity="warning" class="px-4 py-2"> Close Session </Button>
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
          <div v-if="draftInvoices.length === 0" class="text-center py-8">
            <span class="material-icons text-4xl text-gray-400 mb-2">draft</span>
            <p class="text-gray-500">No draft invoices found</p>
          </div>

          <div v-else class="draft-list">
            <div v-for="draft in draftInvoices" :key="draft.id" class="draft-item p-4 border-1 border-gray-200 border-round cursor-pointer" @click="loadDraftInvoice(draft)">
              <div class="flex align-items-start justify-content-between">
                <div class="flex-1">
                  <div class="flex align-items-center gap-2 mb-2">
                    <span class="font-medium text-blue-600">{{ draft.id }}</span>
                    <span class="text-sm text-gray-500">{{ formatTime(draft.createdAt) }}</span>
                  </div>

                  <div class="flex align-items-center gap-4 mb-2">
                    <div class="flex align-items-center gap-1">
                      <span class="material-icons text-sm text-gray-400">person</span>
                      <span class="text-sm">{{ draft.customer }}</span>
                    </div>
                    <div class="flex align-items-center gap-1">
                      <span class="material-icons text-sm text-gray-400">shopping_cart</span>
                      <span class="text-sm">{{ draft.items }} items</span>
                    </div>
                  </div>

                  <div class="font-bold text-lg" style="color: var(--sap-primary)">${{ formatPrice(draft.total) }}</div>
                </div>

                <Button text severity="danger" class="p-2 delete-draft-btn" @click="deleteDraftInvoice(draft.id, $event)" v-tooltip.left="'Delete Draft'">
                  <span class="material-icons text-red-500">delete</span>
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

// Session management
const isSessionOpen = ref(false);
const sessionStartTime = ref<Date | null>(null);
const openingCash = ref(0);
const closingCash = ref(0);
const showOpenSessionDialog = ref(false);
const showCloseSessionDialog = ref(false);

// Timer management
const currentTime = ref(new Date());
let timerInterval: NodeJS.Timeout | null = null;

// Draft invoices
const showDraftInvoices = ref(false);
const draftInvoices = ref([
  {
    id: 'DRAFT-001',
    customer: 'John Doe',
    items: 3,
    total: 125.5,
    createdAt: new Date('2025-05-24T10:30:00')
  },
  {
    id: 'DRAFT-002',
    customer: 'Select Customer',
    items: 1,
    total: 45.0,
    createdAt: new Date('2025-05-24T11:15:00')
  },
  {
    id: 'DRAFT-003',
    customer: 'Sarah Smith',
    items: 5,
    total: 280.75,
    createdAt: new Date('2025-05-24T12:00:00')
  }
]);

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
onMounted(() => {
  startTimer();
});

// Clean up timer when component unmounts
onUnmounted(() => {
  stopTimer();
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

const openSession = () => {
  if (openingCash.value < 0) {
    alert('Opening cash amount cannot be negative');
    return;
  }

  isSessionOpen.value = true;
  sessionStartTime.value = new Date();
  showOpenSessionDialog.value = false;

  // Here you would typically save to your store/backend
  console.log('Session opened with:', openingCash.value);
};

const closeSession = () => {
  if (closingCash.value < 0) {
    alert('Closing cash amount cannot be negative');
    return;
  }

  const difference = closingCash.value - openingCash.value;

  // Here you would typically save session data to your store/backend
  console.log('Session closed:', {
    openingCash: openingCash.value,
    closingCash: closingCash.value,
    difference,
    duration: sessionDuration.value
  });

  isSessionOpen.value = false;
  sessionStartTime.value = null;
  showCloseSessionDialog.value = false;

  // Reset values
  openingCash.value = 0;
  closingCash.value = 0;
};

const loadDraftInvoice = (draft: any) => {
  // Here you would load the draft into your order store
  console.log('Loading draft:', draft.id);
  showDraftInvoices.value = false;

  // Emit event to parent or use store to load draft
  // orderStore.loadDraft(draft);
};

const deleteDraftInvoice = (draftId: string, event: Event) => {
  event.stopPropagation();

  if (confirm('Are you sure you want to delete this draft invoice?')) {
    const index = draftInvoices.value.findIndex((d) => d.id === draftId);
    if (index > -1) {
      draftInvoices.value.splice(index, 1);
    }
  }
};

const cancelOpenSession = () => {
  showOpenSessionDialog.value = false;
  openingCash.value = 0;
};

const cancelCloseSession = () => {
  showCloseSessionDialog.value = false;
  closingCash.value = 0;
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
  max-width: 28rem;
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
</style>