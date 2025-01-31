<script setup>
import { ref, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import ScrollPanel from 'primevue/scrollpanel';
import ToggleButton from 'primevue/togglebutton';
import Dropdown from 'primevue/dropdown';
import apiClient from '../../../api/apiClient';

const ShiftSession = ref([]);
const GetShiftSession = async () => {
    const response = await apiClient.get(`/ShiftSessions/GetBeforeCloseShiftSession`);
    // ShiftSession.value = response.data.data ? [response.data.data] : [];

    const repeatCount = 5;
    ShiftSession.value = response.data.data ? Array(repeatCount).fill(response.data.data) : [];
};

onMounted(() => {
    GetShiftSession();
});

const formatDateTime = (isoDate) => {
    return new Date(isoDate).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
};

import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

import PageTopBar from '../../../components/pageTopBar.vue';
</script>

<template>
    <div class="customer-management pt-4">
        <PageTopBar :fromInvoice="fromInvoice" :title="'Order History'" v-model:value="isGrid" :simple="true" :hasSearch="false" :hasAddButton="false"></PageTopBar>
        <DataTable :value="ShiftSession" class="p-datatable-sm">
            <Column field="businessEntityName" :header="`${$t(`POS.name`)}`" class="p-2 font-bold h-4rem">
                <template #body="slotProps">
                    <div class="flex">
                        {{ slotProps.data.businessEntityName }}
                        {{}}
                    </div>
                </template>
            </Column>

            <Column field="statusName" :header="`${$t(`POS.Status`)}`" class="p-2">
                <template #body="slotProps">
                    <div class="flex">
                        {{ slotProps.data.statusName }}
                    </div>
                </template>
            </Column>

            <Column field="shiftEndTime" :header="`${$t(`POS.OpeningClosing`)}`" class="p-2">
                <template #body="slotProps">
                    <div class="flex"></div>
                    <div class="flex">
                        {{ formatDateTime(slotProps.data.shiftStartTime) }}
                    </div>

                    <div class="flex">
                        <!-- {{ formatDate(slotProps.data.shiftEndTime) }} -->
                        {{ formatDateTime(slotProps.data.shiftStartTime) }}
                    </div>
                </template>
            </Column>

            <Column field="cashStartAmount" :header="`${$t(`POS.cashStart`)}`" class="p-2">
                <template #body="slotProps">
                    <div class="flex">$ {{ slotProps.data.cashStartAmount }}</div>
                </template>
            </Column>

            <Column field="discrepancyAmount" :header="`${$t(`POS.discrepancyAmount`)}`" class="p-2">
                <template #body="slotProps">
                    <div class="flex">$ {{ slotProps.data.discrepancyAmount }}</div>
                </template>
            </Column>

            <Column field="expectedCashEndAmount" :header="`${$t(`POS.CashEnd `)}`" class="p-2">
                <template #body="slotProps">
                    <div class="flex">$ {{ slotProps.data.expectedCashEndAmount }}</div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
.card-style {
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
}

.card-style:hover {
    transform: scale(1.02);
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.text-gray-600 {
    color: #6b7280;
}
</style>
