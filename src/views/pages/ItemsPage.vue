<template>
  <div class="flex flex-column gap-2">
    <div class="flex justify-content-between mb-5">
      <div>
        <h2>{{ t(`items.title`) }}</h2>
      </div>

      <div>
        <Button icon="pi pi-refresh" class="shadow-none" rounded raised @click="refreshItems" />
      </div>
    </div>

    <DataTable
      class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border"
      :value="paginatedCustomers"
      dataKey="id"
      :rows="10"
      :filters="filters"
      :globalFilterFields="['sapItem', 'sapPlant', 'baseUnit', 'itemGroup', 'sapDescAr']"
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

      <Column field="sapItem" :header="t('items.SapItem')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.sapItem }}</span>
          </div>
        </template>
      </Column>

      <Column field="sapPlant" :header="t('items.sapPlant')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.sapPlant }}</span>
          </div>
        </template>
      </Column>

      <Column field="baseUnit" :header="t('items.baseUnit')" class="" :sortable="true">
        <template #body="slotProps">
          <div class="flex flex-row align-items-center">
            <span class="font-semibold text-md">{{ slotProps.data.baseUnit }}</span>
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

    <Paginator :rows="rowsPerPage" :rowsPerPageOptions="[5, 10, 20, 25, 50]" :totalRecords="ItemsData.length" @page="onPageChange" @update:rows="onRowsChange" />
  </div>
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
import PageTopBar from '@/components/pageTopBar.vue';

const ItemsData = ref([]);

const getItems = async () => {
  try {
    const response = await apiClient.get('/Items/GetItemsForCompany');
    ItemsData.value = response.data.data;
  } catch (err) {
    console.log(err);
  }
};

const refreshItems = async () => {
  try {
    await apiClient.get('/Items/SyncItemsWithSapAsync');
    await getItems();
  } catch (err) {
    console.log(err);
  }
};

onMounted(async () => {
  await getItems();
});

const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);
const containerClass = computed(() => ({
  rtl: mainStore.isRTL,
  ltr: !mainStore.isRTL
}));
const { t, locale } = useI18n();

// const props = defineProps({
//   name: {
//     type: String,
//     required: true
//   },
//   controllerName: {
//     type: String,
//     required: true
//   }
// });

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// const visible = ref(false);
// const initialValues = ref({
//   arabicName: '',
//   englishName: ''
// });
// const schema = yup.object().shape({
//   arabicName: yup.string().required('Arabic Name is required'),
//   englishName: yup.string().required('English Name is required')
// });
// const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
//   validationSchema: schema,
//   initialValues: initialValues.value
// });
// const [arabicName, arabicNameAttrs] = defineField('arabicName');
// const [englishName, englishNameAttrs] = defineField('englishName');





const rowsPerPage = ref(20);
const currentPage = ref(0);

const onPageChange = (event) => {
  currentPage.value = event.page ?? 0;
};

const onRowsChange = (newRows) => {
  rowsPerPage.value = newRows;
  currentPage.value = 0;
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
