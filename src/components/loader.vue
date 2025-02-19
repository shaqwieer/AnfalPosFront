<script setup>
import { computed } from 'vue';
import { useLoaderDataStore } from '../stores/loader';

const loaderStore = useLoaderDataStore();

const isLoading = computed(() => loaderStore.isDataLoading);
</script>

<template>
  <div v-if="isLoading" class="loader-overlay">
    <div class="loader"></div>
    <p class="loader-text">Loading, please wait...</p>
  </div>
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.loader {
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

.loader-text {
  margin-top: 15px;
  font-size: 1.2rem;
  color: #fff;
  font-family: Arial, sans-serif;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
