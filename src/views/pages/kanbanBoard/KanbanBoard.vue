<script setup lang="ts">
import { ref, computed } from 'vue';
import draggable from 'vuedraggable';
import ServiceCard from './ServiceCard.vue';
import FilterTools from './FilterTools.vue';
import type { Column, ServiceCard as ServiceCardType, Technician } from './types';

const technicians = ref<Technician[]>([
  {
    id: 'tech1',
    name: 'John Smith',
    initials: 'JS',
    color: '#1976d2',
    avatar: ''
  },
  {
    id: 'tech2',
    name: 'Maria Garcia',
    initials: 'MG',
    color: '#388e3c',
    avatar: ''
  },
  {
    id: 'tech3',
    name: 'Alex Wong',
    initials: 'AW',
    color: '#d32f2f',
    avatar: ''
  }
]);

const allColumns = ref<Column[]>([
  {
    title: 'Created',
    items: [
      {
        id: '9091',
        customer: 'Gladys McKinney',
        plate: 'SIL-2015',
        vehicle: '2015 Chevrolet Silverado',
        expectedCompletion: '1 hour',
        services: [
          {
            name: 'Gear Oil Change',
            status: 'pending',
            technicians: [technicians.value[0], technicians.value[1]]
          }
        ],
        priority: 'urgent',
        timeSpent: '0/1',
        status: 'Created',
        amount: '547.97',
        progress: '3/3',
        technicians: [technicians.value[0], technicians.value[1]]
      },
      {
        id: '9092',
        customer: 'Philip Webb',
        plate: 'HON-2016',
        vehicle: '2016 Honda CR-V',
        expectedCompletion: '1 hour',
        services: [
          {
            name: 'Engine Repair',
            status: 'pending',
            technicians: [technicians.value[2]]
          }
        ],
        priority: 'urgent',
        timeSpent: '0/1',
        status: 'Created',
        amount: '779.45',
        progress: '3/3',
        technicians: [technicians.value[2]]
      }
    ],
    color: '#2196f3'
  },
  {
    title: 'In Progress',
    items: [
      {
        id: '9093',
        customer: 'Judith Jones',
        plate: 'BMW-2015',
        vehicle: '2015 BMW M5 F10 Manual',
        expectedCompletion: '3 days',
        services: [
          {
            name: 'Gear Oil Change',
            status: 'in_progress',
            technicians: [technicians.value[0], technicians.value[2]]
          }
        ],
        priority: 'urgent',
        timeSpent: '0/1',
        status: 'In Progress',
        amount: '250.97',
        progress: '3/3',
        technicians: [technicians.value[0], technicians.value[2]]
      },
      {
        id: '9094',
        customer: 'Pablo Diego',
        plate: 'BMW-2018',
        vehicle: '2018 DINAN S1 BMW M550i xDrive',
        expectedCompletion: '9 days',
        services: [
          {
            name: 'Body Work',
            status: 'in_progress',
            technicians: [technicians.value[1]]
          },
          {
            name: 'Repaint',
            status: 'pending',
            technicians: []
          },
          {
            name: 'Chassis Welding',
            status: 'pending',
            technicians: []
          }
        ],
        priority: 'urgent',
        timeSpent: '0/1',
        status: 'In Progress',
        amount: '3361.97',
        progress: '12/12',
        technicians: [technicians.value[1]]
      }
    ],
    color: '#ff9800'
  },
  {
    title: 'Vehicle Ready',
    items: [
      {
        id: '9095',
        customer: 'Annette Alexander',
        plate: 'BMW-2015',
        vehicle: '2015 BMW M5 F10 Manual',
        expectedCompletion: '1 hour',
        services: [
          {
            name: 'Brake Replacement',
            status: 'completed',
            technicians: [technicians.value[0]],
            startTime: '2024-01-15T09:00:00',
            endTime: '2024-01-15T11:30:00'
          }
        ],
        priority: 'urgent',
        timeSpent: '0/1',
        status: 'Vehicle Ready',
        amount: '500.97',
        progress: '3/3',
        technicians: [technicians.value[0]]
      },
      {
        id: '9079',
        customer: 'Lily Lane',
        plate: 'BMW-2020',
        vehicle: '2020 BMW 230i xDrive Coupe',
        expectedCompletion: '1 hour',
        services: [
          {
            name: 'Engine Repair',
            status: 'completed',
            technicians: [technicians.value[1], technicians.value[2]],
            startTime: '2024-01-15T08:00:00',
            endTime: '2024-01-15T14:00:00'
          },
          {
            name: 'Maintenance Service',
            status: 'completed',
            technicians: [technicians.value[1]],
            startTime: '2024-01-15T14:30:00',
            endTime: '2024-01-15T16:00:00'
          }
        ],
        priority: 'urgent',
        timeSpent: '0/1',
        status: 'Vehicle Ready',
        amount: '887.97',
        progress: '7/7',
        technicians: [technicians.value[1], technicians.value[2]]
      }
    ],
    color: '#4caf50'
  },
  {
    title: 'Invoiced',
    items: [
      {
        id: '9078',
        customer: 'Lily Lane',
        plate: 'TOY-2017',
        vehicle: '2017 Toyota Tacoma',
        expectedCompletion: '1 day',
        services: [
          {
            name: 'Transmission Repair',
            status: 'completed',
            technicians: [technicians.value[2]],
            startTime: '2024-01-14T10:00:00',
            endTime: '2024-01-14T17:00:00'
          }
        ],
        priority: 'urgent',
        timeSpent: '0/1',
        status: 'Invoiced',
        amount: '950.97',
        progress: '3/3',
        technicians: [technicians.value[2]]
      }
    ],
    color: '#f44336'
  },
  {
    title: 'Paid',
    items: [
      {
        id: '9063',
        customer: 'Irma Pena',
        plate: 'TOY-2018',
        vehicle: '2018 Toyota Camry',
        expectedCompletion: '1 hour',
        services: [
          {
            name: 'Air Filter Replacement',
            status: 'completed',
            technicians: [technicians.value[0]],
            startTime: '2024-01-13T13:00:00',
            endTime: '2024-01-13T13:30:00'
          },
          {
            name: 'AC Filter Replacement',
            status: 'completed',
            technicians: [technicians.value[0]],
            startTime: '2024-01-13T13:30:00',
            endTime: '2024-01-13T14:00:00'
          }
        ],
        priority: 'urgent',
        timeSpent: '1/1',
        status: 'Paid',
        amount: '251.97',
        progress: '3/3',
        technicians: [technicians.value[0]]
      },
      {
        id: '9062',
        customer: 'Serenity Warren',
        plate: 'HON-2020',
        vehicle: '2020 Honda Civic Turbo',
        expectedCompletion: '1 day',
        services: [
          {
            name: 'Oil Change',
            status: 'completed',
            technicians: [technicians.value[1]],
            startTime: '2024-01-13T09:00:00',
            endTime: '2024-01-13T10:00:00'
          },
          {
            name: 'Air Filter Replacement',
            status: 'completed',
            technicians: [technicians.value[2]],
            startTime: '2024-01-13T10:00:00',
            endTime: '2024-01-13T10:30:00'
          }
        ],
        priority: 'urgent',
        timeSpent: '1/1',
        status: 'Paid',
        amount: '361.97',
        progress: '4/4',
        technicians: [technicians.value[1], technicians.value[2]]
      }
    ],
    color: '#9c27b0'
  }
]);

