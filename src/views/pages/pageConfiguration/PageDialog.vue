<script setup>
import { ref, computed, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  pageData: {
    type: Object,
    default: () => ({
      label: '',
      to: '',
      icon: '',
      parentId: null,
      sortNumber: 0,
      isSearchable: true,
      isNavigable: true,
      isSidebarItem: true
    })
  },
  availableIcons: {
    type: Array,
    required: true
  },
  pages: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'save', 'cancel']);

// Local form data copy
const formData = ref({ ...props.pageData });

  // Available parent options with tree structure display
const parentOptions = computed(() => {
  // If we're editing, we need to filter out the current page and its descendants
  if (props.isEdit && props.pageData.id) {
    return buildParentOptions(props.pages, props.pageData.id);
  }
  
  return buildParentOptions(props.pages);
});

// Build parent options with indentation to show hierarchy
function buildParentOptions(pagesArray, excludeId = null) {
  const result = [];
  
  // Helper function to recursively build options and exclude a branch
  function processPages(pages, depth = 0, path = []) {
    pages.forEach(page => {
      // Skip if this is the page we're editing or its descendant
      if (excludeId && (page.id === excludeId || path.includes(excludeId))) {
        return;
      }
      
      // Add indentation to the label based on depth
      const indent = '—'.repeat(depth);
      const displayLabel = depth > 0 ? `${indent} ${page.label}` : page.label;
      
      result.push({
        label: displayLabel,
        value: page.id
      });
      
      // Process children if any
      if (page.children && page.children.length > 0) {
        processPages(page.children, depth + 1, [...path, page.id]);
      }
    });
  }
  
  processPages(pagesArray);
  return result;
}

// Watch for changes to the pageData prop
watch(() => props.pageData, (newValue) => {
  formData.value = { ...newValue };
}, { deep: true });

// Watch for dialog visibility change
watch(() => props.visible, (newValue) => {
  if (newValue) {
    formData.value = { ...props.pageData };
  }
});

const headerText = computed(() => {
  return props.isEdit ? 'Edit Page' : 'Add New Page';
});

const submitButtonText = computed(() => {
  return props.isEdit ? 'Update' : 'Save';
});

const submitButtonIcon = computed(() => {
  return props.isEdit ? 'pi pi-check' : 'pi pi-plus';
});

const isFormValid = computed(() => {
  return formData.value.label && formData.value.to && formData.value.icon;
});

const handleSave = () => {
  emit('save', { ...formData.value });
};

const handleCancel = () => {
  emit('update:visible', false);
  emit('cancel');
};
</script>

<template>
  <Dialog 
    :visible="visible" 
    :header="headerText" 
    :style="{width: '50rem'}" 
    :modal="true" 
    class="p-fluid"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="grid">
      <div class="col-12">
        <div class="field">
          <label for="label" class="font-medium">Label *</label>
          <InputText id="label" v-model="formData.label" required autofocus />
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="route" class="font-medium">Route Path *</label>
          <InputText id="route" v-model="formData.to" placeholder="/example-path" required />
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="icon" class="font-medium">Icon *</label>
          <Dropdown id="icon" v-model="formData.icon" :options="availableIcons" placeholder="Select Icon" class="w-full">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center">
                <FontAwesomeIcon :icon="['fas', slotProps.value]" class="mr-2" />
                <div>{{ slotProps.value }}</div>
              </div>
              <span v-else>Select Icon</span>
            </template>
            <template #option="slotProps">
              <div class="flex align-items-center">
                <FontAwesomeIcon :icon="['fas', slotProps.option]" class="mr-2" />
                <div>{{ slotProps.option }}</div>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="parent" class="font-medium">Parent Page</label>
          <Dropdown id="parent" v-model="formData.parentId" :options="parentOptions" optionLabel="label" optionValue="value" placeholder="No Parent (Root)" class="w-full">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center">
                <div>{{ parentOptions.find(p => p.value === slotProps.value)?.label || 'No Parent' }}</div>
              </div>
              <span v-else>No Parent (Root)</span>
            </template>
            <template #option="slotProps">
              <div class="flex align-items-center">
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="sort" class="font-medium">Sort Number</label>
          <InputNumber id="sort" v-model="formData.sortNumber" showButtons class="w-full" />
        </div>
      </div>
      
      <div class="col-12">
        <div class="grid">
          <div class="col-12 md:col-4">
            <div class="field-checkbox">
              <Checkbox id="searchable" v-model="formData.isSearchable" binary />
              <label for="searchable" class="ml-2">Searchable</label>
            </div>
          </div>
          
          <div class="col-12 md:col-4">
            <div class="field-checkbox">
              <Checkbox id="navigable" v-model="formData.isNavigable" binary />
              <label for="navigable" class="ml-2">Navigable</label>
            </div>
          </div>
          
          <div class="col-12 md:col-4">
            <div class="field-checkbox">
              <Checkbox id="sidebar" v-model="formData.isSidebarItem" binary />
              <label for="sidebar" class="ml-2">Show in Sidebar</label>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="handleCancel" />
        <Button :label="submitButtonText" :icon="submitButtonIcon" @click="handleSave" :disabled="!isFormValid" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* Deep selectors for PrimeVue components */
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
</style>