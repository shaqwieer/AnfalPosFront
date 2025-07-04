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
    // 🔍 CONSOLE LOG: Product being added to order store
    console.log('🏪 ORDER STORE - Adding item:', {
      productBeingAdded: product,
      productSku: product.sku,
      productName: product.name,
      productPrice: product.price,
      hasBatch: !!product.selectedBatch,
      batchInfo: product.selectedBatch || 'No batch selected'
    });

    const existingItem = currentOrder.value.items.find(item =>
      item.service.sku === product.sku &&
      (!item.selectedBatch || !product.selectedBatch || item.selectedBatch.id === product.selectedBatch.id)
    )

    if (existingItem) {
      // 📈 CONSOLE LOG: Updating existing item quantity
      console.log('📈 ORDER STORE - Updating existing item quantity:', {
        existingItem: existingItem,
        oldQuantity: existingItem.quantity,
        newQuantity: product.quantity || (existingItem.quantity + 1),
        itemSku: existingItem.service.sku
      });

      // Update quantity instead of incrementing
      existingItem.quantity = product.quantity || (existingItem.quantity + 1)
    } else {
      // ➕ CONSOLE LOG: Adding new item to cart
      const newItem = {
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
      };

      console.log('➕ ORDER STORE - Adding new item to cart:', {
        newItem: newItem,
        itemId: newItem.id,
        itemName: newItem.service.name,
        itemQuantity: newItem.quantity,
        itemPrice: newItem.price
      });

      currentOrder.value.items.push(newItem)
    }

    updateOrderTotals()

    // 📊 CONSOLE LOG: Updated order totals and complete items array
    console.log('📊 ORDER STORE - Updated order after item addition:', {
      completeItemsArray: currentOrder.value.items,
      totalItemsCount: currentOrder.value.items.length,
      orderSubtotal: currentOrder.value.subtotal,
      orderTax: currentOrder.value.tax,
      orderTotal: currentOrder.value.total,
      currentCustomer: currentOrder.value.customer,
      orderStatus: currentOrder.value.status
    });
  }

  function removeItem(itemId: string) {
    // 🗑️ CONSOLE LOG: Removing item from cart
    const itemToRemove = currentOrder.value.items.find(item => item.id === itemId);
    console.log('🗑️ ORDER STORE - Removing item from cart:', {
      itemToRemove: itemToRemove,
      itemId: itemId,
      itemName: itemToRemove?.service.name || 'Unknown item',
      itemQuantity: itemToRemove?.quantity || 0,
      itemsBeforeRemoval: currentOrder.value.items.length,
      currentCustomer: currentOrder.value.customer?.name || 'No customer'
    });

    currentOrder.value.items = currentOrder.value.items.filter(item => item.id !== itemId)
    updateOrderTotals()

    // 📊 CONSOLE LOG: Items array after removal
    console.log('📊 ORDER STORE - Items array after item removal:', {
      itemsArray: currentOrder.value.items,
      itemsCount: currentOrder.value.items.length,
      orderTotal: currentOrder.value.total
    });
  }

  function updateQuantity(itemId: string, quantity: number) {
    const item = currentOrder.value.items.find(item => item.id === itemId)
    if (item) {
      // 🔢 CONSOLE LOG: Updating item quantity
      console.log('🔢 ORDER STORE - Updating item quantity:', {
        itemId: itemId,
        itemName: item.service.name,
        oldQuantity: item.quantity,
        newQuantity: Math.max(0, quantity),
        willBeRemoved: Math.max(0, quantity) === 0,
        currentCustomer: currentOrder.value.customer?.name || 'No customer'
      });

      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) {
        console.log('🗑️ ORDER STORE - Item quantity is 0, removing item:', {
          removedItem: item,
          itemName: item.service.name,
          itemId: itemId
        });
        removeItem(itemId)
      }
    }
    updateOrderTotals()

    // 📊 CONSOLE LOG: Updated items array after quantity change
    console.log('📊 ORDER STORE - Items array after quantity update:', {
      itemsArray: currentOrder.value.items,
      itemsCount: currentOrder.value.items.length,
      orderTotal: currentOrder.value.total
    });
  }

  function setItemDiscount(itemId: string, discount?: Discount) {
    const item = currentOrder.value.items.find(item => item.id === itemId)
    if (item) {
      item.discount = discount
      updateOrderTotals()
    }
  }

  function setCustomer(customer: Customer) {
    // 👤 CONSOLE LOG: Setting customer in order store
    console.log('👤 ORDER STORE - Setting customer:', {
      customerBeingSet: customer,
      customerId: customer.id,
      customerName: customer.name,
      customerType: customer.type,
      customerMobile: customer.mobile,
      customerVehicles: customer.vehicles,
      businessDetails: customer.businessDetails,
      previousCustomer: currentOrder.value.customer,
      orderItemsCount: currentOrder.value.items.length
    });

    currentOrder.value.customer = customer

    // 👤 CONSOLE LOG: Customer successfully set
    console.log('👤 ORDER STORE - Customer successfully assigned to order:', {
      orderWithCustomer: currentOrder.value,
      customerAssigned: !!currentOrder.value.customer,
      customerName: currentOrder.value.customer?.name
    });
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

  function loadInvoiceData(invoiceData: any) {
    console.log('🔄 ORDER STORE - Loading invoice data:', invoiceData);
    
    // Clear current order
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
    };

    // Set customer
    if (invoiceData.customer) {
      console.log('👤 ORDER STORE - Setting customer:', invoiceData.customer);
      setCustomer(invoiceData.customer);
    }

    // Add items
    console.log('📦 ORDER STORE - Adding items:', invoiceData.items);
    invoiceData.items.forEach((item: any) => {
      console.log('➕ ORDER STORE - Adding item:', item);
      // Extract the service data and pass it directly to addItem
      const productData = {
        sku: item.service.sku,
        name: item.service.name,
        unit: item.service.unit,
        size: item.service.size,
        price: item.service.price,
        image: item.service.image,
        category: item.service.category,
        description: item.service.description,
        features: item.service.features,
        specifications: item.service.specifications,
        quantity: item.quantity,
        basePrice: item.basePrice
      };
      addItem(productData);
    });

    // Set totals (override calculated totals)
    if (invoiceData.totals) {
      console.log('💰 ORDER STORE - Setting totals:', invoiceData.totals);
      currentOrder.value.subtotal = invoiceData.totals.subtotal;
      currentOrder.value.tax = invoiceData.totals.tax;
      currentOrder.value.total = invoiceData.totals.total;
    }
    
    console.log('✅ ORDER STORE - Final order state:', currentOrder.value);
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
    calculateItemTotal,
    loadInvoiceData
  }
})