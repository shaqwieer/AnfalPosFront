<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useOrganizationStore } from '@/stores/organizationStore';
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

const branchSchema = yup.object({
  arabicName: yup.string().required(t('branchDialog.requiredError')),
  englishName: yup.string().required(t('branchDialog.requiredError')),
  email: yup.string().nullable(t('branchDialog.requiredError')),
  address: yup.string().nullable(t('branchDialog.requiredError')),
  primaryPhone: yup.string().nullable(t('branchDialog.requiredError')),
  secondaryPhone: yup.string().nullable(),

  city: yup.mixed().nullable(t('branchDialog.requiredError')),
  defaultPaymentTermId: yup.mixed().nullable(t('branchDialog.paymentTerm')),

  branchType: yup.mixed().nullable(t('branchDialog.requiredError')),
  country: yup.mixed().nullable(t('branchDialog.requiredError')),

  salesRepCode: yup.string().nullable(t('branchDialog.requiredError')),
  sapStorageLocation: yup.mixed().nullable(),
  cashCustomer: yup.mixed().nullable(),
  profitCenter: yup.mixed().nullable(),
  cajoNumber: yup.mixed().nullable(),
  bankAccountId: yup.mixed().nullable(),
  bankName: yup.mixed().nullable(),
  bankCode: yup.mixed().nullable(),
  bankAccountNo: yup.mixed().nullable(),
  bulkStorageLocation: yup.mixed().nullable(),
  salesDistrict: yup.mixed().nullable(),

  defaultCustomerLimit: yup.mixed().nullable(),
  costCenter: yup.mixed().nullable(),

  bulkOrderType: yup.mixed().nullable(),
  enableBulk: yup.boolean().nullable(),
  selectBatch: yup.boolean().nullable(),
  canEditPrice: yup.boolean().nullable(),
  enableCreditLimitSalesRep: yup.boolean().nullable(),
  enableCreditLimitCustomer: yup.boolean().nullable(),
  customerCodeId: yup.mixed().nullable(),

  bankAccounts: yup.mixed().nullable(),
  bankAccountMain: yup.string().nullable() // Add validation for BankAccountMain
});

const informationInitial = ref({
  arabicName: '',
  englishName: '',
  email: '',
  address: '',
  primaryPhone: '',
  secondaryPhone: '',
  salesRepCode: '',
  city: null,
  defaultPaymentTermId: null,

  country: null,
  branchType: null,
  sapStorageLocation: '',
  cashCustomer: null,
  profitCenter: null,
  cajoNumber: '',
  bankAccountId: '',
  bankAccounts: '',
  bankName: '',
  bankCode: '',
  bankAccountNo: '',
  bulkStorageLocation: '',
  salesDistrict: '',

  defaultCustomerLimit: '',
  costCenter: '',
  bulkOrderType: '',
  canEditPrice: null,
  enableBulk: null,
  selectBatch: null,
  enableCreditLimitSalesRep: false,
  enableCreditLimitCustomer: false,
  bankPosFirst: null,
  bankPosSecond: null,
  customerCodeId: null,

  bankPosThird: null,
  bankAccountMain: '' // Add initial value for BankAccountMain
});

const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
  validationSchema: branchSchema,
  initialValues: informationInitial.value
});

let countries = [];
const cities = ref([]);
const paymentTerms = ref([]);

const filterCities = computed(() => {
  return cities.value.filter((e) => e.countryId === country?.value?.id);
});
let branchTypes = [];

const [arabicName, arabicNameAttrs] = defineField('arabicName');
const [englishName, englishNameAttrs] = defineField('englishName');
const [email, emailAttrs] = defineField('email');
const [address, addressAttrs] = defineField('address');
const [primaryPhone, primaryPhoneAttrs] = defineField('primaryPhone');
const [secondaryPhone, secondaryPhoneAttrs] = defineField('secondaryPhone');
const [canEditPrice, canEditPriceAttrs] = defineField('canEditPrice');
const [enableBulk, enableBulkAttrs] = defineField('enableBulk');
const [selectBatch, selectBatchAttrs] = defineField('selectBatch');
const [enableCreditLimitSalesRep, enableCreditLimitSalesRepAttrs] = defineField('enableCreditLimitSalesRep');
const [enableCreditLimitCustomer, enableCreditLimitCustomerAttrs] = defineField('enableCreditLimitCustomer');

