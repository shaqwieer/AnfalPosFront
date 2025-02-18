<script setup>
import { useLayout } from '@/layout/composables/layout';
const { onProfileSidebarToggle } = useLayout();

import { useMainStore } from '@/stores/mainStore';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n'; // Import useI18n hook
import { useRouter } from 'vue-router';
const router = useRouter();
const goToPage = () => {
  router.push({ name: 'available-branches' }); // Navigate to a named route
};
const { t } = useI18n();

const mainStore = useMainStore();
const rtlValueText = computed(() => (mainStore.isRTL ? 'rtl' : 'ltr'));
const logOut = () => {
  onProfileSidebarToggle();
  mainStore.logout();
};
const { layoutState } = useLayout();

const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
</script>

<template>
  <Sidebar v-model:visible="layoutState.profileSidebarVisible.value" :position="'right'" class="layout-profile-sidebar w-full sm:w-25rem">
    <div class="flex flex-column mx-auto md:mx-0" :dir="rtlValueText">
      <span class="mb-2 font-semibold">{{ t('profileBar.welcome') }}</span>
      <span class="text-color-secondary font-medium mb-5"> {{ userInfo.personalInfo.name }}</span>

      <ul class="list-none m-0 p-0">
        <li>
          <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
            <span>
              <i class="pi pi-table text-xl text-primary"></i>
            </span>
            <div class="mx-3" @click="goToPage()">
              <span class="mb-2 font-semibold">{{ t('profileBar.branches') }}</span>
              <p class="text-color-secondary m-0">{{ t('profileBar.branchesDesc') }}</p>
            </div>
          </a>
        </li>
        <!-- <li>
                    <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                        <span>
                            <i class="pi pi-money-bill text-xl text-primary"></i>
                        </span>
                        <div class="ml-3">
                            <span class="mb-2 font-semibold">Billing</span>
                            <p class="text-color-secondary m-0">Amet mimin mıollit</p>
                        </div>
                    </a>
                </li>
                <li>
                    <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                        <span>
                            <i class="pi pi-cog text-xl text-primary"></i>
                        </span>
                        <div class="ml-3">
                            <span class="mb-2 font-semibold">Settings</span>
                            <p class="text-color-secondary m-0">Exercitation veniam</p>
                        </div>
                    </a>
                </li> -->
        <li>
          <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
            <span>
              <i class="pi pi-power-off text-xl text-primary"></i>
            </span>
            <div class="mx-3" @click="logOut()">
              <span class="mb-2 font-semibold">{{ t('profileBar.logout') }}</span>
              <p class="text-color-secondary m-0">{{ t('profileBar.logoutDesc') }}</p>
            </div>
          </a>
        </li>
      </ul>
    </div>

    <!-- <div class="flex flex-column mt-5 mx-auto md:mx-0">
            <span class="mb-2 font-semibold">Notifications</span>
            <span class="text-color-secondary font-medium mb-5">You have 3 notifications</span>

            <ul class="list-none m-0 p-0">
                <li>
                    <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                        <span>
                            <i class="pi pi-comment text-xl text-primary"></i>
                        </span>
                        <div class="ml-3">
                            <span class="mb-2 font-semibold">Your post has new comments</span>
                            <p class="text-color-secondary m-0">5 min ago</p>
                        </div>
                    </a>
                </li>
                <li>
                    <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                        <span>
                            <i class="pi pi-trash text-xl text-primary"></i>
                        </span>
                        <div class="ml-3">
                            <span class="mb-2 font-semibold">Your post has been deleted</span>
                            <p class="text-color-secondary m-0">15min ago</p>
                        </div>
                    </a>
                </li>
                <li>
                    <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                        <span>
                            <i class="pi pi-folder text-xl text-primary"></i>
                        </span>
                        <div class="ml-3">
                            <span class="mb-2 font-semibold">Post has been updated</span>
                            <p class="text-color-secondary m-0">3h ago</p>
                        </div>
                    </a>
                </li>
            </ul>
        </div>

        <div class="flex flex-column mt-5 mx-auto md:mx-0">
            <span class="mb-2 font-semibold">Messages</span>
            <span class="text-color-secondary font-medium mb-5">You have new messages</span>

            <ul class="list-none m-0 p-0">
                <li>
                    <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                        <span> <img src="/demo/images/avatar/circle/avatar-m-8.png" alt="Avatar" class="w-2rem h-2rem" /> </span>
                        <div class="ml-3">
                            <span class="mb-2 font-semibold">James Robinson</span>
                            <p class="text-color-secondary m-0">10 min ago</p>
                        </div>
                        <Badge value="3" class="ml-auto"></Badge>
                    </a>
                </li>
                <li>
                    <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                        <span> <img src="/demo/images/avatar/circle/avatar-f-8.png" alt="Avatar" class="w-2rem h-2rem" /> </span>
                        <div class="ml-3">
                            <span class="mb-2 font-semibold">Mary Watson</span>
                            <p class="text-color-secondary m-0">15min ago</p>
                        </div>
                        <Badge value="1" class="ml-auto"></Badge>
                    </a>
                </li>
                <li>
                    <a class="cursor-pointer flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                        <span> <img src="/demo/images/avatar/circle/avatar-f-4.png" alt="Avatar" class="w-2rem h-2rem" /> </span>
                        <div class="ml-3">
                            <span class="mb-2 font-semibold">Aisha Webb</span>
                            <p class="text-color-secondary m-0">3h ago</p>
                        </div>
                        <Badge value="2" class="ml-auto"></Badge>
                    </a>
                </li>
            </ul>
        </div> -->
  </Sidebar>
</template>
