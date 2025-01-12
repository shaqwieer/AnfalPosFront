<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, ref } from 'vue';
// import AppConfig from '@/layout/AppConfig.vue';
import { useRouter } from 'vue-router';
import { usePrimeVue } from 'primevue/config';

const $primevue = usePrimeVue();

defineExpose({
    $primevue
});

const router = useRouter();
const { layoutConfig } = useLayout();
const darkMode = computed(() => {
    return layoutConfig.colorScheme.value !== 'light';
});
const navigateToDashboard = () => {
    router.push('/');
};

const testData = ref([]);
testData.value = [
    {
        barcode: 'AAAAAA SSSSSSSSS',
        brand: null,
        itemGroup: 'BTY',
        sapDescAr: 'ACDelco N55D23R إيه سي ديلكو بطارية',
        sapDescEn: 'ACDelco N55D23R إيه سي ديلكو بطارية',
        sapItem: 'CPBATACD006',
        sapPlant: 'MC01',
        price: 236.1,
        id: 29586,
        uniqueIdentifier: '914b873f-d550-4c19-bbd1-d177767ab30c',
        createdAt: '2025-01-05T16:06:10.069689Z'
    },
    {
        barcode: 'BBBBBB SSSSSSSSS',
        brand: null,
        itemGroup: 'BTY',
        sapDescAr: 'ACDelco N55D23L إيه سي ديلكو بطارية',
        sapDescEn: 'ACDelco N55D23L إيه سي ديلكو بطارية',
        sapItem: 'CPBATACD005',
        sapPlant: 'MC01',
        price: 236.1,
        id: 29587,
        uniqueIdentifier: '06806bf4-1e1d-44c3-bd94-c20c67a83442',
        createdAt: '2025-01-05T16:06:10.069689Z'
    }
];
const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(value);
};

const totalPrice = computed(() => {
    return testData.value.reduce((sum, item) => sum + item.price, 0);
});
</script>

<template>
    <div>
        <DataTable :value="testData" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Products</span>
                    <Button icon="pi pi-refresh" rounded raised />
                </div>
            </template>

            <Column field="sapItem" header="Item Code">
                <template #body="slotProps">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span>{{ slotProps.data.sapItem }}</span>
                    </div>
                </template>
            </Column>

            <Column field="sapDescEn" header="Description">
                <template #body="slotProps">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span>{{ slotProps.data.sapDescEn }}</span>
                    </div>
                </template>
            </Column>

            <Column field="price" header="Price">
                <template #body="slotProps">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span> {{ formatCurrency(slotProps.data.price) }}</span>
                    </div>
                </template>
            </Column>

            <Column field="itemGroup" header="Item Group">
                <template #body="slotProps">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span>{{ slotProps.data.itemGroup }}</span>
                    </div>
                </template>
            </Column>

            <Column field="barcode" header="Barcode">
                <template #body="slotProps">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span>{{ slotProps.data.barcode }}</span>
                    </div>
                </template>
            </Column>

            <Column field="sapPlant" header="Plant">
                <template #body="slotProps">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span>{{ slotProps.data.sapPlant }}</span>
                    </div>
                </template>
            </Column>

            <template #footer>
                <div class="flex justify-between items-center flex-column gap-2">
                    <span>In total there are {{ testData.length }} products.</span>
                    <span class="font-bold">Total Price: {{ formatCurrency(totalPrice) }}</span>
                </div>
            </template>
        </DataTable>
    </div>
</template>

<style scoped>
.bg-circle {
    width: 1000px;
    height: 1000px;
    border-radius: 50%;
    background-image: linear-gradient(140deg, var(--primary-color), var(--surface-ground) 80%);
    position: absolute;
    opacity: 0.25;
    z-index: -1;
}
</style>
