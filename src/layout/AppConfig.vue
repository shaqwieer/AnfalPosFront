<script setup>
import { ref, watch, computed } from 'vue';
import { usePrimeVue } from 'primevue/config';
import { useLayout } from '@/layout/composables/layout';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n'; // Import useI18n hook
import { setI18nLanguage } from '@/i18n';
import { saveToLocalStorage } from '@/utilities/localStorage';
const layoutStore = useMainStore();
const rtlValue = computed(() => layoutStore.isRTL);
const rtlValueText = computed(() => (layoutStore.isRTL ? 'rtl' : 'ltr'));
const containerClass = computed(() => ({
    rtl: layoutStore.isRTL,
    ltr: !layoutStore.isRTL
}));
defineProps({
    simple: {
        type: Boolean,
        default: false
    }
});
const toggleLayoutDirection = () => {
    layoutStore.toggleRTL();
};

const $primevue = usePrimeVue();
const rippleActive = computed(() => $primevue.config.ripple);
const inputStyle = computed(() => $primevue.config.inputStyle || 'outlined');

const { setScale, layoutConfig, layoutState, replaceLink, onConfigSidebarToggle } = useLayout();
const colorScheme = computed(() => {
    return layoutConfig.colorScheme.value;
});
const componentThemes = ref([
    { name: 'indigo', color: '#6366F1' },
    { name: 'blue', color: '#3B82F6' },
    { name: 'purple', color: '#8B5CF6' },
    { name: 'teal', color: '#14B8A6' },
    { name: 'cyan', color: '#06b6d4' },
    { name: 'green', color: '#10b981' },
    { name: 'orange', color: '#f59e0b' },
    { name: 'pink', color: '#d946ef' },
    { name: 'noir', color: '#000000' }
]);
const scales = ref([11,12, 13, 14, 15, 16,17]);

watch(layoutConfig.menuMode, (newVal) => {
    if (newVal === 'static') {
        layoutState.staticMenuDesktopInactive.value = false;
    }
    saveToLocalStorage('menuMode', newVal);
});

const onConfigButtonClick = () => {
    onConfigSidebarToggle();
};
const changeTheme = (theme) => {
    const themeLink = document.getElementById('theme-link');
    const themeHref = themeLink.getAttribute('href');
    const newHref = themeHref.replace(layoutConfig.theme.value, theme);

    replaceLink(themeLink, newHref, () => {
        layoutConfig.theme.value = theme;
        saveToLocalStorage('theme', theme);
    });
};

const decrementScale = () => {
    setScale(layoutConfig.scale.value - 1);
    applyScale();
};
const incrementScale = () => {
    setScale(layoutConfig.scale.value + 1);
    applyScale();
};
const applyScale = () => {
    document.documentElement.style.fontSize = layoutConfig.scale.value + 'px';
};
const onInputStyleChange = (value) => {
    $primevue.config.inputStyle = value;
};
const onRippleChange = (value) => {
    $primevue.config.ripple = value;
};
const { locale } = useI18n(); // Access i18n instance
const { t } = useI18n(); // Access i18n instance

const languages = ref([
    { name: 'Arabic', value: 'ar' },
    { name: 'English', value: 'en' }
]);
// const localizedLanguages = computed(() => {
//     const languages = tm('languages');
//     return Array.isArray(languages) ? languages : [];
// });

// const localizedLanguages = computed(() => {
//   return languages.value.map(lang => ({
//     ...lang,
//     name: t(`${lang.value}`),
//   }));
// });
const lan = computed(() => layoutStore.language);
const language = ref(lan);
// const language = computed({
//       get() {
//         return layoutStore.language;
//       },
//       set(value) {
//         layoutStore.language = value;
//       },
//     });
const onLanguageChange = async (newLanguage) => {
    console.log(newLanguage);
    layoutStore.changeLanguage(newLanguage);
    if (locale.value !== newLanguage.value) {
        if ((newLanguage.value === 'ar' && locale.value === 'en') || (newLanguage.value === 'en' && locale.value === 'ar')) {
            layoutStore.toggleRTL();
        }
        await setI18nLanguage(newLanguage.value); // Update Vue-i18n locale
        location.reload();
    }
};
const changeColorScheme = (colorScheme) => {
    const themeLink = document.getElementById('theme-link');
    const themeLinkHref = themeLink.getAttribute('href');
    const currentColorScheme = 'theme-' + layoutConfig.colorScheme.value.toString();
    const newColorScheme = 'theme-' + colorScheme;
    const newHref = themeLinkHref.replace(currentColorScheme, newColorScheme);

    replaceLink(themeLink, newHref, () => {
        layoutConfig.colorScheme.value = colorScheme;
        saveToLocalStorage('colorScheme', colorScheme);
    });
};
</script>

