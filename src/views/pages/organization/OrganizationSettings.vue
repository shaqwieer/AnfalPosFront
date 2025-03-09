<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useOrganizationStore } from '@/stores/organizationStore';
import apiClient from '@/api/apiClient';
import { inject } from 'vue';

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
  organizationConfigs: {
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

const organizationConfigSchema = yup.object({
  basePriceCode: yup.mixed().nullable(),
  cashBillingType: yup.mixed().nullable(),
  cashSalesFocItemType: yup.mixed().nullable(),
  cashSalesOrderType: yup.mixed().nullable(),
  customerDiscountFixedCode: yup.mixed().nullable(),
  customerDiscountPercentageCode: yup.mixed().nullable(),
  customerReturnOrderType: yup.mixed().nullable(),
  requestedBillingDocumentType: yup.mixed().nullable(),

  billingDocumentType: yup.mixed().nullable(),

  referenceSDDocumentCategory: yup.mixed().nullable(),

  salesDistrict: yup.mixed().nullable(),

  reconciliationAccount: yup.mixed().nullable(),

  paymentTerms: yup.mixed().nullable(),

  businessPartnerGrouping: yup.mixed().nullable(),
  customerPriceGroup: yup.mixed().nullable(),

  DistributionChannel: yup.mixed().nullable(),
  IncotermsClassification: yup.mixed().nullable(),
  OrganizationDivision: yup.mixed().nullable(),
  pricingProcedure: yup.mixed().nullable(),
  profitCenter: yup.mixed().nullable(),
  returnBillingType: yup.mixed().nullable(),
  SalesOrganization: yup.mixed().nullable(),
  sapCode: yup.mixed().nullable(),
  SapOrganization: yup.mixed().nullable(),
  sapPlant: yup.mixed().nullable(),
  superOrganization: yup.mixed().nullable()
});

const informationInitial = ref({
  basePriceCode: '',
  cashBillingType: '',
  cashSalesFocItemType: '',
  cashSalesOrderType: '',
  customerDiscountFixedCode: '',
  customerDiscountPercentageCode: '',
  customerReturnOrderType: '',
  requestedBillingDocumentType: '',

  billingDocumentType: '',

  referenceSDDocumentCategory: '',

  salesDistrict: '',

  reconciliationAccount: '',

  paymentTerms: '',

  businessPartnerGrouping: '',

  customerPriceGroup: '',
  DistributionChannel: '',
  IncotermsClassification: '',
  OrganizationDivision: '',
  pricingProcedure: '',
  profitCenter: '',
  returnBillingType: '',
  SalesOrganization: '',
  sapCode: '',
  SapOrganization: '',
  sapPlant: '',
  superOrganization: ''
});

const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
  validationSchema: organizationConfigSchema,
  initialValues: informationInitial.value
});

const [basePriceCode, basePriceCodeAttrs] = defineField('basePriceCode');
const [cashBillingType, cashBillingTypeAttrs] = defineField('cashBillingType');
const [cashSalesFocItemType, cashSalesFocItemTypeAttrs] = defineField('cashSalesFocItemType');
const [cashSalesOrderType, cashSalesOrderTypeAttrs] = defineField('cashSalesOrderType');
const [customerDiscountFixedCode, customerDiscountFixedCodeAttrs] = defineField('customerDiscountFixedCode');
const [customerDiscountPercentageCode, customerDiscountPercentageCodeAttrs] = defineField('customerDiscountPercentageCode');
const [customerReturnOrderType, customerReturnOrderTypeAttrs] = defineField('customerReturnOrderType');
const [requestedBillingDocumentType, requestedBillingDocumentTypeAttrs] = defineField('requestedBillingDocumentType');

const [billingDocumentType, billingDocumentTypeAttrs] = defineField('billingDocumentType');

const [referenceSDDocumentCategory, referenceSDDocumentCategoryAttrs] = defineField('referenceSDDocumentCategory');

const [salesDistrict, salesDistrictAttrs] = defineField('salesDistrict');

const [reconciliationAccount, reconciliationAccountAttrs] = defineField('reconciliationAccount');

