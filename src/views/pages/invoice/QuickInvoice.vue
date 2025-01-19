<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '../../../api/apiClient';
import { handleError } from '../../../utilities/errorHandler';
import PaymentDialog from './PaymentDialog.vue';
import type { OrderItem, Order, Customer } from './types';
import { useInvoiceStore } from '../../../stores/invoiceStore';
import { useMainStore } from '../../../stores/mainStore';
import { useRouter } from 'vue-router';
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
const commercialCustomers = ref<Customer[]>([
    {
        name: 'Acme Corp',
        address: '123 Business St',
        email: '',
        primaryPhone: '',
        secondaryPhone: '',
        creditBalance: 0,
        sapCustomer: '',
        vatNumber: '',
        isBusinessPartner: false
    },
    {
        name: 'TechStart Inc',
        address: '456 Innovation Ave',
        email: '',
        primaryPhone: '',
        secondaryPhone: '',
        creditBalance: 0,
        sapCustomer: '',
        vatNumber: '',
        isBusinessPartner: false
    },
    {
        name: 'Global Traders',
        address: '789 Market Blvd',
        email: '',
        primaryPhone: '',
        secondaryPhone: '',
        creditBalance: 0,
        sapCustomer: '',
        vatNumber: '',
        isBusinessPartner: false
    }
]);
const categories = ref<string[]>([]);

const orders = ref<Order[]>([
    { id: '#12532', customerName: 'Vinicius Bayu', status: 'cancelled', time: '3 mins', table: 'Table 3' },
    { id: '#12533', customerName: 'Cheryl Arema', status: 'ready', time: '3 mins', table: 'Table 3' },
    { id: '#12531', customerName: 'Kylian Rex', status: 'waiting', time: '12 mins', table: 'Table 4' },
    { id: '#12529', customerName: 'Rijal Arudam', status: 'completed', time: '3 mins', table: 'Table 24' }
]);

