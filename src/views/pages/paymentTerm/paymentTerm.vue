<template>
  <div class="flex flex-column gap-2 px-6">
    <!-- <PageTopBar v-model:searchText="filters['global'].value" :title="t(`baseLookup.${name}`)" :addText="t('baseLookup.createButtonLabel')" simple :addButton="openCreateDialog"></PageTopBar> -->
    <div class="flex justify-content-between h-fit">
      <div>
        <h2 class="m-0">{{ t(`paymentTerm`) }}</h2>
      </div>

      <div class="flex gap-3">
        <IconField iconPosition="left">
          <InputText type="text" v-model="searchText" :placeholder="t('labels.search')" class="w-full" />
          <InputIcon class="pi pi-search" />
        </IconField>

        <!-- <Button :label="t('users.createButtonLabel')" v-tooltip.top="t('users.createButtonLabel')" class="w-full md:w-12rem h-fit" icon="pi pi-plus" @click="CreateCustomerCode(true, {}, false)" /> -->
        <Button :label="t('users.createButtonLabel')" v-tooltip.top="t('users.createButtonLabel')" class="w-full md:w-12rem h-fit" icon="pi pi-plus" @click="openCreateDialog(true, {}, false)" />
      </div>
    </div>
    <p class="font-medium">{{ t('users.description') }}</p>
    <DataTable
      :value="paginatedCustomers"
      dataKey="id"
      :rows="10"
      :filters="filters"
      :globalFilterFields="['name', 'id']"
      class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border"
      :paginatorTemplate="
        mainStore.isRTL ? 'RowsPerPageDropdown NextPageLink LastPageLink  PageLinks FirstPageLink PrevPageLink  CurrentPageReport ' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
      "
      :rowsPerPageOptions="[5, 10, 25]"
      :currentPageReportTemplate="''"
    >
      <template #empty>
        <div class="flex justify-content-center align-items-center font-bold text-lg">
          {{ t(`baseLookup.empty${name}`) }}
        </div>
      </template>

      <Column field="ID" :header="t('labels.ID')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.id }}</span>
          </div>
        </template>
      </Column>

      <Column field="Code" :header="t('labels.Code')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.code }}</span>
          </div>
        </template>
      </Column>

      <Column field="Description" :header="t('labels.Description')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.description }}</span>
          </div>
        </template>
      </Column>

      <Column field="Days" :header="t('labels.Days')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.days }}</span>
          </div>
        </template>
      </Column>

      <Column field="actions">
        <template #header="">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md px-3">{{ t('labels.actions') }}</span>
          </div>
        </template>

        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-trash"
              v-tooltip.top="t('users.deleteTooltip')"
              text
              rounded
              aria-label="Delete"
              severity="danger"
              @click="
                () => {
                  deleteText = slotProps.data.name;
                  deletedKey = slotProps.data.id;
                  deleteDialogVisible = true;
                }
              "
            />
            <Button
              icon="pi pi-pencil"
              v-tooltip.top="t('users.updateTooltip')"
              text
              rounded
              aria-label="Update"
              severity="success"
              @click="
                () => {
                  editItem(slotProps.data);
                }
              "
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Paginator :rows="rowsPerPage" :totalRecords="entities.length" @page="onPageChange" />
  </div>

  <Dialog v-model:visible="visible" :breakpoints="{ '640px': '25rem' }" :header="t(`baseLookup.edit`) + ' ' + name" :class="containerClass" :style="{ width: '35rem' }" :modal="true" :closable="false">
    <div class="flex flex-column gap-4 p-4">
      <div class="field flex flex-column">
        <label for="code" class="">{{ t(`labels.Code`) }}</label>
        <InputText id="code" v-model="editCode" v-bind="editCodeAttrs" autofocus :invalid="!!errors.editCode" />
        <small v-if="errors.editCode" class="text-red-600">{{ errors.editCode }}</small>
      </div>

      <div class="field flex flex-column">
        <label for="editDescription" class="">{{ t(`labels.Description`) }}</label>
        <InputText id="editDescription" v-model="editDescription" v-bind="editDescriptionAttrs" autofocus :invalid="!!errors.editDescription" />
        <small v-if="errors.editDescription" class="text-red-600">{{ errors.editDescription }}</small>
      </div>

      <div class="field flex flex-column">
        <label for="editDays" class="">{{ t(`labels.Days`) }}</label>
        <InputText id="editDays" v-model="editDays" v-bind="editDaysAttrs" autofocus :invalid="!!errors.editDays" />
        <small v-if="errors.editDays" class="text-red-600">{{ errors.editDays }}</small>
      </div>

      <div v-if="!isEdit" class="field flex flex-column">
        <label for="editId" class="">{{ t(`labels.ID`) }}</label>
        <InputText id="editId" v-model="editId" v-bind="editIdAttrs" autofocus :invalid="!!errors.editId" />
        <small v-if="errors.editId" class="text-red-600">{{ errors.editId }}</small>
      </div>

      <div class="flex justify-content-end gap-3 pt-2">
        <Button :label="t('RoleCreateUpdateDialog.addButton')" v-if="!isEdit" icon="pi pi-check" @click="createData" />
        <Button :label="t('RoleCreateUpdateDialog.updateButton')" v-else icon="pi pi-check" @click="updateData" />
        <Button
          :label="t('RoleCreateUpdateDialog.cancelButton')"
          severity="danger"
          icon="pi pi-times"
          outlined
          @click="
            () => {
              visible = false;
              resetForm();
            }
          "
        />
      </div>
    </div>
  </Dialog>

  <DeleteDialog
    v-model="deleteDialogVisible"
    :confirmDelete="
      () => {
        confirmDelete();
      }
    "
    :deleteText="deleteText"
    :deletedKey="deletedKey"
  />
