<template>
    <div class="loading-bar-container" v-if="isLoading">
        <ProgressBar :value="progress" style="height: 12px"></ProgressBar>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useLoadingStore } from '@/stores/loaderStore';
const loadingStore = useLoadingStore();

const progress = ref(0);
const isLoading = computed(() => loadingStore.isBarLoading);
let interval = ref(null);

const startProgress = () => {
    interval.value = setInterval(() => {
        let newValue = progress.value + Math.floor(Math.random() * 10) + 1;
        progress.value = newValue;
    }, 2000);
};
const endProgress = () => {
    clearInterval(interval.value);
    interval.value = null;
};
onMounted(() => {
    startProgress();
});

onUnmounted(() => {
    endProgress();
});
</script>

<style scoped>
.loading-bar-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;
}
</style>
