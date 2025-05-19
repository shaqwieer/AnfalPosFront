<script setup>
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import draggable from 'vuedraggable';

// Define the component name for self-reference
const name = 'PageTreeNode';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  expanded: {
    type: Object,
    required: true
  },
  reorderMode: {
    type: Boolean,
    default: false
  },
  depth: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['toggle-expand', 'edit', 'delete', 'drop']);

const toggleExpand = () => {
  emit('toggle-expand', props.node.id);
};

const handleEdit = () => {
  emit('edit', props.node);
};

const handleDelete = () => {
  emit('delete', props.node);
};

const handleDrop = (event) => {
  if (event.added) {
    // An item was added to this container
    const newItem = event.added.element;
    console.log('Item added to', props.node.label, ':', newItem);
    
    // The item's parentId should be updated
    newItem.parentId = props.node.id;
    
    emit('drop', {
      type: 'added',
      parentId: props.node.id,
      item: newItem,
      event: event
    });
  } else if (event.removed) {
    // An item was removed from this container
    console.log('Item removed from', props.node.label, ':', event.removed.element);
    emit('drop', {
      type: 'removed',
      parentId: props.node.id,
      item: event.removed.element,
      event: event
    });
  } else if (event.moved) {
    // An item was moved within this container
    console.log('Item reordered within', props.node.label);
    emit('drop', {
      type: 'reordered',
      parentId: props.node.id,
      event: event
    });
  }
};

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

const isExpanded = computed(() => {
  return props.expanded[props.node.id];
});

/* For indentation based on depth */
const leftPadding = computed(() => {
  // Add more padding for each level of depth
  // Base padding of 1rem + 2rem per level of depth
  return (1 + props.depth * 2) + 'rem';
});

// For the child container indentation
const childIndent = computed(() => {
  return (props.depth + 1) * 1.5 + 'rem';
});
</script>

