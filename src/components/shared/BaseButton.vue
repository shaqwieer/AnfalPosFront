<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :type="type || 'button'"
    class="px-4 py-2 border-round transition-colors flex align-items-center justify-content-center custom-button"
    :class="{
      'primary-button': variant === 'primary',
      'secondary-button': variant === 'secondary',
      'danger-button': variant === 'danger',
      'loading-button': loading
    }"
    :disabled="loading"
  >
    <div class="flex align-items-center gap-2">
      <span v-if="loading" class="material-icons animate-spin">refresh</span>
      <slot />
    </div>
  </button>
</template>

<style scoped>
.custom-button {
  transition-duration: 200ms;
}

.primary-button {
  background-color: #2563eb;
  color: white;
}

.primary-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.secondary-button {
  border: 1px solid #d1d5db;
  background-color: transparent;
}

.secondary-button:hover:not(:disabled) {
  background-color: #f9fafb;
}

.danger-button {
  background-color: #dc2626;
  color: white;
}

.danger-button:hover:not(:disabled) {
  background-color: #b91c1c;
}

.loading-button {
  opacity: 0.5;
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>