const searchFilter = ref({
  query: '',
  filterBy: 'order',
  selectedTechs: [] as string[],
  selectedAreas: [] as string[]
});

const handleSearch = (filters: { 
  query: string; 
  filterBy: 'order' | 'plate' | 'customer';
  selectedTechs: string[];
  selectedAreas: string[];
}) => {
  searchFilter.value = filters;
};

const columns = computed(() => {
  let filteredColumns = allColumns.value.map(column => ({
    ...column,
    items: [...column.items]
  }));

  // Apply text search filter
  if (searchFilter.value.query) {
    const query = searchFilter.value.query.toLowerCase();
    filteredColumns = filteredColumns.map(column => ({
      ...column,
      items: column.items.filter(item => {
        switch (searchFilter.value.filterBy) {
          case 'order':
            return item.id.toLowerCase().includes(query);
          case 'plate':
            return item.plate.toLowerCase().includes(query);
          case 'customer':
            return item.customer.toLowerCase().includes(query);
          default:
            return true;
        }
      })
    }));
  }

  // Apply technician filter
  if (searchFilter.value.selectedTechs.length > 0) {
    filteredColumns = filteredColumns.map(column => ({
      ...column,
      items: column.items.filter(item => 
        item.services.some(service => 
          service.technicians.some(tech => 
            searchFilter.value.selectedTechs.includes(tech.id)
          )
        )
      )
    }));
  }

  // Apply service area filter
  if (searchFilter.value.selectedAreas.length > 0) {
    filteredColumns = filteredColumns.map(column => ({
      ...column,
      items: column.items.filter(item => 
        item.services.some(service => 
          service.serviceArea && 
          searchFilter.value.selectedAreas.includes(service.serviceArea.id)
        )
      )
    }));
  }

  return filteredColumns;
});

