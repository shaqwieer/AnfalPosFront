<script setup>
import { ref, watch, computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import { useUserRoleStore } from '@/stores/userRoleStore';
import * as yup from 'yup';

const userRoleStore = useUserRoleStore();
const mainStore = useMainStore();
const { t } = useI18n();

const containerClass = computed(() => ({
    rtl: mainStore.isRTL,
    ltr: !mainStore.isRTL
}));
const rtl = computed(() => mainStore.isRTL);

const props = defineProps({
    closeDialog: {
        type: Function,
        required: true
    },
    IsAdd: {
        required: true
    },
    selectedData: {
        required: false
    },
    createElement: {
        type: Function,
        required: false
    },
    editElement: {
        type: Function,
        required: false
    },
    load: {
        type: Boolean,
        default: false
    }
});

const isPasswordVisible = ref(false);
const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};
const passwordFieldType = computed(() => (isPasswordVisible.value ? 'text' : 'password'));

const isPasswordConfirmVisible = ref(false);
const togglePasswordConfirmVisibility = () => {
    isPasswordConfirmVisible.value = !isPasswordConfirmVisible.value;
};
const passwordConfirmFieldType = computed(() => (isPasswordConfirmVisible.value ? 'text' : 'password'));

const typeSchema = yup.object({
    name: yup.string().min(6, t('CreateUpdateUsersRoles.nameMinError')).required(t('CreateUpdateUsersRoles.requiredError')),
    userName: yup.string().min(6, t('CreateUpdateUsersRoles.userNameMinError')).required(t('CreateUpdateUsersRoles.requiredError')),
    roles: yup.mixed().required(t('CreateUpdateUsersRoles.requiredError')),
    status: yup.mixed().required(t('CreateUpdateUsersRoles.requiredError')),
    password: yup.string(),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], t('CreateUpdateUsersRoles.passwordNotMatch'))
});

const informationInitial = ref({ name: '', userName: '', roles: null, status: null, password: '', confirmPassword: '' });

const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
    validationSchema: typeSchema,
    initialValues: informationInitial.value
});

const statusOptions = [
    { name: 'Active', color: 'success' },
    { name: 'Blocked', color: 'warning' }
];

const [name, nameAttrs] = defineField('name');
const [userName, userNameAttrs] = defineField('userName');
const [roles, rolesAttrs] = defineField('roles');
const [status, statusAttrs] = defineField('status');
const [password, passwordAttrs] = defineField('password');
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');

const createData = handleSubmit(async (validatedInfo) => {
        const transformedInfo = {
            name: validatedInfo.name,
            userName: validatedInfo.userName,
            roles: validatedInfo.roles,
            status: validatedInfo.status.name === 'Active' || validatedInfo.status.name === 'نشط' ? 'Active' : 'Blocked',
            password: validatedInfo.password,
            confirmPassword: validatedInfo.confirmPassword
        };
        props.createElement(transformedInfo);
        resetForm();
});

const updateData = handleSubmit(async (validatedInfo) => {
    const transformedInfo = {
        id: props.selectedData.id,
        name: validatedInfo.name,
        userName: validatedInfo.userName,
        roles: validatedInfo.roles,
        status: validatedInfo.status.name === 'Active' || validatedInfo.status.name === 'نشط' ? 'Active' : 'Blocked'
    };
    const fullDto = { ...props.selectedData, ...transformedInfo };
    props.editElement(props.selectedData.id, fullDto);
    resetForm();
});

const setFormValues = () => {
    const statusObj = props.selectedData.status ? statusOptions.find((e) => e.name === props.selectedData.status) : null;
    const rolesSelected = props.selectedData.roles ? dropDownOptions.value.filter((option) => props.selectedData.roles.map((e) => e.id).includes(option.id)) : [];
    setValues({
        name: props.selectedData.name,
        userName: props.selectedData.userName,
        status: statusObj,
        roles: rolesSelected
    });
};

watch(
    () => props.load,
    async (newLoad) => {
        if (newLoad) {
            await userRoleStore.GetRolesBasedOnTenant();
            if (props.load === true && props.IsAdd === false && props.selectedData) {
                setFormValues();
            }
        }
    }
);

const dropDownOptions = computed(() => userRoleStore.rolesSelection);
</script>

