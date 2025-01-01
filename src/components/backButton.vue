<template>
    <Button
        :icon="mainStore.isRTL ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"
        @click="
            () => {
                router.back();
            }
        "
    ></Button>
</template>
<script setup>
import { useRouter } from 'vue-router';
import { useMainStore } from '@/stores/mainStore';
const router = useRouter();
const mainStore = useMainStore();
</script>