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

const ItemsData = ref([]);

const getItems = async () => {
    try {
        console.log('response');
        const response = await apiClient.get(`/Items`);
        ItemsData.value = response.data.data;
        console.log(ItemsData.value);
    } catch (err) {
        console.log(err);
    }
};
getItems();

const Rtl = ref();
const getRtl = localStorage.getItem('Rtl');
Rtl.value = getRtl;
console.log(Rtl.value);


import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

</script>

<template>
    <div class="">
        <div class="flex flex-column gap-2">
            <PageTopBar :title="t(`items`)" simple></PageTopBar>

            <DataTable :value="ItemsData" dataKey="id" paginator :rows="5" responsiveLayout="scroll" v-model:filters="filterSalesTable">
                <template #empty> No products found.</template>
                <Column field="barcode" header="barcode" sortable :headerStyle="{ minWidth: '12rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">barcode</span>
                        <div class="flex">{{ data.barcode }}</div>
                    </template>
                </Column>

                <Column field="brand" header="brand" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">brand</span>
                        <div class="flex">{{ data.brand }}</div>
                    </template>
                </Column>

                <Column field="id" header="id" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">id</span>
                        <div class="flex">{{ data.id }}</div>
                    </template>
                </Column>

                <Column field="itemGroup" header="itemGroup" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">itemGroup</span>
                        <div class="flex">{{ data.itemGroup }}</div>
                    </template>
                </Column>

                <Column field="price" header="price" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">price</span>
                        <div class="flex">{{ data.price }}</div>
                    </template>
                </Column>

                <Column field="sapDescAr" v-if="Rtl" header="sapDescAr" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">sapDescAr</span>

                        <div class="flex">{{ data.sapDescAr }}</div>
                    </template>
                </Column>

                <Column field="sapDescEn" v-else header="sapDescEn" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">sapDescEn</span>

                        <div class="flex">{{ data.sapDescEn }}</div>
                    </template>
                </Column>

                <Column field="sapItem" header="sapItem" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">sapItem</span>

                        <div class="flex">{{ data.sapItem }}</div>
                    </template>
                </Column>

                <Column field="sapPlant" header="sapPlant" sortable :headerStyle="{ minWidth: '10rem' }">
                    <template #body="{ data }">
                        <span class="p-column-title">sapPlant</span>

                        <div class="flex">{{ data.sapPlant }}</div>
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
