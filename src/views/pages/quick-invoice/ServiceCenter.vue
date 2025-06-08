<script setup lang="ts">
import { TerminalBar } from '@/components/shared';
import { ServiceMenu, NewOrderDetails } from '@/views/pages/quick-invoice/components';
import  SessionManagementBar  from '@/views/pages/quick-invoice/components/SessionManagementBar.vue';
</script>

<template>
  <div>
  <div class="flex flex-column" style="height: calc(100vh - 130px)">
    <SessionManagementBar />

    <div class="flex-1 flex overflow-hidden">
      <ServiceMenu class="flex-1" />
      <NewOrderDetails class="new-order-details" style="border-color: var(--sap-border)" />
    </div>

 
  </div>
  <div>
      <TerminalBar />
    </div>
  </div>
</template>

<style scoped>
.new-order-details {
  width: 400px;
  border-left: 1px solid;
}
</style>
