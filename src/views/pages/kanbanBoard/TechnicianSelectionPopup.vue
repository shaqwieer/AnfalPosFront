<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Technician } from './types';
import TechnicianAvatar from './TechnicianAvatar.vue';

const props = defineProps<{
  show: boolean;
  selectedTechnicians: Technician[];
  availableTechnicians: Technician[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', technicians: Technician[]): void;
}>();

const selectedTechs = ref<Set<string>>(new Set(props.selectedTechnicians.map(tech => tech.id)));

const toggleTechnician = (tech: Technician) => {
  if (selectedTechs.value.has(tech.id)) {
    selectedTechs.value.delete(tech.id);
  } else {
    selectedTechs.value.add(tech.id);
  }
};

const save = () => {
  const selectedTechArray = props.availableTechnicians.filter(tech => 
    selectedTechs.value.has(tech.id)
  );
  emit('save', selectedTechArray);
  emit('close');
};
</script>

<template>
  <div v-if="show" class="popup-overlay">
    <div class="popup">
      <div class="popup-header">
        <h3>Assign Technicians</h3>
        <button class="close-btn" @click="$emit('close')">
          <font-awesome-icon icon="times" />
        </button>
      </div>
      <div class="technicians-list">
        <div
          v-for="tech in availableTechnicians"
          :key="tech.id"
          class="technician-item"
          :class="{ selected: selectedTechs.has(tech.id) }"
          @click="toggleTechnician(tech)"
        >
          <TechnicianAvatar :technician="tech" size="medium" />
          <span class="tech-name">{{ tech.name }}</span>
          <span class="check-icon" v-if="selectedTechs.has(tech.id)">
            <font-awesome-icon icon="check" />
          </span>
        </div>
      </div>
      <div class="popup-footer">
        <button class="cancel-btn" @click="$emit('close')">Cancel</button>
        <button class="save-btn" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup {
  background: white;
  border-radius: 4px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.popup-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popup-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: #32363a;
}

.close-btn {
  background: transparent;
  border: none;
  color: #515559;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f5f6f7;
}

.technicians-list {
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.technician-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.technician-item:hover {
  background: #f5f6f7;
}

.technician-item.selected {
  background: #ebf5ff;
}

.tech-name {
  margin-left: 0.75rem;
  flex-grow: 1;
  font-size: 0.875rem;
  color: #32363a;
}

.check-icon {
  color: #0854a0;
}

.popup-footer {
  padding: 1rem;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn, .save-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: white;
  border: 1px solid #d9d9d9;
  color: #32363a;
}

.cancel-btn:hover {
  border-color: #515559;
}

.save-btn {
  background: #0854a0;
  border: 1px solid #0854a0;
  color: white;
}

.save-btn:hover {
  background: #0a6ed1;
}
</style>