<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import apiClient from '@/api/apiClient';
import { Search, Edit, Trash2, Plus, ChevronDown, ChevronUp, Check, X, Move } from 'lucide-vue-next';
import { useMainStore } from '@/stores/mainStore';
import draggable from 'vuedraggable';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faHouse, faGlobe, faHouseUser, faUsers, faGears, faFileInvoice,
  faMoneyBill, faCashRegister, faLayerGroup, faShop, faRecycle,
  faBuilding, faPuzzlePiece, faMoneyBillTransfer, faRoute,
  faPenFancy, faEnvelope, faTicket, faDollarSign,
  faArrowsSplitUpAndLeft, faGauge, faCalendarDays, faBusinessTime,
  faBullseye, faEyeLowVision, faTruck, faStreetView, faUser,
  faUpload, faFile, faShieldHalved, faSitemap, faMountainCity, faCity, faCodeBranch
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import PageTreeNode from './PageTreeNode.vue';
import PageDialog from './PageDialog.vue';

// Add all needed icons to the library
library.add(
  faHouse, faGlobe, faHouseUser, faUsers, faGears, faFileInvoice,
  faMoneyBill, faCashRegister, faLayerGroup, faShop, faRecycle,
  faBuilding, faPuzzlePiece, faMoneyBillTransfer, faRoute,
  faPenFancy, faEnvelope, faTicket, faDollarSign,
  faArrowsSplitUpAndLeft, faGauge, faCalendarDays, faBusinessTime,
  faBullseye, faEyeLowVision, faTruck, faStreetView, faUser,
  faUpload, faFile, faShieldHalved, faSitemap, faMountainCity, faCity, faCodeBranch
);

// Store and state management
const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);
const containerClass = computed(() => ({
  rtl: mainStore.isRTL,
  ltr: !mainStore.isRTL
}));

// Pages data
const pages = ref([]);
const filteredPages = ref([]);
const searchTerm = ref('');
const isDialogVisible = ref(false);
const isDialogEditMode = ref(false);
const isDeleteModalVisible = ref(false);
const selectedPage = ref(null);
const loading = ref(true);
const expandedNodes = ref({});
const reorderMode = ref(false);
const pageTree = ref([]);

// Form state for adding/editing
const dialogFormData = ref({
  label: '',
  to: '',
  icon: '',
  parentId: null,
  sortNumber: 0,
  isSearchable: true,
  isNavigable: true,
  isSidebarItem: true,
});

// Icons available in the system
const availableIcons = [
  'house', 'globe', 'house-user', 'users', 'gears', 'file-invoice', 
  'money-bill', 'cash-register', 'layer-group', 'shop', 'recycle', 
  'building', 'puzzle-piece', 'money-bill-transfer', 'route', 
  'pen-fancy', 'envelope', 'ticket', 'dollar-sign', 
  'arrows-split-up-and-left', 'gauge', 'calendar-days', 'business-time', 
  'bullseye', 'eye-low-vision', 'truck', 'street-view', 'user', 
  'upload', 'file', 'shield-halved', 'sitemap', 'mountain-city', 'city', 'code-branch'
];

// Filters
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Pagination
const currentPage = ref(0);
const rowsPerPage = ref(10);
const totalRecords = ref(0);
const first = ref(0);

// Functions for working with hierarchical data
const buildPageTree = () => {
  // Create a map of all pages by ID
  const pageMap = {};
  
  // Create a deep copy of each page to avoid reference issues
  const pagesData = filteredPages.value || pages.value;
  pagesData.forEach(page => {
    pageMap[page.id] = { 
      ...page, 
      children: [] 
    };
  });
  
  // Build the tree structure
  const tree = [];
  
  pagesData.forEach(page => {
    const pageWithChildren = pageMap[page.id];
    
    if (!page.parentId) {
      // This is a root page
      tree.push(pageWithChildren);
    } else if (pageMap[page.parentId]) {
      // This is a child page, add to its parent's children array
      pageMap[page.parentId].children.push(pageWithChildren);
    } else {
      // Parent doesn't exist (should not happen in properly structured data)
      // Add as a root node instead
      tree.push(pageWithChildren);
    }
  });
  
  // Sort the tree (and sub-trees) by sortNumber
  const sortTree = (nodes) => {
    nodes.sort((a, b) => a.sortNumber - b.sortNumber);
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortTree(node.children);
      }
    });
  };
  
  sortTree(tree);
  pageTree.value = tree;
};

