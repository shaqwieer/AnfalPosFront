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

import apiClient from '@/api/apiClient';

const CustomersData = ref([]);

const getCustomers = async () => {
    try {
        console.log('response');
        const response = await apiClient.get(`/Customers`);
        CustomersData.value = response.data.data;
        console.log(CustomersData.value);
    } catch (err) {
        console.log(err);
    }
};
getCustomers();

// const formatCurrency = (value) => {
//     return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(value);
// };
</script>

<template>
    <div class="">
        <div class="card">
            <div class="flex flex-column md:flex-row md:align-items-start md:justify-content-between mb-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <Button icon="pi pi-refresh" @click="getCustomers" rounded raised />
                </div>
            </div>

            <DataTable :value="CustomersData" dataKey="id" paginator :rows="5" responsiveLayout="scroll" v-model:filters="filterSalesTable">
                <template #empty> No products found.</template>
                <Column field="name" header="Name" sortable :headerStyle="{ minWidth: '12rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">Name</span>
                        <div class="flex">{{ data.name }}</div>
                    </template>
                </Column>

                <Column field="address" header="address" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">address</span>
                        <div class="flex">{{ data.address }}</div>
                    </template>
                </Column>

                <Column field="creditBalance" header="creditBalance" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">credit Balance</span>
                        <div class="flex">{{ data.creditBalance }}</div>
                    </template>
                </Column>

                <Column field="email" header="email" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">email</span>
                        <div class="flex">{{ data.email }}</div>
                    </template>
                </Column>

                <Column field="id" header="id" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">id</span>
                        <div class="flex">{{ data.id }}</div>
                    </template>
                </Column>

                <Column field="primaryPhone" header="primaryPhone" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">Phone</span>
                        <!-- {{ data.secondaryPhone }} -->
                        <div class="flex">{{ data.primaryPhone }}</div>
                    </template>
                </Column>

                <Column field="sapCustomer" header="sapCustomer" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">sapCustomer</span>
                        <div class="flex">{{ data.sapCustomer }}</div>
                    </template>
                </Column>

                <Column field="type" header="type" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">type</span>
                        <div class="flex">{{ data.type }}</div>
                    </template>
                </Column>
            </DataTable>
        </div>
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
