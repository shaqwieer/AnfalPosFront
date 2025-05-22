<script setup lang="ts">
const terminalInfo = {
  user: 'John Doe',
  terminal: 'POS-001',
  version: '1.0.0',
  connection: 'Connected to Sales Hub Server',
  cashJournal: {
    id: 'CJ-2024-001',
    openedAt: '08:30 AM',
    balance: 1500.00
  }
}
</script>

<template>
  <div class="terminal-bar text-white flex align-items-center px-4 text-sm">
    <!-- Mobile View (Stacked) -->
    <div class="lg:hidden w-full">
      <div class="flex align-items-center justify-content-between">
        <div class="flex align-items-center gap-2">
          <span class="status-dot"></span>
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
        Cash Journal: {{ terminalInfo.cashJournal.id }} (Opened: {{ terminalInfo.cashJournal.openedAt }} | Balance: ${{ terminalInfo.cashJournal.balance.toFixed(2) }})
      </div>
      <div class="flex align-items-center justify-content-end flex-1 gap-6">
        <div class="truncate">Version: {{ terminalInfo.version }}</div>
        <div class="flex align-items-center gap-2 connection-status">
          <span class="status-dot"></span>
          <span>{{ terminalInfo.connection }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-bar {
  background-color: #1f2937;
  height: 2rem;
  border-top: 1px solid #374151;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #10b981;
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