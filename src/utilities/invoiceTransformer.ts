/**
 * Utility functions to transform invoice API data to order store format
 */

export interface InvoiceData {
  id: number;
  uniqueIdentifier: string;
  customerId: number;
  customerName: string;
  customerPhoneNumber: string;
  totalAmount: number;
  remainingAmount: number;
  discountTotal: number;
  taxTotal: number;
  finalAmount: number;
  items: Array<{
    id: number;
    price: number;
    quantity: number;
    sapDesc: string;
    sapItem: string;
  }>;
}

export interface TransformedOrderData {
  customer: {
    id: string;
    name: string;
    mobile: string;
    type: 'individual' | 'business';
  };
  items: Array<{
    id: string;
    service: {
      sku: string;
      name: string;
      price: number;
      unit: string;
      size: string;
      image: string;
      category: string;
      description: string;
      features: string[];
      specifications: Record<string, string>;
    };
    quantity: number;
    price: number;
    basePrice: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

/**
 * Transform API invoice data to order store format
 */
export const transformInvoiceToOrder = (invoice: InvoiceData): TransformedOrderData => {
  return {
    customer: {
      id: invoice.customerId.toString(),
      name: invoice.customerName,
      mobile: invoice.customerPhoneNumber,
      type: 'individual' as const
    },
    items: invoice.items.map((item) => ({
      id: crypto.randomUUID(),
      service: {
        sku: item.sapItem,
        name: item.sapDesc,
        price: item.price,
        unit: 'piece',
        size: '',
        image: '',
        category: '',
        description: item.sapDesc,
        features: [],
        specifications: {}
      },
      quantity: item.quantity,
      price: item.price,
      basePrice: item.price
    })),
    totals: {
      subtotal: invoice.totalAmount,
      tax: invoice.taxTotal,
      total: invoice.finalAmount
    }
  };
}; 