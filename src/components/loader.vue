<script setup>
import { computed } from 'vue';
import { useLoaderDataStore } from '../stores/loader';

const loaderStore = useLoaderDataStore();

const isLoading = computed(() => loaderStore.isDataLoading);
</script>

<template>
  <div v-if="isLoading" class="loader-overlay">
    <div class="loader-container">
      <img 
        src="/pos.gif" 
        alt="Loading..." 
        class="loader-gif"
        @error="onImageError"
      />
    </div>
    <p class="loader-text">Loading, please wait...</p>
  </div>
</template>

<script>
export default {
  methods: {
    onImageError() {
      console.warn('Failed to load pos.gif, check if file exists in public folder');
    }
  }
}
</script>

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

.loader-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loader-gif {
  max-width: 80px;
  max-height: 80px;
  width: auto;
  height: auto;
  /* Optional: Add a subtle drop shadow */
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.loader-text {
  margin-top: 15px;
  font-size: 1.2rem;
  color: #fff;
  font-family: Arial, sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* Fallback CSS spinner in case GIF fails to load */
.loader-gif:not([src]),
.loader-gif[src=""] {
  display: none;
}

.loader-gif:not([src])::after,
.loader-gif[src=""]::after {
  content: '';
  display: block;
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
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