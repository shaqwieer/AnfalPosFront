<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '../../../api/apiClient';
import { handleError } from '../../../utilities/errorHandler';
import PaymentDialog from './PaymentDialog.vue';
import type { OrderItem, Order, Customer, InvoiceViewItem } from './types';
import { useInvoiceStore } from '../../../stores/invoiceStore';
import { useMainStore } from '../../../stores/mainStore';
import { useRouter } from 'vue-router';
import customerManagement from './masterInvoice/customer-management.vue';
import OrderActionMenu from './masterInvoice/orderActionMenu.vue';
import OrderHistory from '../orders/OrderHistory.vue';
import customerList from '../customerList.vue';
import invoiceDialog from './masterInvoice/invoiceDialog.vue';
import orderHistory from './masterInvoice/orderHistory.vue';
import orderlist from './masterInvoice/orderlist.vue';

import ScrollPanel from 'primevue/scrollpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const router = useRouter();
const invoiceStore = useInvoiceStore();
const selectedItems = ref<OrderItem[]>([]);
const customerType = ref<'express' | 'commercial'>('express');
const customerName = ref('');
const searchQuery = ref('');
const discountAmount = ref('');
const discountType = ref<'fixed' | 'percentage'>('fixed');
const discountError = ref('');
const selectedCommercialCustomer = ref('');
const companyAddress = ref('');
const mainStore = useMainStore();
const paymentDialogVisible = ref(false);
const commercialCustomers = ref<Customer[]>([]);
const categories = ref<string[]>([]);

const orders = ref<Order[]>([
    { id: '#12532', customerName: 'Vinicius Bayu', status: 'cancelled', time: '3 mins', table: 'Table 3' },
    { id: '#12533', customerName: 'Cheryl Arema', status: 'ready', time: '3 mins', table: 'Table 3' },
    { id: '#12531', customerName: 'Kylian Rex', status: 'waiting', time: '12 mins', table: 'Table 4' },
    { id: '#12529', customerName: 'Rijal Arudam', status: 'completed', time: '3 mins', table: 'Table 24' }
]);

const statusColors = {
    Rejected: 'error',
    Returned: 'error',
    Accepted: 'success',
    Purchased: 'info',
    UnderRevision: 'warning',
    Archived: 'info'
};

const subtotal = computed(() => invoiceStore.invoice.items.reduce((sum, item) => sum + item.finalDiscountAmount * item.quantity, 0));
const calculateDiscount = (amount: string, type: 'fixed' | 'percentage', subtotalValue: number) => {
    if (!amount) return 0;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return 0;
    if (type === 'fixed') {
        return Math.min(parsedAmount, subtotalValue);
    } else {
        return Math.min(subtotalValue * (parsedAmount / 100), subtotalValue);
    }
};

const total = computed(() => {
    const discount = calculateDiscount(discountAmount.value, discountType.value, subtotal.value);
    return subtotal.value - discount;
});

const filteredMenuItems = computed(() => invoiceStore.products.filter((item) => item.name.toLowerCase().includes(searchQuery.value.toLowerCase())));

const processTransaction = async (isDraft: boolean) => {
    invoiceStore.invoice.isDraft = isDraft;
    await apiClient.post(`Invoices/CreateQuickInvoice`, invoiceStore.invoice);
    console.log('Processing transaction:', invoiceStore.invoice);
};

const selectedCategory = ref('');
watch(selectedCategory, async () => {
    try {
        const response = await apiClient.get(`/Items/GetItemsForQuickInvoiceBasedOnCategory/${selectedCategory.value}`);
        invoiceStore.products = response.data.data;
    } catch (err) {
        handleError(err, mainStore.loading);
    }
});

onMounted(async () => {
    try {
        const [categoryResponse, invoiceResponse] = await Promise.all([apiClient.get('/Items/GetCategoriesForItems'), apiClient.post('/Invoices/GetQuickInvoice')]);
        categories.value = categoryResponse.data.data;
        selectedCategory.value = categories.value[0] || '';
        invoiceStore.HistoryOrders = invoiceResponse.data.data;
    } catch (err) {
        handleError(err, mainStore.loading);
    }
});

const search = (e) => {
    setTimeout(() => {
        if (!searchQuery.value.trim().length) {
            var temp = selectedCategory.value;
            selectedCategory.value = '';
            selectedCategory.value = temp;
            //suggestions.value = [];
        } else {
            searchAPI();
        }
    }, 250);
};
const searchAPI = async () => {
    const response = await apiClient.get(`/Items/SarchForItemsInQuickInvoice?searchTerm=${searchQuery.value}`);
    invoiceStore.products = response.data.data;
};
const navigateToHistory = () => {
    router.push({ name: 'OrderHistory' });
};

