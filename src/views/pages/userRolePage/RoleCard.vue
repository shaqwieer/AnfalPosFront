<script setup>
import { onMounted, ref, computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useUserRoleStore } from '@/stores/userRoleStore';
import { useI18n } from 'vue-i18n';
import RoleCreateUpdateDialog from '@/views/pages/userRolePage/RoleCreateUpdateDialog.vue';
import Permissions from '@/views/pages/userRolePage/Permissions.vue';

const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);
const { t } = useI18n();
const userRoleStore = useUserRoleStore();

onMounted(async () => {
    await userRoleStore.getRolesWithusers();
});
const roles = computed(() => userRoleStore.roles);

// Card settings
const itemsPerPage = 5;
const maxVisibleAvatars = 4;
const currentPage = ref(1);
const totalPages = computed(() => {
    return Math.ceil(roles.value.length / itemsPerPage);
});
const paginatedRoles = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return roles.value.slice(start, end);
});
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

// Editing/Adding Setting
const load = ref(false);
const updateAddDialogVisible = ref(false);
const updateData = ref({});
const isAddFlag = ref(true);
const toggleCreateEditDialog = (addFlag, data, close) => {
    if (!addFlag && !close) {
        updateData.value = data;
        isAddFlag.value = false;
        load.value = true;
    } else if (addFlag && !close) {
        updateData.value = data;
        isAddFlag.value = true;
        load.value = true;
    } else {
        load.value = false;
    }
    updateAddDialogVisible.value = !updateAddDialogVisible.value;
};
const editData = async (newData) => {
    await userRoleStore.updateRole(newData);
    toggleCreateEditDialog(true, {}, true);
};
const addData = async (data) => {
    await userRoleStore.createRole(data);
    toggleCreateEditDialog(true, {}, true);
};

// Editing/Adding Permissions
const loadPermissions = ref(false);
const permissionsDialogVisible = ref(false);
const rolekey = ref('');
const togglePermissionsDialog = (data, close) => {
    if (!close) {
        rolekey.value = data;
        loadPermissions.value = true;
    } else {
        loadPermissions.value = false;
    }
    permissionsDialogVisible.value = !permissionsDialogVisible.value;
};
const addPermissions = async (data) => {
    await userRoleStore.SavePermission(data);
    togglePermissionsDialog(true, {}, true);
};
</script>

<template>
  


    <div class="flex flex-column row-gap-5 px-3 lg:flex-row justify-content-between">
      <div class="lg:col-8 px-0 pt-2">
        <h3 class="text-700 text-3xl font-semibold">{{ t('RoleCard.header') }}</h3>
        <p class="text-500 text-lg">{{ t('RoleCard.description') }}</p>
      </div>



      <div class="flex cursor-pointer flex-row justify-content-center gap-2 align-items-center bg-primary text-white border-round h-3rem w-full lg:w-14rem" @click="toggleCreateEditDialog(true, {}, false)">
        <div class="">+</div>
        <div class="">{{ t('RoleCard.addRoleButton') }}</div>
      </div>

      
    </div>






    <div class="grid">
        <div v-for="(role, index) in paginatedRoles" :key="index" class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0 flex flex-column gap-3 h-13rem">
                <div class="flex justify-content-between mb-4">
                    <div>
                        <span class="block text-500 font-medium mb-3">{{ t('RoleCard.totalUsers', { count: role.users.length }) }}</span>
                        <div class="text-900 font-medium text-xl">{{ role.name }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center">
                        <AvatarGroup>
                            <Avatar v-for="(label, index) in role.users.slice(0, maxVisibleAvatars)" :key="index" :label="label[0]" v-tooltip.top="label" size="large" shape="circle" class="avatar-hover-animation" />
                            <Avatar v-if="role.users.length > maxVisibleAvatars" :label="`+${role.users.length - maxVisibleAvatars}`" size="large" shape="circle" class="avatar-hover-animation" />
                        </AvatarGroup>
                    </div>
                </div>
                <div class="flex justify-content-between mb-2">
                    <Button :label="t('RoleCard.editRoleButton')"  class="h-2rem" severity="secondary" @click="toggleCreateEditDialog(false, role, false)" outlined />
                    <Button :label="t('RoleCard.editPermissionsButton')"    class="h-2rem" severity="success" outlined @click="togglePermissionsDialog(role.id, false)" />
                </div>
            </div>
        </div>

        <!-- <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0 gap-3 h-13rem">
                <div class="grid">
                    <div class="mb-4 col-5">
                        <div>
                            <img src="@/assets/images/newRole.png" class="w-5rem" alt="rolePhoto" />
                        </div>
                    </div>
                    <div class="col-7 flex flex-column gap-4">
                        <Button :label="" class="h-2rem" severity="primary" outlined  />
                        <span class="font-medium text-base text-600">{{ t('RoleCard.addRoleDescription') }}</span>
                    </div>
                </div>
            </div>
        </div> -->
    </div>


    <div class="pagination-controls flex justify-content-center align-items-center mt-4">
        <Button class="h-2rem"  @click="prevPage" :disabled="currentPage === 1">{{ t('RoleCard.previousButton') }}</Button>
        <span>{{ t('RoleCard.pageInfo', { currentPage: currentPage, totalPages: totalPages }) }}</span>
        <Button class="h-2rem"  @click="nextPage" :disabled="currentPage === totalPages">{{ t('RoleCard.nextButton') }}</Button>
    </div>
    <RoleCreateUpdateDialog
        v-model:visible="updateAddDialogVisible"
        :closeDialog="
            () => {
                toggleCreateEditDialog(true, {}, true);
            }
        "
        :IsAdd="isAddFlag"
        :selectedData="updateData"
        :createElement="addData"
        :editElement="editData"
        :load="load"
    >
    </RoleCreateUpdateDialog>
    <Permissions
        v-model:visible="permissionsDialogVisible"
        :closeDialog="
            () => {
                togglePermissionsDialog('', true);
            }
        "
        :roleKey="rolekey"
        :saveElement="addPermissions"
        :load="loadPermissions"
    >
    </Permissions>
</template>

<style scoped>
.avatar-hover-animation {
    transition:
        transform 0.3s ease-in-out,
        box-shadow 0.3s ease-in-out;
}

.avatar-hover-animation:hover {
    transform: scale(1.2);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
:deep(.p-avatar-group .p-avatar) {
    margin-left: -0.75rem;
}
.pagination-controls span {
    margin: 0 1rem;
} 
</style>