const [city, cityAttrs] = defineField('city');

const [defaultPaymentTermId, defaultPaymentTermIdAttrs] = defineField('defaultPaymentTermId');

const [branchType, branchTypeAttrs] = defineField('branchType');
const [country, countryAttrs] = defineField('country');

const [salesRepCode, salesRepCodeAttrs] = defineField('salesRepCode');
const [sapStorageLocation, sapStorageLocationAttrs] = defineField('sapStorageLocation');
const [cashCustomer, cashCustomerAttrs] = defineField('cashCustomer');
const [profitCenter, profitCenterAttrs] = defineField('profitCenter');
const [cajoNumber, cajoNumberAttrs] = defineField('cajoNumber');
const [bankAccountId, bankAccountIdAttrs] = defineField('bankAccountId');
const [bankName, bankNameAttrs] = defineField('bankName');
const [bankCode, bankCodeAttrs] = defineField('bankCode');
const [bankAccountNo, bankAccountNoAttrs] = defineField('bankAccountNo');
const [bulkStorageLocation, bulkStorageLocationAttrs] = defineField('bulkStorageLocation');
const [salesDistrict, salesDistrictAttrs] = defineField('salesDistrict');

const [defaultCustomerLimit, defaultCustomerLimitAttrs] = defineField('defaultCustomerLimit');
const [costCenter, costCenterAttrs] = defineField('costCenter');
const [bulkOrderType, bulkOrderTypeAttrs] = defineField('bulkOrderType');

const [customerCodeId, customerCodeIdAttrs] = defineField('customerCodeId');

const [bankAccounts, bankAccountsAttrs] = defineField('bankAccounts');

const [bankPosFirst, bankPosFirstAttrs] = defineField('bankPosFirst');
const [bankPosSecond, bankPosSecondAttrs] = defineField('bankPosSecond');
const [bankPosThird, bankPosThirdAttrs] = defineField('bankPosThird');
const [bankAccountMain, bankAccountMainAttrs] = defineField('bankAccountMain'); // Define the field

