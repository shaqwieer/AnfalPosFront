<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useTerminalStore } from '@/stores/terminalStore.js';

// Terminal store
const terminalStore = useTerminalStore();

// Static info
const staticInfo = {
  user: terminalStore.branchName || "Branch" , // This could come from auth store
  version: '1.0.0',
  connection: 'Connected to Sales Hub Server'
};

// Dynamic info from API
const terminalInfo = computed(() => ({
  user: terminalStore.branchName,
  terminal: terminalStore.branchName || 'POS Terminal',
  version: staticInfo.version,
  connection: staticInfo.connection,
  cashJournal: {
    id: terminalStore.cashJournal || 'N/A',
    openedAt: terminalStore.getFormattedSessionDate || 'Not opened',
    balance: terminalStore.currentCash || 0
  },
  isSessionOpen: terminalStore.isSessionOpened
}));

// Initialize terminal data
onMounted(async () => {
  await terminalStore.initializeTerminal();
});

// Cleanup
onUnmounted(() => {
  terminalStore.cleanup();
});
</script>
 
<template>
  <div class="terminal-bar text-white flex align-items-center px-4 text-sm">
    <!-- Mobile View (Stacked) -->
    <div class="lg:hidden w-full">
      <div class="flex align-items-center justify-content-between">
        <div class="flex align-items-center gap-2">
          <span class="status-dot" :class="{ 'session-active': terminalInfo.isSessionOpen, 'session-inactive': !terminalInfo.isSessionOpen }"></span>
          <span class="truncate">{{ terminalInfo.terminal }}</span>
        </div>
        <div class="flex align-items-center gap-4">
          <span class="text-xs">CJ: {{ terminalInfo.cashJournal.id }}</span>
          <span class="text-xs">v{{ terminalInfo.version }}</span>
        </div>
      </div>
    </div>

    <!-- Desktop View (Full) -->
    <div class="hidden lg:flex w-full align-items-center">
      <div class="flex-1 truncate">User: {{ terminalInfo.user }}</div>
      <div class="flex-1 text-center truncate">
        Cash Journal: {{ terminalInfo.cashJournal.id }}
        <span v-if="terminalInfo.isSessionOpen">
          (Opened: {{ terminalInfo.cashJournal.openedAt }} | Balance: ${{ terminalInfo.cashJournal.balance.toFixed(2) }})
        </span>
        <span v-else class="text-red-400">(Session Closed)</span>
      </div>
      <div class="flex align-items-center justify-content-end flex-1 gap-6">
        <div class="truncate">Version: {{ terminalInfo.version }}</div>
        <div class="flex align-items-center gap-2 connection-status">
          <span class="status-dot" :class="{ 'session-active': terminalInfo.isSessionOpen, 'session-inactive': !terminalInfo.isSessionOpen }"></span>
          <span>{{ terminalInfo.connection }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-bar {
  background-color: #1f2937;
  height: 2.5rem;
  border-top: 1px solid #374151;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
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

.connection-status {
  white-space: nowrap;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-xs {
  font-size: 0.75rem;
}
</style>