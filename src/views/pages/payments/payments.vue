<template>
    <div class="flex flex-column gap-2">
        <PageTopBar :title="'Cash Journal'" v-model:value="isGrid" :hasAddButton="false" simple hasReload :hasSearch="false">
            <template #action>
                <div class="flex justify-content-end gap-2 w-full">
                    <IconField iconPosition="left" class="w-9 flex">
                        <InputText type="text" v-model="filters['global'].value" :placeholder="'Search by order-id or customer'" class="w-full" />
                        <InputIcon class="pi pi-search" />
                    </IconField>
                    <Dropdown class="w-10rem" v-model="selectedTimePeriod" :options="TimePeriods" optionLabel="name" placeholder="Select" />
                </div>
            </template>
        </PageTopBar>
        <div class="grid px-3 pt-3">
            <div v-for="(paymentType, index) in tempPaymentList" :key="paymentType.paymentMethodId" class="col-12 md:col-6 lg:col-3" @click="selectPaymentMethod(paymentType.paymentMethodId)">
                <div :style="`background-color: ${colors[index]}`" class="p-3 border-round shadow-1 border-solid  border-transparent transition-all	" :class="paymentType.paymentMethodId == selectedPaymentMethod ? 'shadow-7 text-white border-white' : ''">
                    <div class="flex flex-column gap-2">
                        <span class="text-3xl font-bold text-white">{{ paymentType.totalCount }} Transactions</span>
                        <span class="text-xl font-thin text-white">${{ paymentType.totalAmount }}</span>
                        
                        <p class="font-semibold text-white text-right">{{ paymentType.paymentMethodName }}</p>

                    </div>
                </div>
            </div>
        </div>
        <div class="card" v-if="isGrid == 'list'">
            <DataTable
                :value="tempPaymentList2.filter((item) => item.paymentMethodId == selectedPaymentMethod || selectedPaymentMethod == null)"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :globalFilterFields="['invoiceId']"
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

                <Column field="invoiceId" :header="'Order ID'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.invoiceId }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="createdAt" :header="'Date'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ new Date(slotProps.data.createdAt).toLocaleDateString(locale) }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="paymentMethodName" :header="'Payment Method'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.paymentMethodName }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="amount" :header="'Amount'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">${{ slotProps.data.amount }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="paymentStatus" :header="'Status'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <Tag :severity="slotProps.data.paymentStatus == 'UnderRevision' ? 'warning' : slotProps.data.paymentStatus == 'success' ? 'success' : 'danger'" :value="slotProps.data.paymentStatus"></Tag>
                        </div>
                    </template>
                </Column>

                <Column field="actions" :header="t('labels.actions')">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button
                                label="View Details"
                                class="border-primary-200"
                                outlined
                                @click="
                                    selectedOrder = slotProps.data;
                                    display = true;
                                "
                            ></Button>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <div v-else>
            <div class="grid">
                <div class="col-6 sm:col-6 md:col-4 xl:col-3" v-for="item in tempPaymentList2" :key="item.id">
                    <div class="card">
                        <div class="flex flex-column gap-4">
                            <span class="font-bold text-3xl">Order #{{ item.id }}</span>
                            <div class="flex flex-column gap-1">
                                <span class=""><span class="font-bold text-md">Customer:</span> {{ item.customerName }}</span>
                                <span class=""><span class="font-bold text-md">Date:</span> {{ new Date(item.createdAt).toLocaleDateString(locale) }}</span>
                                <span class=""><span class="font-bold text-md">Total:</span> ${{ item.finalAmount }}</span>
                                <span class=""><span class="font-bold text-md">Status:</span> <Tag :severity="item.currentStatus == 'UnderRevision' ? 'warning' : 'danger'" :value="item.currentStatus"></Tag> </span>
                            </div>
                            <div class="flex flex-row justify-content-between">
                                <Button
                                    label="View Details"
                                    class="border-primary-200"
                                    outlined
                                    @click="
                                        selectedOrder = item;
                                        display = true;
                                    "
                                ></Button>
                                <div class="flex flex-row"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-if="display" :header="'Order #' + selectedOrder.id" v-model:visible="display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" :modal="true">
        <div class="flex flex-column gap-4">
            <div class="flex flex-row justify-content-between">
                <span class="font-bold text-md">Order #{{ selectedOrder.id }}</span>
                <span class="font-bold text-md">${{ selectedOrder.finalAmount }}</span>
            </div>
            <div class="flex flex-column gap-2">
                <div class="flex flex-row justify-content-between">
                    <span class="font-bold text-md">Customer:</span>
                    <span class="font-bold text-md">{{ selectedOrder.customerName }}</span>
                </div>
                <div class="flex flex-row justify-content-between">
                    <span class="font-bold text-md">Date:</span>
                    <span class="font-bold text-md">{{ new Date(selectedOrder.createdAt).toLocaleDateString(locale) }}</span>
                </div>
                <div class="flex flex-row justify-content-between">
                    <span class="font-bold text-md">Status:</span>
                    <span class="font-bold text-md"><Tag :severity="selectedOrder.currentStatus == 'UnderRevision' ? 'warning' : 'danger'" :value="selectedOrder.currentStatus"></Tag></span>
                </div>
            </div>
            <div class="flex flex-column gap-2">
                <div class="flex flex-column gap-2">
                    <span class="font-bold text-md">Items:</span>
                    <div class="flex flex-column gap-2">
                        <div class="flex flex-row justify-content-between" v-for="item in selectedOrder.items" :key="item.id">
                            <div class="flex flex-row gap-2">
                                <!-- <img :src="item.image" :alt="item.name" class="item-img border-round" /> -->
                                <ul class="list-none p-0 m-0">
                                    <li class="flex flex-row gap-2" v-for="item in selectedOrder.items" :key="item.id">
                                        <div class="flex flex-row gap-2 justify-content-between w-full">
                                            <span class="font-semibold text-md">{{ item.sapDesc }}</span>
                                            <div class="flex flex-row gap-2 text-sm text-700 justify-content-between">
                                                <span>{{ item.quantity }}</span>
                                                <span class="text-lg font-semibold text-primary">${{ item.finalDiscountAmount.toFixed(2) }}</span>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import { ref, watch } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import PageTopBar from '../../../components/pageTopBar.vue';
