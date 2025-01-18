<template>
    <div class="flex flex-column md:flex-row w-full gap-5">
        <div class="flex flex-column md:w-8 gap-5 w-full">
            <div class="flex flex-column sm:flex-row gap-2">
                <InputText id="productSearch" type="text" placeholder="Search Products..." class="w-full" />
                <div class="flex flex-row gap-2 min-w-max">
                    <Button label="Order History" icon="pi pi-history" class="border-primary-200" outlined @click="navigateToHistory"></Button>
                    <Button label="Draft Orders" icon="pi pi-file" class="border-primary-200" outlined @click="navigateToDraft"></Button>
                </div>
            </div>
            <div class="grid">
                <div class="col-6 sm:col-6 md:col-6 xl:col-4" v-for="item in invoiceStore.products" :key="item.id">
                    <ItemCard :itemData="item" @click="selectItem(item)" />
                </div>
            </div>
        </div>
        <div class="flex flex-column w-full md:w-4">
            <div class="card w-full flex flex-column">
                <h4>Current Sale</h4>
                <div class="flex flex-column gap-4">
                    <div v-for="(item, index) in invoiceStore.invoice.items" :key="item.id" class="flex flex-row justify-content-between">
                        <div class="flex flex-column gap-1">
                            <span class="font-semibold text-900 text-lg">{{ item.name }}</span>
                            <div class="flex flex-row gap-2">
                                <span class="text-500">{{ item.finalDiscountAmount }}x{{ item.quantity }}</span>
                                <!-- <span v-if="item.discount.value > 0" class="text-green-500"> ({{ item.discount.value + '' + (item.discount.type == 'percentage' ? '%' : '$') + ' off' }})</span> -->
                            </div>

                            <!-- <span class="text-500">{{ item.selectedBatch.type === 'single' ? 'Single' : `Pack of ${item.selectedBatch.size}` }}</span> -->
                        </div>
                        <div class="flex flex-row align-items-center">
                            <div class="flex flex-row align-items-center gap-3">
                                <Button icon="pi pi-plus" class="border-400" severity="contrast" outlined size="small" @click="invoiceStore.addItemToInvoice(item)"></Button>
                                <span class="text-800 text-lg">{{ item.quantity }}</span>
                                <Button icon="pi pi-minus" class="border-400" severity="contrast" outlined size="small" @click="invoiceStore.decreaseItemInInvoice(index)"></Button>
                            </div>
                            <Button icon="pi pi-trash" severity="danger" rounded text size="small" @click="invoiceStore.removeItemFromInvoice(index)" />
                        </div>
                    </div>
                </div>
                <hr />
                <div class="flex flex-column gap-3">
                    <div class="flex flex-row justify-content-between">
                        <div>Subtotal</div>
                        <div>{{ subtotal.toFixed(2) }}</div>
                    </div>
                    <div class="flex flex-row justify-content-between">
                        <div>Discount</div>
                        <div>{{ discount.toFixed(2) }}</div>
                    </div>
                    <div class="flex flex-row justify-content-between">
                        <div>Tax</div>
                        <div>14%</div>
                    </div>
                    <div class="flex flex-row justify-content-between">
                        <div>Tax Amount</div>
                        <div>{{ ((subtotal - discount) * 0.14).toFixed(2) }}</div>
                    </div>
                    <div class="flex flex-row justify-content-between font-bold">
                        <div>Total</div>
                        <div>{{ ((subtotal - discount) * 1.14).toFixed(2) }}</div>
                    </div>
                    <div class="flex flex-column gap-2">
                        <Button label="Complete Sale" class=""></Button>
                        <Button label="Save as Draft" class="border-primary-200" outlined></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AddItemDialog :itemData="selectedItem" v-model:visible="addItemVisible" @add-to-cart="addItemToInvoice" />
</template>
<script setup>
import { computed, ref } from 'vue';
import ItemCard from './ItemCard.vue';
import AddItemDialog from './AddItemDialog.vue';
import { useInvoiceStore } from '@/stores/invoiceStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const invoiceStore = useInvoiceStore();
const subtotal = computed(() => {
    return invoiceStore.invoice.items.reduce((total, item) => {
        return total + item.finalDiscountAmount * item.quantity;
    }, 0);
});
const discount = computed(() => {
    // return invoiceStore.invoice.items.reduce((total, item) => {
    //     if (item.discount.type === 'percentage') return total + (item.finalDiscountAmount * item.quantity ) / 100;
    //     else return total + item.discount.value;
    // }, 0);
    return 0;
});

const addItemVisible = ref(false);
const selectedItem = ref(null);
const selectItem = (item) => {
    selectedItem.value = item;
    addItemVisible.value = true;
};

const addItemToInvoice = (item) => {
    invoiceStore.addItemToInvoice(item);
    selectedItem.value = null;
    addItemVisible.value = false;
};

const navigateToHistory = () => {
    router.push({ name: 'OrderHistory' });
};
const navigateToDraft = () => {
    router.push({ name: 'DraftOrders' });
};
</script>