const [paymentTerms, paymentTermsAttrs] = defineField('paymentTerms');
const [businessPartnerGrouping, businessPartnerGroupingAttrs] = defineField('businessPartnerGrouping');
const [customerPriceGroup, customerPriceGroupAttrs] = defineField('customerPriceGroup');
const [DistributionChannel, DistributionChannelAttrs] = defineField('DistributionChannel');
const [IncotermsClassification, IncotermsClassificationAttrs] = defineField('IncotermsClassification');
const [OrganizationDivision, OrganizationDivisionAttrs] = defineField('OrganizationDivision');
const [pricingProcedure, pricingProcedureAttrs] = defineField('pricingProcedure');
const [profitCenter, profitCenterAttrs] = defineField('profitCenter');
const [returnBillingType, returnBillingTypeAttrs] = defineField('returnBillingType');
const [SalesOrganization, SalesOrganizationAttrs] = defineField('SalesOrganization');
const [sapCode, sapCodeAttrs] = defineField('sapCode');
const [SapOrganization, SapOrganizationAttrs] = defineField('SapOrganization');
const [sapPlant, sapPlantAttrs] = defineField('sapPlant');
const [superOrganization, superOrganizationAttrs] = defineField('superOrganization');

const setFormValues = () => {
  var config = props.selectedData.configurations;
  console.log(config);
  setValues({
    basePriceCode: config.basePriceCode,
    cashBillingType: config.cashBillingType,
    cashSalesFocItemType: config.cashSalesFocItemType,
    cashSalesOrderType: config.cashSalesOrderType,
    customerDiscountFixedCode: config.customerDiscountFixedCode,
    customerDiscountPercentageCode: config.customerDiscountPercentageCode,
    customerReturnOrderType: config.customerReturnOrderType,
    requestedBillingDocumentType: config.requestedBillingDocumentType,

    billingDocumentType: config.billingDocumentType,

    referenceSDDocumentCategory: config.referenceSDDocumentCategory,
    salesDistrict: config.salesDistrict,

    reconciliationAccount: config.reconciliationAccount,

    paymentTerms: config.paymentTerms,

    businessPartnerGrouping: config.businessPartnerGrouping,

    customerPriceGroup: config.customerPriceGroup,
    DistributionChannel: config.distributionChannel,

    IncotermsClassification: config.incotermsClassification,
    OrganizationDivision: config.organizationDivision,
    pricingProcedure: config.pricingProcedure,
    profitCenter: config.profitCenter,
    returnBillingType: config.returnBillingType,
    SalesOrganization: config.salesOrganization,
    sapCode: config.sapCode,
    SapOrganization: config.sapOrganization,
    sapPlant: config.sapPlant,
    superOrganization: config.superOrganization
  });
};

const getOrganizations = inject('getOrganizations');

const saveData = async (formData) => {
  console.log(formData);
  const response = await apiClient.post('/Organizations/UpdateInsertConfiguration/' + props.selectedData.id, formData);
  mainStore.loading.setNotificationInfo('success', response.data.message);
  props.closeDialog();
  if (getOrganizations) {
    getOrganizations();
  }
};

const updateData = handleSubmit(async (validatedInfo) => {
  //debugger;
  const formData = new FormData();
  formData.append('basePriceCode', validatedInfo.basePriceCode);
  formData.append('cashBillingType', validatedInfo.cashBillingType);
  formData.append('cashSalesFocItemType', validatedInfo.cashSalesFocItemType);
  formData.append('cashSalesOrderType', validatedInfo.cashSalesOrderType);
  formData.append('customerDiscountFixedCode', validatedInfo.customerDiscountFixedCode);
  formData.append('customerDiscountPercentageCode', validatedInfo.customerDiscountPercentageCode);
  formData.append('customerReturnOrderType', validatedInfo.customerReturnOrderType);
  formData.append('requestedBillingDocumentType', validatedInfo.requestedBillingDocumentType);

  formData.append('billingDocumentType', validatedInfo.billingDocumentType);

  formData.append('referenceSDDocumentCategory', validatedInfo.referenceSDDocumentCategory);

  formData.append('salesDistrict', validatedInfo.salesDistrict);

  formData.append('reconciliationAccount', validatedInfo.reconciliationAccount);

  formData.append('paymentTerms', validatedInfo.paymentTerms);
  formData.append('businessPartnerGrouping', validatedInfo.businessPartnerGrouping);

  formData.append('customerPriceGroup', validatedInfo.customerPriceGroup);

  formData.append('DistributionChannel', validatedInfo.DistributionChannel);
  formData.append('IncotermsClassification', validatedInfo.IncotermsClassification);
  formData.append('OrganizationDivision', validatedInfo.OrganizationDivision);
  formData.append('pricingProcedure', validatedInfo.pricingProcedure);
  formData.append('profitCenter', validatedInfo.profitCenter);
  formData.append('returnBillingType', validatedInfo.returnBillingType);
  formData.append('SalesOrganization', validatedInfo.SalesOrganization);
  formData.append('SapCode', validatedInfo.sapCode);
  formData.append('SapOrganization', validatedInfo.SapOrganization);
  formData.append('SapPlant', validatedInfo.sapPlant);
  formData.append('SuperOrganization', validatedInfo.superOrganization);

  saveData(formData);
  resetForm();
});

