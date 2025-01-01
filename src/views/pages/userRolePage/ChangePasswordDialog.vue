<script setup>
import { ref, computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

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
    createElement: {
        type: Function,
        required: false
    },
    selectedData: {
        required: false
    },
    
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
    password: yup.string().required(t('ChangePasswordDialog.passwordRequired')),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], t('ChangePasswordDialog.passwordsNotMatching')).required(t('ChangePasswordDialog.confirmPasswordRequired'))
});

const informationInitial = ref({  password: '', confirmPassword: '' });

const { handleSubmit, errors, resetForm, defineField } = useForm({
    validationSchema: typeSchema,
    initialValues: informationInitial.value
});

const [password, passwordAttrs] = defineField('password');
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');

const createData = handleSubmit(async (validatedInfo) => {
        const transformedInfo = {
            newPassword: validatedInfo.password,
            confirmPassword: validatedInfo.confirmPassword
        };
        props.createElement(props.selectedData.id,transformedInfo);
        resetForm();
});
</script>

<template>
    <Dialog :breakpoints="{ '640px': '25rem' }" :header="t('ChangePasswordDialog.header')" :class="containerClass" :style="{ width: '35rem' }" :modal="true" :closable="false">
        <div class="flex flex-column gap-4 p-4">
            <span class="text-3xl mx-auto text-center font-bold">{{ t('ChangePasswordDialog.prompt', { userName: props.selectedData.userName }) }}</span>
            <div class="field flex flex-column">
                <label for="password" class="required">{{ t('ChangePasswordDialog.password') }}</label>
                <IconField :iconPosition="rtl ? 'right' : 'left'" class="w-full mb-3 mt-1">
                    <InputIcon :class="passwordFieldType === 'password' ? 'pi pi-eye' : 'pi pi-eye-slash'" @click="togglePasswordVisibility" />
                    <InputText id="password" v-model="password" v-bind="passwordAttrs" :type="passwordFieldType" class="w-full md:w-25rem" :class="{ 'p-invalid': errors.password }" :placeholder="t('ChangePasswordDialog.password')" />
                </IconField>
                <span v-if="errors.password" class="text-red-600">{{ errors.password }}</span>
            </div>

            <div class="field flex flex-column">
                <label for="confirmPassword" class="required">{{ t('ChangePasswordDialog.confirmPassword') }}</label>
                <IconField :iconPosition="rtl ? 'right' : 'left'" class="w-full mb-3 mt-1">
                    <InputIcon :class="passwordFieldType === 'password' ? 'pi pi-eye' : 'pi pi-eye-slash'" @click="togglePasswordConfirmVisibility" />
                    <InputText id="confirmPassword" v-model="confirmPassword" v-bind="confirmPasswordAttrs" :type="passwordConfirmFieldType" class="w-full md:w-25rem" :class="{ 'p-invalid': errors.confirmPassword }" :placeholder="t('ChangePasswordDialog.confirmPassword')" />
                </IconField>
                <span v-if="errors.confirmPassword" class="text-red-600">{{ errors.confirmPassword }}</span>
            </div>
            <div class="flex justify-content-end gap-3 pt-2">
                <Button :label="t('ChangePasswordDialog.saveButton')" icon="pi pi-check" @click="createData" />
                <Button
                    :label="t('ChangePasswordDialog.cancelButton')"
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