import { useInvoiceStore } from '@/stores/invoiceStore';
import apiClient from '../../../api/apiClient';
import { handleError } from '../../../utilities/errorHandler';
import { FilterMatchMode } from 'primevue/api';

const invoiceStore = useInvoiceStore();
const { t, locale } = useI18n();
const mainStore = useMainStore();
const isGrid = ref('list');
const selectedOrder = ref(null);
const display = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
// const TimePeriods = Object.freeze({
//     Day: 1,
//     Week: 2,
//     Month: 3,
//     Quarter:4,
//     Half: 5,
//     Year: 6,
// });
const TimePeriods = ref([
    { name: 'Today', code: 0 },
    { name: 'This Week', code: 1 },
    { name: 'This Month', code: 2 },
    { name: '3 Months', code: 3 },
    { name: '6 Months', code: 4 },
    { name: 'This Year', code: 5 }
]);

const selectedTimePeriod = ref(TimePeriods.value[0]);
const selectedPaymentMethod = ref(null);
const selectPaymentMethod = (event) => {
    if (selectedPaymentMethod.value == event) {
        selectedPaymentMethod.value = null;
    } else {
        selectedPaymentMethod.value = event;
    }
};
const paymentList = ref(null);
const colors = ref(['#3D84F8', '#E64843', '#34B6D4', '#8560F7']);
const tempPaymentList = ref([
    {
        paymentMethodId: 1,
        paymentMethodName: 'Cash',
        totalCount: 1,
        totalAmount: 1000
    },
    {
        paymentMethodId: 2,
        paymentMethodName: 'Visa',
        totalCount: 1,
        totalAmount: 1000
    }
]);
const tempPaymentList2 = ref([
    {
        invoiceId: 1426,
        paymentMethodId: 1,
        paymentMethodName: 'Cash',
        amount: 1000,
        paymentStatus: 'Completed',
        id: 1,
        uniqueIdentifier: '82d4ed09-c43f-427b-b25c-b5bbb7ab00bd',
        createdAt: '2025-01-20T20:46:00.077643Z'
    }
]);
const getPayments = async () => {
    try {
        const response = await apiClient.post(`/Payments/GetTransactionInInvoices`, { timeFrame: selectedTimePeriod.value.code });
        paymentList.value = response.data.data;
        console.log(paymentList.value);
    } catch (err) {
        handleError(err, mainStore.loading);
    }
};
watch(
    selectedTimePeriod,
    () => {
        getPayments();
    },
    { immediate: true }
);
</script>
