<template>
    <div class="card flex flex-column hover:shadow-3 transition-all transition-duration-100 h-full p-4 cursor-pointer">
        <img class="item-img border-round-md" :src="'https://th.bing.com/th/id/OIP.olxheB0A98nctnQeZtkF-wHaGs?rs=1&pid=ImgDetMain'" />
        <span class="font-semibold text-900 text-lg">{{ itemData.name }}</span>
        <span class="text-500">From ${{ itemData.price }}</span>
    </div>
</template>
<script setup>
const props = defineProps(['itemData']);
</script>
<style scoped>
.item-img {
    width: 100%;
    aspect-ratio: 1/1;
}
</style>
