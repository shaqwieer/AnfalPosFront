<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { ServiceCard, Technician, Column } from './types';
import TechnicianAvatar from './TechnicianAvatar.vue';
import TechnicianSelectionPopup from './TechnicianSelectionPopup.vue';
import ServiceDetailsDialog from './ServiceDetailsDialog.vue';

const props = defineProps<{
  card: ServiceCard;
  availableTechnicians: Technician[];
  columns: Column[];
}>();

const emit = defineEmits<{
  (e: 'statusChange', cardId: string, newStatus: string): void;
}>();

const showTechPopup = ref(false);
const showServices = ref(false);
const showStatusMenu = ref(false);
const showServiceDetails = ref(false);
const isHighlighted = ref(false);

const handleTechnicianUpdate = (technicians: ServiceCard['technicians']) => {
  props.card.technicians = technicians;
};

const handleStatusChange = (newStatus: string) => {
  if (newStatus !== props.card.status) {
    isHighlighted.value = true;
    setTimeout(() => {
      isHighlighted.value = false;
    }, 10000);
  }
  emit('statusChange', props.card.id, newStatus);
  showStatusMenu.value = false;
};

const statusMenuRef = ref<HTMLDivElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (statusMenuRef.value && !statusMenuRef.value.contains(event.target as Node)) {
    showStatusMenu.value = false;
  }
};

const toggleStatusMenu = () => {
  showStatusMenu.value = !showStatusMenu.value;
  if (showStatusMenu.value) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    });
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
};

const completedServices = computed(() => {
  return props.card.services.filter(service => service.status === 'completed').length;
});

const totalServices = computed(() => props.card.services.length);
</script>

<template>
  <div 
    class="card" 
    :class="{ 
      'border-urgent': card.priority === 'urgent',
      'highlight': isHighlighted 
    }"
  >
    <!-- Card Header -->
    <div class="card-header">
      <div class="id-section">
        <div class="id-container">
          <span class="id">#{{ card.id }}</span>
          <span class="plate">{{ card.plate }}</span>
        </div>
        <span class="time-badge">{{ card.expectedCompletion }}</span>
      </div>
      <div class="menu-container" ref="statusMenuRef">
        <button class="menu-btn" @click="toggleStatusMenu">
          <font-awesome-icon icon="ellipsis-h" />
        </button>
        <div v-if="showStatusMenu" class="status-menu">
          <div class="menu-header">Move to Status</div>
          <div 
            v-for="column in columns" 
            :key="column.title"
            class="menu-item"
            :class="{ active: column.title === card.status }"
            @click="handleStatusChange(column.title)"
          >
            <div class="status-color" :style="{ backgroundColor: column.color }"></div>
            {{ column.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="customer-info">
      <div class="info-row">
        <span class="icon"><font-awesome-icon icon="user" /></span>
        <span class="customer-name">{{ card.customer }}</span>
      </div>
      <div class="info-row">
        <span class="icon"><font-awesome-icon icon="car" /></span>
        <span class="vehicle">{{ card.vehicle }}</span>
      </div>
    </div>

    <!-- Services Section -->
    <div class="services-section">
      <div 
        class="services-header" 
        @click="showServiceDetails = true"
      >
        <div class="services-title">
          <span class="service-name">Service List {{ completedServices }}/{{ totalServices }}</span>
        </div>
        <font-awesome-icon 
          :icon="showServices ? 'chevron-up' : 'chevron-down'" 
          class="toggle-icon"
        />
      </div>
    </div>

    <!-- Progress Info -->
    <div class="status-section">
      <div class="progress-info">
        <font-awesome-icon icon="clock" class="icon" />
        <span class="progress-text">{{ card.progress }}</span>
        <span class="divider">|</span>
        <span class="time-spent">{{ card.timeSpent }}</span>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="payment-info">
      <span class="amount">
        <font-awesome-icon icon="dollar-sign" class="icon" />
        {{ card.amount }}
      </span>
      <span class="status" :class="{ 'paid': card.status === 'Paid', 'unpaid': card.status === 'Unpaid', 'balance': card.status.includes('Balance') }">
        {{ card.status }}
      </span>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="tags">
        <span class="tag urgent">
          {{ card.priority }}
        </span>
      </div>
      <div class="action-icons">
        <button class="icon-btn" v-if="card.status !== 'Paid'">
          <font-awesome-icon icon="calendar-alt" />
        </button>
        <button class="icon-btn" v-if="card.status !== 'Paid'">
          <font-awesome-icon icon="envelope" />
        </button>
        <button class="icon-btn check" v-if="card.status === 'Paid'">
          <font-awesome-icon icon="check" />
        </button>
      </div>
    </div>
  </div>

  <ServiceDetailsDialog
    v-if="showServiceDetails"
    :show="showServiceDetails"
    :services="card.services"
    :technicians="availableTechnicians"
    @close="showServiceDetails = false"
    @update="handleServiceUpdate"
  />
</template>

<style scoped>
@keyframes highlight-pulse {
  0% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px rgba(8, 84, 160, 0.4);
    transform: scale(1.01);
  }
  100% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    transform: scale(1);
  }
}

