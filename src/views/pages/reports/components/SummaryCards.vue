<script setup>
import { computed } from 'vue';
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
  }
});

// Computed
const hasSummaryData = computed(() => {
  return props.summary && Object.keys(props.summary).length > 0;
});

const summaryCards = computed(() => {
  if (!props.report?.summaryCards || !hasSummaryData.value) return [];
  
  return props.report.summaryCards.map(card => ({
    ...card,
    value: props.summary[card.key],
    formattedValue: formatValue(props.summary[card.key], card.format)
  }));
});
</script>

<template>
  <div v-if="hasSummaryData" class="summary-section">
    <div class="summary-grid">
      <Card
        v-for="card in summaryCards"
        :key="card.key"
        :class="['summary-card', `card-${card.color}`]"
      >
        <template #content>
          <div class="card-content">
            <div class="card-icon">
              <i :class="getCardIcon(card.format)"></i>
            </div>
            <div class="card-value">
              {{ card.formattedValue }}
            </div>
            <div class="card-label">{{ card.label }}</div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script>
// Methods
const getCardIcon = (format) => {
  switch (format) {
    case 'currency':
      return 'pi pi-dollar';
    case 'number':
      return 'pi pi-hashtag';
    case 'date':
      return 'pi pi-calendar';
    default:
      return 'pi pi-info-circle';
  }
};
</script>

<style scoped>
.summary-section {
  margin-bottom: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  border-left: 4px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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

.card-content {
  text-align: center;
  padding: 1rem;
  position: relative;
}

.card-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 0.875rem;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.card-label {
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  
  .card-value {
    font-size: 1.5rem;
  }
}

/* Loading State */
.summary-card.loading {
  opacity: 0.6;
  pointer-events: none;
}

.summary-card.loading .card-value {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  color: transparent;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>