<template>
    <div class="flex flex-column gap-2">
        <PageTopBar :fromInvoice="fromInvoice" :title="'Order History'" v-model:value="isGrid" :simple="true" :hasSearch="false" :hasAddButton="false"></PageTopBar>
        <div class="w-full" v-if="currentView == 'list'">
            <DataTable
                :value="invoiceStore.HistoryOrders"
                dataKey="id"
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
                        {{ t(`baseLookup.empty${name}`) }}
                    </div></template
                >

                <Column field="id" :header="'Order ID'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.id }}</span>
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
                <Column field="customerName" :header="'Customer'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.customerName }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="finalAmount" :header="'Total'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">${{ slotProps.data.finalAmount }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="currentStatus" :header="'Status'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <Tag :severity="slotProps.data.currentStatus == 'UnderRevision' ? 'warning' : slotProps.data.currentStatus == 'success' ? 'success' : 'danger'" :value="slotProps.data.currentStatus"></Tag>
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
            <div class="Orders gap-3 px-2">
                <div v-for="item in invoiceStore.HistoryOrders" :key="item.id" class="Order w-full surface-card border-round-lg shadow-1 hover:shadow-3 cursor-pointer transition-all transition-duration-150 relative overflow-hidden">
                    <!-- Draft Label -->
                    <div class="flex flex-column gap-3 p-4">
                        <div class="flex flex-row justify-content-between align-items-center">
                            <div class="flex flex-row align-items-center gap-2">
                                <i class="pi pi-file text-blue-600 text-2xl"></i>
                                <span class="font-semibold text-900 text-center text-lg">Order #{{ item.id }}</span>
                            </div>
                            <div v-if="item.isDraft" class="border-1 border-yellow-600 text-yellow-600 text-sm font-semibold px-2 py-1 border-round-xl"><i class="pi pi-file-edit text-yellow-600 text-sm"></i> Draft</div>
                        </div>
                        <div class="flex flex-row justify-content-between align-items-center">
                            <span class="text-md text-500 text-center text-overflow-ellipsis overflow-hidden white-space-nowrap"> {{ item.customerName }} </span>
                            <span class="text-md text-500 text-center"> {{ new Date(item.createdAt).toLocaleDateString(locale) }} </span>
                        </div>
                        <hr class="my-0 border-top-2 border-none border-200" />
                        <div class="flex flex-row justify-content-between align-items-center">
                            <div class="flex flex-row align-items-center gap-2">
                                <i
                                    class="pi text-xl"
                                    :class="{
                                        ' text-green-500 pi-verified': item.currentStatus === 'Accepted',
                                        ' text-red-500 pi-exclamation-circle': item.currentStatus === 'Rejected'
                                    }"
                                ></i>
                                <span
                                    class="text-md border-round"
                                    :class="{
                                        'text-green-600': item.currentStatus === 'Accepted',
                                        'text-red-600': item.currentStatus === 'Rejected'
                                    }"
                                >
                                    {{ item.currentStatus }}
                                </span>
                            </div>

                            <span class="text-xl font-semibold text-primary-800 text-center"> ${{ item.finalAmount }} </span>
                        </div>

                        <div class="flex flex-row justify-content-between w-full">
                            <Button
                                label="View Details"
                                class="border-primary-200 w-full"
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
    <!--  -->
    <Dialog v-if="display" :header="customHeader" v-model:visible="display" :breakpoints="{ '960px': '75vw' }" style="min-width: 50%; max-width: 100%" :modal="true" :closable="false"  :draggable="false"  :dismissableMask="true">
        <template #header>
            <PageTopBar :fromInvoice="fromInvoice" :title="`Order #${selectedOrder.id}`" v-model:value="isGrid" :simple="true" :hasSearch="false" :hasAddButton="false">
                <template #close>
                    <div>
                        <button @click="display = false" class="p-dialog-header-icon p-link bg-gray-100 text-black-alpha-9">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                </template>
            </PageTopBar>
        </template>

        <div class="flex flex-column gap-4  border-1 border-round-lg border-gray-300 p-3">
            <div class="border-1 border-round-lg border-gray-300 p-3 relative flex column-gap-3 justify-content-between align-items-center">
                <div class="time-bar absolute bg-gray-300">
                    <div class="time-bar-fill bg-primary" :style="`width: ${widthStyle}`"></div>
                </div>

                <div class="flex row-gap-3 justify-content-center align-items-center z-1 flex-column">
                    <div class="time-item border-2 flex justify-content-center align-items-center border-circle" :class="`${timeBarFill >= 0 ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`">
                        <i class="pi pi-check font-medium" :class="`${timeBarFill >= 0 ? 'text-white' : 'text-gray-300'}`" style="font-size: 20px"></i>
                    </div>
                    <div class="font-medium text-sm" :class="`${timeBarFill >= 0 ? 'text-gray-900' : 'text-gray-300'}`">CREATED</div>
                </div>

                <div class="flex row-gap-3 justify-content-center align-items-center z-1 flex-column">
                    <div class="time-item border-2 flex justify-content-center align-items-center border-circle" :class="`${timeBarFill >= 25 ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`">
                        <i class="pi pi-stopwatch font-medium" :class="`${timeBarFill >= 25 ? 'text-white' : 'text-gray-300'}`" style="font-size: 20px"></i>
                    </div>
                    <div class="font-medium text-sm text-ellipsis" :class="`${timeBarFill >= 25 ? 'text-gray-900' : 'text-gray-300'}`">IN PROGRESS</div>
                </div>

                <div class="flex row-gap-3 justify-content-center align-items-center z-1 flex-column">
                    <div class="time-item border-2 flex justify-content-center align-items-center border-circle" :class="`${timeBarFill >= 50 ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`">
                        <i class="pi pi-truck font-medium" :class="`${timeBarFill >= 50 ? 'text-white' : 'text-gray-300'}`" style="font-size: 20px"></i>
                    </div>
                    <div class="font-medium text-sm text-ellipsis" :class="`${timeBarFill >= 50 ? 'text-gray-900' : 'text-gray-300'}`">VEHICLE READY</div>
                </div>

                <div class="flex row-gap-3 justify-content-center align-items-center z-1 flex-column">
                    <div class="time-item border-2 flex justify-content-center align-items-center border-circle" :class="`${timeBarFill >= 75 ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`">
                        <i class="pi pi-credit-card font-medium" :class="`${timeBarFill >= 75 ? 'text-white' : 'text-gray-300'}`" style="font-size: 20px"></i>
                    </div>
                    <div class="font-medium text-sm text-ellipsis" :class="`${timeBarFill >= 75 ? 'text-gray-900' : 'text-gray-300'}`">PAYMENT DUE</div>
                </div>

                <div class="flex row-gap-3 justify-content-center align-items-center z-1 flex-column">
                    <div class="time-item border-2 flex justify-content-center align-items-center border-circle" :class="`${timeBarFill >= 100 ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`">
                        <i class="pi pi-dollar font-medium" :class="`${timeBarFill >= 100 ? 'text-white' : 'text-gray-300'}`" style="font-size: 20px"></i>
                    </div>
                    <div class="font-medium text-sm text-ellipsis" :class="`${timeBarFill >= 100 ? 'text-gray-900' : 'text-gray-300'}`">PAYMENT DONE</div>
                </div>
            </div>

            <div class="flex flex-column gap-3">
                <div class="flex flex-row justify-content-between">
                    <span class="font-bold text-md">price: ${{ selectedOrder.finalAmount }}</span>
                </div>

                <div class="flex flex-row justify-content-between">
                    <span class="font-bold text-md">Customer: {{ selectedOrder.customerName }}</span>
                </div>

                <div class="flex flex-row justify-content-between">
                    <span class="font-bold text-md">Date: {{ new Date(selectedOrder.createdAt).toLocaleDateString(locale) }}</span>
                    <span class="font-bold text-md"></span>
                </div>
                <div class="flex flex-row justify-content-between">
                    <span class="font-bold text-md">Status: <Tag :severity="selectedOrder.currentStatus == 'UnderRevision' ? 'warning' : 'danger'" :value="selectedOrder.currentStatus"></Tag></span>
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
                                            <div class="flex flex-row gap-2 text-sm text-700 justify-content-between align-items-center">
                                                | <span class="text-md font-semibold">{{ item.quantity }}</span>
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
import Dialog from 'primevue/dialog';

