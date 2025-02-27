<script setup>
import { ref, watch, computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useOrganizationStore } from '@/stores/organizationStore';
import simpleuploader from '@/components/simpleuploader.vue';
import { ImageIcon, XIcon } from 'lucide-vue-next';
import placeHolderPhoto from '@/assets/images/placeholder.jpg';
import OrganizationSettings from './OrganizationSettings.vue';
const organizationStore = useOrganizationStore();

const mainStore = useMainStore();
const { t } = useI18n();
const visible = defineModel();

const containerClass = computed(() => ({
  rtl: mainStore.isRTL,
  ltr: !mainStore.isRTL
}));
const rtl = computed(() => mainStore.isRTL);

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

const organizationSchema = yup.object({
  arabicName: yup.string().required(t('organizationDialog.requiredError')),
  englishName: yup.string().required(t('organizationDialog.requiredError')),
  sapConfiguration: yup.mixed().nullable(),
  organizationType: yup.mixed().required(t('organizationDialog.requiredError')),
  invoiceTemplate: yup.mixed().required(t('organizationDialog.requiredError'))
});

const informationInitial = ref({ arabicName: '', englishName: '', sapConfiguration: null, organizationType: null, invoiceTemplate: null });

const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
  validationSchema: organizationSchema,
  initialValues: informationInitial.value
});

let invoiceTemplates = [];
let organizationTypes = [];
let organizationConfigs = [];

const [arabicName, arabicNameAttrs] = defineField('arabicName');
const [englishName, englishNameAttrs] = defineField('englishName');
const [sapConfiguration, sapConfigurationAttrs] = defineField('sapConfiguration');
const [organizationType, organizationTypeAttrs] = defineField('organizationType');
const [invoiceTemplate, invoiceTemplateAttrs] = defineField('invoiceTemplate');
const selectedFile = ref(null);
const logoFile = ref(null);

const loadPlaceholderBlob = async () => {
  const response = await fetch(placeHolderPhoto);
  const blob = await response.blob();
  return blob;
};

const createData = handleSubmit(async (validatedInfo) => {
  const formData = new FormData();
  formData.append('ArabicName', validatedInfo.arabicName);
  formData.append('EnglishName', validatedInfo.englishName);
  formData.append('OrganizationTypeId', validatedInfo.organizationType.id);
  formData.append('InvoiceTemplateId', validatedInfo.invoiceTemplate.id);
  formData.append('OrganizationConfigId', validatedInfo.sapConfiguration == null ? 0 : validatedInfo.sapConfiguration);
  if (selectedFile.value != null) {
    formData.append('LogoFile', selectedFile.value == null ? emptyBlob : selectedFile.value);
  }
  props.createElement(formData);
  logoFile.value = null;
  selectedFile.value = null;
  resetForm();
});
const updateData = handleSubmit(async (validatedInfo) => {
  const formData = new FormData();
  formData.append('UniqueIdentifier', props.selectedData.uniqueIdentifier);
  formData.append('ArabicName', validatedInfo.arabicName);
  formData.append('EnglishName', validatedInfo.englishName);
  formData.append('OrganizationTypeId', validatedInfo.organizationType.id);
  formData.append('InvoiceTemplateId', validatedInfo.invoiceTemplate.id);
  formData.append('IsChangedLogo', isChangedLogo.value);
  formData.append('OrganizationConfigId', validatedInfo.sapConfiguration == null ? 0 : validatedInfo.sapConfiguration.id);
  debugger;
  if (selectedFile.value != null) {
    formData.append('LogoFile', selectedFile.value == null ? emptyBlob : selectedFile.value);
  }
  props.editElement(props.selectedData.id, formData);
  resetForm();
});
//
const fileInput = ref(null);
const isDragging = ref(false);
const errorMessage = ref('');
const isChangedLogo = ref(false);

const previewUrl = computed(() => {
  return selectedFile.value ? (!props.IsUpdate && !(selectedFile.value instanceof Blob) ? selectedFile.value : URL.createObjectURL(selectedFile.value)) : null;
});

const dragover = (e) => {
  isDragging.value = true;
};

const dragleave = (e) => {
  isDragging.value = false;
};