// Function to flatten a tree structure back to a flat list
const flattenTree = (tree, parentId = null, result = []) => {
  tree.forEach((node, index) => {
    const flatNode = { ...node };
    delete flatNode.children; // Remove the children property
    flatNode.parentId = parentId;
    flatNode.sortNumber = index + 1; // Update sort number based on position
    
    result.push(flatNode);
    
    // Recursively flatten children
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, node.id, result);
    }
  });
  
  return result;
};

// Functions for API interactions
const fetchPages = async () => {
  try {
    loading.value = true;
    // In a real application, you would fetch this from the server
    const response = await apiClient.get('/Pages');
    pages.value = response.data.data;
    filteredPages.value = response.data.data;
    totalRecords.value = response.data.data.length;
    
    // Build the tree structure
    buildPageTree();
    
    loading.value = false;
  } catch (error) {
    console.error('Error fetching pages:', error);
    mainStore.loading.setNotificationInfo('error', 'Failed to fetch pages');
    loading.value = false;
  }
};

const handleSearch = (event) => {
  const term = event.target.value.toLowerCase();
  searchTerm.value = term;
  
  if (term.trim() === '') {
    filteredPages.value = pages.value;
  } else {
    const filtered = pages.value.filter(page => 
      page.label.toLowerCase().includes(term) || 
      (page.to && page.to.toLowerCase().includes(term))
    );
    filteredPages.value = filtered;
  }
  
  // Rebuild the tree with filtered pages
  buildPageTree();
};

const openAddDialog = () => {
  dialogFormData.value = {
    label: '',
    to: '',
    icon: '',
    parentId: null,
    sortNumber: 0,
    isSearchable: true,
    isNavigable: true,
    isSidebarItem: true,
  };
  isDialogEditMode.value = false;
  isDialogVisible.value = true;
};

const openEditDialog = (page) => {
  selectedPage.value = page;
  dialogFormData.value = {
    id: page.id,
    label: page.label,
    to: page.to || '',
    icon: page.icon || '',
    parentId: page.parentId || null,
    sortNumber: page.sortNumber,
    isSearchable: page.isSearchable,
    isNavigable: page.isNavigable,
    isSidebarItem: page.isSidebarItem,
    uniqueIdentifier: page.uniqueIdentifier,
    createdAt: page.createdAt
  };
  isDialogEditMode.value = true;
  isDialogVisible.value = true;
};

const openDeleteDialog = (page) => {
  selectedPage.value = page;
  isDeleteModalVisible.value = true;
};

