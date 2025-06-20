<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useReportFilters } from '../composables/useReportFilters';

const { t } = useI18n();

// Props
const props = defineProps({
  report: {
    type: Object,
    required: true
  }
});

// Composables
const {
  filterValues,
  filterOptions,
  isFormValid,
  loading
} = useReportFilters(computed(() => props.report));
</script>

<template>
  <Card class="filters-card">
    <template #content>
      <div class="filters-grid">
        <div v-for="filter in report.filters" :key="filter.name" class="filter-field">
          <label class="filter-label" :class="{ required: filter.required }">
            {{ t(filter.label) }}
          </label>
          
          <!-- Date Filter -->
          <Calendar 
            v-if="filter.type === 'date'"
            v-model="filterValues[filter.name]"
            dateFormat="yy-mm-dd"
            class="filter-input"
            :loading="loading"
          />
          
          <!-- Date Range Filter -->
          <div v-else-if="filter.type === 'daterange'" class="date-range-group">
            <Calendar 
              v-model="filterValues[filter.startDate]"
              dateFormat="yy-mm-dd"
              :placeholder="t('reports.startDate')"
              class="filter-input"
              :loading="loading"
            />
            <Calendar 
              v-model="filterValues[filter.endDate]"
              dateFormat="yy-mm-dd"
              :placeholder="t('reports.endDate')"
              class="filter-input"
              :loading="loading"
            />
          </div>
          
          <!-- Dropdown Filter -->
          <Dropdown
            v-else-if="filter.type === 'dropdown'"
            v-model="filterValues[filter.name]"
            :options="filterOptions[filter.name] || []"
            :optionLabel="filter.optionLabel"
            :optionValue="filter.optionValue"
            :placeholder="t(filter.label)"
            filter
            class="filter-input"
            :loading="loading"
          />
          
          <!-- MultiSelect Filter -->
          <MultiSelect
            v-else-if="filter.type === 'multiselect'"
            v-model="filterValues[filter.name]"
            :options="filterOptions[filter.name] || []"
            :optionLabel="filter.optionLabel"
            :optionValue="filter.optionValue"
            :placeholder="t(filter.label)"
            display="chip"
            class="filter-input"
            :loading="loading"
          />
          
          <!-- Text Input Filter -->
          <InputText
            v-else-if="filter.type === 'text'"
            v-model="filterValues[filter.name]"
            :placeholder="t(filter.label)"
            class="filter-input"
          />
          
          <!-- Checkbox Filter -->
          <div v-else-if="filter.type === 'checkbox'" class="checkbox-field">
            <Checkbox 
              v-model="filterValues[filter.name]"
              :inputId="filter.name"
              :binary="true"
            />
            <label :for="filter.name" class="checkbox-label">{{ t(filter.label) }}</label>
          </div>
        </div>
      </div>

      <!-- Validation Status -->
      <div v-if="!isFormValid" class="validation-message">
        <Message severity="warn" :closable="false">
          {{ t('reports.pleaseFillRequiredFields') }}
        </Message>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.filters-card {
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.filter-label.required::after {
  content: ' *';
  color: #e74c3c;
}

.filter-input {
  width: 100%;
}

.date-range-group {
  display: flex;
  gap: 0.5rem;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-weight: 500;
  color: #2c3e50;
}

.validation-message {
  margin-top: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .date-range-group {
    flex-direction: column;
  }
}
</style>