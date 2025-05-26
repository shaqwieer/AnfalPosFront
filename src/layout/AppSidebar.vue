<script setup>
import AppMenu from './AppMenu.vue';
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';

const {layoutConfig, layoutState } = useLayout();

const layoutStore = useMainStore();
const rtl = computed(() => layoutStore.isRTL);
let timeout = null;

const onMouseEnter = () => {
    if (!layoutState.anchored.value) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        layoutState.sidebarActive.value = true;
    }
};

const onMouseLeave = () => {
    if (!layoutState.anchored.value) {
        if (!timeout) {
            timeout = setTimeout(() => (layoutState.sidebarActive.value = false), 300);
        }
    }
};

const anchor = () => {
    layoutState.anchored.value = !layoutState.anchored.value;
};
</script>

<template>
    <div :class="['layout-sidebar', { rtl: rtl }]" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <div class="sidebar-header">
            <router-link :to="{ name: 'e-commerce' }" class="app-logo flex flex-column align-items-center justify-content-center">
                <img 
                src="/favicon.png" 
                alt="Sales Hub POS" 
                class="w-2rem h-2rem "
                @error="onLogoError"
                />
                <span v-if="layoutConfig.menuMode.value==='static'" class="mt-1 text-blue-600 font-bold">Sales Hub POS</span>
            </router-link>
            <button class="layout-sidebar-anchor p-link z-2 mb-2" type="button" @click="anchor()"></button>
        </div>
        <div :class="['layout-menu-container', { rtl: rtl }]">
            <AppMenu />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
