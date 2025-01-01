<template>
    <img
        :src="src"
        :alt="alt"
        :class="[
            'w-full h-full  ',
            { 'fadein animation-duration-1000 animation-iteration-infinite': loadingImage },
            $attrs.class 
        ]"
        @load="onImageLoad"
        loading="lazy"
    />
</template>

<script setup>
import { ref } from 'vue';
import { useAttrs } from 'vue';

const attrs = useAttrs(); 

const props = defineProps({
    src: {
        type: String,
        required: true
    },
    alt: {
        type: String,
        default: 'Image'
    }
});

const loadingImage = ref(true);

setTimeout(() => {
    if (loadingImage.value) {
        loadingImage.value = false;
    }
}, 3000);
const onImageLoad = () => {
    loadingImage.value = false;
};
</script>
<style scoped>
.object-cover {
    object-fit: cover;
}
</style>
