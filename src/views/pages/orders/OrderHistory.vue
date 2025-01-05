<template>
    <div class="flex flex-column gap-2">
        <PageTopBar :title="'Order History'" v-model:value="isGrid" :hasAddButton="false"></PageTopBar>
        <div class="card" v-if="isGrid == 'list'">
            <DataTable
                :value="invoiceStore.HistoryOrders"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                :globalFilterFields="['name', 'id']"
                :paginatorTemplate="
                    mainStore.isRTL ? 'RowsPerPageDropdown NextPageLink LastPageLink  PageLinks FirstPageLink PrevPageLink  CurrentPageReport ' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                "
                :rowsPerPageOptions="[5, 10, 25]"
                :currentPageReportTemplate="''"
            >
                <template #empty>
                    <div class="flex justify-content-center align-items-center font-bold text-lg">
                        {{ t(`baseLookup.empty${name}`) }}
                    </div></template
                >

                <Column field="id" :header="'Order ID'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.id }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="createdAt" :header="'Date'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ new Date(slotProps.data.createdAt).toLocaleDateString(locale) }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="customer" :header="'Customer'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">{{ slotProps.data.customer.name }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="total" :header="'Total'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <span class="font-semibold text-md">${{ slotProps.data.total }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="status" :header="'Status'" class="" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex flex-row align-items-center">
                            <Tag :severity="slotProps.data.status == 'Completed' ? 'success' : 'danger'" :value="slotProps.data.status"></Tag>
                        </div>
                    </template>
                </Column>

                <Column field="actions" :header="t('labels.actions')">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button label="View Details" class="border-primary-200" outlined></Button>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <div v-else>
            <div class="grid">
                <div class="col-6 sm:col-6 md:col-4 xl:col-3" v-for="item in invoiceStore.HistoryOrders" :key="item.id">
                    <div class="card">
                        <div class="flex flex-column gap-4">
                            <span class="font-bold text-3xl">Order #{{ item.id }}</span>
                            <div class="flex flex-column gap-1">
                                <span class=""><span class="font-bold text-md">Customer:</span> {{ item.customer.name }}</span>
                                <span class=""><span class="font-bold text-md">Date:</span> {{ new Date(item.createdAt).toLocaleDateString(locale) }}</span>
                                <span class=""><span class="font-bold text-md">Total:</span> ${{ item.total }}</span>
                                <span class=""><span class="font-bold text-md">Status:</span> <Tag :severity="item.status == 'Completed' ? 'success' : 'danger'" :value="item.status"></Tag> </span>
                            </div>
                            <div class="flex flex-row justify-content-between">
                                <Button label="View Details" class="border-primary-200" outlined></Button>
                                <div class="flex flex-row"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import PageTopBar from '../../../components/pageTopBar.vue';
import { useInvoiceStore } from '@/stores/invoiceStore';
const invoiceStore = useInvoiceStore();
const { t, locale } = useI18n();
const mainStore = useMainStore();
const isGrid = ref('list');
</script>
