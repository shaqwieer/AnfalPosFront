<template>
    <div class="flex flex-column gap-2">
        <PageTopBar v-model:searchText="filters['global'].value" :hasAddButton="false" :hasReload="true" :hasSearch="false" :title="t(`items.title`)" :addText="t('baseLookup.createButtonLabel')" simple :addButton="openCreateDialog">
            <template #action>
                <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                    <Button icon="pi pi-refresh" rounded raised @click="getCustomers" />
                </div>
            </template>
        </PageTopBar>

        <div class="card">
            <DataTable
                :value="CustomersData"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :globalFilterFields="['name', 'id']"
                :paginatorTemplate="
                    mainStore.isRTL ? 'RowsPerPageDropdown NextPageLink LastPageLink  PageLinks FirstPageLink PrevPageLink  CurrentPageReport ' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                "
                :rowsPerPageOptions="[5, 10, 25]"
                :currentPageReportTemplate="''"
            >
                <template #empty>
                    <div class="flex justify-content-center align-items-center font-bold text-lg">
                        {{ t(`Customer.empty`) }}
                    </div>
                </template>

                <Column field="name" :header="t('Customer.name')" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="address" :header="t('Customer.address')" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.address }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="creditBalance" :header="t('Customer.creditBalance')" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.creditBalance }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="email" :header="t('Customer.email')" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.email }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="id" :header="t('Customer.id')" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.id }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="primaryPhone" :header="t('Customer.primaryPhone')" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.primaryPhone }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="actions" :header="t('labels.actions')">
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
                            <Button
                                icon="pi pi-credit-card"
                                v-tooltip.top="t('users.updateTooltip')"
                                text
                                rounded
                                aria-label="Update"
                                severity="success"
                                @click="
                                    () => {
                                        openPaymentTerm(slotProps.data);
                                    }
                                "
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
    <Dialog v-model:visible="visible" :breakpoints="{ '640px': '25rem' }" :header="t(`baseLookup.${isEdit ? 'edit' : 'add'}${name}`)" :class="containerClass" :style="{ width: '35rem' }" :modal="true" :closable="false">
        <div class="flex flex-column gap-4 p-4">
            <div class="field flex flex-column">
                <label for="arabicName" class="required">{{ t(`baseLookup.arabicName`) }}</label>
                <InputText id="arabicName" v-model="arabicName" v-bind="arabicNameAttrs" autofocus :invalid="!!errors.arabicName" />
                <small v-if="errors.arabicName" class="text-red-600">{{ errors.arabicName }}</small>
            </div>
            <div class="field flex flex-column">
                <label for="englishName" class="required">{{ t(`baseLookup.englishName`) }}</label>
                <InputText id="englishName" v-model="englishName" v-bind="englishNameAttrs" autofocus :invalid="!!errors.englishName" />
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
import PageTopBar from '@/components/pageTopBar.vue';

onMounted(() => {
    getCustomers();
});
const CustomersData = ref([]);

const getCustomers = async () => {
    try {
        console.log('response');
        const response = await apiClient.get('/Customers');
        CustomersData.value = response.data.data;
        console.log(CustomersData.value);
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

const createData = handleSubmit(async (validatedInfo) => {
    const transformedInfo = {
        arabicName: validatedInfo.arabicName,
        englishName: validatedInfo.englishName
    };
    try {
        const response = await apiClient.post(`/${props.controllerName}`, transformedInfo);
        entities.value.push(response.data.data);
        mainStore.loading.setNotificationInfo('success', response.data.message);
        resetForm();
        visible.value = false;
    } catch (err) {
        handleError(err, mainStore.loading);
    }
});

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
        await apiClient.delete(`Customers/${deletedKey.value}`);
        deleteDialogVisible.value = false;
        CustomersData.value = CustomersData.value.filter((customer) => customer.id !== deletedKey.value);
    } catch (err) {
        handleError(err, mainStore.loading);
    }
};
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
