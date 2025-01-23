<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Technician, ServiceArea } from './types';
import TechnicianAvatar from './TechnicianAvatar.vue';

const props = defineProps<{
  availableTechnicians: Technician[];
}>();

const emit = defineEmits<{
  (e: 'search', filters: {
    query: string;
    filterBy: 'order' | 'plate' | 'customer';
    selectedTechs: string[];
    selectedAreas: string[];
  }): void;
}>();

const searchQuery = ref('');
const filterBy = ref<'order' | 'plate' | 'customer'>('order');
const selectedTechs = ref<Set<string>>(new Set());
const selectedAreas = ref<Set<string>>(new Set());
const showTechFilter = ref(false);
const showAreaFilter = ref(false);

// Sample service areas (same as in ServiceDetailsDialog)
const serviceAreas = ref<ServiceArea[]>([
  {
    id: 'tire-service',
    name: 'Tire Service Bay',
    description: 'Tire mounting, balancing, and alignment services'
  },
  {
    id: 'wheel-alignment',
    name: 'Wheel Alignment Bay',
    description: 'Computerized wheel alignment and adjustment'
  },
  {
    id: 'quick-service',
    name: 'Quick Service Bay',
    description: 'Oil changes, filters, and basic maintenance'
  },
  {
    id: 'brake-service',
    name: 'Brake Service Bay',
    description: 'Brake repairs and maintenance'
  },
  {
    id: 'diagnostic',
    name: 'Diagnostic Bay',
    description: 'Vehicle diagnostics and electronic systems'
  },
  {
    id: 'inspection',
    name: 'Inspection Bay',
    description: 'Vehicle inspections and safety checks'
  },
  {
    id: 'express-maintenance',
    name: 'Express Maintenance Bay',
    description: 'Quick maintenance services'
  },
  {
    id: 'tire-storage',
    name: 'Tire Storage Area',
    description: 'Seasonal tire storage and management'
  }
]);

const handleSearch = () => {
  emit('search', {
    query: searchQuery.value,
    filterBy: filterBy.value,
    selectedTechs: Array.from(selectedTechs.value),
    selectedAreas: Array.from(selectedAreas.value)
  });
};

const toggleTech = (techId: string) => {
  if (selectedTechs.value.has(techId)) {
    selectedTechs.value.delete(techId);
  } else {
    selectedTechs.value.add(techId);
  }
  handleSearch();
};

const toggleArea = (areaId: string) => {
  if (selectedAreas.value.has(areaId)) {
    selectedAreas.value.delete(areaId);
  } else {
    selectedAreas.value.add(areaId);
  }
  handleSearch();
};

const selectedTechCount = computed(() => selectedTechs.value.size);
const selectedAreaCount = computed(() => selectedAreas.value.size);
</script>

<template>
  <div class="filter-tools">
    <div class="search-container">
      <div class="search-input">
        <div class="filter-select">
          <select v-model="filterBy" @change="handleSearch">
            <option value="order">Order #</option>
            <option value="plate">Plate</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="'Search by ' + filterBy"
          @input="handleSearch"
        />
      </div>

      <div class="filter-buttons">
        <!-- Technician Filter -->
        <div class="filter-dropdown">
          <button 
            class="filter-btn" 
            @click="showTechFilter = !showTechFilter"
            :class="{ active: selectedTechCount > 0 }"
          >
            <font-awesome-icon icon="user-group" class="btn-icon" />
            <span class="btn-text">Technicians</span>
            <span v-if="selectedTechCount > 0" class="filter-count">
              {{ selectedTechCount }}
            </span>
          </button>

          <div v-if="showTechFilter" class="dropdown-content">
            <div class="dropdown-header">Select Technicians</div>
            <div class="filter-list">
              <div
                v-for="tech in availableTechnicians"
                :key="tech.id"
                class="filter-item"
                :class="{ selected: selectedTechs.has(tech.id) }"
                @click="toggleTech(tech.id)"
              >
                <TechnicianAvatar :technician="tech" size="small" />
                <span class="item-name">{{ tech.name }}</span>
                <span v-if="selectedTechs.has(tech.id)" class="check-icon">
                  <font-awesome-icon icon="check" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Service Area Filter -->
        <div class="filter-dropdown">
          <button 
            class="filter-btn" 
            @click="showAreaFilter = !showAreaFilter"
            :class="{ active: selectedAreaCount > 0 }"
          >
            <font-awesome-icon icon="map-marker-alt" class="btn-icon" />
            <span class="btn-text">Service Areas</span>
            <span v-if="selectedAreaCount > 0" class="filter-count">
              {{ selectedAreaCount }}
            </span>
          </button>

          <div v-if="showAreaFilter" class="dropdown-content">
            <div class="dropdown-header">Select Service Areas</div>
            <div class="filter-list">
              <div
                v-for="area in serviceAreas"
                :key="area.id"
                class="filter-item"
                :class="{ selected: selectedAreas.has(area.id) }"
                @click="toggleArea(area.id)"
              >
                <div class="area-color" :style="{ backgroundColor: '#0854a0' }"></div>
                <div class="area-info">
                  <span class="item-name">{{ area.name }}</span>
                  <span class="item-description">{{ area.description }}</span>
                </div>
                <span v-if="selectedAreas.has(area.id)" class="check-icon">
                  <font-awesome-icon icon="check" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-tools {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-container {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  display: flex;
  flex-grow: 1;
  max-width: 600px;
  position: relative;
}

.search-input input {
  flex-grow: 1;
  padding: 8px 16px;
  padding-left: 110px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #32363a;
  transition: all 0.2s ease;
}

.search-input input:focus {
  outline: none;
  border-color: #0854a0;
  box-shadow: 0 0 0 2px rgba(8, 84, 160, 0.1);
}

.filter-select {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.filter-select select {
  padding: 4px 8px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #515559;
  background: #f5f6f7;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 90px;
}

.filter-select select:focus {
  outline: none;
  border-color: #0854a0;
}

/* Filter Buttons */
.filter-buttons {
  display: flex;
  gap: 12px;
}

.filter-dropdown {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  color: #515559;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon {
  font-size: 0.875rem;
}

.filter-btn:hover {
  border-color: #0854a0;
  color: #0854a0;
}

.filter-btn.active {
  background: #ebf5ff;
  border-color: #0854a0;
  color: #0854a0;
}

.filter-count {
  background: #0854a0;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  z-index: 1000;
  border: 1px solid #e5e5e5;
}

.dropdown-header {
  padding: 12px 16px;
  color: #515559;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e5e5;
  font-weight: 500;
}

.filter-list {
  padding: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.filter-item {
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.filter-item:hover {
  background: #f5f6f7;
}

.filter-item.selected {
  background: #ebf5ff;
}

.area-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.area-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 0.875rem;
  color: #32363a;
  font-weight: 500;
}

.item-description {
  font-size: 0.75rem;
  color: #515559;
}

.check-icon {
  color: #0854a0;
  font-size: 0.875rem;
}
</style>