.highlight {
  animation: highlight-pulse 2s ease-in-out infinite;
  background-color: #f8faff;
}

.card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e5e5;
  border-left: 4px solid transparent;
  transition: all 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.card.border-urgent {
  border-left-color: #bb0000;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  cursor: move;
}

.id-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  margin-right: 12px;
}

.id-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.id {
  font-weight: 600;
  color: #32363a;
  font-size: 0.875rem;
}

.plate {
  color: #515559;
  font-size: 0.75rem;
  background: #f5f6f7;
  padding: 2px 6px;
  border-radius: 4px;
}

.time-badge {
  background: #f5f6f7;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #515559;
  border: 1px solid #e5e5e5;
}

/* Menu */
.menu-container {
  position: relative;
}

.menu-btn {
  background: transparent;
  border: none;
  color: #515559;
  padding: 6px;
  cursor: pointer;
  border-radius: 4px;
}

.menu-btn:hover {
  background: #f5f6f7;
}

.status-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  border: 1px solid #e5e5e5;
}

.menu-header {
  padding: 12px 16px;
  color: #515559;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e5e5;
  font-weight: 500;
}

.menu-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #32363a;
  font-size: 0.875rem;
}

.menu-item:hover {
  background: #f5f6f7;
}

.menu-item.active {
  background: #ebf5ff;
  color: #0854a0;
}

.status-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

/* Customer Info */
.customer-info {
  margin: 12px 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.icon {
  color: #515559;
  font-size: 0.875rem;
  width: 16px;
}

.customer-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #32363a;
}

.vehicle {
  color: #515559;
  font-size: 0.875rem;
}

/* Services Section */
.services-section {
  margin: 16px 0;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}

.services-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.services-header:hover {
  background: #f5f6f7;
}

.services-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #32363a;
}

.service-count {
  font-size: 0.75rem;
  color: #515559;
  background: #f5f6f7;
  padding: 2px 6px;
  border-radius: 4px;
}

.toggle-icon {
  color: #515559;
  font-size: 0.75rem;
}

.services-details {
  border-top: 1px solid #e5e5e5;
  padding: 12px;
}

.service-item {
  padding: 8px 0;
}

.service-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.service-header {
  margin-bottom: 8px;
}

.service-title {
  font-size: 0.875rem;
  color: #32363a;
  font-weight: 500;
}

.service-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.service-progress {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex-grow: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #0854a0;
  border-radius: 2px;
}

.progress-text {
  font-size: 0.75rem;
  color: #515559;
  min-width: 70px;
}

.service-techs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.technicians-avatars {
  display: flex;
  align-items: center;
}

.assign-btn {
  background: #f5f6f7;
  border: 1px dashed #d9d9d9;
  color: #515559;
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.assign-btn:hover {
  background: #e5e5e5;
  border-color: #515559;
}

/* Status Section */
.status-section {
  margin: 16px 0;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #515559;
  font-size: 0.875rem;
}

.divider {
  color: #d9d9d9;
}

/* Payment Info */
.payment-info {
  margin: 16px 0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount {
  font-weight: 600;
  color: #32363a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status {
  color: #515559;
}

.status.paid {
  color: #107e3e;
}

.status.unpaid {
  color: #bb0000;
}

.status.balance {
  color: #e9730c;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.tags {
  display: flex;
  gap: 8px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: capitalize;
  font-weight: 500;
}

.tag.urgent {
  background: #ffeaf4;
  color: #bb0000;
  border: 1px solid #ffcfe1;
}

.action-icons {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: 1px solid #d9d9d9;
  color: #515559;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f5f6f7;
  border-color: #515559;
}

.icon-btn.check {
  color: #107e3e;
  border-color: #107e3e;
}

.icon-btn.check:hover {
  background: #f5faf6;
}
</style>