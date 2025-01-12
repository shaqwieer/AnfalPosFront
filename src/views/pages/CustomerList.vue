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
        companyName: 'Company A',
        address: '123 Main St, City A',
        email: 'contact@companya.com',
        primaryPhone: '+962792000111',
        secondaryPhone: '+962792000222',
        creditBalance: 1000,
        type: 1,
        name: 'LCS24001111',
        sapCustomer: 'L2S001',
        vatNumber: 'VAT123456',
        id: 1001,
        uniqueIdentifier: 'e1b73127-1f22-45b3-99f4-567c1a12abcd',
        createdAt: '2025-01-05T16:18:21.272344Z'
    },
    {
        companyName: 'Company B',
        address: '456 Elm St, City B',
        email: 'info@companyb.com',
        primaryPhone: '+962792000333',
        secondaryPhone: '+962792000444',
        creditBalance: 2000,
        type: 2,
        name: 'LCS24002222',
        sapCustomer: 'L2S002',
        vatNumber: 'VAT654321',
        id: 1002,
        uniqueIdentifier: 'a9c82f49-2f6a-4db3-baa1-1234abcd5678',
        createdAt: '2025-01-05T17:30:00.000000Z'
    },
    {
        companyName: 'Company C',
        address: '789 Oak St, City C',
        email: 'support@companyc.com',
        primaryPhone: '+962792000555',
        secondaryPhone: '+962792000666',
        creditBalance: 1500,
        type: 1,
        name: 'LCS24003333',
        sapCustomer: 'L2S003',
        vatNumber: 'VAT987654',
        id: 1003,
        uniqueIdentifier: 'b2f3c234-4acd-44b3-a456-abcdef123456',
        createdAt: '2025-01-06T10:15:00.000000Z'
    },
    {
        companyName: 'Company D',
        address: '101 Pine St, City D',
        email: 'hello@companyd.com',
        primaryPhone: '+962792000777',
        secondaryPhone: '+962792000888',
        creditBalance: 500,
        type: 2,
        name: 'LCS24004444',
        sapCustomer: 'L2S004',
        vatNumber: 'VAT112233',
        id: 1004,
        uniqueIdentifier: 'c3d4f567-5ef6-6a78-b89c-123456abcdef',
        createdAt: '2025-01-06T12:45:00.000000Z'
    },
    {
        companyName: 'Company E',
        address: '202 Birch St, City E',
        email: 'sales@companye.com',
        primaryPhone: '+962792000999',
        secondaryPhone: null,
        creditBalance: 300,
        type: 1,
        name: 'LCS24005555',
        sapCustomer: 'L2S005',
        vatNumber: null,
        id: 1005,
        uniqueIdentifier: 'd4e5f678-7gh8-8i90-j123-k456lmnopqrs',
        createdAt: '2025-01-07T08:30:00.000000Z'
    },
    {
        companyName: 'Company F',
        address: '303 Cedar St, City F',
        email: 'admin@companyf.com',
        primaryPhone: '+962792000111',
        secondaryPhone: '+962792000222',
        creditBalance: 750,
        type: 2,
        name: 'LCS24006666',
        sapCustomer: 'L2S006',
        vatNumber: 'VAT334455',
        id: 1006,
        uniqueIdentifier: 'e5f6g789-8hi9-0j12-k34l-m56nopqrstuv',
        createdAt: '2025-01-07T10:00:00.000000Z'
    },
    {
        companyName: 'Company G',
        address: '404 Maple St, City G',
        email: 'info@companyg.com',
        primaryPhone: '+962792000333',
        secondaryPhone: null,
        creditBalance: 400,
        type: 1,
        name: 'LCS24007777',
        sapCustomer: 'L2S007',
        vatNumber: 'VAT556677',
        id: 1007,
        uniqueIdentifier: 'f6g7h890-9ij1-2k34-l45m-n67opqrstuvw',
        createdAt: '2025-01-08T09:00:00.000000Z'
    },
    {
        companyName: 'Company H',
        address: '505 Walnut St, City H',
        email: 'hello@companyh.com',
        primaryPhone: '+962792000444',
        secondaryPhone: '+962792000555',
        creditBalance: 1200,
        type: 2,
        name: 'LCS24008888',
        sapCustomer: 'L2S008',
        vatNumber: 'VAT778899',
        id: 1008,
        uniqueIdentifier: 'g7h8i901-0jk2-3l45-m56n-o78pqrstuvwx',
        createdAt: '2025-01-08T14:30:00.000000Z'
    },
    {
        companyName: 'Company I',
        address: '606 Spruce St, City I',
        email: 'support@companyi.com',
        primaryPhone: '+962792000666',
        secondaryPhone: null,
        creditBalance: 800,
        type: 1,
        name: 'LCS24009999',
        sapCustomer: 'L2S009',
        vatNumber: null,
        id: 1009,
        uniqueIdentifier: 'h8i9j012-1kl3-4m56-n78o-p89qrstuvwxy',
        createdAt: '2025-01-09T08:00:00.000000Z'
    },
    {
        companyName: 'Company J',
        address: '707 Redwood St, City J',
        email: 'contact@companyj.com',
        primaryPhone: '+962792000777',
        secondaryPhone: '+962792000888',
        creditBalance: 0,
        type: 2,
        name: 'LCS24001000',
        sapCustomer: 'L2S010',
        vatNumber: 'VAT990011',
        id: 1010,
        uniqueIdentifier: 'i9j0k123-2lm4-5n67-o89p-q90rstuvwxyz',
        createdAt: '2025-01-10T16:45:00.000000Z'
    }
];

const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(value);
};
</script>

<template>
    <div>
        <DataTable :value="testData" tableStyle="min-width: 50rem">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Companies</span>
                    <Button icon="pi pi-refresh" rounded raised />
                </div>
            </template>

            <Column field="companyName" header="company Name"></Column>
            <Column field="address" header="address"></Column>
            <Column field="creditBalance" header="credit Balance"></Column>
            <Column field="name" header="name"></Column>
            <Column field="sapCustomer" header="sap Customer"></Column>
            <Column field="vatNumber" header="vat Number"></Column>
            <template #footer>
                <div class="flex justify-between items-center flex-column gap-2">
                    <span>In total there are {{ testData.length }} products.</span>
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
