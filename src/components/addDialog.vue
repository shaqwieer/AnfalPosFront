<template>
    <Dialog v-model:visible="visible" style="width: 900px">
        <div>
            <Form @submit="onSubmit" :initial-values="initialValues" :validation-schema="schema">
                <FieldArray name="cirriculumName" class="flex flex-column align-items-center justify-content-center" v-slot="{ remove, push, fields }">
                    <button ref="removeButton" type="button" class="hidden" @click.stop="remove(0)"></button>
                    <button
                        ref="editButton"
                        class="hidden"
                        type="button"
                        @click.stop="
                            () => {
                                push({ title: title, languageCode: languageCode });
                            }
                        "
                    ></button>
                    <fieldset class="border-round-lg border-50 md:border-none flex flex-column md:flex-row gap-2 m-1 align-items-start w-full" v-for="(field, idx) in fields" :key="field.key">
                        <div class="flex flex-column align-items-center md:align-items-start w-full md:w-9 gap-2">
                            <Field :id="`title_${idx}`" :name="`cirriculumName[${idx}].title`" v-slot="{ field }">
                                <label for="name" class="min-w-max md:w-auto">{{ t(`Add.Name`) }} </label>
                                <InputText id="name" class="w-full shadow-4 font-semibold text-lg" v-bind="field" />
                            </Field>
                            <ErrorMessage class="text-red-500" :name="`cirriculumName[${idx}].title`" />
                        </div>

                        <div class="flex flex-row w-full md:w-3 gap-2">
                            <Field :id="`languageCode_${idx}`" :name="`cirriculumName[${idx}].languageCode`" v-slot="{ field }">
                                <div class="flex flex-column align-items-center md:align-items-start w-full gap-2">
                                    <label>{{ t(`Add.Lang`) }}</label>
                                    <div class="flex flex-row w-full gap-2">
                                        <Dropdown
                                            v-bind="field"
                                            v-model="field.value"
                                            :options="languages.filter((lang) => !fields.map((f) => f?.value?.languageCode?.value?.value).includes(lang.value))"
                                            filter
                                            optionLabel="name"
                                            class="flex-grow w-9 shadow-4 text-lg"
                                        >
                                            <template #value="slotProps">
                                                <div v-if="slotProps.value" class="flex align-items-center">
                                                    <div>{{ slotProps.value.value.name }}</div>
                                                </div>
                                                <span v-else class="flex h-1rem">
                                                    {{ slotProps.placeholder }}
                                                </span>
                                            </template>
                                            <template #option="slotProps">
                                                <div class="flex align-items-center">
                                                    <div>{{ slotProps.option.name }}</div>
                                                </div>
                                            </template>
                                        </Dropdown>
                                        <Button class="" severity="danger" :loading="loading" :disabled="loading || fields.length <= 1" icon="pi pi-trash" @click="remove(idx)" rounded></Button>
                                    </div>
                                    <ErrorMessage class="text-red-500" :name="`cirriculumName[${idx}].languageCode`" />
                                </div>
                            </Field>
                        </div>
                    </fieldset>
                    <div class="w-full flex justify-content-center">
                        <Button
                            class="w-6 md:w-auto flex justify-content-center border-2 font-semibold"
                            :loading="loading"
                            :disabled="loading || languages.filter((lang) => !fields.map((f) => f?.value?.languageCode?.value?.value).includes(lang.value)).length < fields.length"
                            @click="push({ title: '', languageCode: null })"
                            outlined
                            >{{ t('AddCurriculum.addLang') }}</Button
                        >
                    </div>
                </FieldArray>
                <div class="flex gap-3 w-full">
                    <Button
                        class="h-4rem w-6 md:w-auto flex justify-content-center font-semibold"
                        :loading="loading"
                        :disabled="loading"
                        @click="
                            () => {
                                submitButton.click();
                            }
                        "
                        type="button"
                        >{{ t(`labels.add`) }}
                    </Button>
                    <Button
                        class="h-4rem w-6 md:w-auto flex justify-content-center border-2 font-semibold"
                        :loading="loading"
                        :disabled="loading"
                        @click="
                            () => {
                                visible = false;
                            }
                        "
                        type="button"
                        outlined
                        >{{ t('labels.cancel') }}</Button
                    >
                </div>
                <button ref="submitButton" class="hidden" type="submit">Create Curriculum</button>
            </Form>
        </div>
    </Dialog>
</template>
<script setup>
import { ref } from 'vue';
import * as yup from 'yup';
import { Field, Form, ErrorMessage, FieldArray } from 'vee-validate';
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
const visible = defineModel(false);
const action = ref('add');
const loading = ref(false);
const submitButton = ref(null);
const removeButton = ref(null);
const editButton = ref(null);
const languages = ref([
    { name: t('languages.arabic'), value: 'ar' },
    { name: t('languages.english'), value: 'en' }
]);
const emit = defineEmits(['close']);
const initialValues = ref({
    cirriculumName: [
        {
            title: '',
            languageCode: { value: languages.value.find((lang) => lang.value === locale.value) }
        }
    ]
});
const schema = yup.object().shape({
    cirriculumName: yup.array().of(
        yup.object().shape({
            languageCode: yup.object().required('Language is required'),
            title: yup.string().required('Name is required')
        })
    )
});
const onSubmit = (values) => {
    loading.value = true;
    const temp = values.cirriculumName.map((item) => {
        return {
            languageCode: item.languageCode.value.value,
            title: item.title
        };
    });
    const newTemp = {
        translations: temp
    };
    emit('close', newTemp);
    loading.value = false;
    visible.value = false;
};
</script>