const navigateToDraft = () => {
    router.push({ name: 'DraftOrders' });
};
//pagination
// const totalRecords = ref(0);
// const rows = ref(12);
// const first = ref(0);
// watch([first, rows], () => {
//     updatePaginatedData();
// });

const activeIndex = ref(0);

function setActiveIndex(index) {
    activeIndex.value = index;
}
const viewModes = ref<InvoiceViewItem[]>([{ viewMode: 'Products' }, { viewMode: 'Customers' }, { viewMode: 'Orders' }]);
const showMode = ref('Products');
function updateShowMode() {
    showMode.value = showMode.value;
}
const currentView = ref('list');
const showactions = ref(false);

const handleOnClose = () => {
    showactions.value = false;
};
const showInvoiceDialog = ref(false);
</script>

<template>
    <div class="flex gap-3 flex-column lg:flex-row relative w-full">
        <div class="lg:w-8 flex flex-column h-86vh gap-2 overflow-auto">
            <orderHistory />

            <!-- Main Content -->
            <div class="flex flex-column gap-2 w-full relative overflow-y-auto overflow-x-hidden min-h-90px px-4">
                <div class="test flex flex-column sm:flex-row gap-4">
                    <InputText v-model="searchQuery" id="productSearch" type="text" placeholder="Search Products..." class="w-full shadow-none" />
                    <div class="flex flex-row gap-2 min-w-max">
                        <Dropdown v-model="showMode" :options="viewModes" optionLabel="viewMode" optionValue="viewMode" placeholder="Select a view" class="w-full shadow-none" @change="updateShowMode" />

                        <!-- <Button label="Order History" icon="pi pi-history" class="border-primary-200" outlined @click="navigateToHistory"></Button>
                        <Button label="Draft Orders" icon="pi pi-file" class="border-primary-200" outlined @click="navigateToDraft"></Button> -->
                    </div>
                </div>

                <div v-show="showMode == 'Products'" class="sticky top-0 z-5 surface-50">
                    <!-- Search Bar -->
                    <div class="flex flex-column gap-2 pb-3 pt-2 pl-3 pr-3">
                        <div class="flex flex-wrap gap-2">
                            <button
                                v-for="category in categories"
                                :key="category"
                                @click="selectedCategory = category"
                                class="p-button p-button-sm text-xs shadow-none font-bold"
                                :class="`${selectedCategory == category ? 'bg-primary' : 'p-button-outlined'}`"
                            >
                                {{ category }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Header with Actions -->
                <div v-if="showMode === 'Products'" class="mb-3 flex justify-content-between align-items-center flex-row-reverse">
                    <div class="flex gap-2">
                        <Button icon="pi pi-list" class="shadow-none" :class="{ 'p-button-primary': currentView === 'list', 'p-button-outlined': currentView === 'grid' }" @click="currentView = 'list'" />
                        <Button icon="pi pi-th-large" class="shadow-none" :class="{ 'p-button-primary': currentView === 'grid', 'p-button-outlined': currentView === 'list' }" @click="currentView = 'grid'" />
                    </div>
                </div>

                <div v-if="currentView == 'grid' && showMode == 'Products'" class="Products grid max-h-screen mt-0 gap-3 pl-3 pr-3">
                    <div v-for="item in filteredMenuItems.filter((i) => i.itemGroup === selectedCategory)" :key="item.id" class="Product-item p-0">
                        <Card class="h-full border-round shadow-2 flex justify-content-between">
                            <template #content>
                                <div class="flex flex-column gap-2 p-0">
                                    <img :src="item.image ? item.image : '/src/assets/images/item.png'" :alt="item.name" class="item-img w-full h-full border-round mx-auto" />
                                    <div class="flex flex-column gap-2">
                                        <h3 class="font-semibold mb-0 text-base">{{ item.name }}</h3>
                                        <span v-if="item.totalStock === 0" class="text-danger ml-2"> <i class="pi pi-exclamation-triangle"></i> Out of Stock </span>
                                        <div class="flex flex-row gap-2 text-sm text-500 justify-content-between">
                                            <span class="text-base font-semibold text-primary">${{ item.price.toFixed(2) }}</span>

                                            <span>{{ item.totalStock }} Available</span>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="item.totalStock > 0" class="w-full totalStock flex justify-content-evenly align-items-between border-top-1 surface-border pt-3 mt-3">
                                    <Button
                                        class="p-0 shadow-none"
                                        icon="pi pi-minus"
                                        @click="invoiceStore.decreaseItemInInvoice(item.id)"
                                        :disabled="!invoiceStore.invoice.items.find((i) => i.id === item.id)?.quantity"
                                        severity="danger"
                                        outlined
                                        rounded
                                    />
                                    <span class="w-4rem text-center font-medium">
                                        {{ invoiceStore.invoice.items.find((i) => i.id === item.id)?.quantity || 0 }}
                                    </span>
                                    <Button class="p-0 shadow-none" icon="pi pi-plus" @click="invoiceStore.addItemToInvoice(item.id)" :disabled="item.totalStock === 0" severity="success" outlined rounded />
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>

                <!-- Customer List/Grid View -->
                <ScrollPanel v-if="currentView == 'list' && showMode == 'Products'" class="w-full">
                    <DataTable :value="filteredMenuItems.filter((i) => i.itemGroup === selectedCategory)" class="p-datatable-sm">
                        <Column field="image" header="Image" class="p-2">
                            <template #body="slotProps">
                                <div class="flex">
                                    <img :src="slotProps.data.image ? slotProps.data.image : '/src/assets/images/item.png'" width="50px" :alt="slotProps.data.name" class="border-round" />
                                </div>
                            </template>
                        </Column>

                        <Column field="name" header="name"></Column>

                        <Column field="totalStock" header="totalStock">
                            <template #body="slotProps">
                                <div>
                                    {{ slotProps.data.totalStock > 0 ? `${slotProps.data.totalStock} Available` : 'Out of Stock' }}
                                </div>
                            </template>
                        </Column>

                        <Column field="price" header="price">
                            <template #body="slotProps">
                                <div>${{ slotProps.data.price.toFixed(2) }}</div>
                            </template>
                        </Column>

                        <Column field="quantity" header="quantity">
                            <template #body="slotProps">
                                <div style="min-width: 74px" :class="slotProps.data.totalStock > 0 ? 'blac' : 'opacity-40 cursor-no-drop'" class="w-full gap-1 totalStock flex justify-content-between align-items-center">
                                    <Button
                                        class="p-0 shadow-none"
                                        icon="pi pi-minus"
                                        @click="invoiceStore.decreaseItemInInvoice(slotProps.data.id)"
                                        :disabled="!invoiceStore.invoice.items.find((i) => i.id === slotProps.data.id)?.quantity"
                                        severity="danger"
                                        outlined
                                        rounded
                                    />
                                    <span class="text-center font-medium">
                                        {{ invoiceStore.invoice.items.find((i) => i.id === slotProps.data.id)?.quantity || 0 }}
                                    </span>
                                    <Button class="p-0 shadow-none" icon="pi pi-plus" @click="invoiceStore.addItemToInvoice(slotProps.data.id)" :disabled="slotProps.data.totalStock === 0" severity="success" outlined rounded />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </ScrollPanel>

                <!-- other tabs -->

                <div v-show="showMode == 'Customers'">
                    <customerManagement :view="currentView" @updateView="(newView) => (currentView = newView)" />
                </div>

                <div v-show="showMode == 'Orders'">
                    <OrderHistory :fromInvoice="true" :view="currentView" @updateView="(newView) => (currentView = newView)" />
                </div>
            </div>

            <Dialog v-model:visible="showInvoiceDialog" :style="{ width: '50vw', height: '90vh' }">
                <!-- <invoiceDialog :modelValue="showInvoiceDialog"
            :orderItems="invoiceStore.invoice.items"
            :customer-name="invoiceStore.invoice.customer.name"
            :invoice-number="'1'" /> -->
            </Dialog>
        </div>

        <!-- Order Summary Card -->
        <Card class="lg:w-4 sticky top-0">
            <template #content>
                <!-- Customer Info -->
                <div class="mb-6 w-full">
                    <div class="flex justify-content-between align-items-center w-full">
                        <Button label="Customer Name" class="w-full p-button-outlined bg-primary" @click="showMode == 'Customers' ? (showMode = 'Products') : (showMode = 'Customers')" />
                        <Button icon="pi pi-ellipsis-v" class="p-button-sm ml-1 bg-primary" @click="showactions = !showactions" />
                    </div>
                </div>

                <!-- Order Items -->
                <div class="w-full h-full">
                    <OrderActionMenu :onClose="handleOnClose" v-if="showactions == true" />
                    <div class="flex justify-content-between align-items-center mb-3">
                        <h3 class="text-xl font-bold">Order Details</h3>
                        <Button icon="pi pi-trash" label="Clear All" @click="invoiceStore.clearInvoiceItems" :disabled="invoiceStore.invoice.items.length === 0" severity="danger" text />
                    </div>

                    <div class="Orders-items overflow-y-auto max-h-30rem">
                        <div v-for="item in invoiceStore.invoice.items" :key="item.id" class="mb-2 p-3 surface-ground border-round">
                            <div class="flex justify-content-between align-items-center">
                                <div class="flex align-items-center gap-2">
                                    <img :src="'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-15%20at%209.10.24%20PM-Y1GVfaII2ikT6z3XAanB72VCYKJAVF.jpeg'" :alt="item.itemName" class="w-3rem h-3rem border-round" />
                                    <div>
                                        <p class="font-medium">{{ item.itemName }}</p>
                                        <p class="text-sm text-600">${{ item.finalDiscountAmount.toFixed(2) }} each</p>
                                    </div>
                                </div>
                                <div class="flex align-items-center gap-2">
                                    <Button icon="pi pi-minus" @click="invoiceStore.decreaseItemInInvoice(item.id)" severity="danger" text />
                                    <span class="font-medium">{{ item.quantity }}</span>
                                    <Button icon="pi pi-plus" @click="invoiceStore.addItemToInvoice(item.id)" severity="success" text />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="height: 274px" class="w-full">
                    <!-- Order Summary -->
                    <div class="surface-ground p-3 border-round">
                        <h3 class="text-lg font-bold mb-3">Order Summary</h3>
                        <div class="flex justify-content-between mb-2">
                            <span>Subtotal</span>
                            <span class="font-medium">${{ subtotal.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-content-between mb-2">
                            <span>Discount</span>
                            <div class="flex gap-2">
                                <InputText v-model="discountAmount" placeholder="Amount" class="w-6rem" />
                                <Dropdown
                                    v-model="discountType"
                                    :options="[
                                        { label: '$', value: 'fixed' },
                                        { label: '%', value: 'percentage' }
                                    ]"
                                    optionLabel="label"
                                    optionValue="value"
                                    class="w-4rem"
                                />
                            </div>
                        </div>
                        <div class="border-top-1 surface-border pt-2 mt-2">
                            <div class="flex justify-content-between">
                                <span class="font-bold">Total</span>
                                <span class="text-xl font-bold text-primary">${{ total.toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Process Transaction Button -->
                    <div class="space-y-2 flex flex-column gap-2">
                        <Button label="Save as Draft" class="w-full p-button-outlined border-primary-200 my-2" @click="processTransaction(true)" :disabled="invoiceStore.invoice.items.length === 0" />
                        <div class="flex gap-2">
                            <Button label="Invoice" class="flex-1" @click="processTransaction(false)" :disabled="invoiceStore.invoice.items.length === 0" />
                            <Button label="Payment" class="flex-1 p-button-outlined" @click="showInvoiceDialog = true" />
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>

    <div class="footer flex justify-content-between align-items-center fixed bottom-0 h-2rem bg-gray-200 font-medium text-black-alpha-90">
        <div>User: Customer Name</div>

        <div>Terminal: POS-001</div>

        <div>Version: 1.0.0</div>

        <div>Connected to SAP ERP</div>
    </div>

    <PaymentDialog v-model:visible="paymentDialogVisible" />
</template>
<style>
.totalStock Button {
    width: 30px;
    height: 30px;
}

.p-card-body {
    padding: 0px;
    display: flex;
    height: 100%;
}
.cursor-no-drop {
    cursor: no-drop;
}
.p-card-content {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 0.75rem;
    min-width: 100%;

    justify-content: space-between;
}
</style>
<style scoped>
.p-tabview-nav {
    border: none;
}

.max-w-200px {
    width: 200px;
}

.p-tabview-nav-link {
    border: none !important;
}
.footer {
    width: -webkit-fill-available;
    padding-left: 2px;

    padding-right: 0px;
    margin-right: 26px;
}
/* .p-tabview-scrollable .p-tabview-nav-container {
    position: sticky !important;
    top: 0 !important;
    z-index: 1;
    background: #ffffff !important;
    border: 1px solid #e5e7eb;
    border-width: 0 0 2px 0;
}
.p-tabview-selected .p-tabview-nav-link {
    border-bottom: 2px solid var(--primary-color) !important;
} */
.item-img {
    width: 50%;
    align-self: center;
    aspect-ratio: 1/1;
}
.highbutton {
    z-index: 1 !important;
}
.accordion-overlay {
    position: relative; /* Establish the stacking context */
    display: inline-block; /* Ensure proper alignment with surrounding elements */
}

.accordion-overlay .p-accordion-content {
    position: absolute; /* Position the content over other elements */
    top: 100%; /* Align the content below the header */
    left: 0; /* Align with the left edge of the header */
    z-index: 1000; /* Ensure it appears above other elements */
    background-color: white; /* Match the background color of the design */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Add a shadow for better visibility */
    border-radius: 0.5rem; /* Add rounded corners */
    width: max-content; /* Adjust the width to fit the content */
    padding: 0.5rem; /* Add padding for spacing */
    overflow: hidden; /* Prevent content overflow */
}
.h-86vh {
    height: 86vh;
}
.min-h-90px {
    min-height: 90px;
}
.Orders-items {
    max-height: 371px !important;
}

.Products {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, auto));
    justify-items: center;
    justify-content: space-evenly;
}
</style>
