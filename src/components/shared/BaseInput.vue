<script setup lang="ts">
defineProps<{
  modelValue: string
  type?: string
  placeholder?: string
  required?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <input
    :value="modelValue"
    :type="type || 'text'"
    :required="required"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="sap-input w-full"
    :placeholder="placeholder"
  >
</template>