import { ref, onMounted, computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import PageTopBar from '../../../components/pageTopBar.vue';
import { useInvoiceStore } from '@/stores/invoiceStore';
import apiClient from '../../../api/apiClient';
import { handleError } from '../../../utilities/errorHandler';
const invoiceStore = useInvoiceStore();
const { t, locale } = useI18n();
const mainStore = useMainStore();
const isGrid = ref('list');
const selectedOrder = ref(null);
const display = ref(false);

const props = defineProps({
    fromInvoice: {
        type: Boolean,
        default: false
    },
    currentView: {
        type: String,
        default: 'list'
    }
});

const timeBarFill = ref(50);
const widthStyle = computed(() => {
    if (timeBarFill.value >= 100) return '100%';

    if (timeBarFill.value >= 75) return '75%';

    if (timeBarFill.value >= 50) return '50%';

    if (timeBarFill.value >= 25) return '25%';

    return '0%';
});

onMounted(async () => {
    try {
        const response = await apiClient.post(`/Invoices/GetQuickInvoice`);
        invoiceStore.HistoryOrders = response.data.data;
    } catch (err) {
        handleError(err, mainStore.loading);
    }
});
</script>
<style scoped>
.Orders {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, auto));
    justify-items: center;
    padding-bottom: 20px;
}
.time-bar {
    width: 86%;
    height: 2px;
    transform: translateX(50%);
    right: 51%;
    top: 38px;
}
.time-bar-fill {
    height: 2px;
}
.time-item {
    width: 48px;
    height: 48px;
}
.text-ellipsis {
    white-space: nowrap; 
    overflow: hidden;  
    text-overflow: ellipsis;
}
</style>
