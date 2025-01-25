<script setup>
import AppBreadcrumb from './AppBreadcrumb.vue';
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useMainStore } from '@/stores/mainStore';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // Import useI18n hook
import { setI18nLanguage } from '@/i18n';
import { saveToLocalStorage } from '@/utilities/localStorage';
const { t } = useI18n();
const { locale } = useI18n();
const { onMenuToggle, layoutConfig, onProfileSidebarToggle, replaceLink, onConfigSidebarToggle } = useLayout();
const router = useRouter();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const layoutStore = useMainStore();
const rtl = computed(() => layoutStore.isRTL);
onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

const showProfileSidebar = () => {
    onProfileSidebarToggle();
};
const onConfigButtonClick = () => {
    onConfigSidebarToggle();
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
const colorSchemeMenu = ref();
const colorScheme = computed(() => {
    return layoutConfig.colorScheme.value;
});
const colorSchemes = ref([
    {
        label: 'Light',
        icon: 'pi pi-sun',
        command: () => {
            changeColorScheme('light');
        }
    },
    {
        label: 'Dim',
        icon: 'pi pi-star',
        command: () => {
            changeColorScheme('dim');
        }
    },
    {
        label: 'Dark',
        icon: 'pi pi-moon',
        command: () => {
            changeColorScheme('dark');
        }
    }
]);
const toggleColorSchemes = (event) => {
    colorSchemeMenu.value.toggle(event);
};

const showLangChange = ref(false);
const lan = computed(() => layoutStore.language);
const languages = ref([
    { name: 'Arabic', value: 'ar' },
    { name: 'English', value: 'en' }
]);
// const selectedLanguage = computed(() => {
//     return Accents.find((x) => x.code === lan.value.code).code;
// });
const searchLanguage = ref('');
const onLanguageChange = async (newLanguage) => {
    layoutStore.changeLanguage(newLanguage);
    layoutStore.toggleRTL();
    await setI18nLanguage(newLanguage.code.substring(0, 2)); // Update Vue-i18n locale

    showLangChange.value = false;
    location.reload();
};

const searchValue = ref('');
const suggestions = ref([]);
const search = (e) => {
    setTimeout(() => {
        if (!e.query.trim().length) {
            suggestions.value = [...layoutStore.routeList];
        } else {
            suggestions.value = layoutStore.routeList.filter((route) => {
                return route.label.toLowerCase().startsWith(e.query.toLowerCase());
            });
        }
    }, 250);
};
const goToRoute = (e) => {
    const route = layoutStore.routeList.find((x) => x.label.toLowerCase() === searchValue.value.label.toLowerCase());
    if (route) {
        router.push(route.to);
        searchValue.value = ''; // Clear search
    } else {
        search(e);
    }
};

// const Accents = [
//     { code: 'ar-EG', name: t('Egyptian Arabic') },
//     { code: 'ar-SA', name: t('Saudi Arabian Arabic') },
//     { code: 'ar-LB', name: t('Lebanese Arabic') },
//     { code: 'ar-SY', name: t('Syrian Arabic') },
//     { code: 'ar-MA', name: t('Moroccan Arabic') },
//     { code: 'ar-TN', name: t('Tunisian Arabic') },
//     { code: 'ar-IQ', name: t('Iraqi Arabic') },
//     { code: 'ar-KW', name: t('Kuwaiti Arabic') },
//     { code: 'ar-JO', name: t('Jordanian Arabic') },
//     { code: 'ar-SD', name: t('Sudanese Arabic') },
//     { code: 'ar-LY', name: t('Libyan Arabic') },
//     { code: 'ar-AE', name: t('Emirati Arabic') },
//     { code: 'en-US', name: t('English (United States)') },
//     { code: 'en-GB', name: t('English (United Kingdom)') },
//     { code: 'es-ES', name: t('Spanish (Spain)') },
//     { code: 'es-MX', name: t('Spanish (Mexico)') },
//     { code: 'fr-FR', name: t('French (France)') },
//     { code: 'fr-CA', name: t('French (Canada)') },
//     { code: 'zh-CN', name: t('Chinese (Simplified, China)') },
//     { code: 'zh-TW', name: t('Chinese (Traditional, Taiwan)') },
//     { code: 'de-DE', name: t('German (Germany)') },
//     { code: 'pt-PT', name: t('Portuguese (Portugal)') },
//     { code: 'pt-BR', name: t('Portuguese (Brazil)') },
//     { code: 'ru-RU', name: t('Russian (Russia)') },
//     { code: 'ja-JP', name: t('Japanese (Japan)') },
//     { code: 'ko-KR', name: t('Korean (South Korea)') },
//     { code: 'it-IT', name: t('Italian (Italy)') },
//     { code: 'nl-NL', name: t('Dutch (Netherlands)') },
//     { code: 'sv-SE', name: t('Swedish (Sweden)') },
//     { code: 'hi-IN', name: t('Hindi (India)') },
//     { code: 'bn-BD', name: t('Bengali (Bangladesh)') },
//     { code: 'bn-IN', name: t('Bengali (India)') },
//     { code: 'pa-IN', name: t('Punjabi (India)') },
//     { code: 'pa-PK', name: t('Punjabi (Pakistan)') },
//     { code: 'ur-IN', name: t('Urdu (India)') },
//     { code: 'ur-PK', name: t('Urdu (Pakistan)') },
//     { code: 'fa-IR', name: t('Persian (Iran)') },
//     { code: 'tr-TR', name: t('Turkish (Turkey)') },
//     { code: 'id-ID', name: t('Indonesian (Indonesia)') },
//     { code: 'ms-MY', name: t('Malay (Malaysia)') },
//     { code: 'th-TH', name: t('Thai (Thailand)') },
//     { code: 'vi-VN', name: t('Vietnamese (Vietnam)') },
//     { code: 'he-IL', name: t('Hebrew (Israel)') },
//     { code: 'el-GR', name: t('Greek (Greece)') },
//     { code: 'pl-PL', name: t('Polish (Poland)') }
// ];
</script>

<template>
    <div :class="['layout-topbar', { rtl: rtl }]">
        <div class="topbar-start">
            <Button type="button" class="topbar-menubutton p-link p-trigger shadow-none" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </Button>

            <AppBreadcrumb class="topbar-breadcrumb"></AppBreadcrumb>
        </div>

        <div class="topbar-end">
            <div class="flex justify-content-between align-items-center">
                <div class="topbar-search">
                    <IconField iconPosition="left">
                        <InputIcon class="pi pi-search" />
                        <AutoComplete v-model="searchValue" optionLabel="label" :suggestions="suggestions" @complete="search" @keydown.enter="goToRoute" :placeholder="t('search')">
                            <template #option="slotProps">
                                <div class="flex align-items-center gap-2">
                                    <font-awesome-icon icon="fa-solid fa-user-secret" />
                                    <div>{{ slotProps.option.label }}</div>
                                </div>
                            </template>
                        </AutoComplete>
                    </IconField>
                </div>
                <div class="flex gap-2">
                    <!-- <Button
                        icon="pi pi-language"
                        text
                        rounded
                        severity="secondary"
                        @click="showLangChange = true"
                        :pt="{
                            root: 'bg-surface-0 hover:bg-surface-50 rounded-full ',
                            icon: 'text-2xl'
                        }"
                    ></Button>

                    <Dialog
                        v-model:visible="showLangChange"
                        @hide="
                            () => {
                                searchLanguage = '';
                            }
                        "
                        dismissableMask
                        modal
                        :style="{ width: '35rem' }"
                        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
                        :header="t('language')"
                    >
                        <div class="flex flex-column gap-2 pb-5 pt-2 max-h-30rem min-w-max">
                            <IconField iconPosition="left">
                                <InputText type="text" v-model="searchLanguage" :placeholder="t('search')" class="w-full" />
                                <InputIcon class="pi pi-search" />
                            </IconField>
                            <div
                                v-for="language in Accents.filter((x) => x.name.toLowerCase().includes(searchLanguage.toLowerCase()))"
                                :key="language.code"
                                @click="
                                    () => {
                                        onLanguageChange(language);
                                    }
                                "
                                class="flex gap-3 align-items-center hover:bg-primary hover:bg-opacity-20 px-3 pb-2 p-1 border-round-xl cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="language"
                                    :id="language.name"
                                    :value="language.code"
                                    v-model="selectedLanguage"
                                    :class="['appearance-none h-2rem w-2rem border-circle border-2 border-300 focus:ring-rich-black mr-3 surface-50 hover ', selectedLanguage == language.code ? ' border-double border-300 bg-primary' : '']"
                                />
                                <span class="text-sm leading-6 font-medium text-black flex-grow text-start">{{ language.name }}</span>
                            </div>
                        </div>
                    </Dialog> -->

                    <Button
                        :icon="colorSchemes.find((x) => colorScheme == x.label.toLowerCase()).icon"
                        text
                        rounded
                        severity="secondary"
                        @click="toggleColorSchemes"
                        aria-controls="overlay_menu"
                        :pt="{
                            root: 'bg-surface-0 hover:bg-surface-50 rounded-full ',
                            icon: 'text-2xl'
                        }"
                    >
                    </Button>

                    <Menu ref="colorSchemeMenu" id="overlay_menu" :model="colorSchemes" :popup="true">
                        <template #item="{ item }">
                            <div
                                :class="[colorScheme == item.label.toLowerCase() ? (colorScheme == 'light' ? 'bg-primary-100 text-primary-600' : colorScheme == 'dim' ? 'surface-200 text-primary-400' : 'bg-primary-900 text-primary-500') : '', 'p-2']"
                                @click="item.command"
                            >
                                <i :class="item.icon"></i>
                                <span class="ml-2">{{ t(`colorSchemeOptions.${item.label.toLowerCase()}`) }}</span>
                            </div>
                        </template>
                    </Menu>

                    <Button
                        icon="pi pi-cog"
                        text
                        rounded
                        severity="secondary"
                        @click="onConfigButtonClick"
                        :pt="{
                            root: 'bg-surface-0 hover:bg-surface-50 rounded-full ',
                            icon: 'text-2xl'
                        }"
                    ></Button>

                    <Button type="button" class="p-link bg-transparent w-3rem h-3rem border-circle p-0 m-0" @click="showProfileSidebar">
                        <img src="/demo/images/avatar/avatar.png" class="w-3rem h-3rem" alt="Profile" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