<template>
  <div class="page-node">
    <!-- Regular View Mode -->
    <div v-if="!reorderMode" 
         class="flex align-items-center p-3 border-bottom-1 surface-border hover:surface-hover transition-colors transition-duration-150 tree-node"
         :style="{ paddingLeft: leftPadding }"
         :class="{'child-node': depth > 0}">
      <!-- Connection line for children -->
      <div v-if="depth > 0" class="tree-branch-line"></div>
      
      <div class="flex-1 flex align-items-center">
        <Button v-if="hasChildren"
          @click="toggleExpand"
          icon="pi pi-chevron-down"
          :class="{'p-button-rounded p-button-text p-button-plain expand-button': true, 'rotate-180': isExpanded}"
          size="small"
        />
        <div v-else class="ml-2 node-spacer"></div>
        
        <div class="w-2rem h-2rem flex align-items-center justify-content-center rounded-md bg-primary-100 text-primary mr-3 node-icon">
          <FontAwesomeIcon :icon="['fas', node.icon]" />
        </div>
        
        <div class="flex-1 node-content">
          <div class="font-medium node-label">{{ node.label }}</div>
          <div class="text-sm text-color-secondary node-path">{{ node.to || '/' }}</div>
        </div>
      </div>
      
      <div class="flex gap-2 node-actions">
        <Button @click="handleEdit"
          icon="pi pi-pencil"
          class="p-button-text p-button-rounded" 
          size="small"
        />
        <Button @click="handleDelete"
          icon="pi pi-trash"
          class="p-button-text p-button-rounded p-button-danger" 
          size="small"
        />
      </div>
    </div>
    
    <!-- Reorder Mode -->
    <div v-else 
         class="p-3 border-bottom-1 surface-border bg-white"
         :style="{ paddingLeft: leftPadding }">
      <div class="flex align-items-center">
        <div class="drag-handle cursor-move p-2 mr-2 surface-200 hover:surface-300 transition-colors transition-duration-150 rounded-md">
          <i class="pi pi-bars"></i>
        </div>
        
        <div class="w-2rem h-2rem flex align-items-center justify-content-center rounded-md bg-primary-100 text-primary mr-3">
          <FontAwesomeIcon :icon="['fas', node.icon]" />
        </div>
        
        <div class="flex-1">
          <div class="font-medium">{{ node.label }}</div>
          <div class="text-sm text-color-secondary">{{ node.to || '/' }}</div>
        </div>
        
        <Button v-if="hasChildren"
          @click="toggleExpand"
          icon="pi pi-chevron-down"
          :class="{'p-button-rounded p-button-text p-button-plain': true, 'rotate-180': isExpanded}"
          size="small"
        />
      </div>
    </div>
    
    <!-- Children container for reorder mode -->
    <div v-if="reorderMode && isExpanded && hasChildren" 
         class="pl-4 ml-4 border-left-1 surface-border bg-gray-50">
      <div class="p-2 text-sm text-color-secondary">Child Pages of "{{ node.label }}"</div>
      <draggable 
        v-model="node.children" 
        item-key="id"
        handle=".drag-handle"
        ghost-class="bg-primary-50"
        group="pages"
        :animation="200"
        class="min-h-2rem"
        @change="handleDrop"
      >
        <template #item="{element: child}">
          <PageTreeNode
            :node="child"
            :expanded="expanded"
            :reorderMode="reorderMode"
            :depth="depth + 1"
            @toggle-expand="$emit('toggle-expand', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @drop="$emit('drop', $event)"
          />
        </template>
      </draggable>
    </div>
    
    <!-- Drop zone for when node has no children -->
    <div v-if="reorderMode && (!hasChildren || !isExpanded)" 
         class="empty-drop-zone ml-4 pl-4 mt-1 mb-1">
      <draggable
        v-model="node.children"
        item-key="id"
        group="pages"
        :animation="200"
        ghost-class="bg-primary-50"
        class="drop-zone border-dashed border-1 surface-border p-2 text-center text-color-secondary"
        @change="handleDrop"
      >
        <template #header>
          <div class="empty-indicator">Drop here to add child pages to "{{ node.label }}"</div>
        </template>
        <template #item="{element: child}">
          <PageTreeNode
            :node="child"
            :expanded="expanded"
            :reorderMode="reorderMode"
            :depth="depth + 1"
            @toggle-expand="$emit('toggle-expand', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @drop="$emit('drop', $event)"
          />
        </template>
      </draggable>
    </div>
    
    <!-- Children container for normal view mode -->
    <div v-if="!reorderMode && isExpanded && hasChildren" class="child-container">
      <div v-for="child in node.children" :key="child.id" class="child-wrapper">
        <div class="tree-child-indicator"></div>
        <PageTreeNode
          :node="child"
          :expanded="expanded"
          :reorderMode="reorderMode"
          :depth="depth + 1"
          @toggle-expand="$emit('toggle-expand', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-node {
  position: relative;
}

/* Tree styling */
.tree-node {
  position: relative;
  border-radius: 4px;
  margin: 2px 0;
}

.child-node {
  position: relative;
  margin-left: 1.5rem;
  border-left: 1px dashed var(--surface-border);
  border-radius: 0 4px 4px 0;
}

.tree-branch-line {
  position: absolute;
  left: -16px;
  width: 16px;
  height: 50%;
  border-bottom: 1px dashed var(--surface-border);
}

.child-container {
  position: relative;
  padding-left: 0.5rem;
}

.child-wrapper {
  position: relative;
}

.tree-child-indicator {
  position: absolute;
  left: -1rem;
  top: 1.5rem;
  width: 1rem;
  height: calc(100% - 1.5rem);
  border-left: 1px dashed var(--surface-border);
}

.child-container .child-wrapper:last-child .tree-child-indicator {
  border-bottom-left-radius: 8px;
  border-bottom: 1px dashed var(--surface-border);
}

.expand-button {
  transition: transform 0.2s ease-in-out;
}

.node-icon {
  background-color: var(--primary-50);
  border: 1px solid var(--primary-100);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.node-content {
  padding: 0.25rem 0;
}

.node-label {
  font-weight: 600;
  color: var(--text-color);
}

.node-path {
  color: var(--text-color-secondary);
}

.node-actions {
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

/* Drag and drop styling */
.drag-handle {
  cursor: grab;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.rotate-180 {
  transform: rotate(180deg);
}

.drop-zone {
  min-height: 40px;
}

.empty-indicator {
  padding: 8px;
  font-style: italic;
}

/* Draggable ghost styling */
.ghost {
  opacity: 0.5;
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
}

/* For hover indicators */
.page-node:hover > .drop-indicator {
  display: block;
}
</style>