<template>
    <Dialog :header="itemData?.name" :style="{ width: '50vw' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" modal>
        <div class="flex flex-column w-full gap-3">
            <div class="w-full flex flex-column gap-2">
                    <div class="flex justify-content-between align-items-center mb-3">
                        <h3 class="text-xl font-bold">Order Details</h3>
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
                                    <span class="font-medium">{{ item.quantity }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="surface-ground p-3 border-round w-full">
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
                <div class="flex flex-column gap-2">
                    <div class="flex gap-2 w-full">
                        <Button label="Cash" class="border-primary-200" />
                        <Button label="Card" class="border-primary-200" />

                    </div>
                    <Button label="Complete Sale" @click="processTransaction" :disabled="invoiceStore.invoice.items.length === 0" />
                </div>
        </div>
    </Dialog>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useInvoiceStore } from '../../../stores/invoiceStore';
import { useMainStore } from '../../../stores/mainStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const invoiceStore = useInvoiceStore();
const mainStore = useMainStore();

const props = defineProps(['itemData']);
const emit = defineEmits(['add-to-cart']);
const selectedBatch = ref(0);
const discountType = ref('percentage');
const discountValue = ref(0);
const discountTypes = [
    { name: 'No Discount', value: 0 },
    { name: 'Small Discount', value: 5 },
    { name: 'Medium Discount', value: 10 },
    { name: 'Large Discount', value: 15 },
    { name: 'Clearance', value: 20 }
];
const paymentType = ref('cash');
const subtotal = computed(() => invoiceStore.invoice.items.reduce((sum, item) => sum + item.finalDiscountAmount * item.quantity, 0));
// const calculateDiscount = (amount: string, type: 'fixed' | 'percentage', subtotalValue: number) => {
//     if (!amount) return 0;
//     const parsedAmount = parseFloat(amount);
//     if (isNaN(parsedAmount)) return 0;
//     if (type === 'fixed') {
//         return Math.min(parsedAmount, subtotalValue);
//     } else {
//         return Math.min(subtotalValue * (parsedAmount / 100), subtotalValue);
//     }
// };

const total = computed(() => {
    //const discount = calculateDiscount(discountAmount.value, discountType.value, subtotal.value);
    return subtotal.value - 0;
});
const addToCart = () => {
    const itemData = { id: props.itemData.id, selectedBatch: props.itemData.batchOptions[selectedBatch.value], discount: { type: discountType.value, value: discountValue.value } };
    emit('add-to-cart', itemData);
};
</script>