</template>

<script setup>
import DeleteDialog from '@/components/DeleteDialog.vue';
import { handleError } from '@/utilities/errorHandler';
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, computed } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import apiClient from '@/api/apiClient';
import { useMainStore } from '@/stores/mainStore';
import { useForm } from 'vee-validate';
import PageTopBar from '../../../components/pageTopBar.vue';

const entities = ref([]);
onMounted(async () => {
  try {
    const response = await apiClient.get(`/PaymentTerms`);
    entities.value = response.data.data;
  } catch (err) {
    handleError(err, mainStore.loading);
  }
});

const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);
const containerClass = computed(() => ({
  rtl: mainStore.isRTL,
  ltr: !mainStore.isRTL
}));
const { t, locale } = useI18n();

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  controllerName: {
    type: String,
    required: true
  }
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const visible = ref(false);
const initialValues = ref({
  arabicName: '',
  englishName: ''
});

const schema = yup.object().shape({
  editCode: yup.string().required('Arabic Name is required'),
  editDescription: yup.string().required('English Name is required'),
  editDays: yup.string().required('English Name is required'),
  editId: yup.string().required('English Name is required')
});
const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
  validationSchema: schema,
  initialValues: initialValues.value
});

const [editCode, editCodeAttrs] = defineField('editCode');
const [editDescription, editDescriptionAttrs] = defineField('editDescription');
const [editDays, editDaysAttrs] = defineField('editDays');
const [editId, editIdAttrs] = defineField('editId');

// Update create Functionality

const isEdit = ref(false);
const openCreateDialog = () => {
  console.log('test');
  visible.value = true;
  isEdit.value = false;
};

const createData = handleSubmit(async (validatedInfo) => {
  const transformedInfo = {
    code: validatedInfo.editCode,
    description: validatedInfo.editDescription,
    days: validatedInfo.editDays,
    id: validatedInfo.editId
  };
  try {
    const response = await apiClient.post(`/PaymentTerms`, transformedInfo);
    entities.value.push(response.data.data);
    mainStore.loading.setNotificationInfo('success', response.data.message);
    resetForm();
    visible.value = false;
  } catch (err) {
    handleError(err, mainStore.loading);
  }
});

const updateData = handleSubmit(async (validatedInfo) => {
  const transformedInfo = {
    id: validatedInfo.editId,
    code: validatedInfo.editCode,
    description: validatedInfo.editDescription,
    days: validatedInfo.editDays
  };
  console.log('transformedInfo');
  console.log(transformedInfo);
  try {
    const response = await apiClient.put(`/PaymentTerms/${editId.value}`, transformedInfo);
    const index = entities.value.findIndex((entity) => entity.id === editId.value);
    entities.value[index] = { ...entities.value[index], ...response.data.data };
    mainStore.loading.setNotificationInfo('success', response.data.message);
    resetForm();
    isEdit.value = false;
    visible.value = false;
    transformedInfo.value = {};
  } catch (err) {
    handleError(err, mainStore.loading);
  }
});

const name = ref('');

const editItem = async (data) => {
  console.log(data);
  setValues({
    code: data.editCode,
    description: data.editDescription,
    days: data.editDays
  });
  visible.value = true;

  isEdit.value = true;

  editId.value = data.id;

  editCode.value = data.code;
  editDescription.value = data.description;
  editDays.value = data.days;
};

//Delete Option
const deleteDialogVisible = ref(false);
const deleteText = ref('');
const deletedKey = ref('');

const confirmDelete = async () => {
  console.log(deletedKey.value);
  try {
    const response = await apiClient.delete(`/PaymentTerms/${deletedKey.value}`);
    const index = entities.value.findIndex((entity) => entity.id === deletedKey.value);
    entities.value.splice(index, 1);
    deleteDialogVisible.value = false;
    mainStore.loading.setNotificationInfo('success', response.data.message);
  } catch (err) {
    handleError(err, mainStore.loading);
  }
};

const rowsPerPage = ref(10);
const currentPage = ref(0);

const onPageChange = (event) => {
  currentPage.value = event.page ?? 0;
};

const paginatedCustomers = computed(() => {
  if (!entities.value || !Array.isArray(entities.value)) {
    return [];
  }
  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return entities.value.slice(start, end);
});
</script>

<style scoped>
.rtl-direction :deep(.p-datatable .p-datatable-tbody > tr > td) {
  text-align: right;
}
:deep(.p-paginator .p-dropdown .p-dropdown-label) {
  padding-right: 1rem;
}
.rtl-direction :deep(.p-paginator .p-paginator-first) {
  rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-prev) {
  rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-next) {
  rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-last) {
  rotate: 180deg;
}
</style>
