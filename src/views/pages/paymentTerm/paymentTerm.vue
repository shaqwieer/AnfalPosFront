<template>
  <div class="flex flex-column gap-2 px-6">
    <!-- <PageTopBar v-model:searchText="filters['global'].value" :title="t(`baseLookup.${name}`)" :addText="t('baseLookup.createButtonLabel')" simple :addButton="openCreateDialog"></PageTopBar> -->

    <div class="flex justify-content-between h-fit">
      <div>
        <h2 class="m-0">{{ t(`customerCode`) }}</h2>
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
        </div></template
      >

      <Column field="name" :header="t('labels.name')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.id }}</span>
          </div>
        </template>
      </Column>

      <Column field="prefix" :header="t('labels.prefix')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.Code }}</span>
          </div>
        </template>
      </Column>

      <Column field="from" :header="t('labels.from')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.Description }}</span>
          </div>
        </template>
      </Column>

      <Column field="to" :header="t('labels.to')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.Days }}</span>
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
        <label for="Name" class="">{{ t(`baseLookup.Name`) }}</label>
        <InputText id="Name" v-model="editName" v-bind="editNameAttrs" autofocus :invalid="!!errors.arabicName" />
        <small v-if="errors.arabicName" class="text-red-600">{{ errors.arabicName }}</small>
      </div>

      <div class="field flex flex-column">
        <label for="editPrefix" class="">{{ t(`baseLookup.prefix`) }}</label>
        <InputText id="editPrefix" v-model="editPrefix" v-bind="editPrefixAttrs" autofocus :invalid="!!errors.englishName" />
        <small v-if="errors.englishName" class="text-red-600">{{ errors.englishName }}</small>
      </div>

      <div class="field flex flex-column">
        <label for="editForm" class="">{{ t(`baseLookup.from`) }}</label>
        <InputText id="editForm" v-model="editForm" v-bind="editFormAttrs" autofocus :invalid="!!errors.englishName" />
        <small v-if="errors.englishName" class="text-red-600">{{ errors.englishName }}</small>
      </div>

      <div class="field flex flex-column">
        <label for="editTo" class="">{{ t(`baseLookup.to`) }}</label>
        <InputText id="editTo" v-model="editTo" v-bind="editToAttrs" autofocus :invalid="!!errors.englishName" />
        <small v-if="errors.englishName" class="text-red-600">{{ errors.englishName }}</small>
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
    const response = await apiClient.get(`/CustomerCodes`);
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
  arabicName: yup.string('Arabic Name is required'),
  englishName: yup.string('English Name is required')
});
const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
  validationSchema: schema,
  initialValues: initialValues.value
});
const [arabicName, arabicNameAttrs] = defineField('arabicName');
const [englishName, englishNameAttrs] = defineField('englishName');

const [editName, editNameAttrs] = defineField('editName');
const [editPrefix, editPrefixAttrs] = defineField('editPrefix');
const [editForm, editFormAttrs] = defineField('editForm');
const [editTo, editToAttrs] = defineField('editTo');

// Update create Functionality
const editId = ref(0);

const isEdit = ref(false);
const openCreateDialog = () => {
  console.log('test');
  visible.value = true;
  isEdit.value = false;
};

const createData = handleSubmit(async (validatedInfo) => {
  const transformedInfo = {
    arabicName: validatedInfo.arabicName,
    englishName: validatedInfo.englishName,

    name: validatedInfo.editName,
    prefix: validatedInfo.editPrefix,
    from: validatedInfo.editForm,
    to: validatedInfo.editTo
  };
  try {
    const response = await apiClient.post(`/CustomerCodes`, transformedInfo);
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
    id: editId.value,
    name: validatedInfo.editName,
    prefix: validatedInfo.editPrefix,
    from: validatedInfo.editForm,
    to: validatedInfo.editTo
  };
  console.log(transformedInfo);
  try {
    const response = await apiClient.put(`/CustomerCodes/${editId.value}`, transformedInfo);
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
    arabicName: data.arabicName,
    englishName: data.englishName
  });
  isEdit.value = true;

  editId.value = data.id;

  editName.value = data.name;
  name.value = data.name;

  editPrefix.value = data.prefix;
  editForm.value = data.from;
  editTo.value = data.to;

  visible.value = true;
};

//Delete Option
const deleteDialogVisible = ref(false);
const deleteText = ref('');
const deletedKey = ref('');

const confirmDelete = async () => {
  console.log(deletedKey.value);
  try {
    const response = await apiClient.delete(`/CustomerCodes/${deletedKey.value}`);
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
