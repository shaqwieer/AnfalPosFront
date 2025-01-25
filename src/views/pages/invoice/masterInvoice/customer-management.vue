<script setup lang="ts">
import { ref, computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import ScrollPanel from 'primevue/scrollpanel';
import ToggleButton from 'primevue/togglebutton';
import Dropdown from 'primevue/dropdown';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    plateNo?: string;
    type: 'walk-in' | 'business';
    cr?: string;
    vatRegNo?: string;
}

// Props
const props = defineProps<{
    customers?: Customer[];
    view?: 'list' | 'grid';
}>();

// Emits
const emit = defineEmits<{
    (e: 'newCustomer', customer: Customer): void;
    (e: 'selectCustomer', customer: Customer): void;
    (e: 'updateView', view: 'list' | 'grid'): void;
}>();

// State
const showAddCustomerDialog = ref(false);
const customerType = ref<'walk-in' | 'business'>('walk-in');
const newCustomer = ref<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    plateNo: '',
    type: 'walk-in',
    cr: '',
    vatRegNo: ''
});

// Methods
const handleInputChange = (field: keyof Customer, value: string) => {
    newCustomer.value = { ...newCustomer.value, [field]: value };
};

const handleAddCustomer = () => {
    const customer: Customer = {
        id: Date.now().toString(),
        ...newCustomer.value,
        type: customerType.value
    } as Customer;

    emit('newCustomer', customer);
    showAddCustomerDialog.value = false;
    newCustomer.value = {
        name: '',
        email: '',
        phone: '',
        address: '',
        plateNo: '',
        type: 'walk-in',
        cr: '',
        vatRegNo: ''
    };
};

const handleSelectCustomer = (customer: Customer) => {
    emit('selectCustomer', customer);
};

const currentView = computed({
    get: () => props.view || 'list',
    set: (value: 'list' | 'grid') => {
        emit('updateView', value);
    }
});

const dummyCustomers: Customer[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St',
        type: 'walk-in'
    },
    {
        id: '2',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '0987654321',
        address: '456 Elm St',
        type: 'business',
        cr: '1234567890',
        vatRegNo: '1234567890'
    }
];

const customers = computed(() => (props.customers?.length ? props.customers : dummyCustomers));

// Customer Select Component
const selectedCustomerId = ref<string | null>(null);
const selectedCustomerType = ref('walk-in');
</script>

<template>
    <div class="customer-management pt-4">
        <!-- Customer List/Grid View -->
        <ScrollPanel class="w-full">
            <template v-if="currentView === 'list'">
                <DataTable :value="customers" class="p-datatable-sm">
                    <Column field="name" header="Name"></Column>
                    <Column field="email" header="Email"></Column>
                    <Column field="phone" header="Phone"></Column>
                    <Column field="address" header="Address"></Column>
                    <Column field="plateNo" header="Plate No">
                        <template #body="slotProps">
                            {{ slotProps.data.plateNo || '-' }}
                        </template>
                    </Column>
                    <Column header="Action">
                        <template #body="slotProps">
                            <Button icon="pi pi-eye" label="Select" @click="handleSelectCustomer(slotProps.data)" class="p-button-primary p-button-sm" />
                        </template>
                    </Column>
                </DataTable>
            </template>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card v-for="customer in customers" :key="customer.id" class="card-style p-4 bg-white shadow rounded">
                    <template #content>
                        <div class="p-4">
                            <div class="flex align-items-center justify-content-center w-4rem h-4rem bg-blue-100 border-circle mb-4 mx-auto">
                                <i class="pi pi-user text-blue-600 text-2xl"></i>
                            </div>
                            <h3 class="font-medium text-lg text-center mb-2">{{ customer.name }}</h3>
                            <p class="text-sm text-gray-500 text-center mb-1">{{ customer.email }}</p>
                            <p class="text-sm text-gray-500 text-center mb-1">{{ customer.phone }}</p>
                            <p v-if="customer.plateNo" class="text-sm text-gray-500 text-center mb-1">Plate No: {{ customer.plateNo }}</p>
                            <p class="text-sm text-gray-500 text-center mb-4">{{ customer.address }}</p>
                            <Button icon="pi pi-eye" label="Select Customer" @click="handleSelectCustomer(customer)" class="p-button-primary w-full" />
                        </div>
                    </template>
                </Card>
            </div>
        </ScrollPanel>

        <!-- Add Customer Dialog -->
        <Dialog v-model:visible="showAddCustomerDialog" :modal="true" :style="{ width: '50vw' }" header="Add New Customer">
            <div class="space-y-4">
                <!-- Customer Type Selection -->
                <div class="flex gap-4 mb-4">
                    <div class="flex align-items-center">
                        <RadioButton v-model="customerType" inputId="walk-in" name="customerType" value="walk-in" />
                        <label for="walk-in" class="ml-2">Walk-in</label>
                    </div>
                    <div class="flex align-items-center">
                        <RadioButton v-model="customerType" inputId="business" name="customerType" value="business" />
                        <label for="business" class="ml-2">Business partner</label>
                    </div>
                </div>

                <!-- Customer Form -->
                <div :class="{ 'grid grid-cols-2 gap-4': customerType === 'business' }">
                    <div class="space-y-4">
                        <div class="flex flex-column gap-2">
                            <label for="name">Name</label>
                            <InputText id="name" v-model="newCustomer.name" @input="handleInputChange('name', $event.target.value)" required />
                        </div>

                        <div class="flex flex-column gap-2">
                            <label for="email">Email</label>
                            <InputText id="email" v-model="newCustomer.email" @input="handleInputChange('email', $event.target.value)" type="email" />
                        </div>

                        <div class="flex flex-column gap-2">
                            <label for="phone">Phone</label>
                            <InputText id="phone" v-model="newCustomer.phone" @input="handleInputChange('phone', $event.target.value)" required />
                        </div>

                        <div class="flex flex-column gap-2">
                            <label for="plateNo">Plate No</label>
                            <InputText id="plateNo" v-model="newCustomer.plateNo" @input="handleInputChange('plateNo', $event.target.value)" />
                        </div>

                        <div class="flex flex-column gap-2">
                            <label for="address">Address</label>
                            <InputText id="address" v-model="newCustomer.address" @input="handleInputChange('address', $event.target.value)" />
                        </div>
                    </div>

                    <div v-if="customerType === 'business'" class="space-y-4">
                        <div class="flex flex-column gap-2">
                            <label for="cr">CR</label>
                            <InputText id="cr" v-model="newCustomer.cr" @input="handleInputChange('cr', $event.target.value)" />
                        </div>

                        <div class="flex flex-column gap-2">
                            <label for="vatRegNo">VAT Reg. No</label>
                            <InputText id="vatRegNo" v-model="newCustomer.vatRegNo" @input="handleInputChange('vatRegNo', $event.target.value)" />
                        </div>
                    </div>
                </div>

                <Button label="Add Customer" @click="handleAddCustomer" class="w-full p-button-primary" />
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.card-style {
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
}

.card-style:hover {
    transform: scale(1.02);
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.text-gray-600 {
    color: #6b7280;
}
</style>
