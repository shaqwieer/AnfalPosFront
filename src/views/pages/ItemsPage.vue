<template>
  <div class="flex flex-column gap-2">

    <div class="flex justify-content-between mb-5">
      <div>
        <h2>{{ t(`items.title`) }}</h2>
      </div>

      <div>
        <Button icon="pi pi-refresh" class="shadow-none" rounded raised @click="getItems" />
      </div>
    </div>

    <DataTable
      class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border"
      :value="paginatedCustomers"
      dataKey="id"
      :rows="10"
      :filters="filters"
      :globalFilterFields="['name', 'id']"
      :paginatorTemplate="
        mainStore.isRTL ? 'RowsPerPageDropdown NextPageLink LastPageLink  PageLinks FirstPageLink PrevPageLink  CurrentPageReport ' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
      "
      :currentPageReportTemplate="''"
    >
      <template #empty>
        <div class="flex justify-content-center align-items-center font-bold text-lg">
          {{ t(`items.empty`) }}
        </div>
      </template>

      <Column field="barcode" :header="t('items.barcode')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.barcode }}</span>
          </div>
        </template>
      </Column>

      <Column field="brand" :header="t('items.brand')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.brand }}</span>
          </div>
        </template>
      </Column>

      <Column field="id" :header="t('items.id')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.id }}</span>
          </div>
        </template>
      </Column>

      <Column field="price" :header="t('items.price')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.price }}</span>
          </div>
        </template>
      </Column>

      <Column field="itemGroup" :header="t('items.Group')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.itemGroup }}</span>
          </div>
        </template>
      </Column>

      <Column field="sapDescAr" :header="t('items.Desc')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.sapDescAr }}</span>
          </div>
        </template>
      </Column>
    </DataTable>

    <Paginator :rows="rowsPerPage" :totalRecords="ItemsData.length" @page="onPageChange" />
  </div>
</template>

<script setup>
// const Rtl = ref();
// Rtl.value = localStorage.getItem('Rtl');
// console.log(Rtl.value)

import DeleteDialog from '@/components/DeleteDialog.vue';
import { handleError } from '@/utilities/errorHandler';
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, computed } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import apiClient from '@/api/apiClient';
import { useMainStore } from '@/stores/mainStore';
import { useForm } from 'vee-validate';
import PageTopBar from '@/components/pageTopBar.vue';

const ItemsData = ref([]);
onMounted(async () => {
  getItems();
});

const getItems = async () => {
  try {
    console.log('response');
    const response = await apiClient.get('/Items');
    ItemsData.value = response.data.data;
    console.log('ItemsData.value');
  } catch (err) {
    console.log(err);
  }
};

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
  arabicName: yup.string().required('Arabic Name is required'),
  englishName: yup.string().required('English Name is required')
});
const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
  validationSchema: schema,
  initialValues: initialValues.value
});
const [arabicName, arabicNameAttrs] = defineField('arabicName');
const [englishName, englishNameAttrs] = defineField('englishName');

// Update create Functionality
const editId = ref(0);
const isEdit = ref(false);
const openCreateDialog = () => {
  visible.value = true;
  isEdit.value = false;
};

// const createData = handleSubmit(async (validatedInfo) => {
//     const transformedInfo = {
//         arabicName: validatedInfo.arabicName,
//         englishName: validatedInfo.englishName
//     };
//     try {
//         const response = await apiClient.post(`/${props.controllerName}`, transformedInfo);
//         entities.value.push(response.data.data);
//         mainStore.loading.setNotificationInfo('success', response.data.message);
//         resetForm();
//         visible.value = false;
//     } catch (err) {
//         handleError(err, mainStore.loading);
//     }
// });

// const updateData = handleSubmit(async (validatedInfo) => {
//     const transformedInfo = {
//         id: editId.value,
//         arabicName: validatedInfo.arabicName,
//         englishName: validatedInfo.englishName
//     };
//     try {
//         const response = await apiClient.put(`/${props.controllerName}/${editId.value}`, transformedInfo);
//         const index = entities.value.findIndex((entity) => entity.id === editId.value);
//         entities.value[index] = { ...entities.value[index], ...response.data.data };
//         mainStore.loading.setNotificationInfo('success', response.data.message);
//         resetForm();
//         isEdit.value = false;
//         visible.value = false;
//     } catch (err) {
//         handleError(err, mainStore.loading);
//     }
// });

const editItem = async (data) => {
  console.log(data);
  setValues({
    arabicName: data.arabicName,
    englishName: data.englishName
  });
  isEdit.value = true;
  editId.value = data.id;
  visible.value = true;
};

//Delete Option
const deleteDialogVisible = ref(false);
const deleteText = ref('');
const deletedKey = ref('');
const confirmDelete = async () => {
  try {
    const response = await apiClient.delete(`/${props.controllerName}/${deletedKey.value}`);
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
  if (!ItemsData.value || !Array.isArray(ItemsData.value)) {
    return [];
  }
  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return ItemsData.value.slice(start, end);
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
