<script setup>
import { computed, ref } from 'vue';
import Chart from 'primevue/chart';

// Props
const props = defineProps({
  chart: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// State
const chartRef = ref(null);

// Computed
const hasChartData = computed(() => {
  return props.chart?.data?.labels && props.chart.data.labels.length > 0;
});

const chartTitle = computed(() => {
  return props.chart?.title || 'Chart';
});

const chartType = computed(() => {
  return props.chart?.type || 'bar';
});

const chartOptions = computed(() => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: getDefaultLegendPosition(),
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false, // We'll show title in card header
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            return `${context.dataset.label || 'Value'}: ${formatTooltipValue(value)}`;
          }
        }
      }
    },
    scales: getScalesConfig(),
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2
      },
      bar: {
        borderRadius: 4,
        borderSkipped: false
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Merge with custom options from chart configuration
  return mergeDeep(baseOptions, props.chart.options || {});
});

const getDefaultLegendPosition = () => {
  switch (chartType.value) {
    case 'pie':
    case 'doughnut':
      return 'right';
    case 'radar':
    case 'polarArea':
      return 'top';
    default:
      return 'top';
  }
};

const getScalesConfig = () => {
  // No scales for pie, doughnut, radar, polarArea charts
  if (['pie', 'doughnut', 'radar', 'polarArea'].includes(chartType.value)) {
    return undefined;
  }
  
  const isHorizontal = props.chart.options?.indexAxis === 'y';
  
  return {
    x: {
      display: true,
      grid: {
        display: !isHorizontal,
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        font: {
          size: 11
        },
        color: '#666'
      },
      border: {
        display: false
      }
    },
    y: {
      display: true,
      beginAtZero: true,
      grid: {
        display: isHorizontal ? false : true,
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11
        },
        color: '#666',
        callback: function(value) {
          return formatAxisValue(value);
        }
      },
      border: {
        display: false
      }
    }
  };
};

const formatAxisValue = (value) => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
  }
  return value;
};

const formatTooltipValue = (value) => {
  if (typeof value === 'number') {
    // Check if it's likely a currency value
    if (value > 999) {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    }
    return value.toLocaleString();
  }
  return value;
};

const getChartIcon = computed(() => {
  const icons = {
    bar: 'pi pi-chart-bar',
    line: 'pi pi-chart-line',
    doughnut: 'pi pi-chart-pie',
    pie: 'pi pi-chart-pie',
    radar: 'pi pi-eye',
    polarArea: 'pi pi-compass'
  };
  return icons[chartType.value] || 'pi pi-chart-bar';
});

const getChartColorClass = computed(() => {
  const colors = {
    bar: 'text-blue-600',
    line: 'text-green-600',
    doughnut: 'text-purple-600',
    pie: 'text-purple-600',
    radar: 'text-orange-600',
    polarArea: 'text-teal-600'
  };
  return colors[chartType.value] || 'text-blue-600';
});

// Methods
const mergeDeep = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

const refreshChart = () => {
  if (chartRef.value) {
    chartRef.value.refresh();
  }
};

// Expose methods for parent component
defineExpose({
  refreshChart
});
</script>

