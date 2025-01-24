<script setup lang="ts">
import { ref } from 'vue';

interface OrderItem {
    name: string;
    quantity: number;
    price: string;
}

interface Order {
    id: string;
    customer: string;
    date: string;
    status: string;
    total: string;
    isDraft?: boolean;
    items: OrderItem[];
}

const selectedOrder = ref<Order | null>(null);
const isAccordionOpen = ref(true);

const orders: Order[] = [
    {
        id: '1423',
        customer: 'test',
        date: '1/19/2025',
        status: 'Rejected',
        total: '$150.00',
        isDraft: true,
        items: [
            { name: 'Brake Pad', quantity: 2, price: '$45.00' },
            { name: 'Oil Filter', quantity: 1, price: '$15.00' },
            { name: 'Labor', quantity: 1, price: '$45.00' }
        ]
    },
    {
        id: '1422',
        customer: 'test',
        date: '1/17/2025',
        status: 'Accepted',
        total: '$275.50',
        isDraft: true,
        items: [
            { name: 'Tire', quantity: 4, price: '$50.00' },
            { name: 'Alignment', quantity: 1, price: '$75.50' }
        ]
    },
    {
        id: '1421',
        customer: 'test',
        date: '1/17/2025',
        status: 'Accepted',
        total: '$420.00',
        items: [
            { name: 'Battery', quantity: 1, price: '$120.00' },
            { name: 'Alternator', quantity: 1, price: '$250.00' },
            { name: 'Labor', quantity: 1, price: '$50.00' }
        ]
    },
    {
        id: '1420',
        customer: 'mohamed shaqwieer',
        date: '1/16/2025',
        status: 'Accepted',
        total: '$180.75',
        items: [
            { name: 'Oil Change', quantity: 1, price: '$45.00' },
            { name: 'Air Filter', quantity: 1, price: '$25.75' },
            { name: 'Wiper Blades', quantity: 2, price: '$55.00' }
        ]
    },
    {
        id: '1419',
        customer: 'Jane Doe',
        date: '1/15/2025',
        status: 'Accepted',
        total: '$310.25',
        items: [
            { name: 'Brake Rotor', quantity: 2, price: '$120.00' },
            { name: 'Brake Pad', quantity: 1, price: '$45.00' },
            { name: 'Labor', quantity: 1, price: '$25.25' }
        ]
    },
    {
        id: '1418',
        customer: 'John Smith',
        date: '1/14/2025',
        status: 'Accepted',
        total: '$195.00',
        items: [
            { name: 'Spark Plugs', quantity: 4, price: '$40.00' },
            { name: 'Ignition Coil', quantity: 1, price: '$85.00' },
            { name: 'Labor', quantity: 1, price: '$70.00' }
        ]
    },
    {
        id: '1417',
        customer: 'Alice Johnson',
        date: '1/13/2025',
        status: 'Rejected',
        total: '$85.50',
        items: [
            { name: 'Headlight Bulb', quantity: 2, price: '$25.00' },
            { name: 'Labor', quantity: 1, price: '$35.50' }
        ]
    },
    {
        id: '1416',
        customer: 'Bob Williams',
        date: '1/12/2025',
        status: 'Accepted',
        total: '$530.75',
        items: [
            { name: 'Timing Belt Kit', quantity: 1, price: '$250.00' },
            { name: 'Water Pump', quantity: 1, price: '$75.00' },
            { name: 'Coolant', quantity: 1, price: '$25.75' },
            { name: 'Labor', quantity: 1, price: '$180.00' }
        ]
    }
];
</script>

