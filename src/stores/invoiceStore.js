import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import DraftOrders from '../views/pages/orders/DraftOrders.vue';

export const useInvoiceStore = defineStore({
    id: 'invoice',
    state: () => ({
        lookups: [],
        loading: useLoadingStore(),
        error: '',
        invoiceItems: [
            {
                product: {
                    id: '001',
                    name: 'All-Season Tire 215/55R17',
                    category: 'Tires'
                },
                selectedBatch: { id: '001', type: 'single', size: 1, price: 129.99, discount: { type: 'percentage', value: 10 } },
                quantity: 2
            },
            {
                product: {
                    id: '002',
                    name: 'All-Season Tire 215/55R17',
                    category: 'Tires'
                },
                selectedBatch: { id: '002', type: 'pack', size: 4, price: 299.99, discount: { type: 'amount', value: 50 } },
                quantity: 1
            }
        ],
        invoice: {
            id: '001',
            customer: {
                id: '001',
                name: 'John Doe',
                address: '123 Main St, Anytown, USA'
            },
            items: [
                {
                    id: '001',
                    product: {
                        name: 'All-Season Tire 215/55R17',
                        category: 'Tires'
                    },
                    selectedBatch: { id: '001', type: 'single', size: 1, price: 129.99 },
                    discount: { type: 'percentage', value: 10 },
                    quantity: 2
                },
                {
                    id: '002',
                    product: {
                        id: '002',
                        name: 'Summer-Season Tire 215/55R21',
                        category: 'Tires'
                    },
                    selectedBatch: { id: '002', type: 'pack', size: 4, price: 299.99 },
                    discount: { type: 'amount', value: 50 },
                    quantity: 1
                }
            ]
        },
        DraftOrders: [
            {
                id: '001',
                customer: {
                    id: '001',
                    name: 'John Doe',
                    address: '123 Main St, Anytown, USA'
                },
                items: [
                    {
                        id: '001',
                        product: {
                            name: 'All-Season Tire 215/55R17',
                            category: 'Tires'
                        },
                        selectedBatch: { id: '001', type: 'single', size: 1, price: 129.99 },
                        discount: { type: 'percentage', value: 10 },
                        quantity: 2
                    },
                    {
                        id: '002',
                        product: {
                            id: '002',
                            name: 'Summer-Season Tire 215/55R21',
                            category: 'Tires'
                        },
                        selectedBatch: { id: '002', type: 'pack', size: 4, price: 299.99 },
                        discount: { type: 'amount', value: 50 },
                        quantity: 1
                    }
                ],
                total: 999.99,
                createdAt: new Date('2023-01-01')
            },
            {
                id: '002',
                customer: {
                    id: '002',
                    name: 'Jane Smith',
                    address: '456 Elm St, Anytown, USA'
                },
                items: [
                    {
                        id: '001',
                        product: {
                            name: 'All-Season Tire 215/55R17',
                            category: 'Tires'
                        },
                        selectedBatch: { id: '001', type: 'single', size: 1, price: 129.99 },
                        discount: { type: 'percentage', value: 10 },
                        quantity: 2
                    },
                    {
                        id: '002',
                        product: {
                            id: '002',
                            name: 'Summer-Season Tire 215/55R21',
                            category: 'Tires'
                        },
                        selectedBatch: { id: '002', type: 'pack', size: 4, price: 299.99 },
                        discount: { type: 'amount', value: 50 },
                        quantity: 1
                    }
                ],
                total: 999.99,
                createdAt: new Date('2023-05-01')
            }
        ],
        HistoryOrders: [
            {
                id: '001',
                customer: {
                    id: '001',
                    name: 'John Doe',
                    address: '123 Main St, Anytown, USA'
                },
                items: [
                    {
                        id: '001',
                        product: {
                            name: 'All-Season Tire 215/55R17',
                            category: 'Tires'
                        },
                        selectedBatch: { id: '001', type: 'single', size: 1, price: 129.99 },
                        discount: { type: 'percentage', value: 10 },
                        quantity: 2
                    },
                    {
                        id: '002',
                        product: {
                            id: '002',
                            name: 'Summer-Season Tire 215/55R21',
                            category: 'Tires'
                        },
                        selectedBatch: { id: '002', type: 'pack', size: 4, price: 299.99 },
                        discount: { type: 'amount', value: 50 },
                        quantity: 1
                    }
                ],
                status: 'Completed',
                total: 999.99,
                createdAt: new Date('2023-01-01')
            },
            {
                id: '002',
                customer: {
                    id: '002',
                    name: 'Jane Smith',
                    address: '456 Elm St, Anytown, USA'
                },
                items: [
                    {
                        id: '001',
                        product: {
                            name: 'All-Season Tire 215/55R17',
                            category: 'Tires'
                        },
                        selectedBatch: { id: '001', type: 'single', size: 1, price: 129.99 },
                        discount: { type: 'percentage', value: 10 },
                        quantity: 2
                    },
                    {
                        id: '002',
                        product: {
                            id: '002',
                            name: 'Summer-Season Tire 215/55R21',
                            category: 'Tires'
                        },
                        selectedBatch: { id: '002', type: 'pack', size: 4, price: 299.99 },
                        discount: { type: 'amount', value: 50 },
                        quantity: 1
                    }
                ],
                status: 'Refunded',
                total: 999.99,
                createdAt: new Date('2023-01-01')
            }
        ],
        products: [
            {
                id: '001',
                name: 'All-Season Tire 215/55R17',
                category: 'Tires',
                batchOptions: [
                    { id: '001', type: 'single', size: 1, price: 129.99 },
                    { id: '002', type: 'pack', size: 4, price: 479.99 }
                ],
                price: 129.99
            },
            {
                id: '002',
                name: 'Summer-Season Tire 215/55R21',
                category: 'Tires',
                batchOptions: [
                    { id: '001', type: 'single', size: 1, price: 129.99 },
                    { id: '002', type: 'pack', size: 4, price: 479.99 }
                ],
                price: 129.99
            }
        ]
    }),
    actions: {
        addItemToInvoice(item) {
            const tempItem = this.products.find((i) => i.id === item.id);
            const tempInvoiceItem = {
                id: tempItem.id,
                product: {
                    name: tempItem.name,
                    category: tempItem.category
                },
                selectedBatch: tempItem.batchOptions.find((i) => i.id === item.selectedBatch.id),
                discount: item.discount,
                quantity: 1
            };
            const check = this.invoice.items.find((i) => i.id === tempInvoiceItem.id);
            if (check && check.selectedBatch.id === tempInvoiceItem.selectedBatch.id && check.discount.type === tempInvoiceItem.discount.type && check.discount.value === tempInvoiceItem.discount.value) {
                check.quantity += 1;
            } else {
                this.invoice.items.push(tempInvoiceItem);
            }
        },
        removeItemFromInvoice(index) {
            this.invoice.items.splice(index, 1);
        },
        decreaseItemInInvoice(index) {
            const item = this.invoice.items[index];
            item.quantity -= 1;
            if (item.quantity === 0) {
                this.invoice.items.splice(index, 1);
            }
        }
        // async getOrganizationLookups() {
        //     try {
        //         const response = await apiClient.get('/Organizations/GetOrganizationLookups');
        //         this.lookups = response.data.data;
        //         return response.data.data;
        //     } catch (err) {
        //         this.error = handleError(err, this.loading);
        //     }
        // }
    }
});
