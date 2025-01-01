<script setup>
import { ref, watch, computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useCityStore } from '@/stores/cityStore';
const cityStore = useCityStore();

const mainStore = useMainStore();
const { t } = useI18n();
const visible = defineModel()
const containerClass = computed(() => ({
    rtl: mainStore.isRTL,
    ltr: !mainStore.isRTL
}));
const rtl=computed(()=>mainStore.isRTL)

const props = defineProps({

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
    },
    closeDialog: {
        type: Function,
        required: true
    }
});

const citySchema = yup.object({
    arabicName: yup.string().required(t('cityDialog.requiredError')),
    englishName: yup.string().required(t('cityDialog.requiredError')),
    country: yup.mixed().required(t('cityDialog.requiredError'))
});

const informationInitial = ref({ arabicName: '', englishName: '', country: null });

const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
    validationSchema: citySchema,
    initialValues: informationInitial.value
});

const countries=ref([]);

const [arabicName, arabicNameAttrs] = defineField('arabicName');
const [englishName, englishNameAttrs] = defineField('englishName');
const [country, countryAttrs] = defineField('country');


const createData = handleSubmit(async (validatedInfo) => {
    const transformedInfo = {
        arabicName: validatedInfo.arabicName,
        englishName: validatedInfo.englishName,
        countryId: validatedInfo.country.id,
        countryName: validatedInfo.country.name
    };
    props.createElement(transformedInfo);
    resetForm();
});

const updateData = handleSubmit(async (validatedInfo) => {
    const transformedInfo = {
        arabicName: validatedInfo.arabicName,
        englishName: validatedInfo.englishName,
        countryId: validatedInfo.country.id,
        countryName: validatedInfo.country.name
    };
    const fullDto ={...props.selectedData,...transformedInfo}
    props.editElement(props.selectedData.id, fullDto);
});
const setFormValues = () => {
    const countryObject = props.selectedData.countryId ? countries.value.find((e) => e.id === props.selectedData.countryId) : null;
    setValues({
        arabicName: props.selectedData.arabicName,
        englishName: props.selectedData.englishName,
        country: countryObject
    });
};
watch(
    () => props.load,
    async (newLoad) => {
        if (newLoad) {
            countries.value=await cityStore.getCountries();
            if (props.load === true && props.IsAdd === false && props.selectedData) {
                 setFormValues();
            }
        }
    }
);
</script>

<template>
    <Dialog v-model:visible="visible" :breakpoints="{ '640px': '25rem' }" :header="$t('cityDialog.header')" :class="containerClass" :style="{ width: '35rem' }" :modal="true" :closable="false">
        <div class="flex flex-column gap-4 p-4">
            <div class="field flex flex-column">
                <label for="country" class="mb-3 required">{{ $t('cityDialog.countryLabel') }}</label>
                <Dropdown
                    v-model="country"
                    v-bind="countryAttrs"
                    :virtualScrollerOptions="{ itemSize: 38 }"
                    :options="countries"
                    filter
                    :loading="false"
                    optionLabel="name"
                    :placeholder="t('cityDialog.countryPlaceholder')"
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
            <div class="field flex flex-column">
                <label for="englishName" class="required">{{ $t('cityDialog.englishNameLabel') }}</label>
                <InputText id="englishName" v-model="englishName" v-bind="englishNameAttrs" autofocus :invalid="!!errors.englishName" />
                <small v-if="errors.englishName" class="text-red-600">{{ errors.englishName }}</small>
            </div>
            <div class="field flex flex-column">
                <label for="arabicName" class="required">{{ $t('cityDialog.arabicNameLabel') }}</label>
                <InputText id="arabicName" v-model="arabicName" v-bind="arabicNameAttrs" autofocus :invalid="!!errors.arabicName" />
                <small v-if="errors.arabicName" class="text-red-600">{{ errors.arabicName }}</small>
            </div>
            <div class="flex justify-content-end gap-3 pt-2">
                <Button :label="$t('cityDialog.addButton')" v-if="IsAdd" icon="pi pi-check" @click="createData" />
                <Button :label="$t('cityDialog.updateButton')" v-else icon="pi pi-check" @click="updateData" />
                <Button
                    :label="$t('cityDialog.cancelButton')"
                    severity="danger"
                    icon="pi pi-times"
                    outlined
                    @click="
                        () => {
                            resetForm();
                            closeDialog();                        }
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