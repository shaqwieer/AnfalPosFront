<script setup>
import Dialog from 'primevue/dialog';
</script>
<template>
  <Dialog appendTo="div>div>div">
    <template #header>
      <slot name="header"></slot>
    </template>
    <slot></slot>
  </Dialog>
</template>
