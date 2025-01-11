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
    firstName: yup.string().min(6, t('CreateUpdateUsersRoles.nameMinError')).required(t('CreateUpdateUsersRoles.requiredError')),
    lastName: yup.string().min(6, t('CreateUpdateUsersRoles.nameMinError')).required(t('CreateUpdateUsersRoles.requiredError')),
    email: yup
        .string()
        .min(6, t('CreateUpdateUsersRoles.userNameMinError'))
        .email(t('CreateUpdateUsersRoles.emailInvalidError')) // Ensure the email is valid
        .required(t('CreateUpdateUsersRoles.requiredError')),
    roles: yup.mixed().required(t('CreateUpdateUsersRoles.requiredError')),
    country: yup.mixed().required(t('CreateUpdateUsersRoles.requiredError')),
    organization: yup.mixed().required(t('CreateUpdateUsersRoles.requiredError')),
    status: yup.mixed().required(t('CreateUpdateUsersRoles.requiredError')),
    password: yup.string(),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], t('CreateUpdateUsersRoles.passwordNotMatch'))
});

const informationInitial = ref({ firstName: '', lastName: '', email: '', roles: null, country: null, organization: null, status: null, password: '', confirmPassword: '' });

const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
    validationSchema: typeSchema,
    initialValues: informationInitial.value
});

const statusOptions = [
    { name: 'Active', color: 'success' },
    { name: 'Blocked', color: 'warning' }
];

const [firstName, firstNameAttrs] = defineField('firstName');
const [lastName, lastNameAttrs] = defineField('lastName');
const [email, emailAttrs] = defineField('email');
const [roles, rolesAttrs] = defineField('roles');
const [country, countryAttrs] = defineField('country');
const [organization, organizationAttrs] = defineField('organization');

const [status, statusAttrs] = defineField('status');
const [password, passwordAttrs] = defineField('password');
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');
let countries = [];
let organizations = [];
let rolesOptions = [];

const createData = handleSubmit(async (validatedInfo) => {
    const transformedInfo = {
        firstName: validatedInfo.firstName,
        lastName: validatedInfo.lastName,
        email: validatedInfo.email,
        roles: validatedInfo.roles,
        countryId: validatedInfo.country.id,
        organizationId: validatedInfo.organization.id,
        status: validatedInfo.status.name === 'Active' || validatedInfo.status.name === 'نشط' ? 'Active' : 'Blocked',
        password: validatedInfo.password,
        confirmPassword: validatedInfo.confirmPassword
    };
    props.createElement(transformedInfo,validatedInfo.country.name,validatedInfo.organization.name);
    resetForm();
});

const updateData = handleSubmit(async (validatedInfo) => {
    const transformedInfo = {
        id: props.selectedData.id,
        firstName: validatedInfo.firstName,
        lastName: validatedInfo.lastName,
        email: validatedInfo.email,
        countryId: validatedInfo.country.id,
        organizationId: validatedInfo.organization.id,
        countryName: validatedInfo.country.name,
        organizationName: validatedInfo.organization.name,
        roles: validatedInfo.roles,
        status: validatedInfo.status.name === 'Active' || validatedInfo.status.name === 'نشط' ? 'Active' : 'Blocked'
    };
    const fullDto = { ...props.selectedData, ...transformedInfo };
    props.editElement(props.selectedData.id, fullDto);
    resetForm();
});

const setFormValues = () => {
    const statusObj = props.selectedData.status ? statusOptions.find((e) => e.name === props.selectedData.status) : null;
    const rolesSelected = props.selectedData.roles ? rolesOptions.filter((option) => props.selectedData.roles.map((e) => e.id).includes(option.id)) : [];
    setValues({
        firstName: props.selectedData.firstName,
        lastName: props.selectedData.lastName,
        email: props.selectedData.email,
        status: statusObj,
        roles: rolesSelected,
        organization: organizations.find((e) => e.id === props.selectedData.organizationId),
        country: countries.find((e) => e.id === props.selectedData.countryId)
    });
};

watch(
    () => props.load,
    async (newLoad) => {
        if (newLoad) {
            var userRolesLookups = await userRoleStore.GetLookups();
            rolesOptions = userRolesLookups.roles;
            countries = userRolesLookups.countries;
            organizations = userRolesLookups.organizations;
            if (props.load === true && props.IsAdd === false && props.selectedData) {
                setFormValues();
            }
        }
    }
);
</script>

