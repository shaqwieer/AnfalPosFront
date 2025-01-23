<script setup lang="ts">
import { ref } from 'vue';
import type { Service, Technician, ServiceArea } from './types';
import TechnicianAvatar from './TechnicianAvatar.vue';

const props = defineProps<{
  show: boolean;
  services: Service[];
  technicians: Technician[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update', services: Service[]): void;
}>();

// Sample service areas for a tire workshop and fast service
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

const localServices = ref(props.services.map(service => ({
  ...service,
  technicians: service.technicians || [],
  status: service.status || 'pending',
  serviceArea: service.serviceArea
})));

const toggleTechnician = (serviceIndex: number, tech: Technician) => {
  const service = localServices.value[serviceIndex];
  const techIndex = service.technicians.findIndex(t => t.id === tech.id);
  
  if (techIndex === -1) {
    service.technicians.push(tech);
  } else {
    service.technicians.splice(techIndex, 1);
  }
};

const setServiceArea = (serviceIndex: number, areaId: string) => {
  if (!areaId) {
    localServices.value[serviceIndex].serviceArea = undefined;
    return;
  }
  
  const area = serviceAreas.value.find(a => a.id === areaId);
  if (area) {
    localServices.value[serviceIndex].serviceArea = area;
  }
};

const removeServiceArea = (serviceIndex: number) => {
  localServices.value[serviceIndex].serviceArea = undefined;
};

const formatDateTime = (dateTimeStr: string | undefined) => {
  if (!dateTimeStr) return 'Not started';
  return new Date(dateTimeStr).toLocaleString();
};

const save = () => {
  emit('update', localServices.value);
  emit('close');
};
</script>

<template>
  <div v-if="show" class="dialog-overlay">
    <div class="dialog">
      <div class="dialog-header">
        <h3>Service Details</h3>
        <button class="close-btn" @click="$emit('close')">
          <font-awesome-icon icon="times" />
        </button>
      </div>

      <div class="dialog-content">
        <div v-for="(service, index) in localServices" :key="index" class="service-item">
          <div class="service-header">
            <h4>{{ service.name }}</h4>
            <div class="status-badge" :class="service.status">
              {{ service.status.replace('_', ' ') }}
            </div>
          </div>

          <!-- Service Area Selection -->
          <div class="service-area">
            <div class="section-header">
              <h5>
                <font-awesome-icon icon="map-marker-alt" class="section-icon" />
                Service Area
              </h5>
            </div>
            <div class="area-selector">
              <div class="area-input-group">
                <select 
                  :value="service.serviceArea?.id"
                  @change="(e) => setServiceArea(index, (e.target as HTMLSelectElement).value)"
                  class="area-dropdown"
                >
                  <option value="">Select Service Area</option>
                  <option 
                    v-for="area in serviceAreas" 
                    :key="area.id"
                    :value="area.id"
                  >
                    {{ area.name }}
                  </option>
                </select>
                <button 
                  v-if="service.serviceArea"
                  class="remove-area-btn"
                  @click="removeServiceArea(index)"
                  title="Remove service area"
                >
                  <font-awesome-icon icon="times" />
                </button>
              </div>
              <div v-if="service.serviceArea" class="selected-area-description">
                {{ service.serviceArea.description }}
              </div>
            </div>
          </div>

          <div class="service-technicians">
            <div class="section-header">
              <h5>
                <font-awesome-icon icon="user-group" class="section-icon" />
                Assigned Technicians
              </h5>
            </div>
            <div class="tech-list">
              <div 
                v-for="tech in technicians" 
                :key="tech.id"
                class="tech-item"
                :class="{ selected: service.technicians.some(t => t.id === tech.id) }"
                @click="toggleTechnician(index, tech)"
              >
                <TechnicianAvatar :technician="tech" size="small" />
                <div class="tech-info">
                  <span class="tech-name">{{ tech.name }}</span>
                  <div v-if="service.technicians.some(t => t.id === tech.id)" class="tech-times">
                    <div class="time-info">
                      <span class="time-label">Start:</span>
                      <span class="time-value">{{ formatDateTime(service.startTime) }}</span>
                    </div>
                    <div class="time-info">
                      <span class="time-label">End:</span>
                      <span class="time-value">{{ formatDateTime(service.endTime) }}</span>
                    </div>
                  </div>
                </div>
                <span v-if="service.technicians.some(t => t.id === tech.id)" class="check-icon">
                  <font-awesome-icon icon="check" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="cancel-btn" @click="$emit('close')">Close</button>
        <button class="save-btn" @click="save">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
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

.dialog {
  background: white;
  border-radius: 8px;
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: #32363a;
}

.close-btn {
  background: transparent;
  border: none;
  color: #515559;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f5f6f7;
}

.dialog-content {
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
}

.service-item {
  padding: 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 16px;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.service-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #32363a;
}

/* Service Area Styles */
.service-area {
  margin-bottom: 24px;
}

.area-selector {
  margin-top: 12px;
}

.area-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.area-dropdown {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #32363a;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.area-dropdown:hover {
  border-color: #0854a0;
}

.area-dropdown:focus {
  outline: none;
  border-color: #0854a0;
  box-shadow: 0 0 0 2px rgba(8, 84, 160, 0.1);
}

.remove-area-btn {
  padding: 8px;
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  color: #515559;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-area-btn:hover {
  background: #fff4e5;
  border-color: #e9730c;
  color: #e9730c;
}

.selected-area-description {
  margin-top: 8px;
  font-size: 0.75rem;
  color: #515559;
  padding: 8px;
  background: #f5f6f7;
  border-radius: 4px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.pending {
  background: #fff4e5;
  color: #e9730c;
}

.status-badge.in_progress {
  background: #ebf5ff;
  color: #0854a0;
}

.status-badge.completed {
  background: #f1fdf6;
  color: #107e3e;
}

.section-header {
  margin-bottom: 12px;
}

.section-header h5 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #515559;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  color: #515559;
  font-size: 0.875rem;
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tech-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  gap: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: 1px solid #e5e5e5;
}

.tech-item:hover {
  background: #f5f6f7;
}

.tech-item.selected {
  background: #ebf5ff;
  border-color: #0854a0;
}

.tech-info {
  flex-grow: 1;
}

.tech-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #32363a;
  margin-bottom: 4px;
}

.tech-times {
  font-size: 0.75rem;
  color: #515559;
}

.time-info {
  display: flex;
  gap: 4px;
  margin-top: 2px;
}

.time-label {
  color: #515559;
  font-weight: 500;
  min-width: 40px;
}

.time-value {
  color: #32363a;
}

.check-icon {
  color: #0854a0;
  margin-top: 4px;
}

.dialog-footer {
  padding: 16px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn, .save-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
}

.cancel-btn {
  background: white;
  border: 1px solid #e5e5e5;
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