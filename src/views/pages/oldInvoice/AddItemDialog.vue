<template>
    <Dialog :header="itemData?.name" :style="{ width: '30vw' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" modal>
        <div class="flex flex-column gap-3">
            <div class="grid">
                <div class="col-6" v-for="(batch, index) in itemData?.batchOptions" :key="batch.id">
                    <div
                        @click="selectedBatch = index"
                        :class="[' flex flex-column border-1 border-dashed border-400 border-round-md p-4 align-items-center text-900 cursor-pointer', index === selectedBatch ? 'bg-primary-500 text-white border-solid border-primary' : '']"
                    >
                        <span class="font-bold">{{ batch.type === 'single' ? 'Single' : `Pack of ${batch.size}` }}</span>
                        <span class="">${{ batch.price }}</span>
                        <icon name="pi pi-check" class="text-green-500" v-if="index === selectedBatch"></icon>
                    </div>
                </div>
            </div>
            <div class="flex flex-column gap-3">
                <div class="flex flex-column gap-1">
                    <span class="font-bold">Discount Type</span>
                    <div class="flex flex-wrap gap-3">
                        <div class="flex align-items-center">
                            <RadioButton v-model="discountType" inputId="percentage" name="discount" value="percentage" />
                            <label for="percentage" class="ml-2">Percentage</label>
                        </div>
                        <div class="flex align-items-center">
                            <RadioButton v-model="discountType" inputId="amount" name="discount" value="amount" />
                            <label for="amount" class="ml-2">Amount</label>
                        </div>
                    </div>
                </div>
                <div class="flex flex-row justify-content-between gap-3 align-items-center">
                    <span v-if="discountType === 'percentage'" class="font-bold">Discount Percentage</span>
                    <span v-else class="font-bold">Discount Amount ($)</span>
                    <Dropdown v-if="discountType === 'percentage'" :options="discountTypes" v-model="discountValue" optionValue="value" optionLabel="name" placeholder="Select Discount">
                        <template #option="slotProps">
                            <div class="flex align-items-center gap-3">
                                <div>{{ slotProps.option.name }}</div>
                                <div>({{ slotProps.option.value }}%)</div>
                            </div>
                        </template>
                    </Dropdown>
                    <InputNumber v-else v-model="discountValue" placeholder="Discount Amount" />
                </div>
                <Button label="Add to Cart" class="" @click="addToCart"></Button>
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import { ref } from 'vue';
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

const addToCart = () => {
    const itemData = { id: props.itemData.id, selectedBatch: props.itemData.batchOptions[selectedBatch.value], discount: { type: discountType.value, value: discountValue.value } };
    emit('add-to-cart', itemData);
};
</script>
