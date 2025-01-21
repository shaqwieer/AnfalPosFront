<script setup>
import { computed, watch } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useLoadingStore } from '@/stores/loaderStore';
import { useToast } from 'primevue/usetoast';
import loader from './components/loader.vue';
const toast = useToast();
import Loading from '@/components/Loading.vue';
const loadingStore = useLoadingStore();
const isLoading = computed(() => loadingStore.isLoading);
const notificationInfo = computed(() => loadingStore.NotificationInfo);
watch(
    () => notificationInfo.value,
    (newVal) => {
        if (newVal.notificationFlag === true) {
            toast.add({ severity: `${newVal.notificationType}`, detail: `${newVal.notificationMessage}`, life: 3000 });
            loadingStore.resetNotificationInfo();
        }
    }
);
const mainStore = useMainStore();
const containerClass = computed(() => ({
    rtl: mainStore.isRTL,
    ltr: !mainStore.isRTL
}));
</script>

<template>
    <div :class="containerClass">
        <loader />
        <router-view />
    </div>
    <transition name="loader-fade">
        <div class="absolute flex top-0 left-0 w-screen min-h-screen" style="z-index: 99999999" @click.stop="() => {}" v-if="isLoading">
            <Loading />
        </div>
    </transition>

    <Toast :position="mainStore.isRTL ? 'top-left' : 'top-right'"></Toast>
</template>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');
* {
    font-family: 'Inter', sans-serif;
}
.rtl {
    direction: rtl;
    font-family: 'Tajawal', sans-serif;
}
.ltr {
    direction: ltr;
    font-family: 'Inter', sans-serif;
}
.rtl * {
    font-family: 'Tajawal', sans-serif;
}

.loader-fade-enter-active,
.loader-fade-leave-active {
    transition: opacity 0.5s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
    opacity: 0;
}
.p-button {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}
.p-button-icon-only {
    gap: 0 !important;
}
</style>