const statusColors = {
    cancelled: 'error',
    ready: 'success',
    UnderRevision: 'warning',
    completed: 'info'
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

const processTransaction = async () => {
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
        const response = await apiClient.get(`/Items/GetCategoriesForItems`);
        categories.value = response.data.data;
        selectedCategory.value = categories.value[0];
        const response2 = await apiClient.post(`/Invoices/GetQuickInvoice`);
        invoiceStore.HistoryOrders = response2.data.data;
    } catch (err) {
        handleError(err, mainStore.loading);
    }
});
const search = (e) => {
    setTimeout(() => {
        if (!searchQuery.value.trim().length) {
            var temp = selectedCategory.value 
            selectedCategory.value = '';
            selectedCategory.value = temp
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

//test

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
</script>

<template>
    <div class="flex flex-column lg:flex-row gap-2 overflow-auto">
        <!-- Main Content -->
        <div class="flex flex-column gap-2 lg:w-8 w-full overflow-y-auto overflow-x-hidden">
            <div class="flex justify-content-between align-items-center">
                <span class="text-2xl font-bold">Orders </span>
                <Button label="See All Orders" class="border-primary-200" outlined @click="navigateToHistory" />
            </div>
            <div class="grid">
                <div v-for="order in invoiceStore.HistoryOrders.slice(0, 4)" :key="order.id" class="col-12 md:col-6 lg:col-3">
                    <Card unstyled class="bg-white p-3 border-round shadow-1">
                        <template #content>
                            <div class="flex justify-content-between">
                                <div>
                                    <p class="font-semibold text-900">{{ order.customerName }}</p>
                                    <p class="text-sm text-600">{{ new Date(order.createdAt).toLocaleDateString(locale)  }}</p>
                                </div>
                                <span class="text-sm font-medium text-500">{{ order.id }}</span>
                            </div>
                            <Badge :value="order.currentStatus" :severity="statusColors[order.currentStatus]" class="mt-2" />
                        </template>
                    </Card>
                </div>
            </div>

            <!-- Search Bar -->
            <div class="flex flex-column gap-2 sticky top-0 surface-50 z-5">
                <div class="flex flex-column sm:flex-row gap-2">
                    <InputText v-model="searchQuery" id="productSearch" type="text" placeholder="Search Products..." class="w-full" />
                    <div class="flex flex-row gap-2 min-w-max">
                        <Button label="Order History" icon="pi pi-history" class="border-primary-200" outlined @click="navigateToHistory"></Button>
                        <Button label="Draft Orders" icon="pi pi-file" class="border-primary-200" outlined @click="navigateToDraft"></Button>
                    </div>
                </div>

                <div class="flex flex-row max-w-full overflow-x-auto bg-white sticky top-0 border-bottom-1 surface-border">
                    <Button
                        v-for="category in categories"
                        :key="category"
                        :label="category.charAt(0).toUpperCase() + category.slice(1)"
                        outlined
                        class="min-w-max p-2 border-transparent hover:border-primary-400 hover:border-bottom-3 transition-colors transition-duration-150"
                        :class="{
                            'border-primary-400 border-bottom-3': selectedCategory === category
                        }"
                        @click="selectedCategory = category"
                    />
                </div>
            </div>


            <div class="grid overflow-y-auto max-h-screen">
                <div v-for="item in filteredMenuItems.filter((i) => i.itemGroup === selectedCategory)" :key="item.id" class="col-12 sm:col-6 xl:col-4">
                    <Card class="h-full border-round shadow-2" >
                        <template #content>
                            <div class="flex flex-column gap-4 p-3">
                                <img :src="item.image ? item.image : '/src/assets/images/anfal.png'" :alt="item.name" class="item-img w-10rem h-10rem border-round mx-auto" />
                                <div class="flex flex-column gap-2">
                                    <h3 class="font-semibold text-lg mb-2">{{ item.name }}</h3>

                                    <div class="flex flex-row gap-2 text-sm text-500 justify-content-between">
                                        <span>{{ item.totalStock }} Available</span>
                                        <span class="text-lg font-semibold text-primary">${{ item.price.toFixed(2) }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-content-center align-items-center border-top-1 surface-border pt-3 mt-3">
                                <Button icon="pi pi-minus" @click="invoiceStore.decreaseItemInInvoice(item.id)" :disabled="!invoiceStore.invoice.items.find((i) => i.id === item.id)?.quantity" severity="danger" outlined rounded />
                                <span class="w-4rem text-center font-medium">
                                    {{ invoiceStore.invoice.items.find((i) => i.id === item.id)?.quantity || 0 }}
                                </span>
                                <Button icon="pi pi-plus" @click="invoiceStore.addItemToInvoice(item.id)" :disabled="item.totalStock === 0" severity="success" outlined rounded />
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
            <!-- Menu Tabs -->
            <!-- <TabView :scrollable="true" @update:activeIndex="(i) => (selectedCategory = categories[i])" class="overflow-auto">
                <TabPanel v-for="category in categories" :key="category" :header="category.charAt(0).toUpperCase() + category.slice(1)" headerClass="sticky top-0">
                    <div class="grid">
                        <div v-for="item in filteredMenuItems.filter((i) => i.itemGroup === category)" :key="item.id" class="col-12 sm:col-6 xl:col-4">
                            <Card>
                                <template #content>
                                    <div class="flex flex-column gap-4">
                                        <img :src="item.image" :alt="item.name" class="item-img border-round" />
                                        <div class="flex flex-column gap-2">
                                            <h3 class="font-semibold text-lg mb-2">{{ item.name }}</h3>

                                            <div class="flex flex-row gap-2 text-sm text-500 justify-content-between">
                                                <span>{{ item.totalStock }} Available</span>
                                                <span class="text-lg font-semibold text-primary">${{ item.price.toFixed(2) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex justify-content-center align-items-center border-top-1 surface-border pt-3 mt-3 z-1">
                                        <Button class="highbutton" icon="pi pi-minus" @click="invoiceStore.decreaseItemInInvoice(item.id)" :disabled="!invoiceStore.invoice.items.find((i) => i.id === item.id)?.quantity" severity="danger" outlined />
                                        <span class="w-4rem text-center font-medium">
                                            {{ invoiceStore.invoice.items.find((i) => i.id === item.id)?.quantity || 0 }}
                                        </span>
                                        <Button class="highbutton" icon="pi pi-plus" @click="invoiceStore.addItemToInvoice(item.id)" :disabled="item.totalStock === 0" severity="success" outlined />
                                    </div>
                                </template>
                            </Card>
                        </div>
                    </div>
                </TabPanel>
            </TabView> -->
            <!-- <div class="col-12 flex justify-content-center mt-4">
                <Paginator :first="first" :rows="rows" :totalRecords="totalRecords" :rowsPerPageOptions="[6, 12, 18, 24]" @update:first="onFirstChange" @update:rows="onRowsChange" @page="onPageChange" />
            </div> -->
        </div>

        <!-- Order Summary Card -->
        <Card class="w-full lg:w-4 sticky top-0">
            <template #content>
                <!-- Customer Info -->
                <div class="mb-4">
                    <h2 class="text-xl font-bold mb-3">Customer Info</h2>
                    <div class="flex gap-3 mb-3">
                        <div class="flex align-items-center">
                            <RadioButton v-model="customerType" value="express" inputId="express" />
                            <label for="express" class="ml-2">Walk-in</label>
                        </div>
                        <div class="flex align-items-center">
                            <RadioButton v-model="customerType" value="commercial" inputId="commercial" />
                            <label for="commercial" class="ml-2">Business partner</label>
                        </div>
                    </div>

                    <div v-if="customerType === 'express'">
                        <InputText v-model="customerName" placeholder="Customer Name" class="w-full" />
                    </div>
                    <div v-else>
                        <Dropdown v-model="selectedCommercialCustomer" :options="commercialCustomers" optionLabel="name" optionValue="id" placeholder="Select Customer" class="w-full mb-2" />

                        <div v-if="selectedCommercialCustomer === 'new'" class="flex flex-column gap-2">
                            <InputText v-model="customerName" placeholder="Company Name" />
                            <InputText v-model="companyAddress" placeholder="Company Address" />
                            <Button label="Add New Customer" icon="pi pi-plus" />
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="">
                    <div class="flex justify-content-between align-items-center mb-3">
                        <h3 class="text-xl font-bold">Order Details</h3>
                        <Button icon="pi pi-trash" label="Clear All" @click="invoiceStore.clearInvoiceItems" :disabled="invoiceStore.invoice.items.length === 0" severity="danger" text />
                    </div>

                    <div class="overflow-y-auto max-h-30rem">
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
                <hr />
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

                <div class="flex flex-column gap-2">
                    <Button label="Complete Sale" @click="processTransaction" :disabled="invoiceStore.invoice.items.length === 0" />
                    <Button label="Save as Draft" class="border-primary-200" outlined @click="paymentDialogVisible = true"></Button>
                </div>
            </template>
        </Card>
    </div>
    <PaymentDialog v-model:visible="paymentDialogVisible" />
</template>

<style scoped>
.p-tabview-nav {
    border: none;
}

.p-tabview-nav-link {
    border: none !important;
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
</style>
