import type { Promotion } from '@/types/promotions'

export const samplePromotions: Promotion[] = [
  {
    id: 'PROMO-016',
    name: 'Buy 4 Get 2 Free Tire Rotation',
    description: 'Purchase any 4 tire rotations and get 2 additional rotations completely free.',
    type: 'buy_x_get_y',
    status: 'active',
    startDate: '2025-03-01T00:00:00Z',
    endDate: '2025-04-30T23:59:59Z',
    priority: 1,
    rules: [{
      conditions: [
        {
          type: 'product',
          operator: '=',
          value: 'TRS-001'
        },
        {
          type: 'quantity',
          operator: '>=',
          value: 4
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      buyXGetY: {
        buyQuantity: 4,
        getFreeQuantity: 2,
        fromSameProduct: true,
        eligibleProducts: ['TRS-001']
      }
    },
    promoCode: {
      code: 'TIRE4GET2',
      usageLimit: 1000,
      usedCount: 0,
      perCustomerLimit: 1
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  // Previous promotions...
  {
    id: 'PROMO-015',
    name: 'Buy 5 Get 2 Free',
    description: 'Purchase any 5 tires and get 2 additional tires of the same type completely free.',
    type: 'buy_x_get_y',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    priority: 15,
    rules: [{
      conditions: [
        {
          type: 'category',
          operator: '=',
          value: 'tires'
        },
        {
          type: 'quantity',
          operator: '>=',
          value: 5
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      buyXGetY: {
        buyQuantity: 5,
        getFreeQuantity: 2,
        fromSameProduct: true,
        eligibleCategories: ['tires']
      }
    },
    promoCode: {
      code: 'TIRE5GET2',
      usageLimit: 500,
      usedCount: 0,
      perCustomerLimit: 1
    },
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-001',
    name: 'Buy 3 Tires Get 1 Free',
    description: 'Purchase any 3 tires and get the 4th tire completely free. Perfect for a full set replacement.',
    type: 'buy_x_get_y',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-04-30T23:59:59Z',
    priority: 1,
    rules: [{
      conditions: [
        {
          type: 'category',
          operator: '=',
          value: 'tires'
        },
        {
          type: 'quantity',
          operator: '>=',
          value: 3
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      buyXGetY: {
        buyQuantity: 3,
        getFreeQuantity: 1,
        fromSameProduct: true,
        eligibleCategories: ['tires']
      }
    },
    promoCode: {
      code: 'TIRE4FREE',
      usageLimit: 1000,
      usedCount: 234,
      perCustomerLimit: 1
    },
    createdAt: '2024-02-28T10:00:00Z',
    updatedAt: '2024-02-28T10:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-002',
    name: 'Buy 2 Get Cheapest 50% Off',
    description: 'Buy any 2 services and get 50% off on the cheapest one.',
    type: 'buy_n_get_m_cheapest',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-04-30T23:59:59Z',
    priority: 2,
    rules: [{
      conditions: [
        {
          type: 'category',
          operator: 'in',
          value: ['services', 'maintenance']
        },
        {
          type: 'quantity',
          operator: '>=',
          value: 2
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      tieredDiscount: {
        tiers: [{
          minQuantity: 2,
          discountValue: 50,
          isPercentage: true
        }]
      }
    },
    createdAt: '2024-02-28T10:00:00Z',
    updatedAt: '2024-02-28T10:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-003',
    name: 'Bulk Service Discount',
    description: 'Progressive discounts based on the number of services booked.',
    type: 'tiered_discount',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    priority: 3,
    rules: [{
      conditions: [
        {
          type: 'category',
          operator: '=',
          value: 'services'
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      tieredDiscount: {
        tiers: [
          {
            minQuantity: 2,
            discountValue: 10,
            isPercentage: true
          },
          {
            minQuantity: 3,
            discountValue: 15,
            isPercentage: true
          },
          {
            minQuantity: 4,
            discountValue: 20,
            isPercentage: true
          }
        ]
      }
    },
    createdAt: '2024-02-28T11:00:00Z',
    updatedAt: '2024-02-28T11:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-004',
    name: 'Bulk Tire Purchase',
    description: 'Special pricing when buying tires in bulk quantities.',
    type: 'bulk_pricing',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    priority: 4,
    rules: [{
      conditions: [
        {
          type: 'category',
          operator: '=',
          value: 'tires'
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      tieredDiscount: {
        tiers: [
          {
            minQuantity: 4,
            discountValue: 15,
            isPercentage: true
          },
          {
            minQuantity: 8,
            discountValue: 20,
            isPercentage: true
          },
          {
            minQuantity: 12,
            discountValue: 25,
            isPercentage: true
          }
        ]
      }
    },
    createdAt: '2024-02-28T12:00:00Z',
    updatedAt: '2024-02-28T12:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-005',
    name: 'Oil Change with Filter',
    description: 'Get 30% off on oil filter when purchasing an oil change service.',
    type: 'cross_product',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    priority: 5,
    rules: [{
      conditions: [
        {
          type: 'product',
          operator: '=',
          value: 'OIL-CHANGE-001'
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      bundle: {
        requiredProducts: [
          { productId: 'OIL-CHANGE-001', quantity: 1 },
          { productId: 'OIL-FILTER-001', quantity: 1 }
        ],
        discountValue: 30,
        isPercentage: true
      }
    },
    createdAt: '2024-02-28T13:00:00Z',
    updatedAt: '2024-02-28T13:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-006',
    name: 'Complete Car Care Bundle',
    description: 'Save 25% when booking our complete car care package.',
    type: 'bundle',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    priority: 6,
    rules: [{
      conditions: [
        {
          type: 'quantity',
          operator: '>=',
          value: 1
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      bundle: {
        requiredProducts: [
          { productId: 'TIRE-ROT-001', quantity: 1 }, // Tire Rotation
          { productId: 'ALIGN-001', quantity: 1 },    // Wheel Alignment
          { productId: 'OIL-001', quantity: 1 },      // Oil Change
          { productId: 'BRAKE-001', quantity: 1 }     // Brake Check
        ],
        discountValue: 25,
        isPercentage: true
      }
    },
    createdAt: '2024-02-28T14:00:00Z',
    updatedAt: '2024-02-28T14:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-007',
    name: 'Service Loyalty Cashback',
    description: 'Earn 10% cashback on all services, redeemable on your next visit.',
    type: 'loyalty_cashback',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    priority: 7,
    rules: [{
      conditions: [
        {
          type: 'category',
          operator: '=',
          value: 'services'
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      loyaltyCashback: {
        minPurchaseAmount: 100,
        cashbackValue: 10,
        isPercentage: true,
        expiryDays: 90
      }
    },
    createdAt: '2024-02-28T15:00:00Z',
    updatedAt: '2024-02-28T15:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-008',
    name: 'Early Bird Special',
    description: '20% off on all services booked before 10 AM.',
    type: 'time_based',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    priority: 8,
    rules: [{
      conditions: [
        {
          type: 'time',
          operator: '<',
          value: '10:00'
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      tieredDiscount: {
        tiers: [{
          minQuantity: 1,
          discountValue: 20,
          isPercentage: true
        }]
      }
    },
    createdAt: '2024-02-28T16:00:00Z',
    updatedAt: '2024-02-28T16:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-009',
    name: 'Fleet Customer Discount',
    description: 'Special 15% discount for registered fleet customers.',
    type: 'customer_specific',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    priority: 9,
    rules: [{
      conditions: [
        {
          type: 'customer_segment',
          operator: '=',
          value: 'fleet'
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      customerSpecific: {
        customerSegments: ['fleet'],
        discountValue: 15,
        isPercentage: true
      }
    },
    createdAt: '2024-02-28T17:00:00Z',
    updatedAt: '2024-02-28T17:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-010',
    name: 'Free Shipping Over 1000 SAR',
    description: 'Free shipping on orders over 1000 SAR within city limits.',
    type: 'shipping',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    priority: 10,
    rules: [{
      conditions: [
        {
          type: 'invoice_total',
          operator: '>=',
          value: 1000
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      tieredDiscount: {
        tiers: [{
          minQuantity: 1,
          discountValue: 100,
          isPercentage: false
        }]
      }
    },
    createdAt: '2024-02-28T18:00:00Z',
    updatedAt: '2024-02-28T18:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-011',
    name: 'High Value Service Discount',
    description: '10% off on invoices over 2000 SAR.',
    type: 'invoice_discount',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    priority: 11,
    rules: [{
      conditions: [
        {
          type: 'invoice_total',
          operator: '>=',
          value: 2000
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      tieredDiscount: {
        tiers: [{
          minQuantity: 1,
          discountValue: 10,
          isPercentage: true
        }]
      }
    },
    createdAt: '2024-02-28T19:00:00Z',
    updatedAt: '2024-02-28T19:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-012',
    name: 'Mada Payment Discount',
    description: '5% off when paying with Mada card.',
    type: 'payment_method',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    priority: 12,
    rules: [{
      conditions: [
        {
          type: 'payment_method',
          operator: '=',
          value: 'mada'
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      paymentMethod: {
        eligibleMethods: ['mada'],
        discountValue: 5,
        isPercentage: true,
        minTransactionAmount: 0
      }
    },
    createdAt: '2024-02-28T20:00:00Z',
    updatedAt: '2024-02-28T20:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-013',
    name: 'Early Payment Reward',
    description: '3% discount for payments made within 7 days of service.',
    type: 'early_payment',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    priority: 13,
    rules: [{
      conditions: [
        {
          type: 'payment_time',
          operator: '<=',
          value: 7
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      paymentMethod: {
        eligibleMethods: ['all'],
        discountValue: 3,
        isPercentage: true,
        minTransactionAmount: 0
      }
    },
    createdAt: '2024-02-28T21:00:00Z',
    updatedAt: '2024-02-28T21:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 'PROMO-014',
    name: 'Service Rewards Program',
    description: 'Earn 1 point for every 10 SAR spent on services.',
    type: 'reward_points',
    status: 'active',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    priority: 14,
    rules: [{
      conditions: [
        {
          type: 'category',
          operator: '=',
          value: 'services'
        }
      ],
      operator: 'AND'
    }],
    configuration: {
      rewardPoints: {
        pointsPerUnit: 1,
        unitAmount: 10,
        conversionRate: 0.1, // 1 point = 0.1 SAR
        expiryDays: 365
      }
    },
    createdAt: '2024-02-28T22:00:00Z',
    updatedAt: '2024-02-28T22:00:00Z',
    createdBy: 'admin'
  }
]