const addPage = async (formData) => {
  try {
    loading.value = true;
    
    // In a real application, you would post to the server
    /*
    const response = await apiClient.post('/api/Pages/AddNewPagetoAllRoles', formData);
    if (response.data.success) {
      const newPage = response.data.data;
      pages.value.push(newPage);
      buildPageTree();
      isDialogVisible.value = false;
      mainStore.loading.setNotificationInfo('success', response.data.message);
    }
    */
    
    // Mock successful response for demo
    const newId = Math.max(...pages.value.map(page => page.id), 0) + 1;
    const newPage = {
      ...formData,
      id: newId,
      uniqueIdentifier: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    pages.value.push(newPage);
    filteredPages.value = [...pages.value];
    
    // Rebuild the tree
    buildPageTree();
    
    // Close the dialog
    isDialogVisible.value = false;
    
    // In a real app, you would show a success notification
    mainStore.loading.setNotificationInfo('success', 'Page added successfully');
    loading.value = false;
  } catch (error) {
    console.error('Error adding page:', error);
    mainStore.loading.setNotificationInfo('error', 'Failed to add page');
    loading.value = false;
  }
};

const updatePage = async (formData) => {
  try {
    loading.value = true;
    
    // In a real application, you would put to the server
    /*
    const response = await apiClient.put(`/api/Pages/${formData.id}`, formData);
    if (response.data.success) {
      const updatedPage = response.data.data;
      const index = pages.value.findIndex(p => p.id === formData.id);
      if (index !== -1) {
        pages.value[index] = updatedPage;
      }
      buildPageTree();
      isDialogVisible.value = false;
      mainStore.loading.setNotificationInfo('success', response.data.message);
    }
    */
    
    // Mock successful response for demo
    const updatedPage = { ...formData };
    
    const index = pages.value.findIndex(p => p.id === formData.id);
    if (index !== -1) {
      pages.value[index] = updatedPage;
    }
    
    filteredPages.value = [...pages.value];
    
    // Rebuild the tree
    buildPageTree();
    
    // Close the dialog
    isDialogVisible.value = false;
    
    // In a real app, you would show a success notification
    mainStore.loading.setNotificationInfo('success', 'Page updated successfully');
    loading.value = false;
  } catch (error) {
    console.error('Error updating page:', error);
    mainStore.loading.setNotificationInfo('error', 'Failed to update page');
    loading.value = false;
  }
};

const deletePage = async () => {
  try {
    loading.value = true;
    
    const pageIdsToRemove = new Set();
    
    // Helper function to collect all descendant IDs recursively
    const collectDescendantIds = (pageId) => {
      const findChildrenInTree = (nodes, targetId) => {
        for (const node of nodes) {
          if (node.id === targetId) {
            return node.children || [];
          }
          
          if (node.children && node.children.length > 0) {
            const result = findChildrenInTree(node.children, targetId);
            if (result.length) return result;
          }
        }
        
        return [];
      };
      
      const children = findChildrenInTree(pageTree.value, pageId);
      
      children.forEach(child => {
        pageIdsToRemove.add(child.id);
        collectDescendantIds(child.id);
      });
    };
    
    // Add the selected page ID and all its descendants
    pageIdsToRemove.add(selectedPage.value.id);
    collectDescendantIds(selectedPage.value.id);
    
    // In a real application, you would delete from the server
    /*
    const response = await apiClient.delete(`/api/Pages/${selectedPage.value.id}`);
    if (response.data.success) {
      const updatedPages = pages.value.filter(p => !pageIdsToRemove.has(p.id));
      pages.value = updatedPages;
      filteredPages.value = updatedPages;
      buildPageTree();
      isDeleteModalVisible.value = false;
      mainStore.loading.setNotificationInfo('success', response.data.message);
    }
    */
    
    // Mock successful response for demo
    const updatedPages = pages.value.filter(p => !pageIdsToRemove.has(p.id));
    pages.value = updatedPages;
    filteredPages.value = updatedPages;
    
    // Rebuild the tree
    buildPageTree();
    
    // Close the modal
    isDeleteModalVisible.value = false;
    
    // In a real app, you would show a success notification
    mainStore.loading.setNotificationInfo('success', 'Page deleted successfully');
    loading.value = false;
  } catch (error) {
    console.error('Error deleting page:', error);
    mainStore.loading.setNotificationInfo('error', 'Failed to delete page');
    loading.value = false;
  }
};

// Save the reordering changes to the backend
const saveReordering = async () => {
  try {
    loading.value = true;
    
    // Flatten the tree to get updated sort numbers and parent-child relationships
    const updatedPages = flattenTree(pageTree.value);
    
    // In a real application, you would send the updates to the server
    /*
    const response = await apiClient.post('/api/Pages/UpdateOrder', updatedPages);
    if (response.data.success) {
      // Update the local data
      pages.value = updatedPages;
      filteredPages.value = [...updatedPages];
      reorderMode.value = false;
      buildPageTree();
      mainStore.loading.setNotificationInfo('success', response.data.message);
    }
    */
    
    // Mock successful response for demo
    pages.value = updatedPages;
    filteredPages.value = [...updatedPages];
    
    // Exit reorder mode
    reorderMode.value = false;
    
    // Rebuild the tree
    buildPageTree();
    
    // In a real app, you would show a success notification
    mainStore.loading.setNotificationInfo('success', 'Page order updated successfully');
    loading.value = false;
  } catch (error) {
    console.error('Error saving page order:', error);
    mainStore.loading.setNotificationInfo('error', 'Failed to save page order');
    loading.value = false;
  }
};

// UI Helper functions
const toggleExpand = (id) => {
  expandedNodes.value = {
    ...expandedNodes.value,
    [id]: !expandedNodes.value[id]
  };
};

// Handle dialog save based on mode
const handleDialogSave = (formData) => {
  if (isDialogEditMode.value) {
    updatePage(formData);
  } else {
    addPage(formData);
  }
};

// Handle drop events for drag and drop reordering
const handleDrop = (data) => {
  // The tree will be updated automatically through v-model binding
  console.log('Drop event:', data);
  
  // For debugging - log the current tree structure
  console.log('Current tree structure:', JSON.stringify(pageTree.value, null, 2));
  
  // If we need to manually update parentId references
  if (data.type === 'added') {
    // Find the page in the flat list and update its parentId
    const pageIndex = pages.value.findIndex(p => p.id === data.item.id);
    if (pageIndex !== -1) {
      pages.value[pageIndex].parentId = data.parentId;
    }
  }
};

// Initialize component
onMounted(() => {
  fetchPages();
});

// Watch for changes that require updating the tree
watch([pages], () => {
  buildPageTree();
}, { deep: true });
</script>

<template>
  <div :class="['p-6', containerClass]">
    <div class="card">
      <div class="card-header">
        <div class="flex justify-content-between align-items-center mb-3">
          <h1 class="text-2xl font-bold text-primary m-0">Page Configuration</h1>
          <div class="flex gap-2">
            <Button v-if="!reorderMode" @click="reorderMode = true" 
              class="p-button-success" icon="pi pi-sort-alt" label="Reorder Pages" />
            <Button v-if="reorderMode" @click="saveReordering" 
              class="p-button-primary" icon="pi pi-check" label="Save Order" />
            <Button v-if="reorderMode" @click="reorderMode = false" 
              class="p-button-secondary" icon="pi pi-times" label="Cancel" />
            <Button v-if="!reorderMode" @click="openAddDialog"
              class="p-button-primary" icon="pi pi-plus" label="Add New Page" />
          </div>
        </div>
        
        <div class="p-inputgroup mb-3" v-if="!reorderMode">
          <span class="p-inputgroup-addon">
            <i class="pi pi-search"></i>
          </span>
          <InputText
            placeholder="Search pages..."
            v-model="searchTerm"
            @input="handleSearch"
            class="w-full"
          />
        </div>
      </div>
      
      <div class="card-body p-0">
        <ProgressSpinner v-if="loading" class="w-full flex justify-content-center my-4" />
        
        <div v-else>
          <!-- Regular View Mode -->
          <div v-if="!reorderMode" class="page-list tree-view">
            <div v-if="pageTree.length > 0">
              <div v-for="page in pageTree" :key="page.id" class="page-item">
                <PageTreeNode
                  :node="page"
                  :expanded="expandedNodes"
                  :reorderMode="false"
                  :depth="0"
                  @toggle-expand="toggleExpand"
                  @edit="openEditDialog"
                  @delete="openDeleteDialog"
                />
              </div>
            </div>
            <div v-else class="p-4 text-center text-color-secondary">
              No pages found.
            </div>
          </div>
          
          <!-- Reorder Mode -->
          <div v-else class="reorder-mode">
            <div class="p-3 bg-primary-100 font-medium text-primary">Page Structure</div>
            <p class="p-2 text-sm text-color-secondary">
              Drag and drop pages to reorder them. Pages can be nested to create a hierarchy.
            </p>
            <draggable 
              v-model="pageTree" 
              item-key="id"
              handle=".drag-handle"
              ghost-class="bg-primary-50"
              group="pages"
              :animation="200"
              class="min-h-2rem p-2"
            >
              <template #item="{element: page}">
                <PageTreeNode
                  :node="page"
                  :expanded="expandedNodes"
                  :reorderMode="true"
                  :depth="0"
                  @toggle-expand="toggleExpand"
                  @edit="openEditDialog"
                  @delete="openDeleteDialog"
                  @drop="handleDrop"
                />
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Page Add/Edit Dialog -->
    <PageDialog
      v-model:visible="isDialogVisible"
      :isEdit="isDialogEditMode"
      :pageData="dialogFormData"
      :availableIcons="availableIcons"
      :pages="pageTree"
      @save="handleDialogSave"
    />
    
    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="isDeleteModalVisible" header="Delete Page" :style="{width: '30rem'}" :modal="true" v-if="selectedPage">
      <div class="flex flex-column align-items-center p-4">
        <i class="pi pi-exclamation-triangle text-5xl text-orange-500 mb-4"></i>
        <h3 class="font-bold text-lg">Delete Page</h3>
        <p class="text-center mb-0">
          Are you sure you want to delete the page "{{ selectedPage.label }}"?
          <span v-if="selectedPage.children && selectedPage.children.length > 0" class="block text-red-500 font-medium mt-2">
            Warning: This will also delete all child pages!
          </span>
        </p>
      </div>
      
      <template #footer>
        <div class="flex justify-content-end gap-2">
          <Button label="No" icon="pi pi-times" class="p-button-text" @click="isDeleteModalVisible = false" />
          <Button label="Yes" icon="pi pi-trash" class="p-button-danger" @click="deletePage" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Drag handle styling */
.drag-handle {
  cursor: grab;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.min-h-2rem {
  min-height: 2rem;
}

/* RTL Support */
.rtl {
  direction: rtl;
}

.rtl .ml-4,
.rtl .mr-2,
.rtl .mr-3 {
  margin-left: 0;
  margin-right: 1rem;
}

.rtl .drag-handle {
  margin-left: 0.5rem;
  margin-right: 0;
}

.rtl .border-left-1 {
  border-left: none !important;
  border-right: 1px solid var(--surface-border);
}

.rtl .pi-chevron-down.rotate-180 {
  transform: rotate(-180deg);
}

/* Card styling */
.card {
  background: var(--surface-card);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.card-header {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
}

.card-body {
  padding: 0;
}

/* Page list styling */
.page-list {
  max-height: 700px;
  overflow-y: auto;
  padding: 0.5rem;
}

.tree-view {
  background-color: var(--surface-ground);
  border-radius: var(--border-radius);
}

.page-item {
  margin-bottom: 0.5rem;
}

.page-item:last-child > div {
  border-bottom: none !important;
}

/* PrimeVue component overrides */
:deep(.p-paginator) {
  background-color: transparent;
  border: none;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight) {
  background-color: var(--highlight-bg);
  color: var(--highlight-text-color);
}

:deep(.p-dialog .p-dialog-header) {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-dialog .p-dialog-content) {
  padding: 1.5rem;
}

:deep(.p-dialog .p-dialog-footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--surface-border);
  display: flex;
  justify-content: flex-end;
}

:deep(.p-field) {
  margin-bottom: 1.5rem;
}

:deep(.p-inputtext) {
  width: 100%;
}

.reorder-mode {
  background-color: var(--surface-ground);
  border-radius: var(--border-radius);
}
</style>