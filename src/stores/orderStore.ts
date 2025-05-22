import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Service {
  sku: string
  name: string
  unit: string
  size: string
  price: number
  image: string
  category: string
  description: string
  features: string[]
  specifications: Record<string, string>
}

interface Discount {
  type: string
  value: number
  isPercentage: boolean
}

interface OrderItem {
  id: string
  service: Service
  quantity: number
  price: number
  basePrice: number
  discount?: Discount
  selectedBatch?: {
    id: string
    batchNumber: string
    quantity: number
    manufactureDate: string
    expiryDate: string
  }
}

interface Customer {
  id: string
  name: string
  type: 'individual' | 'business'
  mobile: string
  vehicles: Array<{
    plateNo: string
    make: string
    model: string
    year: string
    vin: string
    notes?: string
  }>
  businessDetails?: {
    cr: string
    vat: string
  }
}

interface Order {
  id: string
  customer: Customer | null
  items: OrderItem[]
  status: 'draft' | 'pending' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  total: number
  tax: number
  subtotal: number
}

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref<Order>({
    id: crypto.randomUUID(),
    customer: null,
    items: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    total: 0,
    tax: 0,
    subtotal: 0
  })

  const orders = ref<Order[]>([])

  const calculateItemTotal = (item: OrderItem): number => {
    const baseTotal = item.price * item.quantity

    if (!item.discount) {
      return baseTotal
    }

    const discountAmount = item.discount.isPercentage
      ? baseTotal * (item.discount.value / 100)
      : item.discount.value

    return Math.max(0, baseTotal - discountAmount)
  }

  const subtotal = computed(() => {
    return currentOrder.value.items.reduce((sum, item) => {
      return sum + calculateItemTotal(item)
    }, 0)
  })

  const tax = computed(() => subtotal.value * 0.15) // 15% tax
  const total = computed(() => subtotal.value + tax.value)

  function addItem(product: any) {
    const existingItem = currentOrder.value.items.find(item => 
      item.service.sku === product.sku && 
      (!item.selectedBatch || !product.selectedBatch || item.selectedBatch.id === product.selectedBatch.id)
    )

    if (existingItem) {
      // Update quantity instead of incrementing
      existingItem.quantity = product.quantity || (existingItem.quantity + 1)
    } else {
      currentOrder.value.items.push({
        id: crypto.randomUUID(),
        service: {
          sku: product.sku,
          name: product.name,
          unit: product.unit,
          size: product.size,
          price: product.price,
          image: product.image,
          category: product.category,
          description: product.description,
          features: product.features,
          specifications: product.specifications
        },
        quantity: product.quantity || 1,
        price: product.price,
        basePrice: product.basePrice || product.price,
        discount: product.discount,
        selectedBatch: product.selectedBatch
      })
    }

    updateOrderTotals()
  }

  function removeItem(itemId: string) {
    currentOrder.value.items = currentOrder.value.items.filter(item => item.id !== itemId)
    updateOrderTotals()
  }

  function updateQuantity(itemId: string, quantity: number) {
    const item = currentOrder.value.items.find(item => item.id === itemId)
    if (item) {
      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) {
        removeItem(itemId)
      }
    }
    updateOrderTotals()
  }

  function setItemDiscount(itemId: string, discount?: Discount) {
    const item = currentOrder.value.items.find(item => item.id === itemId)
    if (item) {
      item.discount = discount
      updateOrderTotals()
    }
  }

  function setCustomer(customer: Customer) {
    currentOrder.value.customer = customer
  }

  function updateOrderTotals() {
    currentOrder.value.subtotal = subtotal.value
    currentOrder.value.tax = tax.value
    currentOrder.value.total = total.value
    currentOrder.value.updatedAt = new Date().toISOString()
  }

  function finalizeOrder() {
    if (!currentOrder.value.customer || currentOrder.value.items.length === 0) {
      throw new Error('Cannot finalize order without customer or items')
    }

    currentOrder.value.status = 'pending'
    orders.value.push({ ...currentOrder.value })

    // Reset current order
    currentOrder.value = {
      id: crypto.randomUUID(),
      customer: null,
      items: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      total: 0,
      tax: 0,
      subtotal: 0
    }
  }

  return {
    currentOrder,
    orders,
    subtotal,
    tax,
    total,
    addItem,
    removeItem,
    updateQuantity,
    setItemDiscount,
    setCustomer,
    finalizeOrder,
    calculateItemTotal
  }
})