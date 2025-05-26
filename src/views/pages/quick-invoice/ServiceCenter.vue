<script setup lang="ts">
import { TerminalBar } from '@/components/shared';
import { ServiceMenu, NewOrderDetails } from '@/views/pages/quick-invoice/components';
import  SessionManagementBar  from '@/views/pages/quick-invoice/components/SessionManagementBar.vue';
</script>

<template>
  <div class="flex flex-column gap-4" style="height: calc(100vh - 130px)">
    <SessionManagementBar />

    <div class="flex-1 flex overflow-hidden">
      <ServiceMenu class="flex-1" />
      <NewOrderDetails class="new-order-details" style="border-color: var(--sap-border)" />
    </div>
    <TerminalBar />
  </div>
</template>

<style scoped>
.new-order-details {
  width: 400px;
  border-left: 1px solid;
}
</style>