<template>
    <button class="layout-config-button config-link" type="button" @click="onConfigButtonClick()">
        <i class="pi pi-cog"></i>
    </button>

    <Sidebar
        v-model:visible="layoutState.configSidebarVisible.value"
        position="right"
        class="layout-config-sidebar w-20rem"
        :pt="{
            closeButton: 'ml-auto'
        }"
    >
        <div class="p-2" :dir="rtlValueText">
            <h5 :class="containerClass">{{ $t('themes') }}</h5>
            <div class="flex flex-wrap row-gap-3">
                <div v-for="(theme, i) in componentThemes" :key="i" class="w-3">
                    <Button
                        :autoFocus="layoutConfig.theme === theme.name"
                        class="cursor-pointer p-link w-2rem h-2rem border-circle border-white flex flex-shrink-0 align-items-center justify-content-center p-0"
                        @click="() => changeTheme(theme.name)"
                        :style="{ 'background-color': theme.color, 'border-color': theme.color }"
                    >
                        <i v-if="theme.name === layoutConfig.theme.value" class="pi pi-check text-white"></i>
                    </Button>
                </div>
            </div>

            <h5 :class="containerClass">{{ t('scale') }}</h5>
            <div class="flex align-items-center">
                <Button icon="pi pi-minus" type="button" @click="decrementScale()" class="w-2rem h-2rem mr-2" text rounded :disabled="layoutConfig.scale.value === scales[0]"></Button>
                <div class="flex gap-2 align-items-center">
                    <i class="pi pi-circle-fill text-300" v-for="s in scales" :key="s" :class="{ 'text-primary-500': s === layoutConfig.scale.value }"></i>
                </div>
                <Button icon="pi pi-plus" type="button" @click="incrementScale()" class="w-2rem h-2rem ml-2" text rounded :disabled="layoutConfig.scale.value === scales[scales.length - 1]"></Button>
            </div>
            <h5 :class="containerClass">{{ $t('language') }}</h5>
            <div class="flex align-items-center">
                <Dropdown v-model="language" :options="languages" @update:modelValue="onLanguageChange" optionLabel="name" :placeholder="$t('selectLanguage')" checkmark :highlightOnSelect="false" class="w-full md:w-14rem" />
            </div>
            <!-- note i make false  -->
            <template v-if="!simple">
                <h5 :class="containerClass">{{ $t('menuType') }}</h5>
                <div class="flex flex-wrap row-gap-3">
                    <div class="flex align-items-center gap-2 w-6">
                        <RadioButton name="menuMode" value="static" v-model="layoutConfig.menuMode.value" inputId="mode1"></RadioButton>
                        <label for="mode1" :class="containerClass">{{ $t('static') }}</label>
                    </div>

                    <!-- <div class="flex align-items-center gap-2 w-6">
                        <RadioButton name="menuMode" value="overlay" v-model="layoutConfig.menuMode.value" inputId="mode2"></RadioButton>
                        <label for="mode2">Overlay</label>
                    </div> -->
                    <div class="flex align-items-center gap-2 w-6">
                        <RadioButton name="menuMode" value="slim" v-model="layoutConfig.menuMode.value" inputId="mode3"></RadioButton>
                        <label for="mode3" :class="containerClass">{{ $t('slim') }}</label>
                    </div>
                    <!-- <div class="flex align-items-center gap-2 w-6">
                        <RadioButton name="menuMode" value="slim-plus" v-model="layoutConfig.menuMode.value" inputId="mode4"></RadioButton>
                        <label for="mode3">Slim +</label>
                    </div> -->
                    <!-- <div class="flex align-items-center gap-2 w-6">
                        <RadioButton name="menuMode" value="reveal" v-model="layoutConfig.menuMode.value" inputId="mode5"></RadioButton>
                        <label for="mode4">Reveal</label>
                    </div> -->
                    <!-- <div class="flex align-items-center gap-2 w-6">
                        <RadioButton name="menuMode" value="drawer" v-model="layoutConfig.menuMode.value" inputId="mode6"></RadioButton>
                        <label for="mode6" :class="containerClass">{{ $t('drawer') }}</label>
                    </div> -->
                    <div class="flex align-items-center gap-2 w-6">
                        <RadioButton name="menuMode" value="horizontal" v-model="layoutConfig.menuMode.value" inputId="mode2"></RadioButton>
                        <label for="mode2" :class="containerClass">{{ $t('horizontal') }}</label>
                    </div>
                </div>
                <h5 :class="containerClass">{{ $t('menuTheme') }}</h5>
                <div class="field-radiobutton">
                    <RadioButton :checked="layoutConfig.menuTheme === 'colorScheme'" name="menuTheme" value="colorScheme" v-model="layoutConfig.menuTheme.value" inputId="mode1"></RadioButton>
                    <label for="mode1" :class="containerClass">{{ $t('colorScheme') }}</label>
                </div>

                <div class="field-radiobutton">
                    <RadioButton :checked="layoutConfig.menuTheme === 'primaryColor'" name="menuTheme" value="primaryColor" v-model="layoutConfig.menuTheme.value" inputId="mode2"></RadioButton>
                    <label for="mode2" :class="containerClass">{{ $t('primaryColor') }}</label>
                </div>
                <div class="field-radiobutton">
                    <RadioButton :checked="layoutConfig.menuTheme === 'transparent'" name="menuTheme" value="transparent" v-model="layoutConfig.menuTheme.value" inputId="mode3"></RadioButton>
                    <label for="mode2" :class="containerClass">{{ $t('transparent') }}</label>
                </div>
            </template>

            <h5 :class="containerClass">{{ $t('colorScheme') }}</h5>
            <div class="grid">
                <div class="field-radiobutton col-6">
                    <RadioButton v-model="colorScheme" name="colorScheme" value="light" @change="() => changeColorScheme('light')" inputId="outlined_input"></RadioButton>
                    <label for="outlined_input" :class="containerClass">{{ $t('colorSchemeOptions.light') }}</label>
                </div>
                <div class="field-radiobutton col-6">
                    <RadioButton v-model="colorScheme" name="colorScheme" value="dim" @change="() => changeColorScheme('dim')" inputId="filled_input"></RadioButton>
                    <label for="filled_input" :class="containerClass">{{ $t('colorSchemeOptions.dim') }}</label>
                </div>
                <div class="field-radiobutton pt-0 col-12">
                    <RadioButton v-model="colorScheme" name="colorScheme" value="dark" @change="() => changeColorScheme('dark')" inputId="filled_input"></RadioButton>
                    <label for="filled_input" :class="containerClass">{{ $t('colorSchemeOptions.dark') }}</label>
                </div>
            </div>

            <template v-if="!simple">
                <h5 class="mt-1" :class="containerClass">{{ $t('inputStyle') }}</h5>
                <div class="flex">
                    <div class="field-radiobutton flex-1">
                        <RadioButton :modelValue="inputStyle" name="inputStyle" value="outlined" inputId="outlined_input" @update:modelValue="onInputStyleChange"></RadioButton>
                        <label for="outlined_input" :class="containerClass">{{ $t('outlined') }}</label>
                    </div>
                    <div class="field-radiobutton flex-1">
                        <RadioButton :modelValue="inputStyle" name="inputStyle" value="filled" inputId="filled_input" @update:modelValue="onInputStyleChange"></RadioButton>
                        <label for="filled_input" :class="containerClass">{{ $t('filled') }}</label>
                    </div>
                </div>
                <div v-if="false">
                    <h5 :class="containerClass">{{ $t('rtl') }}</h5>
                    <InputSwitch :modelValue="rtlValue" @update:modelValue="toggleLayoutDirection" />
                </div>

                <h5 :class="containerClass">{{ $t('rippleEffect') }}</h5>
                <InputSwitch :modelValue="rippleActive" @update:modelValue="onRippleChange"></InputSwitch>
            </template>
        </div>
    </Sidebar>
</template>

<style lang="scss" scoped>
.rtl * {
    font-family: 'Tajawal', sans-serif;
}
</style>
