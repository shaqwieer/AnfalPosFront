import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import DraftOrders from '../views/pages/orders/DraftOrders.vue';
import type { MenuItem, Invoice } from '../views/pages/Invoice/types.ts';

export const useInvoiceStore = defineStore('invoice', {
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
        invoice: <Invoice>{
            customer: {
                address: 'cairo',
                email: 'mshaq@yahoo.com',
                primaryPhone: '+966123322202',
                secondaryPhone: 'string',
                creditBalance: 13,
                name: 'mohamed shaqwieer',
                sapCustomer: 'string',
                vatNumber: '162836484',
                isBusinessPartner: true
            },
            items: []
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
          id: 1420,
          uniqueIdentifier: "9d9da600-fcf4-45f2-877f-e74e5101a1ae",
          createdAt: "2025-01-16T15:46:53.934648Z",
          billingDocId: "BillingDocId",
          deliveryId: "DeliveryId",
          currentStatus: "UnderRevision",
          salesOrderId: "SalesOrderId",
          customerId: 1831,
          customerName: "mohamed shaqwieer",
          customerPhoneNumber: "+966123322202",
          totalAmount: 1172,
          discountTotal: 86,
          taxTotal: 0,
          finalAmount: 1086,
          items: [
            {
              id: 2174,
              createdAt: "2025-01-16T15:46:53.934648Z",
              discountPercentage: 0,
              finalDiscountAmount: 86,
              price: 0,
              quantity: 2,
              sapDesc: "MANCERA MIDNIGHT GOLD 120ML"
            }
          ]
        },
        {
          id: 1421,
          uniqueIdentifier: "cb9b6f8c-b139-4ec4-9f62-f8dfa5edc519",
          createdAt: "2025-01-16T21:42:34.167241Z",
          billingDocId: "BillingDocId",
          deliveryId: "DeliveryId",
          currentStatus: "UnderRevision",
          salesOrderId: "SalesOrderId",
          customerId: 333,
          customerName: "test",
          customerPhoneNumber: "+966122222222",
          totalAmount: 1172,
          discountTotal: 0,
          taxTotal: 0,
          finalAmount: 1172,
          items: [
            {
              id: 2175,
              createdAt: "2025-01-16T21:42:34.167241Z",
              discountPercentage: 0,
              finalDiscountAmount: 0,
              price: 0,
              quantity: 2,
              sapDesc: "MANCERA MIDNIGHT GOLD 120ML"
            }
          ]
        }
      ],
        products: <MenuItem[]>[
            {
                id: '1',
                barcode: '123456789',
                name: 'Garlic Bread',
                sapItem: 'CPBATACD001',
                sapPlant: 'ABTA',
                price: 25.0,
                image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-15%20at%209.10.24%20PM-Y1GVfaII2ikT6z3XAanB72VCYKJAVF.jpeg',
                totalStock: 20,
                itemGroup: 'BTY',
                isEmpty: false
            },
            {
                id: '2',
                barcode: '123456789',
                name: 'Tomato Bread',
                sapItem: 'CPBATACD001',
                sapPlant: 'ABTA',
                price: 125.0,
                image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-15%20at%209.10.24%20PM-Y1GVfaII2ikT6z3XAanB72VCYKJAVF.jpeg',
                totalStock: 0,
                itemGroup: 'BTY',
                isEmpty: true
            }
        ]
    }),
    actions: {
        addItemToInvoice(itemId) {
            const tempItem = this.products.find((i) => i.id === itemId);
            if (tempItem) {
                const tempInvoiceItem = {
                    id: tempItem.id,
                    itemName: tempItem.name,
                    finalDiscountAmount: tempItem.price,
                    existpercentage: tempItem.discount,
                    quantity: 1
                };
                const check = this.invoice.items.find((i) => i.id === tempInvoiceItem.id);
                if (check) {
                    check.quantity += 1;
                } else {
                    this.invoice.items.push(tempInvoiceItem);
                }
            }
        },
        removeItemFromInvoice(itemId) {
            this.invoice.items.splice(
                this.invoice.items.findIndex((i) => i.id === itemId),
                1
            );
        },
        decreaseItemInInvoice(itemId) {
            const item = this.invoice.items.find((i) => i.id === itemId);
            item.quantity -= 1;
            if (item.quantity === 0) {
                this.removeItemFromInvoice(itemId);
            }
        },

        clearInvoiceItems() {
            this.invoice.items = [];
        },
        completeInvoice() {
            this.invoice.status = 'Completed';
        },
        refundInvoice() {
            this.invoice.status = 'Refunded';
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