const drop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) addFile(file);
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) addFile(file);
};
const addFile = (file) => {
  debugger;
  if (file.type.startsWith('image/')) {
    if (file.size <= 5 * 1024 * 1024) {
      if (selectedFile.value instanceof Blob) {
        URL.revokeObjectURL(selectedFile.value);
      }
      selectedFile.value = file;
      isChangedLogo.value = true;
      errorMessage.value = '';
    } else {
      errorMessage.value = 'File size exceeds 5MB limit.';
    }
  } else {
    errorMessage.value = 'Please select an image file.';
  }
};
const removeFile = () => {
  debugger
  selectedFile.value = null;
  isChangedLogo.value = true;
  errorMessage.value = '';
};
//
const setFormValues = () => {
  debugger;
  setValues({
    arabicName: props.selectedData.arabicName,
    englishName: props.selectedData.englishName,
    sapConfiguration: organizationConfigs.find((e) => e.id === props.selectedData.organizationConfigId),
    organizationType: organizationTypes.find((e) => e.id === props.selectedData.organizationTypeId),
    invoiceTemplate: invoiceTemplates.find((e) => e.id === props.selectedData.invoiceTemplateId)
  });
};
watch(
  () => props.load,
  async (newLoad) => {
    if (newLoad) {
      var organizationLookups = await organizationStore.getOrganizationLookups();
      invoiceTemplates = organizationLookups.invoiceTemplates;
      organizationTypes = organizationLookups.organizationTypes;
      organizationConfigs = organizationLookups.organizationConfigs;
      if (props.load === true && props.IsAdd === false && props.selectedData) {
        setFormValues();
        selectedFile.value = props.selectedData.logoImageUrl;
        // console.log(props.selectedData.logoImageUrl);
        // const response = await fetch(props.selectedData.logoImageUrl, { mode: 'no-cors' });
        // if (!response.ok) {
        //     throw new Error(`Failed to fetch logo: ${response.status} ${response.statusText}`);
        // }
        // logoFile.value = await response.blob();
        // console.log(logoFile.value);
      }
    }
  }
);
</script>

