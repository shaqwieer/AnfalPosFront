<script setup>
import { ref, watch, computed } from 'vue';
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

const typeSchema = yup.object({
    name: yup.string().min(5, t('RoleCreateUpdateDialog.validationErrors.nameMin')).required(t('RoleCreateUpdateDialog.requiredError')),
    color: yup.mixed().required(t('RoleCreateUpdateDialog.validationErrors.colorRequired'))
});

const informationInitial = ref({ name: '', color: {} });

const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
    validationSchema: typeSchema,
    initialValues: informationInitial.value
});

const dropDownOptions = rtl.value
    ? [
          { name: t('RoleCreateUpdateDialog.dropDownOptions.primary'), color: 'success' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.gray'), color: 'secondary' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.darkBlue'), color: 'info' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.dark'), color: 'contrast' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.orange'), color: 'warning' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.red'), color: 'danger' }
      ]
    : [
          { name: t('RoleCreateUpdateDialog.dropDownOptions.primary'), color: 'success' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.gray'), color: 'secondary' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.darkBlue'), color: 'info' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.dark'), color: 'contrast' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.orange'), color: 'warning' },
          { name: t('RoleCreateUpdateDialog.dropDownOptions.red'), color: 'danger' }
      ];

const [name, nameAttrs] = defineField('name');
const [color, colorAttrs] = defineField('color');

const createData = handleSubmit(async (validatedInfo) => {
    const colorWord = validatedInfo.color.color;
    const transformedInfo = {
        name: validatedInfo.name,
        color: colorWord
    };
    props.createElement(transformedInfo);
    resetForm();
});

const updateData = handleSubmit(async (validatedInfo) => {
    const colorWord = validatedInfo.color.color;
    const transformedInfo = {
        id: props.selectedData.id,
        name: validatedInfo.name,
        color: colorWord
    };
    props.editElement(transformedInfo);
    resetForm();
});

const setFormValues = () => {
    const colorObject = props.selectedData.color ? dropDownOptions.find((e) => e.color === props.selectedData.color) : null;
    setValues({
        name: props.selectedData.name,
        color: colorObject
    });
};

watch(
    () => props.load,
    async (newLoad) => {
        if (newLoad) {
            if (props.load === true && props.IsAdd === false && props.selectedData) {
                setFormValues();
            }
        }
    }
);
</script>

<template>
    <Dialog :breakpoints="{ '640px': '25rem' }" :header="t('RoleCreateUpdateDialog.header')" :class="containerClass" :style="{ width: '35rem' }" :modal="true" :closable="false">
        <div class="flex flex-column gap-4 p-4">
            <div class="field flex flex-column">
                <label for="color" class="mb-3 required">{{ t('RoleCreateUpdateDialog.colorLabel') }}</label>
                <Dropdown v-model="color" v-bind="colorAttrs" :virtualScrollerOptions="{ itemSize: 38 }" :options="dropDownOptions" filter :loading="false" optionLabel="name" :placeholder="t('RoleCreateUpdateDialog.colorPlaceholder')" class="w-full">
                    <template #option="slotProps">
                        <div class="flex align-items-center mx-auto gap-3">
                            <Tag :severity="slotProps.option.color" class="w-3 h-3"></Tag>
                            <div>{{ slotProps.option.name }}</div>
                        </div>
                    </template>
                </Dropdown>
                <small v-if="errors.color" class="text-red-600">{{ errors.color }}</small>
            </div>
            <div class="field flex flex-column">
                <label for="name" class="required">{{ t('RoleCreateUpdateDialog.nameLabel') }}</label>
                <InputText id="name" v-model="name" v-bind="nameAttrs" autofocus :invalid="!!errors.name" />
                <small v-if="errors.name" class="text-red-600">{{ errors.name }}</small>
            </div>
            <div class="flex justify-content-end gap-3 pt-2">
                <Button :label="t('RoleCreateUpdateDialog.addButton')" v-if="IsAdd" icon="pi pi-check" @click="createData" />
                <Button :label="t('RoleCreateUpdateDialog.updateButton')" v-else icon="pi pi-check" @click="updateData" />
                <Button
                    :label="t('RoleCreateUpdateDialog.cancelButton')"
                    severity="danger"
                    icon="pi pi-times"
                    outlined
                    @click="
                        () => {
                            closeDialog();
                            resetForm();
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
