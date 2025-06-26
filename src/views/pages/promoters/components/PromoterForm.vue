<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import { useForm } from 'vee-validate';

const { t } = useI18n();

const props = defineProps({
  visible: Boolean,
  promoter: Object,
  branches: Array,
  title: String,
  isEditing: Boolean
});

const emit = defineEmits(['save', 'cancel', 'update:visible']);

// Form validation schema
const schema = yup.object().shape({
  name: yup.string().required(t('validation.required', { field: t('promoters.name') })).max(100, t('validation.maxLength', { field: t('promoters.name'), max: 100 })),
  contactInfo: yup.string().max(50, t('validation.maxLength', { field: t('promoters.contactInfo'), max: 50 })),
  branchId: yup.number().required(t('validation.required', { field: t('promoters.branch') })).nullable()
});

// Initial form values
const initialValues = ref({
  name: '',
  contactInfo: '',
  branchId: null
});

// Form setup
const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
  validationSchema: schema,
  initialValues: initialValues.value
});

const [name, nameAttrs] = defineField('name');
const [contactInfo, contactInfoAttrs] = defineField('contactInfo');
const [branchId, branchIdAttrs] = defineField('branchId');

// Loading state
const saving = ref(false);

// Computed
const selectedBranch = computed({
  get() {
    return props.branches?.find(b => b.id === branchId.value) || null;
  },
  set(value) {
    branchId.value = value?.id || null;
  }
});

// Methods
const initializeForm = () => {
  if (props.promoter) {
    setValues({
      name: props.promoter.name || '',
      contactInfo: props.promoter.contactInfo || '',
      branchId: props.promoter.branchId || null
    });
  } else {
    resetForm();
  }
};

const handleSave = handleSubmit(async (validatedData) => {
  saving.value = true;
  try {
    await emit('save', validatedData);
  } finally {
    saving.value = false;
  }
});

const handleCancel = () => {
  resetForm();
  emit('cancel');
};

// Helper function to get promoter initials
const getPromoterInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    return words[0].substring(0, 2).toUpperCase();
  }
};

// Watchers
watch(() => props.visible, (newValue) => {
  if (newValue) {
    initializeForm();
  }
});

watch(() => props.promoter, () => {
  if (props.visible) {
    initializeForm();
  }
});
</script>

<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="true"
    :style="{ width: '600px' }"
    :header="title"
    @update:visible="$emit('update:visible', $event)"
    class="promoter-dialog"
  >
    <form @submit.prevent="handleSave" class="flex flex-column gap-4">
      <!-- Promoter Name -->
      <div class="field">
        <label for="name" class="block font-medium mb-2 required">
          {{ t('promoters.name') }}
        </label>
        <InputText
          id="name"
          v-model="name"
          v-bind="nameAttrs"
          :class="{ 'p-invalid': !!errors.name }"
          :placeholder="t('promoters.namePlaceholder')"
          class="w-full"
          maxlength="100"
        />
        <small v-if="errors.name" class="p-error">
          {{ errors.name }}
        </small>
      </div>

      <!-- Branch Selection -->
      <div class="field">
        <label for="branch" class="block font-medium mb-2 required">
          {{ t('promoters.branch') }}
        </label>
        <Dropdown
          id="branch"
          v-model="selectedBranch"
          v-bind="branchIdAttrs"
          :options="branches"
          optionLabel="name"
          :placeholder="t('promoters.selectBranch')"
          :class="{ 'p-invalid': !!errors.branchId }"
          class="w-full"
          filter
        >
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex align-items-center gap-2">
              <div class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle" 
                   style="width: 24px; height: 24px; font-size: 10px; font-weight: bold;">
                {{ slotProps.value.name?.charAt(0)?.toUpperCase() }}
              </div>
              <span>{{ slotProps.value.name }}</span>
            </div>
            <span v-else class="text-500">{{ slotProps.placeholder }}</span>
          </template>
          
          <template #option="slotProps">
            <div class="flex align-items-center gap-2 p-2">
              <div class="flex align-items-center justify-content-center bg-primary text-primary-contrast border-circle" 
                   style="width: 32px; height: 32px; font-size: 12px; font-weight: bold;">
                {{ slotProps.option.name?.charAt(0)?.toUpperCase() }}
              </div>
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Dropdown>
        <small v-if="errors.branchId" class="p-error">
          {{ errors.branchId }}
        </small>
      </div>

      <!-- Contact Info -->
      <div class="field">
        <label for="contactInfo" class="block font-medium mb-2">
          {{ t('promoters.contactInfo') }}
        </label>
        <InputText
          id="contactInfo"
          v-model="contactInfo"
          v-bind="contactInfoAttrs"
          :class="{ 'p-invalid': !!errors.contactInfo }"
          :placeholder="t('promoters.contactInfoPlaceholder')"
          class="w-full"
          maxlength="50"
        />
        <small v-if="errors.contactInfo" class="p-error">
          {{ errors.contactInfo }}
        </small>
        <small class="text-500 block mt-1">
          {{ t('promoters.contactInfoHint') }}
        </small>
      </div>
    </form>

      <div class="flex justify-content-end gap-2">
        <Button
          :label="t('common.cancel')"
          severity="secondary"
          @click="handleCancel"
          :disabled="saving"
        />
        <Button
          :label="isEditing ? t('common.update') : t('common.create')"
          @click="handleSave"
          :loading="saving"
        />
      </div>
  </Dialog>
</template>

<style scoped>
.promoter-dialog :deep(.p-dialog-content) {
  padding: 1.5rem;
}

.field {
  margin-bottom: 0;
}

.field:last-child {
  margin-bottom: 0;
}

.required::after {
  content: " *";
  color: #e24c4c;
}

:deep(.p-dropdown .p-dropdown-label) {
  display: flex;
  align-items: center;
}

:deep(.p-error) {
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
  color: #e24c4c;
}
</style>