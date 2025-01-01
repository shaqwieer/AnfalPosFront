<script setup>
import { ref, watch, computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { useUserRoleStore } from '@/stores/userRoleStore';

const userRoleStore = useUserRoleStore();
const mainStore = useMainStore();
const { t } = useI18n();

const containerClass = computed(() => ({
    rtl: mainStore.isRTL,
    ltr: !mainStore.isRTL
}));

const props = defineProps({
    closeDialog: {
        type: Function,
        required: true
    },
    roleKey: {
        required: false
    },
    saveElement: {
        type: Function,
        required: false
    },
    load: {
        type: Boolean,
        default: false
    }
});

const checked = ref(false);
const previousState = ref(null);
const permissions = computed(() => userRoleStore.permissions);

const togglePermissions = () => {
    if (checked.value) {
        previousState.value = JSON.parse(JSON.stringify(permissions.value));
        permissions.value.forEach((permission) => {
            permission.readAction = true;
            permission.createAction = true;
            permission.updateAction = true;
            permission.deleteAction = true;
        });
    } else {
        permissions.value = JSON.parse(JSON.stringify(previousState.value));
        previousState.value = null;
    }
};

watch(
    () => props.load,
    async (newLoad) => {
        if (newLoad) {
            await userRoleStore.GetPageNamesInRole(props.roleKey);
        }
    }
);

const saveData = () => {
    props.saveElement(permissions.value);
};
</script>

<template>
    <Dialog :header="t('permission.header')" :class="containerClass" :style="{ width: '50rem' }" :modal="true" :closable="false">
        <div class="flex flex-column gap-4 p-4">
            <div class="flex justify-content-end">
                <ToggleButton v-model="checked" class="w-10rem" :onLabel="t('permission.fullAccess')" :offLabel="t('permission.adminAccess')" @change="togglePermissions" />
            </div>
            <div :class="['flex', containerClass]">
                <DataTable
                    :paginator="true"
                    :rows="7"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5,7, 10, 25]"
                    :value="permissions"
                    tableStyle="min-width: 45rem"
                >
                    <template #empty>{{ t('permission.noPagesRoles') }}</template>
                    <Column field="pageName" :header="t('permission.pageName')"></Column>
                    <Column field="readAction">
                        <template #body="slotProps">
                            <div class="flex align-items-center">
                                <Checkbox v-model="slotProps.data.readAction" inputId="readAction" name="Read" :binary="true" />
                                <label for="readAction" class="ml-2">{{ t('permission.read') }}</label>
                            </div>
                        </template>
                    </Column>
                    <Column field="createAction">
                        <template #body="slotProps">
                            <div class="flex align-items-center">
                                <Checkbox v-model="slotProps.data.createAction" inputId="createAction" name="Create" :binary="true" />
                                <label for="createAction" class="ml-2">{{ t('permission.create') }}</label>
                            </div>
                        </template>
                    </Column>
                    <Column field="updateAction">
                        <template #body="slotProps">
                            <div class="flex align-items-center">
                                <Checkbox v-model="slotProps.data.updateAction" inputId="updateAction" name="Update" :binary="true" />
                                <label for="updateAction" class="ml-2">{{ t('permission.update') }}</label>
                            </div>
                        </template>
                    </Column>
                    <Column field="deleteAction">
                        <template #body="slotProps">
                            <div class="flex align-items-center">
                                <Checkbox v-model="slotProps.data.deleteAction" inputId="deleteAction" name="Delete" :binary="true" />
                                <label for="deleteAction" class="ml-2">{{ t('permission.delete') }}</label>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div class="flex justify-content-center gap-7 pt-4">
                <Button :label="t('permission.saveButton')" class="h-3rem" icon="pi pi-check" @click="saveData" />
                <Button
                    :label="t('permission.cancelButton')"
                    severity="danger"
                    icon="pi pi-times"
                    outlined
                    class="h-3rem"
                    @click="
                        () => {
                            closeDialog();
                        }
                    "
                />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.rtl {
    direction: rtl;
}
.ltr {
    direction: ltr;
}
.rtl :deep(.p-datatable .p-datatable-tbody > tr > td) {
    text-align: right;
}
:deep(.p-paginator .p-dropdown .p-dropdown-label) {
    padding-right: 1rem;
}
.rtl :deep(.p-paginator .p-paginator-first) {
    rotate: 180deg;
}
.rtl :deep(.p-paginator .p-paginator-prev) {
    rotate: 180deg;
}
.rtl :deep(.p-paginator .p-paginator-next) {
    rotate: 180deg;
}
.rtl :deep(.p-paginator .p-paginator-last) {
    rotate: 180deg;
}
</style>
