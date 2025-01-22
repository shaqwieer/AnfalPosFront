<script setup lang="ts">
interface Props {
  onClose: () => void
  onDiscardOrder: () => void
  onHold: () => void
  onRemoveAllItems: () => void
  onInvoiceDetails: () => void
  onDeliveryOptions: () => void
}

defineProps<Props>()

interface ActionButtonProps {
  onClick: () => void
  icon: string
  label: string
  color: string
  hoverColor?: string
  textColor?: string
  borderColor?: string
}

const getButtonClasses = ({
  color,
  hoverColor,
  textColor = 'text-white',
  borderColor,
}: Partial<ActionButtonProps>) => {
  return [
    'flex flex-column align-items-center justify-content-center w-full border-round p-2 transition-colors transition-duration-150',
    'shadow-1 hover:shadow-2',
    color,
    hoverColor ? `hover:${hoverColor}` : '',
    textColor,
    borderColor ? `border-1 ${borderColor}` : ''
  ].filter(Boolean).join(' ')
}
</script>

<template>
  <div class="bg-white border-bottom-1 p-3">
    <div class="grid">
      <div class="col-4 sm:col-2 p-1">
        <button 
          :class="getButtonClasses({
            color: 'bg-red-600',
            hoverColor: 'bg-red-700'
          })"
          @click="onDiscardOrder"
        >
          <i class="pi pi-times mb-1 text-lg"></i>
          <span class="text-center text-xs font-medium">Discard </span>
        </button>
      </div>
      <div class="col-4 sm:col-2 p-1">
        <button 
          :class="getButtonClasses({
            color: 'bg-orange-600',
            hoverColor: 'bg-orange-700'
          })"
          @click="onHold"
        >
          <i class="pi pi-pause mb-1 text-lg"></i>
          <span class="text-center text-xs font-medium">Hold</span>
        </button>
      </div>
      <div class="col-4 sm:col-2 p-1">
        <button 
          :class="getButtonClasses({
            color: 'bg-white',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-700'
          })"
          @click="onRemoveAllItems"
        >
          <i class="pi pi-trash mb-1 text-lg"></i>
          <span class="text-center text-xs font-medium">Remove </span>
        </button>
      </div>
      <div class="col-4 sm:col-2 p-1">
        <button 
          :class="getButtonClasses({
            color: 'bg-blue-600',
            hoverColor: 'bg-blue-700'
          })"
          @click="onInvoiceDetails"
        >
          <i class="pi pi-file mb-1 text-lg"></i>
          <span class="text-center text-xs font-medium">Invoice</span>
        </button>
      </div>
      <div class="col-4 sm:col-2 p-1">
        <button 
          :class="getButtonClasses({
            color: 'bg-white',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-700'
          })"
          @click="onDeliveryOptions"
        >
          <i class="pi pi-truck mb-1 text-lg"></i>
          <span class="text-center text-xs font-medium">Delivery</span>
        </button>
      </div>
      <div class="col-4 sm:col-2 p-1">
        <button 
          :class="getButtonClasses({
            color: 'bg-white',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-700'
          })"
          @click="onClose"
        >
          <i class="pi pi-arrow-left mb-1 text-lg"></i>
          <span class="text-center text-xs font-medium">Back</span>
        </button>
      </div>
    </div>
  </div>
</template>