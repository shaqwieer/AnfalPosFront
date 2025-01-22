<template>
    <div class="flex flex-column gap-2">
        <PageTopBar :fromInvoice='fromInvoice' :title="'Order History'" v-model:value="isGrid" :hasAddButton="false"></PageTopBar>
        <div class="card" v-if="isGrid == 'list'">
            <DataTable
                :value="invoiceStore.HistoryOrders"
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
                            <Tag :severity="slotProps.data.currentStatus == 'UnderRevision' ?'warning':slotProps.data.currentStatus == 'success' ? 'success' : 'danger'" :value="slotProps.data.currentStatus"></Tag>
                        </div>
                    </template>
                </Column>

                <Column field="actions" :header="t('labels.actions')">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button label="View Details" class="border-primary-200" outlined @click="selectedOrder = slotProps.data; display = true"></Button>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <div v-else>
            <div class="grid">
                <div class="col-md-6 mr-2 p-3 " v-for="item in invoiceStore.HistoryOrders" :key="item.id">
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
                                <Button label="View Details" class="border-primary-200" outlined @click="selectedOrder = item; display = true; "></Button>
                                <div class="flex flex-row"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-if="display" :header="'Order #'+selectedOrder.id" v-model:visible="display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" :modal="true">
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
import { ref, onMounted } from 'vue';
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
const selectedOrder = ref(null)
const display = ref(false);

const props = defineProps({
    fromInvoice: {
        type: Boolean,
        default: false
    }
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
