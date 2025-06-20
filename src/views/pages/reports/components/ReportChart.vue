<script setup>
import { computed } from 'vue';
import Chart from 'primevue/chart';

// Props
const props = defineProps({
  report: {
    type: Object,
    required: true
  },
  chartData: {
    type: Object,
    default: () => ({})
  }
});

// Computed
const hasChartData = computed(() => {
  return props.chartData && props.chartData.labels && props.chartData.labels.length > 0;
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    title: {
      display: true,
      text: props.report?.chartConfig?.title || 'Chart',
      font: {
        size: 16,
        weight: 'bold'
      },
      padding: 20
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1
    }
  },
  scales: getScalesConfig(),
  elements: {
    line: {
      tension: 0.4
    },
    point: {
      radius: 4,
      hoverRadius: 6
    }
  }
}));

const getScalesConfig = () => {
  const chartType = props.report?.chartConfig?.type;
  
  if (chartType === 'doughnut' || chartType === 'pie' || chartType === 'radar' || chartType === 'polarArea') {
    return undefined;
  }
  
  return {
    x: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        maxRotation: 45,
        minRotation: 0
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        callback: function(value) {
          return formatAxisValue(value);
        }
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

const getChartIcon = computed(() => {
  const type = props.report?.chartConfig?.type;
  switch (type) {
    case 'bar':
      return 'pi pi-chart-bar';
    case 'line':
      return 'pi pi-chart-line';
    case 'doughnut':
    case 'pie':
      return 'pi pi-chart-pie';
    case 'radar':
      return 'pi pi-eye';
    case 'polarArea':
      return 'pi pi-compass';
    default:
      return 'pi pi-chart-bar';
  }
});
</script>

<template>
  <Card v-if="hasChartData" class="chart-section">
    <template #header>
      <div class="chart-header">
        <div class="header-content">
          <i :class="[getChartIcon, 'header-icon']"></i>
          <h3>{{ report.chartConfig.title }}</h3>
        </div>
        <div class="chart-type-badge">
          <Badge :value="report.chartConfig.type.toUpperCase()" severity="info" />
        </div>
      </div>
    </template>
    
    <template #content>
      <div class="chart-container">
        <Chart 
          :type="report.chartConfig.type"
          :data="chartData"
          :options="chartOptions"
          class="chart-canvas"
        />
      </div>
    </template>
  </Card>

  <!-- No Data State -->
  <Card v-else-if="report.chartConfig" class="chart-section no-data">
    <template #content>
      <div class="no-data-content">
        <i class="pi pi-chart-bar no-data-icon"></i>
        <h4>No Chart Data Available</h4>
        <p>Apply filters to generate chart visualization</p>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.chart-section {
  margin-bottom: 2rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.25rem;
  color: #3498db;
}

.chart-header h3 {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
  font-size: 1.25rem;
}

.chart-type-badge {
  display: flex;
  align-items: center;
}

.chart-container {
  height: 400px;
  padding: 1rem 0;
  position: relative;
}

.chart-canvas {
  height: 100% !important;
  width: 100% !important;
}

/* No Data State */
.chart-section.no-data {
  border: 2px dashed #e0e0e0;
}

.no-data-content {
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.no-data-content h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.no-data-content p {
  margin: 0;
  font-size: 0.9rem;
}

/* Loading State */
.chart-section.loading {
  opacity: 0.6;
}

.chart-section.loading .chart-container {
  position: relative;
}

.chart-section.loading .chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  z-index: 1;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>