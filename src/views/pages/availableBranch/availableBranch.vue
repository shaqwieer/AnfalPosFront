<template>
    <div class="w-full h-screen flex flex-column align-items-center surface-100" v-if="!loading">
        <div class="h-18rem"></div>
        <h2 class="text-3xl mb-6 font-bold">{{ t('availableBranch.title') }}</h2>
        <div class="flex justify-content-center align-items-center gap-4 ">
            <div v-for="branch in entities" :key="branch.name"  @click="choosedBranch(branch)">
                <div class="p-4 border-round-lg surface-card shadow-2 cursor-pointer transition-colors transition-duration-300 hover:bg-primary">
                    <div class="flex align-items-center justify-content-center">
                        <span class="text-lg font-medium">{{ branch.name }}</span>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
    <div class="w-full h-screen flex align-items-center gap-3 justify-content-center surface-100" v-else>
        <div class="h-6rem w-6rem bg-primary border-circle fadein animation-duration-1000 animation-iteration-infinite"></div>
        <div class="h-6rem w-6rem bg-primary border-circle fadein animation-duration-2000 animation-iteration-infinite"></div>
        <div class="h-6rem w-6rem bg-primary border-circle fadein animation-duration-3000 animation-iteration-infinite"></div>
    </div>
</template>
<script setup>
import { handleError } from '@/utilities/errorHandler';
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api/apiClient';
import { useMainStore } from '@/stores/mainStore';
const mainStore = useMainStore();
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const loading = ref(false);
const choosedBranch = async (availableBranch) => {
    try {
        console.log(availableBranch);
        loading.value = true;
        const formData = new FormData();
        formData.append('Id', availableBranch.id );
        formData.append('UniqueIdentifier', availableBranch.uniqueIdentifier);
        formData.append('Name', availableBranch.name );
        formData.append('SapStorageLocation', availableBranch.sapStorageLocation ?? '');
        formData.append('ProfitCenter', availableBranch.profitCenter ?? '');
        formData.append('CajoNumber', availableBranch.cajoNumber ?? '');
        formData.append('CashCustomer', availableBranch.cashCustomer ?? '');
        formData.append('BranchTypeId', availableBranch.branchTypeId ?? '');
        await mainStore.chooseBranch(formData);
        loading.value = false;
    } catch (err) {
        loading.value = false;
    }
};
const entities = ref([]);
onMounted(async () => {
    try {
        const response = await apiClient.get(`/UserBranches/GetAvailableBranches`);
        entities.value = response.data.data;
    } catch (err) {
        handleError(err, mainStore.loading);
    }
});
</script>