const handleStatusChange = (cardId: string, newStatus: string) => {
  let card: ServiceCardType | null = null;
  let sourceColumn: Column | null = null;

  for (const column of allColumns.value) {
    const foundCard = column.items.find(item => item.id === cardId);
    if (foundCard) {
      card = foundCard;
      sourceColumn = column;
      break;
    }
  }

  if (card && sourceColumn) {
    sourceColumn.items = sourceColumn.items.filter(item => item.id !== cardId);
    card.status = newStatus;
    const targetColumn = allColumns.value.find(col => col.title === newStatus);
    if (targetColumn) {
      targetColumn.items.push(card);
    }
  }
};
</script>

<template>
  <div class="kanban-board">
    <h1>Work Board</h1>
    <FilterTools 
      @search="handleSearch"
      :available-technicians="technicians"
    />
    <div class="columns">
      <div
        v-for="column in columns"
        :key="column.title"
        class="column"
        :style="{ borderTop: `3px solid ${column.color}` }"
      >
        <div class="column-header" :style="{ color: column.color }">
          <h2>{{ column.title }}</h2>
          <span class="card-count">{{ column.items.length }}</span>
        </div>
        <draggable
          v-model="column.items"
          :group="{ name: 'cards' }"
          item-key="id"
          class="dragArea"
          handle=".card-header"
          :animation="150"
          ghost-class="ghost-card"
          chosen-class="chosen-card"
          drag-class="dragging"
        >
          <template #item="{ element }">
            <ServiceCard 
              :card="element" 
              :available-technicians="technicians"
              :columns="columns"
              @status-change="handleStatusChange"
            />
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-board {
  padding: 20px;
  height: 100vh;
  background: #f7f7f7;
}

h1 {
  color: #32363a;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 400;
}

.columns {
  display: flex;
  gap: 20px;
  height: calc(100% - 100px);
  overflow-x: auto;
  padding-bottom: 20px;
}

.column {
  flex: 1;
  min-width: 300px;
  background: #ffffff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.column-header h2 {
  font-size: 1rem;
  margin: 0;
  font-weight: 600;
}

.card-count {
  background: #f5f6f7;
  border: 1px solid #e5e5e5;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #515559;
}

.dragArea {
  min-height: 100px;
  height: calc(100% - 40px);
  overflow-y: auto;
}

.ghost-card {
  opacity: 0.5;
  background: #f0f0f0;
  border: 2px dashed #ccc !important;
}

.chosen-card {
  opacity: 0.8;
}

.dragging {
  opacity: 0.5;
  background: #f5f6f7;
  transform: rotate(2deg);
  cursor: grabbing !important;
}
</style>