<template>
    <Dialog :breakpoints="{ '640px': '25rem' }" :header="t('CreateUpdateUsersRoles.header')" :class="containerClass" :style="{ width: '40rem' }" :modal="true" :closable="false">
        <div class="flex flex-column gap-4 p-4">
            <div class="field flex flex-column">
                <label for="roles" class="mb-3 required">{{ t('CreateUpdateUsersRoles.rolesLabel') }}</label>
                <MultiSelect
                    v-model="roles"
                    display="chip"
                    v-bind="rolesAttrs"
                    :virtualScrollerOptions="{ itemSize: 38 }"
                    :invalid="!!errors.roles"
                    :options="dropDownOptions"
                    :maxSelectedLabels="3"
                    filter
                    optionLabel="name"
                    :placeholder="t('CreateUpdateUsersRoles.rolesPlaceholder')"
                    class="w-full"
                >
                    <template #option="slotProps">
                        <div class="flex align-items-center mx-auto gap-1">
                            <Tag :severity="slotProps.option.color" class="w-3 h-3"></Tag>
                            <div>{{ slotProps.option.name }}</div>
                        </div>
                    </template>
                </MultiSelect>
                <small v-if="errors.roles" class="text-red-600">{{ errors.roles }}</small>
            </div>
            <div class="field flex flex-column">
                <label for="name" class="required">{{ t('CreateUpdateUsersRoles.nameLabel') }}</label>
                <InputText id="name" v-model="name" v-bind="nameAttrs" autofocus :invalid="!!errors.name" />
                <small v-if="errors.name" class="text-red-600">{{ errors.name }}</small>
            </div>
            <div class="field flex flex-column">
                <label for="userName" class="required">{{ t('CreateUpdateUsersRoles.userNameLabel') }}</label>
                <InputText id="userName" v-model="userName" v-bind="userNameAttrs" autofocus :invalid="!!errors.userName" />
                <small v-if="errors.userName" class="text-red-600">{{ errors.userName }}</small>
            </div>
            <div class="field flex flex-column" v-if="IsAdd">
                <label for="password" class="required">{{ t('CreateUpdateUsersRoles.passwordLabel') }}</label>
                <IconField :iconPosition="rtl ? 'right' : 'left'" class="w-full mb-3 mt-1">
                    <InputIcon :class="passwordFieldType === 'password' ? 'pi pi-eye' : 'pi pi-eye-slash'" @click="togglePasswordVisibility" />
                    <InputText id="password" v-model="password" v-bind="passwordAttrs" :type="passwordFieldType" class="w-full md:w-25rem" :class="{ 'p-invalid': errors.password }" :placeholder="t('CreateUpdateUsersRoles.passwordLabel')" />
                </IconField>
                <span v-if="errors.password" class="text-red-600">{{ errors.password }}</span>
            </div>

            <div class="field flex flex-column" v-if="IsAdd">
                <label for="confirmPassword" class="required">{{ t('CreateUpdateUsersRoles.confirmPasswordLabel') }}</label>
                <IconField :iconPosition="rtl ? 'right' : 'left'" class="w-full mb-3 mt-1">
                    <InputIcon :class="passwordFieldType === 'password' ? 'pi pi-eye' : 'pi pi-eye-slash'" @click="togglePasswordConfirmVisibility" />
                    <InputText id="confirmPassword" v-model="confirmPassword" v-bind="confirmPasswordAttrs" :type="passwordConfirmFieldType" class="w-full md:w-25rem" :class="{ 'p-invalid': errors.confirmPassword }" :placeholder="t('CreateUpdateUsersRoles.confirmPasswordLabel')" />
                </IconField>
                <span v-if="errors.confirmPassword" class="text-red-600">{{ errors.confirmPassword }}</span>
            </div>

            <div class="field flex flex-column">
                <label for="status" class="mb-3 required" >{{ t('CreateUpdateUsersRoles.statusLabel') }}</label>
                <Dropdown v-model="status" v-bind="statusAttrs" :virtualScrollerOptions="{ itemSize: 38 }" :options="statusOptions" :invalid="!!errors.status" filter optionLabel="name" :placeholder="t('CreateUpdateUsersRoles.statusPlaceholder')" class="w-full">
                    <template #option="slotProps">
                        <div class="flex align-items-center mx-auto gap-3">
                            <Tag :severity="slotProps.option.color" class="w-3 h-3"></Tag>
                            <div>{{ slotProps.option.name }}</div>
                        </div>
                    </template>
                </Dropdown>
                <small v-if="errors.status" class="text-red-600">{{ errors.status }}</small>
            </div>
            <div class="flex justify-content-end gap-3 pt-2">
                <Button :label="t('CreateUpdateUsersRoles.addButton')" v-if="IsAdd" icon="pi pi-check" @click="createData" />
                <Button :label="t('CreateUpdateUsersRoles.updateButton')" v-else icon="pi pi-check" @click="updateData" />
                <Button
                    :label="t('CreateUpdateUsersRoles.cancelButton')"
                    severity="danger"
                    icon="pi pi-times"
                    outlined
                    @click="
                        () => {
                            resetForm();
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
</style>