onMounted(async () => {
  setFormValues();
});
</script>
<template>

  <div class="flex flex-column gap-4 p-4">
    <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
      <h3 data-v-2f754343="" class="text-primary-600 text-base font-semibold">{{ $t('organizationConfig.OrganizationalStructure') }}</h3>
      <div class="flex gap-2 flex-wrap flex-column">
        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="superOrganization" class="required">{{ $t('organizationConfig.superOrganization') }}</label>
            <InputText id="superOrganization" v-model="superOrganization" v-bind="superOrganizationAttrs" autofocus :invalid="!!errors.superOrganization" />
            <small v-if="errors.superOrganization" class="text-red-600">{{ errors.superOrganization }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="sapCode" class="required">{{ $t('organizationConfig.sapCode') }}</label>
            <InputText id="sapCode" v-model="sapCode" v-bind="sapCodeAttrs" autofocus :invalid="!!errors.sapCode" />
            <small v-if="errors.sapCode" class="text-red-600">{{ errors.sapCode }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="SalesOrganization" class="required">{{ $t('organizationConfig.SalesOrganization') }}</label>
            <InputText id="SalesOrganization" v-model="SalesOrganization" v-bind="SalesOrganizationAttrs" autofocus :invalid="!!errors.SalesOrganization" />
            <small v-if="errors.SalesOrganization" class="text-red-600">{{ errors.SalesOrganization }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="SapOrganization" class="required">{{ $t('organizationConfig.SapOrganization') }}</label>
            <InputText id="SapOrganization" v-model="SapOrganization" v-bind="SapOrganizationAttrs" autofocus :invalid="!!errors.SapOrganization" />
            <small v-if="errors.SapOrganization" class="text-red-600">{{ errors.SapOrganization }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="sapPlant" class="required">{{ $t('organizationConfig.sapPlant') }}</label>
            <InputText id="sapPlant" v-model="sapPlant" v-bind="sapPlantAttrs" autofocus :invalid="!!errors.sapPlant" />
            <small v-if="errors.sapPlant" class="text-red-600">{{ errors.sapPlant }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="profitCenter" class="required">{{ $t('organizationConfig.profitCenter') }}</label>
            <InputText id="profitCenter" v-model="profitCenter" v-bind="profitCenterAttrs" autofocus :invalid="!!errors.profitCenter" />
            <small v-if="errors.profitCenter" class="text-red-600">{{ errors.profitCenter }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
      <h3 data-v-2f754343="" class="text-primary-600 text-base font-semibold">{{ $t('organizationConfig.SalesDistributionConfiguration') }}</h3>

      <div class="flex gap-2 flex-wrap flex-column">
        <div class="flex gap-2">
          <div class="field flex flex-column w-4">
            <label for="OrganizationDivision" class="required">{{ $t('organizationConfig.OrganizationDivision') }}</label>
            <InputText id="OrganizationDivision" v-model="OrganizationDivision" v-bind="OrganizationDivisionAttrs" autofocus :invalid="!!errors.OrganizationDivision" />
            <small v-if="errors.OrganizationDivision" class="text-red-600">{{ errors.OrganizationDivision }}</small>
          </div>
          <div class="field flex flex-column w-4">
            <label for="DistributionChannel" class="required">{{ $t('organizationConfig.DistributionChannel') }}</label>
            <InputText id="DistributionChannel" v-model="DistributionChannel" v-bind="DistributionChannelAttrs" autofocus :invalid="!!errors.DistributionChannel" />
            <small v-if="errors.DistributionChannel" class="text-red-600">{{ errors.DistributionChannel }}</small>
          </div>
          <div class="field flex flex-column w-4">
            <label for="IncotermsClassification" class="required">{{ $t('organizationConfig.IncometermsClassification') }}</label>
            <InputText id="IncotermsClassification" v-model="IncotermsClassification" v-bind="IncotermsClassificationAttrs" autofocus :invalid="!!errors.IncotermsClassification" />
            <small v-if="errors.IncotermsClassification" class="text-red-600">{{ errors.IncotermsClassification }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
      <h3 data-v-2f754343="" class="text-primary-600 text-base font-semibold">{{ $t('organizationConfig.PricingDiscountConfiguration') }}</h3>
      <div class="flex gap-2 flex-wrap flex-column">
        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="pricingProcedure" class="required">{{ $t('organizationConfig.pricingProcedure') }}</label>
            <InputText id="pricingProcedure" v-model="pricingProcedure" v-bind="pricingProcedureAttrs" autofocus :invalid="!!errors.pricingProcedure" />
            <small v-if="errors.pricingProcedure" class="text-red-600">{{ errors.pricingProcedure }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="basePriceCode" class="required">{{ $t('organizationConfig.basePriceCode') }}</label>
            <InputText id="basePriceCode" v-model="basePriceCode" v-bind="basePriceCodeAttrs" autofocus :invalid="!!errors.basePriceCode" />
            <small v-if="errors.basePriceCode" class="text-red-600">{{ errors.basePriceCode }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="customerDiscountPercentageCode" class="required">{{ $t('organizationConfig.customerDiscountPercentageCode') }}</label>
            <InputText id="customerDiscountPercentageCode" v-model="customerDiscountPercentageCode" v-bind="customerDiscountPercentageCodeAttrs" autofocus :invalid="!!errors.customerDiscountPercentageCode" />
            <small v-if="errors.customerDiscountPercentageCode" class="text-red-600">{{ errors.customerDiscountPercentageCode }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="customerDiscountFixedCode" class="required">{{ $t('organizationConfig.customerDiscountFixedCode') }}</label>
            <InputText id="customerDiscountFixedCode" v-model="customerDiscountFixedCode" v-bind="customerDiscountFixedCodeAttrs" autofocus :invalid="!!errors.customerDiscountFixedCode" />
            <small v-if="errors.customerDiscountFixedCode" class="text-red-600">{{ errors.customerDiscountFixedCode }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
      <h3 data-v-2f754343="" class="text-primary-600 text-base font-semibold">{{ $t('organizationConfig.OrderBillingTypes') }}</h3>

      <div class="flex gap-2 flex-wrap flex-column">
        <div class="flex gap-2">
          <div class="field flex flex-column w-4">
            <label for="cashBillingType" class="required">{{ $t('organizationConfig.cashBillingType') }}</label>
            <InputText id="cashBillingType" v-model="cashBillingType" v-bind="cashBillingTypeAttrs" autofocus :invalid="!!errors.cashBillingType" />
            <small v-if="errors.cashBillingType" class="text-red-600">{{ errors.cashBillingType }}</small>
          </div>
          <div class="field flex flex-column w-4">
            <label for="cashSalesOrderType" class="required">{{ $t('organizationConfig.cashSalesOrderType') }}</label>
            <InputText id="cashSalesOrderType" v-model="cashSalesOrderType" v-bind="cashSalesOrderTypeAttrs" autofocus :invalid="!!errors.cashSalesOrderType" />
            <small v-if="errors.cashSalesOrderType" class="text-red-600">{{ errors.cashSalesOrderType }}</small>
          </div>
          <div class="field flex flex-column w-4">
            <label for="cashSalesFocItemType" class="required">{{ $t('organizationConfig.cashSalesFocItemType') }}</label>
            <InputText id="cashSalesFocItemType" v-model="cashSalesFocItemType" v-bind="cashSalesFocItemTypeAttrs" autofocus :invalid="!!errors.cashSalesFocItemType" />
            <small v-if="errors.cashSalesFocItemType" class="text-red-600">{{ errors.cashSalesFocItemType }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
      <h3 data-v-2f754343="" class="text-primary-600 text-base font-semibold">{{ $t('organizationConfig.ReturnsRefunds') }}</h3>

      <div class="flex gap-2 flex-wrap flex-column">
        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="customerReturnOrderType" class="required">{{ $t('organizationConfig.customerReturnOrderType') }}</label>
            <InputText id="customerReturnOrderType" v-model="customerReturnOrderType" v-bind="customerReturnOrderTypeAttrs" autofocus :invalid="!!errors.customerReturnOrderType" />
            <small v-if="errors.customerReturnOrderType" class="text-red-600">{{ errors.customerReturnOrderType }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="returnBillingType" class="required">{{ $t('organizationConfig.returnBillingType') }}</label>
            <InputText id="returnBillingType" v-model="returnBillingType" v-bind="returnBillingTypeAttrs" autofocus :invalid="!!errors.returnBillingType" />
            <small v-if="errors.returnBillingType" class="text-red-600">{{ errors.returnBillingType }}</small>
          </div>
        </div>
      </div>
    </div>
    <!-- {{ organizationConfigs }} -->
    <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
      <h3 data-v-2f754343="" class="text-primary-600 text-base font-semibold">{{ $t('organizationConfig.Additionalfields') }}</h3>

      <div class="flex gap-2 flex-wrap flex-column">
        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="customerPriceGroup" class="required">{{ $t('organizationConfig.customerPriceGroup') }}</label>
            <InputText id="customerPriceGroup" v-model="customerPriceGroup" v-bind="customerPriceGroupAttrs" autofocus :invalid="!!errors.customerPriceGroup" />
            <small v-if="errors.customerPriceGroup" class="text-red-600">{{ errors.customerPriceGroup }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="businessPartnerGrouping" class="required">{{ $t('organizationConfig.businessPartnerGrouping') }}</label>
            <InputText id="businessPartnerGrouping" v-model="businessPartnerGrouping" v-bind="businessPartnerGroupingAttrs" autofocus :invalid="!!errors.businessPartnerGrouping" />
            <small v-if="errors.businessPartnerGrouping" class="text-red-600">{{ errors.businessPartnerGrouping }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="paymentTerms" class="required">{{ $t('organizationConfig.paymentTerms') }}</label>
            <InputText id="paymentTerms" v-model="paymentTerms" v-bind="paymentTermsAttrs" autofocus :invalid="!!errors.paymentTerms" />
            <small v-if="errors.paymentTerms" class="text-red-600">{{ errors.paymentTerms }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="reconciliationAccount" class="required">{{ $t('organizationConfig.reconciliationAccount') }}</label>
            <InputText id="reconciliationAccount" v-model="reconciliationAccount" v-bind="reconciliationAccountAttrs" autofocus :invalid="!!errors.reconciliationAccount" />
            <small v-if="errors.reconciliationAccount" class="text-red-600">{{ errors.reconciliationAccount }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="salesDistrict" class="required">{{ $t('organizationConfig.salesDistrict') }}</label>
            <InputText id="salesDistrict" v-model="salesDistrict" v-bind="salesDistrictAttrs" autofocus :invalid="!!errors.salesDistrict" />
            <small v-if="errors.salesDistrict" class="text-red-600">{{ errors.salesDistrict }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="referenceSDDocumentCategory" class="required">{{ $t('organizationConfig.referenceSDDocumentCategory') }}</label>
            <InputText id="referenceSDDocumentCategory" v-model="referenceSDDocumentCategory" v-bind="referenceSDDocumentCategoryAttrs" autofocus :invalid="!!errors.referenceSDDocumentCategory" />
            <small v-if="errors.referenceSDDocumentCategory" class="text-red-600">{{ errors.referenceSDDocumentCategory }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="billingDocumentType" class="required">{{ $t('organizationConfig.billingDocumentType') }}</label>
            <InputText id="billingDocumentType" v-model="billingDocumentType" v-bind="billingDocumentTypeAttrs" autofocus :invalid="!!errors.billingDocumentType" />
            <small v-if="errors.billingDocumentType" class="text-red-600">{{ errors.billingDocumentType }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="requestedBillingDocumentType" class="required">{{ $t('organizationConfig.requestedBillingDocumentType') }}</label>
            <InputText id="requestedBillingDocumentType" v-model="requestedBillingDocumentType" v-bind="requestedBillingDocumentTypeAttrs" autofocus :invalid="!!errors.requestedBillingDocumentType" />
            <small v-if="errors.requestedBillingDocumentType" class="text-red-600">{{ errors.requestedBillingDocumentType }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-content-end gap-3 pt-2 absolute" style="bottom: 0px; right: 43px; width: 93%; background: white; height: 59px; padding-bottom: 12px; padding-right: 23px">
      <Button
        :label="$t('cityDialog.addButton')"
        v-if="IsAdd"
        icon="pi pi-check"
        @click="
          () => {
            updateData();
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
</template>

<style scoped>
/* .w-4 {
  width: 32.3333% !important;
} */

/* .w-2 {
  width: 49.5% !important;
} */
</style>
