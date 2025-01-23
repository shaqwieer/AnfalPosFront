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
import customerList from '../customerList.vue'
import invoiceDialog from './masterInvoice/invoiceDialog.vue';
import orderHistory from './masterInvoice/orderHistory.vue';
import orderlist from './masterInvoice/orderlist.vue';
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
  
]);
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
        const [categoryResponse, invoiceResponse] = await Promise.all([
            apiClient.get('/Items/GetCategoriesForItems'),
            apiClient.post('/Invoices/GetQuickInvoice')
        ]);
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

const activeIndex = ref(0);

function setActiveIndex(index) {
    activeIndex.value = index;
}
const viewModes = ref<InvoiceViewItem[]>([
    { viewMode: 'Products' },
    { viewMode: 'Customers' },
    { viewMode: 'Orders' }
]);
const showMode = ref('Products');
function updateShowMode() {
    showMode.value = showMode.value;
}
const currentView = ref('list')
const showactions = ref(false);

const handleOnClose = () => {
    showactions.value=false;
}
const showInvoiceDialog = ref(false);
</script>

<template>
    <orderHistory />
    <div class="flex flex-column lg:flex-row gap-2 overflow-auto">
        <!-- Main Content -->
        
        <div class="flex flex-column gap-2 lg:w-8 w-full overflow-y-auto overflow-x-hidden">
            <div class="flex flex-column sm:flex-row gap-4">
                    <InputText v-model="searchQuery" id="productSearch" type="text" placeholder="Search Products..." class="w-full" />
                     <div class="flex flex-row gap-2 min-w-max">
                      <Dropdown v-model="showMode" :options="viewModes" optionLabel="viewMode" optionValue="viewMode" placeholder="Select a view" class="w-full" @change="updateShowMode" /> 

                        <!-- <Button label="Order History" icon="pi pi-history" class="border-primary-200" outlined @click="navigateToHistory"></Button>
                        <Button label="Draft Orders" icon="pi pi-file" class="border-primary-200" outlined @click="navigateToDraft"></Button> -->
                    </div> 
                </div>
            <div  v-show="showMode == 'Products'">
               

            <!-- Search Bar -->
             <div class="flex flex-column gap-2 sticky top-0 surface-50 z-5">
               
                <div class="flex flex-wrap gap-2">
                    <button
                    v-for="category in categories"
                    :key="category"
                     @click="selectedCategory = category"
                    class="p-button p-button-outlined p-button-sm text-xs"
                    >
                    {{ category }}
                    </button>
                </div>
              
            </div>


            <div class="grid overflow-y-auto max-h-screen"> 
                <div v-for="item in filteredMenuItems.filter((i) => i.itemGroup === selectedCategory)" :key="item.id" class="col-12 sm:col-6 xl:col-4">
                    <Card class="h-full border-round shadow-2" > 
                        <template #content>
                            <div class="flex flex-column gap-4 p-3">
                                <img :src="item.image ? item.image : '/src/assets/images/item.png'" :alt="item.name" class="item-img w-10rem h-10rem border-round mx-auto" />
                                <div class="flex flex-column gap-2">
                                    <h3 class="font-semibold text-lg mb-2">{{ item.name }}</h3>
                                    <span v-if="item.totalStock === 0" class="text-danger ml-2">
            <i class="pi pi-exclamation-triangle"></i> Out of Stock
        </span>
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
         </div>
           <div v-show="showMode == 'Customers'">
            <customerManagement  :view="currentView" @updateView="(newView) => currentView = newView"/>
            </div>
           <div v-show="showMode == 'Orders'">
            <OrderHistory :fromInvoice="true"  :view="currentView" @updateView="(newView) => currentView = newView"/>
           </div>
        </div>

        

        <!-- Order Summary Card -->
        <Card class="w-full lg:w-6 sticky top-0">
            <template #content>
                <!-- Customer Info -->
                <div class="mb-6">
                    <div class="flex justify-content-between align-items-center w-full px-2">
                        <Button label="Customer Name"  class="w-full p-button-outlined border-primary-200 my-2 bg-primary" @click=" showMode == 'Customers' ? showMode = 'Products' : showMode = 'Customers'" />
                        <Button icon="pi pi-ellipsis-v" class="p-button-sm ml-1 px-2 mr-1 bg-primary"    @click="showactions = !showactions"/> 
                   
                    </div>

                </div>

                <!-- Order Items -->
                <div class="">
                    <OrderActionMenu :onClose="handleOnClose" v-if="showactions==true"/>
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
                <div class="space-y-2 flex flex-column gap-2">
                    <Button label="Save as Draft" class="w-full p-button-outlined border-primary-200 my-2" @click="processTransaction(true)" :disabled="invoiceStore.invoice.items.length === 0" />
                    <div class="flex gap-2">
                    <Button label="Invoice" class="flex-1" @click="processTransaction(false)" :disabled="invoiceStore.invoice.items.length === 0" />
                    <Button label="Payment" class="flex-1 p-button-outlined" @click="showInvoiceDialog = true" />
                    </div>
                </div>
                
            
            </template>
        </Card>
        <Dialog v-model:visible="showInvoiceDialog" :style="{ width: '50vw' , height: '90vh' }" >
            <!-- <invoiceDialog :modelValue="showInvoiceDialog"
            :orderItems="invoiceStore.invoice.items"
            :customer-name="invoiceStore.invoice.customer.name"
            :invoice-number="'1'" /> -->
            
        </Dialog>
    </div>
    
    <PaymentDialog v-model:visible="paymentDialogVisible"   
        />
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



</style>