<template>
  <Dialog closable style="width: 80rem; max-width: 80%" v-model:visible="visible" :breakpoints="{ '640px': '25rem' }" :header="$t('organizationDialog.header')" :class="containerClass" :modal="true" :closable="false">
    <TabView>
      <TabPanel :header="$t('organizationDialog.basicDataTab')">
        <div class="flex flex-column gap-4 p-4">
          <div class="flex justify-content-between w-full gap-2">
            <div class="field flex flex-column w-6">
              <label for="englishName" class="required">{{ $t('cityDialog.englishNameLabel') }}</label>
              <InputText id="englishName" v-model="englishName" v-bind="englishNameAttrs" autofocus :invalid="!!errors.englishName" />
              <small v-if="errors.englishName" class="text-red-600">{{ errors.englishName }}</small>
            </div>
            <div class="field flex flex-column w-6">
              <label for="arabicName" class="required">{{ $t('cityDialog.arabicNameLabel') }}</label>
              <InputText id="arabicName" v-model="arabicName" v-bind="arabicNameAttrs" autofocus :invalid="!!errors.arabicName" />
              <small v-if="errors.arabicName" class="text-red-600">{{ errors.arabicName }}</small>
            </div>
          </div>

          <div class="flex justify-content-between w-full gap-2">
            <div class="field flex flex-column w-6">
              <label for="organizationType" class="mb-3 required">{{ $t('organizationDialog.organizationType') }}</label>
              <Dropdown
                v-model="organizationType"
                v-bind="organizationTypeAttrs"
                :virtualScrollerOptions="{ itemSize: 38 }"
                :options="organizationTypes"
                filter
                :loading="false"
                optionLabel="name"
                :placeholder="t('organizationDialog.organizationTypePlaceholder')"
                class="w-full"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center mx-auto gap-3">
                    <div>{{ slotProps.option.name }}</div>
                  </div>
                </template>
              </Dropdown>
              <small v-if="errors.organizationType" class="text-red-600">{{ errors.organizationType }}</small>
            </div>
            <div class="field flex flex-column w-6">
              <label for="invoiceTemplate" class="mb-3 required">{{ $t('organizationDialog.invoicesTemplate') }}</label>
              <Dropdown
                v-model="invoiceTemplate"
                v-bind="invoiceTemplateAttrs"
                :virtualScrollerOptions="{ itemSize: 38 }"
                :options="invoiceTemplates"
                filter
                :loading="false"
                optionLabel="name"
                :placeholder="t('organizationDialog.invoicesTemplatePlaceholder')"
                class="w-full"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center mx-auto gap-3">
                    <div>{{ slotProps.option.name }}</div>
                  </div>
                </template>
              </Dropdown>
              <small v-if="errors.invoiceTemplate" class="text-red-600">{{ errors.invoiceTemplate }}</small>
            </div>
            <!-- <div class="field flex flex-column w-6 border-1 p-3  border-round-lg botder-dashed bg-gray-50">
                            <label for="sapConfiguration" class="mb-3 required">{{ $t('organizationDialog.sapConfiguration') }}</label>
                            <Dropdown
                                v-model="sapConfiguration"
                                v-bind="sapConfigurationAttrs"
                                :virtualScrollerOptions="{ itemSize: 38 }"
                                :options="organizationConfigs"
                                filter
                                :loading="false"
                                :optionLabel="(option) => `${option.sapPlant}-${option.sapCode}`"
                                :placeholder="t('organizationDialog.sapConfigurationplaceholder')"
                                class="w-full"
                            >
                                <template #option="slotProps">
                                    <div class="flex align-items-center mx-auto gap-3">
                                        <div>{{ `${slotProps.option.sapPlant}-${slotProps.option.sapCode}` }}</div>
                                    </div>
                                </template>
                            </Dropdown>
                            <small v-if="errors.sapConfiguration" class="text-red-600">{{ errors.sapConfiguration }}</small>
                        </div> -->
          </div>
          <div class="flex justify-content-between w-full gap-2">
            <div class="field flex flex-column w-6">
              <label for="invoiceTemplate" class="mb-3">{{ $t('organizationDialog.logouploader') }}</label>
              <div
                @dragover.prevent="dragover"
                @dragleave.prevent="dragleave"
                @drop.prevent="drop"
                :class="['max-w-md mx-auto  p-2  border-round-lg h-16m shadow-1 border-2 border-dashed border-round-lg  text-center transition-colors', isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400']"
              >
                <input type="file" ref="fileInput" @change="handleFileSelect" class="hidden" accept="image/*" />

                <div v-if="!selectedFile">
                  <ImageIcon class="w-4rem mt-2 h-4rem mx-auto text-gray-400 mb-4" />
                  <p class="text-gray-600 mb-4">{{ t('uploader.mainlabel') }}</p>
                  <Button @click="$refs.fileInput.click()" text severity="info" class="mx-auto py-1 h-2rem">{{ t('uploader.secondarylabel') }}</Button>
                </div>

                <div v-else class="flex flex-column align-items-center">
                  <img :src="previewUrl" alt="Logo preview" class="max-w-full max-h-16rem mb-4 border-round-lg" />
                  <p class="text-sm text-gray-600 mb-2">{{ selectedFile.name }}</p>
                  <Button severity="danger" text @click="removeFile">
                    <XIcon class="w-1rem h-1rem" />
                  </Button>
                </div>
              </div>
              <!-- <simpleuploader v-model:logoFile="logoFile" v-model:imageChanged="imageChanged" :PhotoString="selectedData.logoImageUrl" :IsUpdated="IsAdd" /> -->
            </div>
          </div>

          <div class="flex justify-content-end gap-3 pt-2">
            <Button
              :label="$t('cityDialog.addButton')"
              v-if="IsAdd"
              icon="pi pi-check"
              @click="
                () => {
                  createData();
                 
                }
              "
            />
            <Button
              :label="$t('cityDialog.updateButton')"
              v-else
              icon="pi pi-check"
              @click="
                () => {
                  updateData();
             
                }
              "
            />
            <Button
              :label="$t('cityDialog.cancelButton')"
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
      </TabPanel>
      <TabPanel :header="$t('organizationDialog.organizationSettingsTab')" v-if="!IsAdd">
        <OrganizationSettings :selectedData="selectedData" :closeDialog="closeDialog" />
      </TabPanel>
    </TabView>
  </Dialog>
</template>
<style scoped>
.rtl {
  direction: rtl;
}
.ltr {
  direction: ltr;
}
.max-w-md {
  max-width: 760px;
}
</style>
