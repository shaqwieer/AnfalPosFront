<script setup>
import { computed, ref, onMounted } from 'vue';
import { formatValue } from '../utils/formatters';

// Props
const props = defineProps({
  report: {
    type: Object,
    required: true
  },
  summary: {
    type: Object,
    default: () => ({})
  },
  formattedSummaryCards: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Reactive state
const animatedValues = ref({});
const showAnimation = ref(false);

// Computed
const hasSummaryData = computed(() => {
  return (props.summary && Object.keys(props.summary).length > 0) ||
         (props.formattedSummaryCards && props.formattedSummaryCards.length > 0);
});

const summaryCards = computed(() => {
  // Use formatted cards if available (from dynamic builder)
  if (props.formattedSummaryCards && props.formattedSummaryCards.length > 0) {
    return props.formattedSummaryCards;
  }
  
  // Fallback to manual card building
  if (!props.report?.summaryCards || !hasSummaryData.value) return [];
  
  return props.report.summaryCards.map(card => ({
    key: card.key,
    label: card.label,
    value: props.summary[card.key],
    formattedValue: formatValue(props.summary[card.key], card.format),
    format: card.format,
    color: card.color,
    icon: card.icon || getDefaultIcon(card.format),
    trend: card.trend || null,
    metadata: props.summary[`${card.key}_meta`] || {}
  }));
});

const gridColumns = computed(() => {
  const cardCount = summaryCards.value.length;
  if (cardCount <= 2) return 'repeat(auto-fit, minmax(220px, 1fr))';
  if (cardCount <= 4) return 'repeat(auto-fit, minmax(200px, 1fr))';
  return 'repeat(auto-fit, minmax(180px, 1fr))';
});

// Methods
const getCardIcon = (card) => {
  if (card.icon) return card.icon;
  return getDefaultIcon(card.format);
};

const getDefaultIcon = (format) => {
  switch (format) {
    case 'currency':
      return 'pi pi-dollar';
    case 'number':
      return 'pi pi-hashtag';
    case 'percentage':
      return 'pi pi-percentage';
    case 'date':
      return 'pi pi-calendar';
    case 'boolean':
      return 'pi pi-check-circle';
    default:
      return 'pi pi-info-circle';
  }
};

const getTrendIcon = (trend) => {
  if (!trend) return null;
  
  if (trend.direction === 'up') return 'pi pi-arrow-up';
  if (trend.direction === 'down') return 'pi pi-arrow-down';
  return 'pi pi-minus';
};

const getTrendClass = (trend) => {
  if (!trend) return '';
  
  if (trend.direction === 'up') return trend.isPositive ? 'trend-positive' : 'trend-negative';
  if (trend.direction === 'down') return trend.isPositive ? 'trend-negative' : 'trend-positive';
  return 'trend-neutral';
};

const getCardClass = (card) => {
  const baseClass = ['summary-card'];
  
  if (card.color) {
    baseClass.push(`card-${card.color}`);
  }
  
  if (props.loading) {
    baseClass.push('loading');
  }
  
  if (showAnimation.value) {
    baseClass.push('animate-in');
  }
  
  return baseClass.join(' ');
};

const animateValue = (card, targetValue) => {
  if (typeof targetValue !== 'number') return targetValue;
  
  const duration = 1000; // 1 second
  const startTime = Date.now();
  const startValue = animatedValues.value[card.key] || 0;
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    const currentValue = startValue + (targetValue - startValue) * easeOut;
    animatedValues.value[card.key] = currentValue;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      animatedValues.value[card.key] = targetValue;
    }
  };
  
  animate();
};

const getDisplayValue = (card) => {
  if (props.loading) return '...';
  
  // Use animated value if available and it's a number
  if (typeof card.value === 'number' && animatedValues.value[card.key] !== undefined) {
    return formatValue(animatedValues.value[card.key], card.format);
  }
  
  return card.formattedValue || formatValue(card.value, card.format);
};

const copyCardValue = (card) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(card.formattedValue || String(card.value));
  }
};

const getCardTooltip = (card) => {
  const tooltipParts = [card.label];
  
  if (card.metadata && card.metadata.dataPoints) {
    tooltipParts.push(`Based on ${card.metadata.dataPoints} records`);
  }
  
  if (card.metadata && card.metadata.calculation) {
    const calc = card.metadata.calculation;
    tooltipParts.push(`Calculation: ${calc.operation} of ${calc.field}`);
  }
  
  return tooltipParts.join('\n');
};

// Lifecycle
onMounted(() => {
  // Animate cards in
  setTimeout(() => {
    showAnimation.value = true;
  }, 100);
  
  // Animate values for numeric cards
  summaryCards.value.forEach((card, index) => {
    if (typeof card.value === 'number') {
      setTimeout(() => {
        animateValue(card, card.value);
      }, index * 100);
    }
  });
});