const createData = handleSubmit(async (validatedInfo) => {
  const branchDto = {
    arabicName: validatedInfo.arabicName,
    englishName: validatedInfo.englishName,
    sapStorageLocation: validatedInfo.sapStorageLocation || null,
    profitCenter: validatedInfo.profitCenter || null,
    primaryPhone: validatedInfo.primaryPhone,
    OrganizationId: validatedInfo.organizationId || 1, // Provide default value if not present
    bankAccountId: validatedInfo.bankAccountId || null,
    canEditPrice: validatedInfo.canEditPrice,
    enableBulk: validatedInfo.enableBulk,
    selectBatch: validatedInfo.selectBatch,
    enableCreditLimitSalesRep: validatedInfo.enableCreditLimitSalesRep || false,
    enableCreditLimitCustomer: validatedInfo.enableCreditLimitCustomer || false,

    bankName: validatedInfo.bankName || null,
    bankCode: validatedInfo.bankCode || null,
    customerCodeId: validatedInfo.customerCodeId || null,

    bankAccountNo: validatedInfo.bankAccountNo || null,
    bulkStorageLocation: validatedInfo.bulkStorageLocation || null,
    salesDistrict: validatedInfo.salesDistrict || null,

    defaultCustomerLimit: validatedInfo.defaultCustomerLimit || null,
    costCenter: validatedInfo.costCenter || null,

    bulkOrderType: validatedInfo.bulkOrderType || null,

    cajoNumber: validatedInfo.cajoNumber || null,
    bankAccountId: validatedInfo.bankAccountId || null,

    bankPosFirst: validatedInfo.bankPosFirst || null,
    bankPosSecond: validatedInfo.bankPosSecond || null,
    bankPosThird: validatedInfo.bankPosThird || null,

    bankAccountMain: validatedInfo.bankAccountMain || null, // Include BankAccountMain

    SecondaryPhone: validatedInfo.secondaryPhone || null,
    SalesRepCode: validatedInfo.salesRepCode || null,
    CashCustomer: validatedInfo.cashCustomer || null,
    BranchTypeId: validatedInfo.branchType?.id || 0,
    CountryId: validatedInfo.country?.id || 0,
    CityId: validatedInfo.city?.id || 0,
    defaultPaymentTermId: validatedInfo.defaultPaymentTermId?.id || 0,

    Email: validatedInfo.email,
    Address: validatedInfo.address
  };
  console.log('validatedInfo');
  console.log(validatedInfo);

  props.createElement(branchDto);
  resetForm();
});
const updateData = handleSubmit(async (validatedInfo) => {
  const branchDto = {
    arabicName: validatedInfo.arabicName,
    englishName: validatedInfo.englishName,
    sapStorageLocation: validatedInfo.sapStorageLocation || null,
    profitCenter: validatedInfo.profitCenter || null,
    primaryPhone: validatedInfo.primaryPhone,
    OrganizationId: validatedInfo.organizationId, // Provide default value if not present
    bankAccounts: validatedInfo.bankAccounts || null,
    customerCodeId: validatedInfo.customerCodeId || null,
    canEditPrice: validatedInfo.canEditPrice,
    enableBulk: validatedInfo.enableBulk,
    selectBatch: validatedInfo.selectBatch,
    enableCreditLimitSalesRep: validatedInfo.enableCreditLimitSalesRep || false,
    enableCreditLimitCustomer: validatedInfo.enableCreditLimitCustomer || false,

    bankName: validatedInfo.bankName || null,
    bankCode: validatedInfo.bankCode || null,
    cajoNumber: validatedInfo.cajoNumber || null,
    bankAccountId: validatedInfo.bankAccountId || null,

    bankAccountNo: validatedInfo.bankAccountNo || null,
    bulkStorageLocation: validatedInfo.bulkStorageLocation || null,
    salesDistrict: validatedInfo.salesDistrict || null,

    defaultCustomerLimit: validatedInfo.defaultCustomerLimit || null,
    costCenter: validatedInfo.costCenter || null,

    bulkOrderType: validatedInfo.bulkOrderType || null,

    bankPosFirst: validatedInfo.bankPosFirst || null,
    bankPosSecond: validatedInfo.bankPosSecond || null,
    bankPosThird: validatedInfo.bankPosThird || null,

    bankAccountMain: validatedInfo.bankAccountMain || null, // Include BankAccountMain

    SecondaryPhone: validatedInfo.secondaryPhone || null,
    SalesRepCode: validatedInfo.salesRepCode || null,
    CashCustomer: validatedInfo.cashCustomer || null,
    BranchTypeId: validatedInfo.branchType?.id || 0,
    CountryId: validatedInfo.country?.id || 0,
    CityId: validatedInfo.city?.id || 0,

    defaultPaymentTermId: validatedInfo.defaultPaymentTermId?.id || 0,

    Email: validatedInfo.email,
    Address: validatedInfo.address
  };
  console.log('validatedInfo');
  console.log(validatedInfo);

  props.editElement(props.selectedData.id, branchDto);
  resetForm();
});

const setFormValues = () => {
  setValues({
    arabicName: props.selectedData.arabicName,
    englishName: props.selectedData.englishName,
    email: props.selectedData.email,
    address: props.selectedData.address,
    primaryPhone: props.selectedData.primaryPhone,
    secondaryPhone: props.selectedData.secondaryPhone,
    salesRepCode: props.selectedData.salesRepCode,
    sapStorageLocation: props.selectedData.sapStorageLocation,
    cashCustomer: props.selectedData.cashCustomer,
    profitCenter: props.selectedData.profitCenter,
    bankAccounts: props.selectedData.bankAccounts,
    canEditPrice: props.selectedData.canEditPrice,
    enableBulk: props.selectedData.enableBulk,
    selectBatch: props.selectedData.selectBatch,
    enableCreditLimitSalesRep: props.selectedData.enableCreditLimitSalesRep,
    enableCreditLimitCustomer: props.selectedData.enableCreditLimitCustomer,

    bankPosFirst: props.selectedData.bankPosFirst,
    bankPosSecond: props.selectedData.bankPosSecond,
    bankPosThird: props.selectedData.bankPosThird,
    customerCodeId: props.selectedData.customerCodeId,

    cajoNumber: props.selectedData.cajoNumber,
    bankAccountId: props.selectedData.bankAccountId,
    bankName: props.selectedData.bankName,
    bankCode: props.selectedData.bankCode,
    bankAccountNo: props.selectedData.bankAccountNo,
    bulkStorageLocation: props.selectedData.bulkStorageLocation,
    salesDistrict: props.selectedData.salesDistrict,

    defaultCustomerLimit: props.selectedData.defaultCustomerLimit,
    costCenter: props.selectedData.costCenter,

    bulkOrderType: props.selectedData.bulkOrderType,

    country: countries.find((e) => e.id === props.selectedData.countryId),
    branchType: branchTypes.find((e) => e.id === props.selectedData.branchTypeId),
    city: cities.value.find((e) => e.id === props.selectedData.cityId),
    defaultPaymentTermId: paymentTerms.value.find((e) => e.id === props.selectedData.defaultPaymentTermId),
    bankAccountMain: props.selectedData.bankAccountMain // Set value for BankAccountMain
  });
  console.log('props.selectedData');
  console.log(props.selectedData);
};
watch(
  () => props.load,
  async (newLoad) => {
    if (newLoad) {
      var branchLookups = await organizationStore.getBranchLookups();
      countries = branchLookups.countries;
      branchTypes = branchLookups.branchTypes;
      cities.value = branchLookups.cities;
      if (props.load === true && props.IsAdd === false && props.selectedData) {
        setFormValues();
      }
    }
  }
);

