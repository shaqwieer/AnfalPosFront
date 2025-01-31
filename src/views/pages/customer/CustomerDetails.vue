<script setup lang="ts">
import { ref, computed } from 'vue'
import CustomerForm from './CustomerForm.vue'

const props = defineProps<{
  show: boolean
  customer: any
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show && customer">
    <CustomerForm
      :show="show"
      :customer="customer"
      :readOnly="true"
      @close="$emit('close')"
    />
  </div>
</template>