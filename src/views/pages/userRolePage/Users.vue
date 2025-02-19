<script setup>
import { onMounted, ref, computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useUserRoleStore } from '@/stores/userRoleStore';
import { useI18n } from 'vue-i18n';
import { FilterMatchMode } from 'primevue/api';
import CreateUpdateDialog from '@/views/pages/userRolePage/CreateUpdateDialog.vue';
import DeleteDialog from '@/components/DeleteDialog.vue';
import ChangePasswordDialog from '@/views/pages/userRolePage/ChangePasswordDialog.vue';

const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);
const userRoleStore = useUserRoleStore();
const { t } = useI18n();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(async () => {
  await userRoleStore.UsersInTenant();
});

const users = computed(() => userRoleStore.users);

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

// Delete setting
const deleteDialogVisible = ref(false);
const deletedData = ref('');
const deletedKey = ref('');
const toggleDeleteDialog = (data, close) => {
  if (!close) {
    deletedData.value = data.name;
    deletedKey.value = data.id;
  }

  deleteDialogVisible.value = !deleteDialogVisible.value;
};
const confirmDelete = async (userId) => {
  await userRoleStore.deleteUser(userId);
  toggleDeleteDialog({}, true);
};

const editData = async (userId, newData) => {
  await userRoleStore.updateUser(userId, newData);
  toggleCreateEditDialog(true, {}, true);
};
const addData = async (data, countryName, organizationName) => {
  await userRoleStore.createUser(data, countryName, organizationName);
  toggleCreateEditDialog(true, {}, true);
};

// Change Password Dialog
const changePasswordDialogVisible = ref(false);
const userData = ref({});
const toggleChangePasswordDialog = (data, close) => {
  if (!close) {
    userData.value = data;
  }
  changePasswordDialogVisible.value = !changePasswordDialogVisible.value;
};
const savePassword = async (userId, payload) => {
  await userRoleStore.changePassword(userId, payload);
  toggleChangePasswordDialog({}, true);
};

// const getRoleColor = (role) => {
//   switch (role) {
//     case 'success':
//       return 'bg-green-100 text-green-800';
//     case 'secondary':
//       return 'bg-orange-100 text-orange-800';
//     default:
//       return 'bg-gray-400 text-white';
//   }
// };

const rowsPerPage = ref(10);
const currentPage = ref(0);

const onPageChange = (event) => {
  currentPage.value = event.page ?? 0;
};

