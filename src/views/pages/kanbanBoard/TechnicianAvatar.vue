<script setup lang="ts">
import { computed } from 'vue';
import type { Technician } from './types';

const props = defineProps<{
  technician: Technician;
  size?: 'small' | 'medium' | 'large';
}>();

const avatarSize = computed(() => {
  switch (props.size) {
    case 'small': return '24px';
    case 'large': return '40px';
    default: return '32px';
  }
});
</script>

<template>
  <div 
    class="avatar" 
    :style="{ 
      width: avatarSize,
      height: avatarSize,
      backgroundColor: technician.color 
    }"
    :title="technician.name"
  >
    <img 
      v-if="technician.avatar" 
      :src="technician.avatar" 
      :alt="technician.name"
      class="avatar-image"
    />
    <span v-else class="initials">{{ technician.initials }}</span>
  </div>
</template>

<style scoped>
.avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.initials {
  font-size: 0.75em;
  text-transform: uppercase;
}
</style>