<template>
    <Dialog :breakpoints="{ '640px': '40rem' }" :header="t('CreateUpdateUsersRoles.header')" :class="containerClass" :style="{ width: '50rem' }" :modal="true" :closable="false">
        <div class="flex flex-column gap-3 p-4">
            <div class="flex gap-2 border-1 p-4 border-round-lg">
                <div class="field flex flex-column w-4">
                    <label for="country" class="mb-3 required">{{ $t('CreateUpdateUsersRoles.country') }}</label>
                    <Dropdown
                        v-model="country"
                        v-bind="countryAttrs"
                        :virtualScrollerOptions="{ itemSize: 38 }"
                        :options="countries"
                        filter
                        :loading="false"
                        optionLabel="name"
                        :placeholder="t('CreateUpdateUsersRoles.countryPlaceholder')"
                        class="w-full"
                    >
                        <template #option="slotProps">
                            <div class="flex align-items-center mx-auto gap-3">
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                    <small v-if="errors.country" class="text-red-600">{{ errors.country }}</small>
                </div>
                <div class="field flex flex-column w-4">
                    <label for="roles" class="mb-3 required">{{ t('CreateUpdateUsersRoles.rolesLabel') }}</label>
                    <MultiSelect
                        v-model="roles"
                        display="chip"
                        v-bind="rolesAttrs"
                        :virtualScrollerOptions="{ itemSize: 38 }"
                        :invalid="!!errors.roles"
                        :options="rolesOptions"
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
                <div class="field flex flex-column w-4">
                    <label for="organization" class="mb-3 required">{{ $t('CreateUpdateUsersRoles.organization') }}</label>
                    <Dropdown
                        v-model="organization"
                        v-bind="organizationAttrs"
                        :virtualScrollerOptions="{ itemSize: 38 }"
                        :options="organizations"
                        filter
                        :loading="false"
                        optionLabel="name"
                        :placeholder="t('CreateUpdateUsersRoles.organizationPlaceholder')"
                        class="w-full"
                    >
                        <template #option="slotProps">
                            <div class="flex align-items-center mx-auto gap-3">
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                    <small v-if="errors.organization" class="text-red-600">{{ errors.organization }}</small>
                </div>
            </div>
            <div class="flex gap-2 border-1 p-4 border-round-lg">
                <div class="field flex flex-column w-4">
                    <label for="email" class="required">{{ t('CreateUpdateUsersRoles.email') }}</label>
                    <InputText id="email" v-model="email" v-bind="emailAttrs" autofocus :invalid="!!errors.email" />
                    <small v-if="errors.email" class="text-red-600">{{ errors.email }}</small>
                </div>

                <div class="field flex flex-column w-4">
                    <label for="firstName" class="required">{{ t('CreateUpdateUsersRoles.firstName') }}</label>
                    <InputText id="firstName" v-model="firstName" v-bind="firstNameAttrs" autofocus :invalid="!!errors.firstName" />
                    <small v-if="errors.firstName" class="text-red-600">{{ errors.firstName }}</small>
                </div>

                <div class="field flex flex-column w-4">
                    <label for="lastName" class="required">{{ t('CreateUpdateUsersRoles.lastName') }}</label>
                    <InputText id="lastName" v-model="lastName" v-bind="lastNameAttrs" autofocus :invalid="!!errors.lastName" />
                    <small v-if="errors.lastName" class="text-red-600">{{ errors.lastName }}</small>
                </div>
            </div>
            <div class="flex  gap-2 border-1 p-4 border-round-lg ">
                <div class="field flex flex-column w-full" v-if="IsAdd">
                    <label for="password" class="required">{{ t('CreateUpdateUsersRoles.passwordLabel') }}</label>
                    <IconField :iconPosition="rtl ? 'right' : 'left'" class="w-full mb-3 mt-1">
                        <InputIcon :class="passwordFieldType === 'password' ? 'pi pi-eye' : 'pi pi-eye-slash'" @click="togglePasswordVisibility" />
                        <InputText id="password" v-model="password" v-bind="passwordAttrs" :type="passwordFieldType" class="w-full " :class="{ 'p-invalid': errors.password }" :placeholder="t('CreateUpdateUsersRoles.passwordLabel')" />
                    </IconField>
                    <span v-if="errors.password" class="text-red-600">{{ errors.password }}</span>
                </div>

                <div class="field flex flex-column w-full" v-if="IsAdd">
                    <label for="confirmPassword" class="required">{{ t('CreateUpdateUsersRoles.confirmPasswordLabel') }}</label>
                    <IconField :iconPosition="rtl ? 'right' : 'left'" class="w-full mb-3 mt-1">
                        <InputIcon :class="passwordFieldType === 'password' ? 'pi pi-eye' : 'pi pi-eye-slash'" @click="togglePasswordConfirmVisibility" />
                        <InputText
                            id="confirmPassword"
                            v-model="confirmPassword"
                            v-bind="confirmPasswordAttrs"
                            :type="passwordConfirmFieldType"
                            class="w-full "
                            :class="{ 'p-invalid': errors.confirmPassword }"
                            :placeholder="t('CreateUpdateUsersRoles.confirmPasswordLabel')"
                        />
                    </IconField>
                    <span v-if="errors.confirmPassword" class="text-red-600">{{ errors.confirmPassword }}</span>
                </div>

                <div class="field flex flex-column w-full">
                    <label for="status" class="mb-3 required">{{ t('CreateUpdateUsersRoles.statusLabel') }}</label>
                    <Dropdown
                        v-model="status"
                        v-bind="statusAttrs"
                        :virtualScrollerOptions="{ itemSize: 38 }"
                        :options="statusOptions"
                        :invalid="!!errors.status"
                        filter
                        optionLabel="name"
                        :placeholder="t('CreateUpdateUsersRoles.statusPlaceholder')"
                        class="w-full"
                    >
                        <template #option="slotProps">
                            <div class="flex align-items-center mx-auto gap-3">
                                <Tag :severity="slotProps.option.color" class="w-3 h-3"></Tag>
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Dropdown>
                    <small v-if="errors.status" class="text-red-600">{{ errors.status }}</small>
                </div>
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