const customerCodes = ref([]);

import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

const getPaymentTerms = async () => {
  try {
    const response = await apiClient.get(`/PaymentTerms`);
    paymentTerms.value = response.data.data;
  } catch (err) {
    handleError(err, mainStore.loading);
  }
};

onMounted(async () => {
  try {
    console.log(defaultPaymentTermId.value);
    const response = await apiClient.get(`/CustomerCodes`);
    customerCodes.value = response.data.data;
    getPaymentTerms();
  } catch (err) {
    handleError(err, mainStore.loading);
  }
});
</script>

<template>
  <Dialog v-model:visible="visible" :breakpoints="{ '640px': '25rem' }" :header="$t('branchDialog.header')" :class="containerClass" :style="{ minWidth: '60rem' }" :modal="true" :closable="false">
    <div class="flex flex-column gap-4 p-4" style="padding-bottom: 50px !important">
      <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
        <h3 class="text-primary-600 text-base font-semibold">{{ $t('branchDialog.generalInformation') }}</h3>
        <div class="flex gap-2">
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
      </div>
      <!-- {{ paymentTerm }} -->
      <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
        <h3 class="text-primary-600 text-base font-semibold">{{ $t('branchDialog.sapInformation') }}</h3>
        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="organizationType" class="mb-3">{{ $t('branchDialog.sapStorageLocation') }}</label>

            <InputText id="organizationType" v-model="sapStorageLocation" v-bind="sapStorageLocationAttrs" :invalid="!!errors.sapStorageLocation" />

            <small v-if="errors.sapStorageLocation" class="text-red-600">{{ errors.sapStorageLocation }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="profitCenter" class="mb-3">{{ $t('branchDialog.profitCenter') }}</label>
            <InputText id="profitCenter" v-model="profitCenter" v-bind="profitCenterAttrs" :invalid="!!errors.profitCenter" />
            <small v-if="errors.profitCenter" class="text-red-600">{{ errors.profitCenter }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="cashCustomer" class="mb-3">{{ $t('branchDialog.cashCustomer') }}</label>
            <!-- <Dropdown
              v-model="cashCustomer"
              disabled
              v-bind="cashCustomerAttrs"
              :virtualScrollerOptions="{ itemSize: 38 }"
              :options="countries"
              filter
              :loading="false"
              optionLabel="name"
              :placeholder="t('branchDialog.cashCustomerPlaceholder')"
              class="w-full"
            >
              <template #option="slotProps">
                <div class="flex align-items-center mx-auto gap-3">
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Dropdown> -->

            <InputText id="cashCustomer" v-model="cashCustomer" v-bind="cashCustomerAttrs" :invalid="!!errors.cashCustomer" />

            <small v-if="errors.cashCustomer" class="text-red-600">{{ errors.cashCustomer }}</small>
          </div>
          <div class="field flex flex-column w-6">
            <label for="SalesRepCode" class="mb-3">Sales Rep Code</label>
            <InputText id="SalesRepCode" v-model="salesRepCode" v-bind="salesRepCodeAttrs" autofocus :invalid="!!errors.salesRepCode" />
            <small v-if="errors.salesRepCode" class="text-red-600">{{ errors.salesRepCode }}</small>
          </div>
        </div>
      </div>

      <div class="flex flex-column w-full gap-2 border-gray-300 border-1 p-4 border-round-lg">
        <h3 class="text-primary-600 text-base font-semibold">Bank Information</h3>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="bankPosFirst" class="mb-3">Bank POS1</label>
            <InputText id="bankPosFirst" v-model="bankPosFirst" v-bind="bankPosFirstAttrs" :invalid="!!errors.bankPosFirst" />
            <small v-if="errors.bankPosFirst" class="text-red-600">{{ errors.bankPosFirst }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="bankPosSecond" class="mb-3">Bank POS2</label>
            <InputText id="bankPosSecond" v-model="bankPosSecond" v-bind="bankPosSecondAttrs" :invalid="!!errors.bankPosSecond" />
            <small v-if="errors.bankPosSecond" class="text-red-600">{{ errors.bankPosSecond }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="bankPosThird" class="mb-3">Bank POS3</label>
            <InputText id="bankPosThird" v-model="bankPosThird" v-bind="bankPosThirdAttrs" :invalid="!!errors.bankPosThird" />
            <small v-if="errors.bankPosThird" class="text-red-600">{{ errors.bankPosThird }}</small>
          </div>
          <div class="field flex flex-column w-6">
            <label for="cajoNumber" class="mb-3">{{ $t('branchDialog.cajoNumber') }}</label>

            <InputText id="cajoNumber" v-model="cajoNumber" v-bind="cajoNumberAttrs" :invalid="!!errors.cajoNumber" />

            <small v-if="errors.cajoNumber" class="text-red-600">{{ errors.cajoNumber }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="bankAccountId" class="mb-3">{{ $t('branchDialog.bankAccountId') }}</label>

            <InputText id="bankAccountId" v-model="bankAccountId" v-bind="bankAccountIdAttrs" :invalid="!!errors.bankAccountId" />

            <small v-if="errors.bankAccountId" class="text-red-600">{{ errors.bankAccountId }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="bankName" class="mb-3">{{ $t('branchDialog.bankName') }}</label>
            <InputText id="bankName" v-model="bankName" v-bind="bankNameAttrs" :invalid="!!errors.bankName" />
            <small v-if="errors.bankName" class="text-red-600">{{ errors.bankName }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="bankCode" class="mb-3">{{ $t('branchDialog.bankCode') }}</label>

            <InputText id="bankCode" v-model="bankCode" v-bind="bankCodeAttrs" :invalid="!!errors.bankCode" />

            <small v-if="errors.bankCode" class="text-red-600">{{ errors.bankCode }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="bankAccountNo" class="mb-3">{{ $t('branchDialog.bankAccountNo') }}</label>
            <InputText id="bankAccountNo" v-model="bankAccountNo" v-bind="bankAccountNoAttrs" autofocus :invalid="!!errors.bankAccountNo" />
            <small v-if="errors.bankAccountNo" class="text-red-600">{{ errors.bankAccountNo }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="bankAccountMain" class="mb-3">Bank Account Main</label>
            <InputText id="bankAccountMain" v-model="bankAccountMain" v-bind="bankAccountMainAttrs" :invalid="!!errors.bankAccountMain" />
            <small v-if="errors.bankAccountMain" class="text-red-600">{{ errors.bankAccountMain }}</small>
          </div>
        </div>
      </div>

      <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
        <h3 class="text-primary-600 text-base font-semibold">{{ $t('branchDialog.additionalfields') }}</h3>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label class="mb-3">{{ $t(`Customer.salesDistrict`) }} </label>
            <InputText id="salesDistrict" v-model="salesDistrict" v-bind="salesDistrictAttrs" autofocus :invalid="!!errors.salesDistrict" />
            <small v-if="errors.salesDistrict" class="text-red-600">{{ errors.salesDistrict }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label class="mb-3">{{ $t(`Customer.BulkStorageLocation`) }} </label>
            <InputText id="bulkStorageLocation" v-model="bulkStorageLocation" v-bind="bulkStorageLocationAttrs" autofocus :invalid="!!errors.bulkStorageLocation" />
            <small v-if="errors.bulkStorageLocation" class="text-red-600">{{ errors.bulkStorageLocation }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label class="mb-3">{{ $t(`Customer.BulkOrderType`) }} </label>
            <InputText id="bulkOrderType" v-model="bulkOrderType" v-bind="bulkOrderTypeAttrs" autofocus :invalid="!!errors.bulkOrderType" />
            <small v-if="errors.bulkOrderType" class="text-red-600">{{ errors.bulkOrderType }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-4">
            <label for="paymentTerm" class="mb-3">{{ $t('branchDialog.DefaultPaymentTerm') }}</label>
            <Dropdown
              v-model="defaultPaymentTermId"
              v-bind="defaultPaymentTermIdAttrs"
              :virtualScrollerOptions="{ itemSize: 38 }"
              :options="paymentTerms"
              filter
              :loading="false"
              optionLabel="description"
              :placeholder="t('branchDialog.paymentTermPlaceholder')"
              class="w-full"
            >
              <template #option="slotProps">
                <div class="flex align-items-center mx-auto gap-3">
                  <div>{{ slotProps.option.description }}</div>
                </div>
              </template>
            </Dropdown>
            <small v-if="errors.paymentTerm" class="text-red-600">{{ errors.paymentTerm }}</small>
          </div>

          <div class="field flex flex-column w-4">
            <label class="mb-3">{{ $t(`Customer.DefaultCreditLimit`) }} </label>
            <InputNumber style="height: 44px" id="creditLimit" v-model="defaultCustomerLimit" v-bind="defaultCustomerLimitAttrs" autofocus :invalid="!!errors.defaultCustomerLimit" />
            <small v-if="errors.defaultCustomerLimit" class="text-red-600">{{ errors.defaultCustomerLimit }}</small>
          </div>

          <div class="field flex flex-column w-4">
            <label class="mb-3">{{ $t(`Customer.CostCenter`) }} </label>
            <InputText id="costCenter" v-model="costCenter" v-bind="costCenterAttrs" autofocus :invalid="!!errors.costCenter" />
            <small v-if="errors.costCenter" class="text-red-600">{{ errors.costCenter }}</small>
          </div>

        </div>

        <div class="">
          <div class="">
            <input type="checkbox" @click.stop id="canEditPrice" class="m-0 mr-2 mt-2" v-model="canEditPrice" v-bind="canEditPriceAttrs" :aria-invalid="!!errors.canEditPrice" />
            <label for="canEditPrice" class="m-0" style="position: relative; top: -2px">{{ $t('branchDialog.canEditPrice') }}</label>
          </div>

          <div class="">
            <input type="checkbox" aria-label="EnableBulk" @click.stop id="EnableBulk" class="m-0 mr-2 mt-2" v-model="enableBulk" v-bind="enableBulkAttrs" :aria-invalid="!!errors.enableBulk" />
            <label for="EnableBulk" class="m-0" style="position: relative; top: -2px">{{ $t('branchDialog.EnableBulk') }}</label>
          </div>

          <div class="">
            <input type="checkbox" aria-label="SelectBatch" @click.stop id="SelectBatch" class="m-0 mr-2 mt-2" v-model="selectBatch" v-bind="selectBatchAttrs" :aria-invalid="!!errors.selectBatch" />
            <label for="SelectBatch" class="m-0" style="position: relative; top: -2px">{{ $t('branchDialog.SelectBatch') }}</label>
          </div>
          <small v-if="errors.selectBatch" class="text-red-600">{{ errors.selectBatch }}</small>
        
          <div class="">
            <input type="checkbox" aria-label="EnableCreditLimitSalesRep" @click.stop id="EnableCreditLimitSalesRep" class="m-0 mr-2 mt-2" v-model="enableCreditLimitSalesRep" v-bind="enableCreditLimitSalesRepAttrs" :aria-invalid="!!errors.enableCreditLimitSalesRep" />
            <label for="EnableCreditLimitSalesRep" class="m-0" style="position: relative; top: -2px">{{ $t('branchDialog.EnableCreditLimitSalesRep') }}</label>
          </div>
          <div class="">
            <input type="checkbox" aria-label="EnableCreditLimitCustomer" @click.stop id="EnableCreditLimitCustomer" class="m-0 mr-2 mt-2" v-model="enableCreditLimitCustomer" v-bind="enableCreditLimitCustomerAttrs" :aria-invalid="!!errors.enableCreditLimitCustomer" />
            <label for="EnableCreditLimitCustomer" class="m-0" style="position: relative; top: -2px">{{ $t('branchDialog.EnableCreditLimitCustomer') }}</label>
          </div>

        </div>
      </div>

      <div class="flex flex-column w-full gap-2 border-gray-300 border-1 p-4 border-round-lg">
        <h3 class="text-primary-600 text-base font-semibold">{{ $t('branchDialog.additionalInformation') }}</h3>
        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="organizationType" class="mb-3">{{ $t('branchDialog.country') }}</label>
            <Dropdown v-model="country" v-bind="countryAttrs" :virtualScrollerOptions="{ itemSize: 38 }" :options="countries" filter :loading="false" optionLabel="name" :placeholder="t('branchDialog.countryPlaceholder')" class="w-full">
              <template #option="slotProps">
                <div class="flex align-items-center mx-auto gap-3">
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Dropdown>
            <small v-if="errors.country" class="text-red-600">{{ errors.country }}</small>
          </div>
          <div class="field flex flex-column w-6">
            <label for="city" class="mb-3">{{ $t('branchDialog.city') }}</label>
            <Dropdown v-model="city" v-bind="cityAttrs" :virtualScrollerOptions="{ itemSize: 38 }" :options="filterCities" filter :loading="false" optionLabel="name" :placeholder="t('branchDialog.cityPlaceholder')" class="w-full">
              <template #option="slotProps">
                <div class="flex align-items-center mx-auto gap-3">
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Dropdown>
            <small v-if="errors.city" class="text-red-600">{{ errors.city }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="branchType" class="mb-3">{{ $t('branchDialog.branchType') }}</label>
            <Dropdown v-model="branchType" v-bind="branchTypeAttrs" :virtualScrollerOptions="{ itemSize: 38 }" :options="branchTypes" filter :loading="false" optionLabel="name" :placeholder="t('branchDialog.branchTypePlaceholder')" class="w-full">
              <template #option="slotProps">
                <div class="flex align-items-center mx-auto gap-3">
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Dropdown>
            <small v-if="errors.branchType" class="text-red-600">{{ errors.branchType }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="branchType" class="mb-3">{{ $t('branchDialog.customerCode') }}</label>

            <Dropdown
              v-model="customerCodeId"
              v-bind="customerCodeIdAttrs"
              :virtualScrollerOptions="{ itemSize: 38 }"
              :options="customerCodes"
              optionValue="id"
              filter
              :loading="false"
              optionLabel="name"
              :placeholder="t('branchDialog.customerCode')"
              class="w-full"
            >
              <template #option="slotProps">
                <div class="flex align-items-center mx-auto gap-3">
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Dropdown>
            <small v-if="errors.branchType" class="text-red-600">{{ errors.branchType }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="email" class="">{{ $t('branchDialog.email') }}</label>
            <InputText id="email" v-model="email" v-bind="emailAttrs" autofocus :invalid="!!errors.email" />
            <small v-if="errors.email" class="text-red-600">{{ errors.email }}</small>
          </div>
          <div class="field flex flex-column w-6">
            <label for="primaryPhone" class="">{{ $t('branchDialog.primaryPhone') }}</label>
            <vue-tel-input class="w-full p-2" v-model="primaryPhone" v-bind="primaryPhoneAttrs"></vue-tel-input>
            <small v-if="errors.primaryPhone" class="text-red-600">{{ errors.primaryPhone }}</small>
          </div>
        </div>
        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="address" class="">{{ $t('cityDialog.address') }}</label>
            <InputText id="address" v-model="address" v-bind="addressAttrs" autofocus :invalid="!!errors.address" />
            <small v-if="errors.address" class="text-red-600">{{ errors.address }}</small>
          </div>
          <div class="field flex flex-column w-6">
            <label for="secondaryPhone" class="">{{ $t('branchDialog.secondaryPhone') }}</label>
            <vue-tel-input class="w-full p-2" v-model="secondaryPhone" v-bind="secondaryPhoneAttrs"></vue-tel-input>
            <small v-if="errors.secondaryPhone" class="text-red-600">{{ errors.secondaryPhone }}</small>
          </div>
        </div>
      </div>

      <div class="flex justify-content-end border-gray-300 gap-3 pt-2 absolute" style="bottom: 0px; right: 28px; width: 93%; background: white; height: 59px; padding-bottom: 12px; padding-right: 23px">
        <Button
          :label="$t('cityDialog.addButton')"
          v-if="IsAdd"
          icon="pi pi-check"
          @click="
            () => {
              createData();
              logoFile = null;
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
              logoFile = null;
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
              logoFile = null;
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
.max-w-md {
  max-width: 760px;
}
.vti__dropdown-list {
  right: 0;
}
</style>
