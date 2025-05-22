<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div v-if="show" class="modal-overlay fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center z-5">
    <div class="modal-content bg-white border-round w-full flex flex-column">
      <!-- Dialog Header -->
      <div class="p-4 flex align-items-center justify-content-between modal-header">
        <h2 class="text-xl font-semibold m-0" style="color: var(--sap-text)">{{ title }}</h2>
        <button @click="$emit('close')" class="p-2 border-round close-button">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <!-- Dialog Content -->
      <div class="p-4 flex-1 modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  max-width: 672px; /* max-w-2xl equivalent */
  max-height: 90vh;
}

.modal-header {
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  overflow-y: auto;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
}

.close-button:hover {
  background-color: #f3f4f6;
}
</style>