<script setup>
import { ref, watch, computed } from 'vue';
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
  branchType: yup.mixed().nullable(t('branchDialog.requiredError')),
  country: yup.mixed().nullable(t('branchDialog.requiredError')),

  salesRepCode: yup.string().nullable(t('branchDialog.requiredError')),
  sapStorageLocation: yup.mixed().nullable(),
  cashCustomer: yup.mixed().nullable(),
  profitCenter: yup.mixed().nullable(),
  cashJournal: yup.mixed().nullable(),
  bankAccounts: yup.mixed().nullable()
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
  country: null,
  branchType: null,
  sapStorageLocation: '',
  cashCustomer: null,
  profitCenter: null,
  cashJournal: null,
  bankAccounts: '',

  bankPosFirst: null,
  bankPosSecond: null,
  bankPosThird: null
});

const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
  validationSchema: branchSchema,
  initialValues: informationInitial.value
});

let countries = [];
const cities = ref([]);
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

const [city, cityAttrs] = defineField('city');
const [branchType, branchTypeAttrs] = defineField('branchType');
const [country, countryAttrs] = defineField('country');

const [salesRepCode, salesRepCodeAttrs] = defineField('salesRepCode');
const [sapStorageLocation, sapStorageLocationAttrs] = defineField('sapStorageLocation');
const [cashCustomer, cashCustomerAttrs] = defineField('cashCustomer');
const [profitCenter, profitCenterAttrs] = defineField('profitCenter');
const [cashJournal, cashJournalAttrs] = defineField('cashJournal');
const [bankAccounts, bankAccountsAttrs] = defineField('bankAccounts');

const [bankPosFirst, bankPosFirstAttrs] = defineField('bankPosFirst');
const [bankPosSecond, bankPosSecondAttrs] = defineField('bankPosSecond');
const [bankPosThird, bankPosThirdAttrs] = defineField('bankPosThird');

