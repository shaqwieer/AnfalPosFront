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
    email: yup.string().required(t('branchDialog.requiredError')),
    address: yup.string().required(t('branchDialog.requiredError')),
    primaryPhone: yup.string().required(t('branchDialog.requiredError')),
    secondaryPhone: yup.string().nullable(),

    city: yup.mixed().required(t('branchDialog.requiredError')),
    branchType: yup.mixed().required(t('branchDialog.requiredError')),
    country: yup.mixed().required(t('branchDialog.requiredError')),

    salesRepCode: yup.string().required(t('branchDialog.requiredError')),
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
    sapStorageLocation: null,
    cashCustomer: null,
    profitCenter: null,
    cashJournal: null,
    bankAccounts: null
});

const { handleSubmit, errors, resetForm, setValues, defineField } = useForm({
    validationSchema: branchSchema,
    initialValues: informationInitial.value
});

let countries = [];
const cities = ref([]);
const filterCities = computed(() => { return cities.value.filter((e) => e.countryId === country?.value?.id)});
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

const createData = handleSubmit(async (validatedInfo) => {
    const branchDto = {
            "arabicName": validatedInfo.arabicName,
            "englishName": validatedInfo.englishName,
            "sapStorageLocation": validatedInfo.sapStorageLocation || null,
            "profitCenter": validatedInfo.profitCenter || null,
            "primaryPhone": validatedInfo.primaryPhone,
            "OrganizationId": validatedInfo.organizationId || 1, // Provide default value if not present
            "BankAccountId": validatedInfo.bankAccounts || null,
            "BankName": validatedInfo.bankName || null,
            "BankCode": validatedInfo.bankCode || null,
            "BankAccountNo": validatedInfo.bankAccountNo || null,

            "SecondaryPhone": validatedInfo.secondaryPhone || null,
            "SalesRepCode": validatedInfo.salesRepCode || null,
            "CashCustomer": validatedInfo.cashCustomer || null,
            "BranchTypeId": validatedInfo.branchType?.id || 0,
            "CountryId": validatedInfo.country?.id || 0,
            "CityId": validatedInfo.city?.id || 0,
            "Email": validatedInfo.email,
            "Address": validatedInfo.address,
        };
    props.createElement(branchDto);
    resetForm();
});
const updateData = handleSubmit(async (validatedInfo) => {
    const branchDto = {
            "arabicName": validatedInfo.arabicName,
            "englishName": validatedInfo.englishName,
            "sapStorageLocation": validatedInfo.sapStorageLocation || null,
            "profitCenter": validatedInfo.profitCenter || null,
            "primaryPhone": validatedInfo.primaryPhone,
            "OrganizationId": validatedInfo.organizationId || 1, // Provide default value if not present
            "BankAccountId": validatedInfo.bankAccounts || null,
            "BankName": validatedInfo.bankName || null,
            "BankCode": validatedInfo.bankCode || null,
            "BankAccountNo": validatedInfo.bankAccountNo || null,

            "SecondaryPhone": validatedInfo.secondaryPhone || null,
            "SalesRepCode": validatedInfo.salesRepCode || null,
            "CashCustomer": validatedInfo.cashCustomer || null,
            "BranchTypeId": validatedInfo.branchType?.id || 0,
            "CountryId": validatedInfo.country?.id || 0,
            "CityId": validatedInfo.city?.id || 0,
            "Email": validatedInfo.email,
            "Address": validatedInfo.address,
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
        sapStorageLocation: null,
        cashCustomer: null,
        profitCenter: null,
        bankAccounts: null,
        cashJournal: null,
        country: countries.find((e) => e.id === props.selectedData.countryId),
        branchType: branchTypes.find((e) => e.id === props.selectedData.branchTypeId),
        city: cities.value.find((e) => e.id === props.selectedData.cityId)
    });
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
</script>

<template>
    <Dialog v-model:visible="visible" :breakpoints="{ '640px': '25rem' }" :header="$t('branchDialog.header')" :class="containerClass" :style="{ minWidth: '60rem' }" :modal="true" :closable="false">
        <div class="flex flex-column gap-4 p-4">
            <div class="flex flex-column w-full gap-2 border-1 p-4 border-round-lg">
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
            <div class="flex flex-column w-full gap-2 border-1 p-4 border-round-lg">
                <h3 class="text-primary-600 text-base font-semibold">{{ $t('branchDialog.sapInformation') }}</h3>
                <div class="flex gap-2">
                    <div class="field flex flex-column w-4">
                        <label for="organizationType" class="mb-3 required">{{ $t('branchDialog.sapStorageLocation') }}</label>
                        <Dropdown
                            v-model="sapStorageLocation"
                            v-bind="sapStorageLocationAttrs"
                            :virtualScrollerOptions="{ itemSize: 38 }"
                            :options="countries"
                            filter
                            :disabled="true"
                            :loading="false"
                            optionLabel="name"
                            :placeholder="t('branchDialog.sapStorageLocationPlaceholder')"
                            class="w-full"
                        >
                            <template #option="slotProps">
                                <div class="flex align-items-center mx-auto gap-3">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                        <small v-if="errors.sapStorageLocation" class="text-red-600">{{ errors.sapStorageLocation }}</small>
                    </div>
                    <div class="field flex flex-column w-4">
                        <label for="cashJournal" class="mb-3 required">{{ $t('branchDialog.cashJournal') }}</label>
                        <Dropdown
                            v-model="cashJournal"
                            v-bind="cashJournalAttrs"
                            :virtualScrollerOptions="{ itemSize: 38 }"
                            :options="countries"
                            filter
                            :loading="false"
                            optionLabel="name"
                            disabled
                            :placeholder="t('branchDialog.cashJournalPlaceholder')"
                            class="w-full"
                        >
                            <template #option="slotProps">
                                <div class="flex align-items-center mx-auto gap-3">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                        <small v-if="errors.cashJournal" class="text-red-600">{{ errors.cashJournal }}</small>
                    </div>
                    <div class="field flex flex-column w-4">
                        <label for="bankAccounts" class="mb-3 required">{{ $t('branchDialog.bankAccounts') }}</label>
                        <Dropdown
                            v-model="bankAccounts"
                            disabled
                            v-bind="bankAccountsAttrs"
                            :virtualScrollerOptions="{ itemSize: 38 }"
                            :options="countries"
                            filter
                            :loading="false"
                            optionLabel="name"
                            :placeholder="t('branchDialog.bankAccountsPlaceholder')"
                            class="w-full"
                        >
                            <template #option="slotProps">
                                <div class="flex align-items-center mx-auto gap-3">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                        <small v-if="errors.bankAccounts" class="text-red-600">{{ errors.bankAccounts }}</small>
                    </div>
                </div>
                <div class="flex gap-2">
                    <div class="field flex flex-column w-4">
                        <label for="profitCenter" class="mb-3 required">{{ $t('branchDialog.profitCenter') }}</label>
                        <Dropdown
                            v-model="profitCenter"
                            disabled
                            v-bind="profitCenterAttrs"
                            :virtualScrollerOptions="{ itemSize: 38 }"
                            :options="countries"
                            filter
                            :loading="false"
                            optionLabel="name"
                            :placeholder="t('branchDialog.profitCenterPlaceholder')"
                            class="w-full"
                        >
                            <template #option="slotProps">
                                <div class="flex align-items-center mx-auto gap-3">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                        <small v-if="errors.profitCenter" class="text-red-600">{{ errors.profitCenter }}</small>
                    </div>
                    <div class="field flex flex-column w-4">
                        <label for="cashCustomer" class="mb-3 required">{{ $t('branchDialog.cashCustomer') }}</label>
                        <Dropdown
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
                        </Dropdown>
                        <small v-if="errors.cashCustomer" class="text-red-600">{{ errors.cashCustomer }}</small>
                    </div>
                    <div class="field flex flex-column w-6 p-2">
                        <label for="SalesRepCode" class="required">Sales Rep Code</label>
                        <InputText id="SalesRepCode" v-model="salesRepCode" v-bind="salesRepCodeAttrs" autofocus :invalid="!!errors.salesRepCode" />
                        <small v-if="errors.salesRepCode" class="text-red-600">{{ errors.salesRepCode }}</small>
                    </div>
                </div>
            </div>
            <div class="flex flex-column w-full gap-2 border-1 p-4 border-round-lg">
                <h3 class="text-primary-600 text-base font-semibold">{{ $t('branchDialog.additionalInformation') }}</h3>
                <div class="flex gap-2">
                    <div class="field flex flex-column w-4">
                        <label for="organizationType" class="mb-3 required">{{ $t('branchDialog.country') }}</label>
                        <Dropdown v-model="country" v-bind="countryAttrs" :virtualScrollerOptions="{ itemSize: 38 }" :options="countries" filter :loading="false" optionLabel="name" :placeholder="t('branchDialog.countryPlaceholder')" class="w-full">
                            <template #option="slotProps">
                                <div class="flex align-items-center mx-auto gap-3">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                        <small v-if="errors.country" class="text-red-600">{{ errors.country }}</small>
                    </div>
                    <div class="field flex flex-column w-4">
                        <label for="city" class="mb-3 required">{{ $t('branchDialog.city') }}</label>
                        <Dropdown v-model="city" v-bind="cityAttrs" :virtualScrollerOptions="{ itemSize: 38 }" :options="filterCities" filter :loading="false" optionLabel="name" :placeholder="t('branchDialog.cityPlaceholder')" class="w-full">
                            <template #option="slotProps">
                                <div class="flex align-items-center mx-auto gap-3">
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Dropdown>
                        <small v-if="errors.city" class="text-red-600">{{ errors.city }}</small>
                    </div>
                    <div class="field flex flex-column w-4">
                        <label for="branchType" class="mb-3 required">{{ $t('branchDialog.branchType') }}</label>
                        <Dropdown
                            v-model="branchType"
                            v-bind="branchTypeAttrs"
                            :virtualScrollerOptions="{ itemSize: 38 }"
                            :options="branchTypes"
                            filter
                            :loading="false"
                            optionLabel="name"
                            :placeholder="t('branchDialog.branchTypePlaceholder')"
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
                        <label for="email" class="required">{{ $t('branchDialog.email') }}</label>
                        <InputText id="email" v-model="email" v-bind="emailAttrs" autofocus :invalid="!!errors.email" />
                        <small v-if="errors.email" class="text-red-600">{{ errors.email }}</small>
                    </div>
                    <div class="field flex flex-column w-6">
                        <label for="primaryPhone" class="required">{{ $t('branchDialog.primaryPhone') }}</label>
                        <vue-tel-input class="w-full p-2" v-model="primaryPhone"  v-bind="primaryPhoneAttrs"></vue-tel-input>
                        <small v-if="errors.primaryPhone" class="text-red-600">{{ errors.primaryPhone }}</small>
                    </div>
                </div>
                <div class="flex gap-2">
                    <div class="field flex flex-column w-6">
                        <label for="address" class="required">{{ $t('cityDialog.address') }}</label>
                        <InputText id="address" v-model="address" v-bind="addressAttrs" autofocus :invalid="!!errors.address" />
                        <small v-if="errors.address" class="text-red-600">{{ errors.address }}</small>
                    </div>
                    <div class="field flex flex-column w-6">
                        <label for="secondaryPhone" class="required">{{ $t('branchDialog.secondaryPhone') }}</label>
                        <vue-tel-input class="w-full p-2" v-model="secondaryPhone"  v-bind="secondaryPhoneAttrs"></vue-tel-input>
                        <small v-if="errors.secondaryPhone" class="text-red-600">{{ errors.secondaryPhone }}</small>
                    </div>
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
