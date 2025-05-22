export type PromotionType = 
  | 'buy_x_get_y'
  | 'buy_n_get_m_cheapest'
  | 'tiered_discount'
  | 'bulk_pricing'
  | 'cross_product'
  | 'bundle'
  | 'loyalty_cashback'
  | 'time_based'
  | 'customer_specific'
  | 'shipping'
  | 'invoice_discount'
  | 'payment_method'
  | 'early_payment'
  | 'reward_points'

export type ConditionOperator = 'AND' | 'OR'

export interface PromotionCondition {
  type: 'product' | 'category' | 'invoice_total' | 'customer_segment' | 'quantity' | 'payment_method' | 'time' | 'custom'
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in' | 'between'
  value: any
  additionalData?: Record<string, any>
}

export interface PromotionRule {
  conditions: PromotionCondition[]
  operator: ConditionOperator
  subRules?: PromotionRule[]
}

export interface BuyXGetYConfig {
  buyQuantity: number
  getFreeQuantity: number
  fromSameProduct: boolean
  eligibleProducts?: string[]
  eligibleCategories?: string[]
}

export interface TieredDiscountConfig {
  tiers: {
    minQuantity: number
    discountValue: number
    isPercentage: boolean
  }[]
}

export interface BundleConfig {
  requiredProducts: {
    productId: string
    quantity: number
  }[]
  discountValue: number
  isPercentage: boolean
}

export interface LoyaltyCashbackConfig {
  minPurchaseAmount: number
  cashbackValue: number
  isPercentage: boolean
  expiryDays: number
}

export interface CustomerSpecificConfig {
  customerSegments: string[]
  discountValue: number
  isPercentage: boolean
}

export interface PaymentMethodConfig {
  eligibleMethods: string[]
  discountValue: number
  isPercentage: boolean
  minTransactionAmount?: number
}

export interface RewardPointsConfig {
  pointsPerUnit: number
  unitAmount: number
  conversionRate: number
  expiryDays: number
}

export interface PromoCode {
  code: string
  usageLimit?: number
  usedCount: number
  perCustomerLimit?: number
}

export interface Promotion {
  id: string
  name: string
  description: string
  type: PromotionType
  status: 'active' | 'scheduled' | 'expired' | 'draft'
  startDate: string
  endDate: string
  priority: number
  rules: PromotionRule[]
  configuration: {
    buyXGetY?: BuyXGetYConfig
    tieredDiscount?: TieredDiscountConfig
    bundle?: BundleConfig
    loyaltyCashback?: LoyaltyCashbackConfig
    customerSpecific?: CustomerSpecificConfig
    paymentMethod?: PaymentMethodConfig
    rewardPoints?: RewardPointsConfig
  }
  promoCode?: PromoCode
  createdAt: string
  updatedAt: string
  createdBy: string
  metadata?: Record<string, any>
}