const createData = handleSubmit(async (validatedInfo) => {
  const branchDto = {
    arabicName: validatedInfo.arabicName,
    englishName: validatedInfo.englishName,
    sapStorageLocation: validatedInfo.sapStorageLocation || null,
    profitCenter: validatedInfo.profitCenter || null,
    primaryPhone: validatedInfo.primaryPhone,
    OrganizationId: validatedInfo.organizationId || 1, // Provide default value if not present
    BankAccountId: validatedInfo.bankAccounts || null,

    BankName: validatedInfo.bankName || null,
    BankCode: validatedInfo.bankCode || null,

    BankAccountNo: validatedInfo.bankAccounts || null,

    bankPosFirst: validatedInfo.bankPosFirst || null,
    bankPosSecond: validatedInfo.bankPosSecond || null,
    bankPosThird: validatedInfo.bankPosThird || null,

    SecondaryPhone: validatedInfo.secondaryPhone || null,
    SalesRepCode: validatedInfo.salesRepCode || null,
    CashCustomer: validatedInfo.cashCustomer || null,
    BranchTypeId: validatedInfo.branchType?.id || 0,
    CountryId: validatedInfo.country?.id || 0,
    CityId: validatedInfo.city?.id || 0,
    Email: validatedInfo.email,
    Address: validatedInfo.address
  };
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
    OrganizationId: validatedInfo.organizationId , // Provide default value if not present
    BankAccountId: validatedInfo.bankAccounts || null,

    BankName: validatedInfo.bankName || null,
    BankCode: validatedInfo.bankCode || null,

    BankAccountNo: validatedInfo.bankAccounts || null,

    bankPosFirst: validatedInfo.bankPosFirst || null,
    bankPosSecond: validatedInfo.bankPosSecond || null,
    bankPosThird: validatedInfo.bankPosThird || null,

    SecondaryPhone: validatedInfo.secondaryPhone || null,
    SalesRepCode: validatedInfo.salesRepCode || null,
    CashCustomer: validatedInfo.cashCustomer || null,
    BranchTypeId: validatedInfo.branchType?.id || 0,
    CountryId: validatedInfo.country?.id || 0,
    CityId: validatedInfo.city?.id || 0,
    Email: validatedInfo.email,
    Address: validatedInfo.address
  };
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
    bankAccounts: props.selectedData.bankAccountId,

    bankPosFirst: props.selectedData.bankPosFirst,
    bankPosSecond: props.selectedData.bankPosSecond,
    bankPosThird: props.selectedData.bankPosThird,

    cashJournal: props.selectedData.cashJournal,
    country: countries.find((e) => e.id === props.selectedData.countryId),
    branchType: branchTypes.find((e) => e.id === props.selectedData.branchTypeId),
    city: cities.value.find((e) => e.id === props.selectedData.cityId)
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

const customerCodes = ref([
  { name: 'avs', prefix: 'as', from: 234, to: 234, id: 30, uniqueIdentifier: '84e366fd-b420-461f-a174-d70665cbd064', createdAt: '2025-02-27T12:56:19.744434Z' },
  { name: 'ascasc', prefix: '23234', from: 234234, to: 234243, id: 31, uniqueIdentifier: 'dcc0fd49-2a81-4651-b967-ce322ee726e6', createdAt: '2025-02-27T12:56:28.42559Z' },
  { name: 'المنطقة الغربية', prefix: 'WST', from: 100000, to: 199999, id: 1, uniqueIdentifier: '3fa85f64-5717-4562-b3fc-2c963f66afa6', createdAt: '2025-02-14T17:16:11.569884Z' }
]);
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
      <div class="flex flex-column w-full gap-2 border-1 border-gray-300 p-4 border-round-lg">
        <h3 class="text-primary-600 text-base font-semibold">{{ $t('branchDialog.sapInformation') }}</h3>
        <div class="flex gap-2">
          <div class="field flex flex-column w-4">
            <label for="organizationType" class="mb-3">{{ $t('branchDialog.sapStorageLocation') }}</label>

            <InputText id="organizationType" v-model="sapStorageLocation" v-bind="sapStorageLocationAttrs" :invalid="!!errors.sapStorageLocation" />

            <small v-if="errors.sapStorageLocation" class="text-red-600">{{ errors.sapStorageLocation }}</small>
          </div>

          <div class="field flex flex-column w-4">
            <label for="cashJournal" class="mb-3">{{ $t('branchDialog.cashJournal') }}</label>

            <InputText id="cashJournal" v-model="cashJournal" v-bind="cashJournalAttrs" :invalid="!!errors.cashJournal" />

            <small v-if="errors.cashJournal" class="text-red-600">{{ errors.cashJournal }}</small>
          </div>

          <div class="field flex flex-column w-4">
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
            <label for="bankAccounts" class="mb-3">{{ $t('branchDialog.bankAccounts') }}</label>

            <InputText id="bankAccounts" v-model="bankAccounts" v-bind="bankAccountsAttrs" :invalid="!!errors.bankAccounts" />

            <small v-if="errors.bankAccounts" class="text-red-600">{{ errors.bankAccounts }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="bankPosFirst" class="mb-3">Bank POS1</label>
            <InputText id="bankPosFirst" v-model="bankPosFirst" v-bind="bankPosFirstAttrs" :invalid="!!errors.bankPosFirst" />
            <small v-if="errors.bankPosFirst" class="text-red-600">{{ errors.bankPosFirst }}</small>
          </div>
        </div>

        <div class="flex gap-2">
          <div class="field flex flex-column w-6">
            <label for="bankPosSecond" class="mb-3">Bank POS2</label>
            <InputText id="bankPosSecond" v-model="bankPosSecond" v-bind="bankPosSecondAttrs" :invalid="!!errors.bankPosSecond" />
            <small v-if="errors.bankPosSecond" class="text-red-600">{{ errors.bankPosSecond }}</small>
          </div>

          <div class="field flex flex-column w-6">
            <label for="bankPosThird" class="mb-3">Bank POS3</label>
            <InputText id="bankPosThird" v-model="bankPosThird" v-bind="bankPosThirdAttrs" :invalid="!!errors.bankPosThird" />
            <small v-if="errors.bankPosThird" class="text-red-600">{{ errors.bankPosThird }}</small>
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
            <Dropdown v-model="customerCode" v-bind="customerCodeAttrs" :virtualScrollerOptions="{ itemSize: 38 }" :options="customerCodes" filter :loading="false" optionLabel="name" :placeholder="t('branchDialog.customerCode')" class="w-full">
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
