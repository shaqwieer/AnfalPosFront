import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVanStore = defineStore('van', () => {
  // Van Information
  const vanInfo = ref({
    id: 'VAN-001',
    driver: 'Mohammed Al-Saud',
    route: 'Route-North-01',
    startTime: '08:00',
    endTime: '17:00',
    status: 'active'
  })

  // Van Inventory
  const inventory = ref([
    {
      productId: 'EO-001',
      quantity: 48,
      batchNumber: 'BATCH-001',
      expiryDate: '2025-12-31'
    },
    {
      productId: 'EO-002',
      quantity: 36,
      batchNumber: 'BATCH-002',
      expiryDate: '2025-12-31'
    },
    {
      productId: 'GO-001',
      quantity: 24,
      batchNumber: 'BATCH-003',
      expiryDate: '2025-12-31'
    }
  ])

  // Check if product is available in van inventory
  const isProductAvailable = (productId, requestedQty = 1) => {
    const item = inventory.value.find(i => i.productId === productId)
    return item ? item.quantity >= requestedQty : false
  }
  

  // Update inventory quantity
  const updateInventory = (productId, quantity) => {
    const item = inventory.value.find(i => i.productId === productId)
    if (item) {
      item.quantity += quantity
    }
  }

  // Get current stock level for a product
  const getStockLevel = (productId) => {
    const item = inventory.value.find(i => i.productId === productId)
    return item?.quantity || 0
  }

  // Low stock items
  const lowStockItems = computed(() => {
    return inventory.value.filter(item => item.quantity <= 10)
  })

  return {
    vanInfo,
    inventory,
    isProductAvailable,
    updateInventory,
    getStockLevel,
    lowStockItems
  }
})