<template>
    <div class="bg-white border-bottom-1 surface-border border-round-md">
        <!-- Accordion Header -->
        <div class="p-3 cursor-pointer hover:surface-100 transition-colors transition-duration-150 flex align-items-center" @click="isAccordionOpen = !isAccordionOpen">
            <i class="pi pi-chevron-down mr-2 transition-transform transition-duration-150" :class="{ 'transform rotate-180': isAccordionOpen }"></i>
            <h2 class="text-xl font-semibold m-0">Recent Orders</h2>
        </div>

        <!-- Accordion Content -->
        <div :class="`overflow-hidden transition-all transition-duration-200 transition-linear  ${isAccordionOpen ? 'h-0' : 'h-200px'}`">
            <div class="overflow-x-auto Scrollbar">
                <div class="flex gap-3 p-3" style="min-width: max-content">
                    <div
                        v-for="order in orders"
                        :key="order.id"
                        class="surface-card border-round-lg shadow-1 hover:shadow-3 cursor-pointer transition-all transition-duration-150 relative overflow-hidden"
                        style="width: 250px"
                        @click="selectedOrder = order"
                    >
                        <!-- Draft Label -->

                        <div class="flex flex-column gap-3 p-4">
                            <div class="flex flex-row justify-content-between align-items-center">
                                <div class="flex flex-row align-items-center gap-2">
                                    <i class="pi pi-file text-blue-600 text-2xl"></i>
                                    <span class="font-semibold text-900 text-center text-lg">Order #{{ order.id }}</span>
                                </div>
                                <div v-if="order.isDraft" class="border-1 border-yellow-600 text-yellow-600 text-sm font-semibold px-2 py-1 border-round-xl"><i class="pi pi-file-edit text-yellow-600 text-sm"></i> Draft</div>
                            </div>
                            <div class="flex flex-row justify-content-between align-items-center">
                                <span class="text-md text-500 text-center text-overflow-ellipsis overflow-hidden white-space-nowrap">
                                    {{ order.customer }}
                                </span>
                                <span class="text-md text-500 text-center">{{ order.date }}</span>
                            </div>
                            <hr class="my-0 border-top-2 border-none border-200" />
                            <div class="flex flex-row justify-content-between align-items-center">
                                <div class="flex flex-row align-items-center gap-2">
                                    <i
                                        class="pi text-xl"
                                        :class="{
                                            ' text-green-500 pi-verified': order.status === 'Accepted',
                                            ' text-red-500 pi-exclamation-circle': order.status === 'Rejected'
                                        }"
                                    ></i>
                                    <span
                                    class="text-md border-round"
                                    :class="{
                                        'text-green-600': order.status === 'Accepted',
                                        'text-red-600': order.status === 'Rejected'
                                    }"
                                >

                                    {{ order.status }}
                                </span>
                                </div>
                               
                                <span class="text-xl font-semibold text-primary-800 text-center">{{ order.total }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Order Details Dialog -->
    <div v-if="selectedOrder" class="fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center bg-black-alpha-60 z-50">
        <div class="surface-card border-round-lg shadow-2 w-full max-w-30rem p-4">
            <div class="flex justify-content-between align-items-center mb-4">
                <h2 class="text-xl font-semibold m-0">Order Details #{{ selectedOrder.id }}</h2>
                <button class="p-button p-button-text p-button-rounded p-button-plain" @click="selectedOrder = null">
                    <i class="pi pi-times"></i>
                </button>
            </div>

            <div class="mb-4">
                <p class="mb-2"><strong>Customer:</strong> {{ selectedOrder.customer }}</p>
                <p class="mb-2"><strong>Date:</strong> {{ selectedOrder.date }}</p>
                <p class="mb-2">
                    <strong>Status:</strong>
                    <span
                        class="ml-2 text-xs px-2 py-1 border-round"
                        :class="{
                            'bg-green-100 text-green-900': selectedOrder.status === 'Accepted',
                            'bg-red-100 text-red-900': selectedOrder.status === 'Rejected'
                        }"
                    >
                        {{ selectedOrder.status }}
                    </span>
                </p>
            </div>

            <div class="surface-ground border-round p-3 mb-4">
                <h3 class="text-lg font-semibold mb-3">Items</h3>
                <div v-for="(item, index) in selectedOrder.items" :key="index" class="flex justify-content-between mb-2">
                    <div>
                        <span class="font-medium">{{ item.name }}</span>
                        <span class="text-600 text-sm ml-2">x{{ item.quantity }}</span>
                    </div>
                    <span>{{ item.price }}</span>
                </div>
            </div>

            <div class="flex justify-content-between font-medium text-lg">
                <span>Total:</span>
                <span>{{ selectedOrder.total }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.h-0 {
    height: 0px;
}
.h-200px {
    height: 200px;
}
</style>