// Watch for data changes to trigger re-animation
watch(() => props.formattedSummaryCards, (newCards) => {
  if (newCards && newCards.length > 0) {
    newCards.forEach((card, index) => {
      if (typeof card.value === 'number') {
        setTimeout(() => {
          animateValue(card, card.value);
        }, index * 50);
      }
    });
  }
}, { deep: true });
</script>

<template>
  <div v-if="hasSummaryData" class="summary-section">
    <div class="summary-grid" :style="{ gridTemplateColumns: gridColumns }">
      <Card
        v-for="(card, index) in summaryCards"
        :key="card.key"
        :class="getCardClass(card)"
        :style="{ animationDelay: `${index * 100}ms` }"
        v-tooltip="getCardTooltip(card)"
      >
        <template #content>
          <div class="card-content" @click="copyCardValue(card)">
            <!-- Card Header -->
            <div class="card-header">
              <div class="card-icon">
                <i :class="getCardIcon(card)"></i>
              </div>
              
              <!-- Trend Indicator -->
              <div v-if="card.trend" :class="['trend-indicator', getTrendClass(card.trend)]">
                <i :class="getTrendIcon(card.trend)"></i>
                <span class="trend-value">{{ card.trend.percentage }}%</span>
              </div>
            </div>
            
            <!-- Card Value -->
            <div class="card-value">
              {{ getDisplayValue(card) }}
            </div>
            
            <!-- Card Label -->
            <div class="card-label">{{ card.label }}</div>
            
            <!-- Additional Metadata -->
            <div v-if="card.metadata && card.metadata.dataPoints" class="card-metadata">
              <small>{{ card.metadata.dataPoints }} records</small>
            </div>
          </div>
        </template>
      </Card>
    </div>
    
    <!-- Summary Stats Footer -->
    <div v-if="props.summary._metadata" class="summary-footer">
      <div class="summary-stats">
        <span class="stat">
          <i class="pi pi-database"></i>
          {{ props.summary._metadata.totalRecords }} Total Records
        </span>
        <span v-if="props.summary._metadata.filteredRecords !== props.summary._metadata.totalRecords" class="stat">
          <i class="pi pi-filter"></i>
          {{ props.summary._metadata.filteredRecords }} Filtered
        </span>
        <span class="stat">
          <i class="pi pi-clock"></i>
          Updated {{ formatRelativeTime(props.summary._metadata.calculatedAt) }}
        </span>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="loading" class="summary-section">
    <div class="summary-grid">
      <Card v-for="i in 4" :key="i" class="summary-card loading">
        <template #content>
          <div class="card-content">
            <div class="card-header">
              <div class="card-icon skeleton"></div>
            </div>
            <div class="card-value skeleton"></div>
            <div class="card-label skeleton"></div>
          </div>
        </template>
      </Card>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else-if="props.report?.summaryCards" class="summary-section">
    <div class="empty-state">
      <i class="pi pi-chart-bar empty-icon"></i>
      <h4>No Summary Data</h4>
      <p>Load data to see summary statistics</p>
    </div>
  </div>
</template>

<script>
import { watch } from 'vue';

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};
</script>

<style scoped>
.summary-section {
  margin-bottom: 2rem;
}

.summary-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.summary-card {
  border-left: 4px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
}

.summary-card.animate-in {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.summary-card.card-primary {
  border-left-color: #3498db;
}

.summary-card.card-success {
  border-left-color: #27ae60;
}

.summary-card.card-danger {
  border-left-color: #e74c3c;
}

.summary-card.card-info {
  border-left-color: #f39c12;
}

.summary-card.card-warning {
  border-left-color: #f39c12;
}

.summary-card.card-secondary {
  border-left-color: #6c757d;
}

.card-content {
  padding: 1.5rem;
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(52, 152, 219, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
  font-size: 1.1rem;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.trend-positive {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.trend-negative {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.trend-neutral {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.2;
  word-break: break-all;
}

.card-label {
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.card-metadata {
  color: #9ca3af;
  font-size: 0.75rem;
}

.summary-footer {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

.summary-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.stat i {
  color: #3498db;
}

/* Loading States */
.summary-card.loading {
  pointer-events: none;
  opacity: 0.7;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.card-icon.skeleton {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}

.card-value.skeleton {
  height: 2rem;
  width: 60%;
  margin-bottom: 0.5rem;
}

.card-label.skeleton {
  height: 1rem;
  width: 80%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
    gap: 1rem;
  }
  
  .card-value {
    font-size: 1.5rem;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .summary-stats {
    gap: 1rem;
    justify-content: space-around;
  }
  
  .stat {
    font-size: 0.8rem;
  }
}

/* Accessibility */
.summary-card:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .summary-card:hover {
    transform: none;
    box-shadow: none;
  }
  
  .trend-indicator {
    background: none !important;
    border: 1px solid currentColor;
  }
}
</style>