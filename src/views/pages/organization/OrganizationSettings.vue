<script setup>
import { ref, watch, computed,onMounted } from 'vue';
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
    superOrganization: yup.mixed().nullable(),

});

const informationInitial = ref({
  basePriceCode: '',
  cashBillingType: '',
  cashSalesFocItemType: '',
  cashSalesOrderType: '',
  customerDiscountFixedCode: '',
  customerDiscountPercentageCode: '',
  customerReturnOrderType: '',
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
  superOrganization: '',
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
    setValues({
        basePriceCode: config.basePriceCode,
        cashBillingType: config.cashBillingType,
        cashSalesFocItemType: config.cashSalesFocItemType,
        cashSalesOrderType: config.cashSalesOrderType,
        customerDiscountFixedCode: config.customerDiscountFixedCode,
        customerDiscountPercentageCode: config.customerDiscountPercentageCode,
        customerReturnOrderType: config.customerReturnOrderType,
        DistributionChannel: config.DistributionChannel,
        IncotermsClassification: config.IncotermsClassification,
        OrganizationDivision: config.OrganizationDivision,
        pricingProcedure: config.pricingProcedure,
        profitCenter: config.profitCenter,
        returnBillingType: config.returnBillingType,
        SalesOrganization: config.SalesOrganization,
        sapCode: config.sapCode,
        SapOrganization: config.SapOrganization,
        sapPlant: config.sapPlant,
        superOrganization: config.superOrganization,
    });
};

const getOrganizations = inject('getOrganizations');

const saveData = async (formData) =>{
    const response = await apiClient.post('/Organizations/UpdateInsertConfiguration/'+ props.selectedData.id , formData);
    mainStore.loading.setNotificationInfo('success', response.data.message);
   props.closeDialog();
   if (getOrganizations) {
        getOrganizations();
      }
}

const updateData = handleSubmit(async (validatedInfo) => {
    debugger;
    const formData = new FormData();
    formData.append('basePriceCode', validatedInfo.basePriceCode);
    formData.append('cashBillingType', validatedInfo.cashBillingType);
    formData.append('cashSalesFocItemType', validatedInfo.cashSalesFocItemType);
    formData.append('cashSalesOrderType', validatedInfo.cashSalesOrderType);
    formData.append('customerDiscountFixedCode', validatedInfo.customerDiscountFixedCode);
    formData.append('customerDiscountPercentageCode', validatedInfo.customerDiscountPercentageCode);
    formData.append('customerReturnOrderType', validatedInfo.customerReturnOrderType);
    formData.append('DistributionChannel', validatedInfo.DistributionChannel);
    formData.append('IncotermsClassification', validatedInfo.IncotermsClassification);
    formData.append('OrganizationDivision', validatedInfo.OrganizationDivision);
    formData.append('pricingProcedure', validatedInfo.pricingProcedure);
    formData.append('profitCenter', validatedInfo.profitCenter);
    formData.append('returnBillingType', validatedInfo.returnBillingType);
    formData.append('SalesOrganization', validatedInfo.SalesOrganization);
    formData.append('sapCode', validatedInfo.sapCode);
    formData.append('SapOrganization', validatedInfo.SapOrganization);
    formData.append('sapPlant', validatedInfo.sapPlant);
    formData.append('superOrganization', validatedInfo.superOrganization);

   saveData(formData);
    resetForm();
});

onMounted(async () => {
    setFormValues();
    
})

</script>
<template>
    <div class="flex flex-column gap-4 p-4">
      <div class="flex flex-wrap w-full gap-2">
        <!-- First set of 3 fields -->
        <div class="field flex flex-column w-4">
          <label for="basePriceCode" class="required">Base Price Code</label>
          <InputText id="basePriceCode" v-model="basePriceCode" v-bind="basePriceCodeAttrs" autofocus :invalid="!!errors.basePriceCode" />
          <small v-if="errors.basePriceCode" class="text-red-600">{{ errors.basePriceCode }}</small>
        </div>
        <div class="field flex flex-column w-4">
          <label for="cashBillingType" class="required">Cash Billing Type</label>
          <InputText id="cashBillingType" v-model="cashBillingType" v-bind="cashBillingTypeAttrs" autofocus :invalid="!!errors.cashBillingType" />
          <small v-if="errors.cashBillingType" class="text-red-600">{{ errors.cashBillingType }}</small>
        </div>
        <div class="field flex flex-column w-4">
          <label for="cashSalesFocItemType" class="required">Cash Sales Foc Item Type</label>
          <InputText id="cashSalesFocItemType" v-model="cashSalesFocItemType" v-bind="cashSalesFocItemTypeAttrs" autofocus :invalid="!!errors.cashSalesFocItemType" />
          <small v-if="errors.cashSalesFocItemType" class="text-red-600">{{ errors.cashSalesFocItemType }}</small>
        </div>
      </div>
  
      <div class="flex flex-wrap w-full gap-2">
        <!-- Second set of 3 fields -->
        <div class="field flex flex-column w-4">
          <label for="cashSalesOrderType" class="required">Cash Sales Order Type</label>
          <InputText id="cashSalesOrderType" v-model="cashSalesOrderType" v-bind="cashSalesOrderTypeAttrs" autofocus :invalid="!!errors.cashSalesOrderType" />
          <small v-if="errors.cashSalesOrderType" class="text-red-600">{{ errors.cashSalesOrderType }}</small>
        </div>
        <div class="field flex flex-column w-4">
          <label for="customerDiscountFixedCode" class="required">Customer Discount Fixed Code</label>
          <InputText id="customerDiscountFixedCode" v-model="customerDiscountFixedCode" v-bind="customerDiscountFixedCodeAttrs" autofocus :invalid="!!errors.customerDiscountFixedCode" />
          <small v-if="errors.customerDiscountFixedCode" class="text-red-600">{{ errors.customerDiscountFixedCode }}</small>
        </div>
        <div class="field flex flex-column w-4">
          <label for="customerDiscountPercentageCode" class="required">Customer Discount Percentage Code</label>
          <InputText id="customerDiscountPercentageCode" v-model="customerDiscountPercentageCode" v-bind="customerDiscountPercentageCodeAttrs" autofocus :invalid="!!errors.customerDiscountPercentageCode" />
          <small v-if="errors.customerDiscountPercentageCode" class="text-red-600">{{ errors.customerDiscountPercentageCode }}</small>
        </div>
      </div>
  
      <div class="flex flex-wrap w-full gap-2">
        <!-- Third set of 3 fields -->
        <div class="field flex flex-column w-4">
          <label for="customerReturnOrderType" class="required">Customer Return Order Type</label>
          <InputText id="customerReturnOrderType" v-model="customerReturnOrderType" v-bind="customerReturnOrderTypeAttrs" autofocus :invalid="!!errors.customerReturnOrderType" />
          <small v-if="errors.customerReturnOrderType" class="text-red-600">{{ errors.customerReturnOrderType }}</small>
        </div>
        <div class="field flex flex-column w-4">
          <label for="DistributionChannel" class="required">Distribution Channel</label>
          <InputText id="DistributionChannel" v-model="DistributionChannel" v-bind="DistributionChannelAttrs" autofocus :invalid="!!errors.DistributionChannel" />
          <small v-if="errors.DistributionChannel" class="text-red-600">{{ errors.DistributionChannel }}</small>
        </div>
        <div class="field flex flex-column w-4">
          <label for="IncotermsClassification" class="required">Incoterms Classification</label>
          <InputText id="IncotermsClassification" v-model="IncotermsClassification" v-bind="IncotermsClassificationAttrs" autofocus :invalid="!!errors.IncotermsClassification" />
          <small v-if="errors.IncotermsClassification" class="text-red-600">{{ errors.IncotermsClassification }}</small>
        </div>
      </div>
  
      <!-- Continue adding more sets as necessary -->
  
      <div class="flex justify-content-end gap-3 pt-2">
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
.w-4 {
    width: 32.3333% !important;
}
</style>