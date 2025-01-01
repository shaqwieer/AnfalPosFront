import { toRefs, reactive, computed } from 'vue';
import { saveToLocalStorage, getFromLocalStorage } from '@/utilities/localStorage';
const layoutConfig = reactive({
    menuMode: getFromLocalStorage('menuMode') ? getFromLocalStorage('menuMode') : 'static',
    menuTheme: 'colorScheme',
    colorScheme: getFromLocalStorage('colorScheme') ? getFromLocalStorage('colorScheme') : 'light',
    theme: getFromLocalStorage('theme') ? getFromLocalStorage('theme') : 'blue',
    scale: getFromLocalStorage('scale') ? getFromLocalStorage('scale') : 14
});
document.documentElement.style.fontSize = layoutConfig.scale + 'px';

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    sidebarActive: false,
    anchored: false,
    overlaySubmenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    activeMenuItem: null
});
const replaceLink = (linkElement, href, onComplete) => {
    if (!linkElement || !href) {
        return;
    }

    const id = linkElement.getAttribute('id');
    const cloneLinkElement = linkElement.cloneNode(true);

    cloneLinkElement.setAttribute('href', href);
    cloneLinkElement.setAttribute('id', id + '-clone');

    linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

    cloneLinkElement.addEventListener('load', () => {
        linkElement.remove();

        const element = document.getElementById(id); // re-check
        element && element.remove();

        cloneLinkElement.setAttribute('id', id);
        onComplete && onComplete();
    });
};
const themeLink1 = document.getElementById('theme-link');
const themeHref = themeLink1.getAttribute('href');
const newHref2 = themeHref.replace('light/indigo', layoutConfig.colorScheme+'/'+layoutConfig.theme);
replaceLink(themeLink1, newHref2);
export function useLayout() {
    const replaceLink = (linkElement, href, onComplete) => {
        if (!linkElement || !href) {
            return;
        }

        const id = linkElement.getAttribute('id');
        const cloneLinkElement = linkElement.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            linkElement.remove();

            const element = document.getElementById(id); // re-check
            element && element.remove();

            cloneLinkElement.setAttribute('id', id);
            onComplete && onComplete();
        });
    };
    const setScale = (scale) => {
        layoutConfig.scale = scale;
        saveToLocalStorage('scale', scale);
    };

    const setActiveMenuItem = (item) => {
        layoutState.activeMenuItem = item.value || item;
    };

    const onMenuToggle = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (window.innerWidth > 991) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const onProfileSidebarToggle = () => {
        layoutState.profileSidebarVisible = !layoutState.profileSidebarVisible;
    };

    const onConfigSidebarToggle = () => {
        layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
    };

    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive || layoutState.overlaySubmenuActive);

    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    const isDesktop = computed(() => window.innerWidth > 991);

    const isSlim = computed(() => layoutConfig.menuMode === 'slim');
    const isSlimPlus = computed(() => layoutConfig.menuMode === 'slim-plus');

    const isHorizontal = computed(() => layoutConfig.menuMode === 'horizontal');

    return {
        layoutConfig: toRefs(layoutConfig),
        layoutState: toRefs(layoutState),
        replaceLink,
        setScale,
        onMenuToggle,
        isSidebarActive,
        isDarkTheme,
        setActiveMenuItem,
        onProfileSidebarToggle,
        onConfigSidebarToggle,
        isSlim,
        isSlimPlus,
        isHorizontal,
        isDesktop
    };
}