const paginatedCustomers = computed(() => {
  if (!users.value || !Array.isArray(users.value)) {
    return [];
  }
  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return users.value.slice(start, end);
});
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="flex justify-content-between mb-5">
        <div>
          <h2>{{ t('users.header') }}</h2>
          <p class="font-medium">{{ t('users.description') }}</p>
        </div>

        <div>
          <Button :label="t('users.createButtonLabel')" v-tooltip.top="t('users.createButtonLabel')" class="w-full md:w-12rem" icon="pi pi-plus" @click="toggleCreateEditDialog(true, {}, false)" />
        </div>
      </div>

      <!-- <div :class="['card', { 'rtl-direction': rtl }]">
        <DataTable
          :value="users"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          :globalFilterFields="['userName', 'name']"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
        >
          <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
              <IconField :iconPosition="rtl ? 'left' : 'right'" class="block mt-2 md:mt-0">
                <InputIcon class="pi pi-search" />
                <InputText class="w-full sm:w-auto" v-model="filters['global'].value" :placeholder="t('users.searchPlaceholder')" />
              </IconField>
            </div>
          </template>
          <template #empty>{{ t('users.noUsers') }}</template>
          <Column :header="t('users.mainData')" headerStyle="min-width:10rem;">
            <template #body="slotProps">
              <div class="flex flex-column">
                <p class="font-bold text-base mb-0">{{ slotProps.data.countryName }}</p>
                <p class="text-sm font-semibold text-primary">{{ slotProps.data.organizationName }}</p>
              </div>
            </template>
          </Column>
          <Column field="email" :header="t('users.userName')" :sortable="true" headerStyle="min-width:10rem;">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Avatar :label="slotProps.data.email[0]" size="medium" shape="circle" class="avatar-hover-animation" />
                <span class="text-xl"> {{ slotProps.data.email }}</span>
              </div>
            </template>
          </Column>
          <Column field="name" :header="t('users.name')" :sortable="true" headerStyle="min-width:10rem;">
            <template #body="slotProps">
              <span class="text-xl"> {{ slotProps.data.name }}</span>
            </template>
          </Column>

          <Column field="roles" :header="t('users.rolesNames')" :sortable="true" headerStyle="min-width:10rem;">
            <template #body="slotProps">
              <div class="flex justify-content-start gap-2">
                <Tag v-for="(role, index) in slotProps.data.roles" :key="index" :severity="role.color" style="white-space: nowrap" class="h-2rem">{{ role.name }}</Tag>
              </div>
            </template>
          </Column>

          <Column field="branches" :header="t('users.branchesName')" :sortable="true" headerStyle="min-width:10rem;">
            <template #body="slotProps">
              <div class="flex justify-content-start gap-2">
                <span style="padding-bo" class="flex justify-content-center align-content-center border-round-lg w-max p-1 px-2 text-sm font-semibold">
                  <AvatarGroup>
                    <Avatar v-for="(branch, index) in slotProps.data.branches" :key="index" v-html="branch.name[0]" v-tooltip.top="branch.name" size="large" shape="circle" class="avatar-hover-animation cursor-pointer" />
                  </AvatarGroup>
                </span>
              </div>
            </template>
          </Column>

          <Column field="status" headerStyle="min-width:10rem;">
            <template #header="slotProps">
              <div class="flex mx-auto">
                {{ t('users.status') }}
              </div>
            </template>

            <template #body="slotProps">
              <Tag :class="slotProps.data.status === 'Active' || slotProps.data.status === 'نشط' ? 'bg-green-100 text-green-800' : 'warning'" rounded class="w-max p-1 px-2 mx-auto flex" :value="slotProps.data.status"></Tag>
            </template>
          </Column>

          <Column :header="t('users.actions')" headerStyle="min-width:10rem;">
            <template #body="slotProps">
              <div class="flex flex-nowrap">
                <Button icon="pi pi-trash" class="w-3rem h-3rem" v-tooltip.top="t('users.deleteTooltip')" text rounded aria-label="Delete" severity="danger" @click="toggleDeleteDialog(slotProps.data, false)" />
                <Button icon="pi pi-pencil" class="p-0 w-3rem h-3rem" v-tooltip.top="t('users.updateTooltip')" text rounded aria-label="Update" severity="success" @click="toggleCreateEditDialog(false, slotProps.data, false)" />
                <Button icon="pi pi-lock" class="w-3rem h-3rem" v-tooltip.top="t('users.passwordTooltip')" text rounded aria-label="Password" severity="secondary" @click="toggleChangePasswordDialog(slotProps.data, false)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div> -->
      <!-- {{ users }} -->
      <!-- Customer List - Scrollable Area -->
      <div class="flex-1 overflow-hidden">
        <div class="h-full overflow-y-auto pb-6">
          <div class="max-w-7xl mx-auto">
            <DataTable class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border" :value="paginatedCustomers" dataKey="id" :rows="10" :globalFilterFields="['name', 'id']" :currentPageReportTemplate="''">
              <template #empty>{{ t('users.noUsers') }}</template>
              <Column :header="t('users.mainData')" headerStyle="min-width:10rem;">
                <template #body="slotProps">
                  <div class="flex flex-column">
                    <p class="font-bold text-base mb-0">{{ slotProps.data.countryName }}</p>
                    <p class="text-sm font-semibold text-primary">{{ slotProps.data.organizationName }}</p>
                  </div>
                </template>
              </Column>
              <Column field="email" :header="t('users.userName')" :sortable="true" headerStyle="min-width:10rem;">
                <template #body="slotProps">
                  <div class="flex gap-2">
                    <Avatar :label="slotProps.data.email[0]" size="medium" shape="circle" class="avatar-hover-animation" />
                    <span class="text-xl"> {{ slotProps.data.email }}</span>
                  </div>
                </template>
              </Column>
              <Column field="name" :header="t('users.name')" :sortable="true" headerStyle="min-width:10rem;">
                <template #body="slotProps">
                  <span class="text-xl"> {{ slotProps.data.name }}</span>
                </template>
              </Column>

              <Column field="roles" :header="t('users.rolesNames')" :sortable="true" headerStyle="min-width:10rem;">
                <template #body="slotProps">
                  <div class="flex justify-content-start gap-2">
                    <Tag v-for="(role, index) in slotProps.data.roles" :key="index" :severity="role.color" style="white-space: nowrap" class="h-2rem">{{ role.name }}</Tag>
                  </div>
                </template>
              </Column>

              <Column field="branches" :header="t('users.branchesName')" :sortable="true" headerStyle="min-width:10rem;">
                <template #body="slotProps">
                  <div class="flex justify-content-start gap-2">
                    <span style="padding-bo" class="flex justify-content-center align-content-center border-round-lg w-max p-1 px-2 text-sm font-semibold">
                      <AvatarGroup>
                        <Avatar v-for="(branch, index) in slotProps.data.branches" :key="index" v-html="branch.name[0]" v-tooltip.top="branch.name" size="large" shape="circle" class="avatar-hover-animation cursor-pointer" />
                      </AvatarGroup>
                    </span>
                  </div>
                </template>
              </Column>

              <Column field="status" headerStyle="min-width:10rem;">
                <template #header="slotProps">
                  <div class="flex mx-auto">
                    {{ t('users.status') }}
                  </div>
                </template>

                <template #body="slotProps">
                  <Tag :class="slotProps.data.status === 'Active' || slotProps.data.status === 'نشط' ? 'bg-green-100 text-green-800' : 'warning'" rounded class="w-max p-1 px-2 mx-auto flex" :value="slotProps.data.status"></Tag>
                </template>
              </Column>

              <Column :header="t('users.actions')" headerStyle="min-width:10rem;">
                <template #body="slotProps">
                  <div class="flex flex-nowrap">
                    <Button icon="pi pi-trash" class="w-3rem h-3rem" v-tooltip.top="t('users.deleteTooltip')" text rounded aria-label="Delete" severity="danger" @click="toggleDeleteDialog(slotProps.data, false)" />
                    <Button icon="pi pi-pencil" class="p-0 w-3rem h-3rem" v-tooltip.top="t('users.updateTooltip')" text rounded aria-label="Update" severity="success" @click="toggleCreateEditDialog(false, slotProps.data, false)" />
                    <Button icon="pi pi-lock" class="w-3rem h-3rem" v-tooltip.top="t('users.passwordTooltip')" text rounded aria-label="Password" severity="secondary" @click="toggleChangePasswordDialog(slotProps.data, false)" />
                  </div>
                </template>
              </Column>
            </DataTable>

            <Paginator :rows="rowsPerPage" :totalRecords="users.length" @page="onPageChange" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <DeleteDialog
    v-model:visible="deleteDialogVisible"
    :confirmDelete="confirmDelete"
    :closeDialog="
      () => {
        toggleDeleteDialog({}, true);
      }
    "
    :deletedKey="deletedKey"
    :deleteText="deletedData"
  />
  <!-- Add Dialog -->
  <CreateUpdateDialog
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
  </CreateUpdateDialog>
  <ChangePasswordDialog
    v-model:visible="changePasswordDialogVisible"
    :closeDialog="
      () => {
        toggleChangePasswordDialog({}, true);
      }
    "
    :selectedData="userData"
    :createElement="savePassword"
  >
  </ChangePasswordDialog>
</template>

<style scoped>
.rtl-direction :deep(.p-datatable .p-datatable-tbody > tr > td) {
  text-align: right;
}
:deep(.p-paginator .p-dropdown .p-dropdown-label) {
  padding-right: 1rem;
}
.rtl-direction :deep(.p-paginator .p-paginator-first) {
  rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-prev) {
  rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-next) {
  rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-last) {
  rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-current) {
  direction: ltr;
}

.p-tag.p-tag-success {
  background-color: var(--green-100) !important;

  color: var(--green-800) !important;
}

.p-tag.p-tag-secondary {
  color: #4b5563;

  background-color: #e5e7eb;
}

.p-tag.p-tag-warning {
  background-color: var(--orange-100) !important;

  color: var(--orange-800) !important;
}

.p-tag.p-tag-danger {
  background-color: var(--red-100) !important;

  color: var(--red-800) !important;
}

.p-tag.p-tag-info {
  background-color: var(--blue-100) !important;

  color: var(--blue-800) !important;
}

.avatar-hover-animation {
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.avatar-hover-animation:hover {
  transform: scale(1.2);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
</style>
