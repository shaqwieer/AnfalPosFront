import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Promotion, PromotionRule, PromotionCondition } from '@/types/promotions'
import { samplePromotions } from './sampleData'

export const usePromoStore = defineStore('promo', () => {
  const promotions = ref<Promotion[]>(samplePromotions)
  const selectedPromotion = ref<Promotion | null>(null)

  const activePromotions = computed(() => {
    const now = new Date()
    return promotions.value.filter(promo => {
      const startDate = new Date(promo.startDate)
      const endDate = new Date(promo.endDate)
      return promo.status === 'active' && startDate <= now && endDate >= now
    })
  })

  function evaluateCondition(condition: PromotionCondition, context: any): boolean {
    switch (condition.operator) {
      case '=':
        if (condition.type === 'product') {
          return context.items?.some((item: any) => item.service.sku === condition.value)
        }
        return context[condition.type] === condition.value

      case '>=':
        if (condition.type === 'quantity') {
          const matchingItems = context.items?.filter((item: any) => 
            item.service.sku === condition.value
          )
          if (!matchingItems?.length) return false
          
          const totalQuantity = matchingItems.reduce((sum: number, item: any) => 
            sum + item.quantity, 0
          )
          return totalQuantity >= condition.value
        }
        return context[condition.type] >= condition.value

      case '!=':
        return context[condition.type] !== condition.value
      case '>':
        return context[condition.type] > condition.value
      case '<':
        return context[condition.type] < condition.value
      case '<=':
        return context[condition.type] <= condition.value
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(context[condition.type])
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(context[condition.type])
      case 'between':
        return Array.isArray(condition.value) && 
               context[condition.type] >= condition.value[0] && 
               context[condition.type] <= condition.value[1]
      default:
        return false
    }
  }

  function evaluateRule(rule: PromotionRule, context: any): boolean {
    const conditionResults = rule.conditions.map(condition => 
      evaluateCondition(condition, context)
    )

    return rule.operator === 'AND' 
      ? conditionResults.every(result => result)
      : conditionResults.some(result => result)
  }

  function isPromotionApplicable(promotion: Promotion, context: any): boolean {
    const now = new Date()
    const startDate = new Date(promotion.startDate)
    const endDate = new Date(promotion.endDate)

    if (promotion.status !== 'active' || now < startDate || now > endDate) {
      return false
    }

    if (promotion.promoCode) {
      if (promotion.promoCode.usageLimit && 
          promotion.promoCode.usedCount >= promotion.promoCode.usageLimit) {
        return false
      }
      
      if (!context.promoCode || context.promoCode !== promotion.promoCode.code) {
        return false
      }
    }

    return evaluateRule(promotion.rules[0], context)
  }

  function calculateDiscount(promotion: Promotion, context: any): number {
    if (!isPromotionApplicable(promotion, context)) {
      return 0
    }

    switch (promotion.type) {
      case 'buy_x_get_y': {
        const config = promotion.configuration.buyXGetY
        if (!config) return 0

        const matchingItems = context.items?.filter((item: any) => {
          if (config.eligibleProducts) {
            return config.eligibleProducts.includes(item.service.sku)
          }
          if (config.eligibleCategories) {
            return config.eligibleCategories.includes(item.service.category)
          }
          return true
        })

        if (!matchingItems?.length) return 0

        const totalQuantity = matchingItems.reduce((sum: number, item: any) => 
          sum + item.quantity, 0
        )

        const sets = Math.floor(totalQuantity / config.buyQuantity)
        if (sets === 0) return 0

        const itemPrice = matchingItems[0].price
        return itemPrice * config.getFreeQuantity * sets
      }

      case 'tiered_discount': {
        const config = promotion.configuration.tieredDiscount
        if (!config) return 0

        const quantity = context.quantity || 0
        const baseAmount = (context.price || 0) * quantity

        const applicableTier = [...config.tiers]
          .sort((a, b) => b.minQuantity - a.minQuantity)
          .find(tier => quantity >= tier.minQuantity)

        if (!applicableTier) return 0

        return applicableTier.isPercentage
          ? (baseAmount * applicableTier.discountValue) / 100
          : applicableTier.discountValue
      }

      default:
        return 0
    }
  }

  function addPromotion(promotion: Promotion) {
    promotions.value.push({
      ...promotion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  function updatePromotion(id: string, updates: Partial<Promotion>) {
    const index = promotions.value.findIndex(p => p.id === id)
    if (index !== -1) {
      promotions.value[index] = {
        ...promotions.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }
  }

  function deletePromotion(id: string) {
    promotions.value = promotions.value.filter(p => p.id !== id)
  }

  function validatePromoCode(code: string): boolean {
    const promotion = promotions.value.find(p => p.promoCode?.code === code)
    if (!promotion) return false

    const { promoCode } = promotion
    if (!promoCode) return false

    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return false
    }

    return true
  }

  return {
    promotions,
    selectedPromotion,
    activePromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    isPromotionApplicable,
    calculateDiscount,
    validatePromoCode
  }
})