<template>
  <Card class="chart-card" :class="{ 'chart-loading': loading }">
    <template #header>
      <div class="chart-header">
        <div class="chart-header-content">
          <div class="chart-icon-wrapper">
            <i :class="[getChartIcon, getChartColorClass, 'chart-header-icon']"></i>
          </div>
          <div class="chart-title-section">
            <h4 class="chart-title">{{ chartTitle }}</h4>
            <div class="chart-meta">
              <Badge :value="chartType.toUpperCase()" :class="`chart-type-badge chart-type-${chartType}`" />
              <span v-if="hasChartData" class="data-count">
                {{ chart.data.labels.length }} data points
              </span>
            </div>
          </div>
        </div>
        <div class="chart-actions">
          <Button 
            icon="pi pi-refresh" 
            class="p-button-text p-button-sm chart-refresh-btn"
            @click="refreshChart"
            :loading="loading"
            v-tooltip="'Refresh Chart'"
          />
        </div>
      </div>
    </template>
    
    <template #content>
      <!-- Chart Container -->
      <div v-if="hasChartData && !loading" class="chart-container">
        <Chart 
          ref="chartRef"
          :type="chartType"
          :data="chart.data"
          :options="chartOptions"
          class="chart-canvas"
        />
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="chart-loading-state">
        <div class="loading-content">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="3" />
          <p class="loading-text">Loading chart data...</p>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="chart-no-data">
        <div class="no-data-content">
          <i :class="[getChartIcon, 'no-data-icon']"></i>
          <h5 class="no-data-title">No Data Available</h5>
          <p class="no-data-text">Apply filters to generate chart visualization</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="chart.error" class="chart-error">
        <div class="error-content">
          <i class="pi pi-exclamation-triangle error-icon"></i>
          <h5 class="error-title">Chart Error</h5>
          <p class="error-text">{{ chart.error }}</p>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.chart-card {
  height: 100%;
  min-height: 400px;
  transition: all 0.3s ease;
  border: 1px solid #e0e6ed;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.chart-loading {
  opacity: 0.7;
}

/* Chart Header */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e6ed;
}

.chart-header-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.chart-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  background: rgba(var(--primary-color-rgb), 0.1);
  flex-shrink: 0;
}

.chart-header-icon {
  font-size: 1.25rem;
}

.chart-title-section {
  flex: 1;
}

.chart-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
}

.chart-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.chart-type-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
}

.chart-type-bar { background: #e3f2fd; color: #1976d2; }
.chart-type-line { background: #e8f5e8; color: #2e7d32; }
.chart-type-doughnut, .chart-type-pie { background: #f3e5f5; color: #7b1fa2; }
.chart-type-radar { background: #fff3e0; color: #f57c00; }
.chart-type-polararea { background: #e0f2f1; color: #00695c; }

.data-count {
  font-size: 0.8rem;
  color: #666;
}

.chart-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-refresh-btn {
  color: #666;
}

/* Chart Container */
.chart-container {
  height: 350px;
  padding: 1.5rem;
  position: relative;
}

.chart-canvas {
  height: 100% !important;
  width: 100% !important;
}

/* Loading State */
.chart-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
  padding: 2rem;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-text {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* No Data State */
.chart-no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
  padding: 2rem;
}

.no-data-content {
  text-align: center;
  color: #666;
}

.no-data-icon {
  font-size: 3rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.no-data-title {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 500;
}

.no-data-text {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

/* Error State */
.chart-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
  padding: 2rem;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  margin: 1rem;
}

.error-content {
  text-align: center;
}

.error-icon {
  font-size: 2.5rem;
  color: #e53e3e;
  margin-bottom: 1rem;
}

.error-title {
  margin: 0 0 0.5rem 0;
  color: #e53e3e;
  font-size: 1.1rem;
  font-weight: 600;
}

.error-text {
  margin: 0;
  font-size: 0.9rem;
  color: #c53030;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chart-card {
    min-height: 300px;
  }
  
  .chart-container {
    height: 250px;
    padding: 1rem;
  }
  
  .chart-loading-state,
  .chart-no-data,
  .chart-error {
    height: 250px;
    padding: 1rem;
  }
  
  .chart-header {
    padding: 1rem;
  }
  
  .chart-header-content {
    gap: 0.75rem;
  }
  
  .chart-title {
    font-size: 1rem;
  }
  
  .chart-meta {
    gap: 0.5rem;
  }
  
  .no-data-icon {
    font-size: 2rem;
  }
  
  .error-icon {
    font-size: 2rem;
  }
}

/* Print Styles */
@media print {
  .chart-card:hover {
    transform: none;
    box-shadow: none;
  }
  
  .chart-actions {
    display: none;
  }
  
  .chart-header {
    background: white;
  }
  
  .chart-type-badge {
    background: white !important;
    border: 1px solid currentColor;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .chart-card {
    border: 2px solid #000;
  }
  
  .chart-header {
    border-bottom: 2px solid #000;
  }
  
  .chart-icon-wrapper {
    background: #000;
    color: #fff;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .chart-card {
    transition: none;
  }
  
  .chart-card:hover {
    transform: none;
  }
}
</style>