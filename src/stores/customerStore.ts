import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '../api/apiClient';
import { handleError } from '../utilities/errorHandler';

export const useCustomerStore = defineStore({
    id: 'customerStore',
    state: () => ({
        customers: <any[]>[],
        attachmentTypes: <any[]>[],
        loading: useLoadingStore(),
        error: '',
    }),
    actions: {
        async GetCustomerBasedOnBranchType() {
            try {
                const response = await apiClient.get('/Customers/GetCustomerBasedOnBranchType');
                this.customers = response.data.data;
            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        },
        async GetAttachmentTypes() {
            try {
                const response = await apiClient.get('/AttachmentTypes');
                this.attachmentTypes = response.data.data;
            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        },
        async CreateCustomerBasedOnBranchType(customer:any) {
            try {
                console.log(customer);
                debugger
                const formData = new FormData();
                formData.append('Name', customer.name);
                formData.append('PrimaryPhone', customer.mobile);
                formData.append('Email', customer.email);
                formData.append('CrNumber', customer.cr);
                formData.append('VatNumber', customer.vat);
                formData.append('Industry', '')
                formData.append('CreditLimit', customer.creditLimit);
                formData.append("PaymentTerm", customer.paymentTerm);
                formData.append("Latitude", customer.location.lat);
                formData.append("Altitude", customer.location.lng);
                formData.append("BuildingNumber", customer.buildingNumber);
                formData.append("StreetName", customer.streetName);
                formData.append("District", customer.district);
                formData.append("City", customer.city);
                formData.append("PostalCode", customer.postalCode);
                formData.append("AdditionalNumber", customer.additionalNumber);
                formData.append("BankName", customer.bankName);
                formData.append("AccountNumber", customer.bankAccount);
                formData.append("Iban", customer.iban);
                formData.append("SwiftCode", customer.swiftCode);
                formData.append("FinanceNotes", customer.financialNotes);
                formData.append("IsBusinessPartner", 'true');
                formData.append("AdditionalNotes", customer.notes);
                customer.attachments.forEach((file, index) => {
                    formData.append(`CustomerAttachments[${index}].attachmentTypeId`, file.id);
                    formData.append(`CustomerAttachments[${index}].attachmentTypeData`, file.file);
                });
                const response = await apiClient.post('/Customers/CreateCustomerBasedOnBranchType', { params: formData });
                //this.customers = response.data.data;
                console.log(response);
                
            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        },
        async EditCustomerBasedOnBranchType(customer:any) {
            try {
                console.log(customer);
                debugger
                const formData = new FormData();
                formData.append('Id', customer.id);
                formData.append('Name', customer.name);
                formData.append('PrimaryPhone', customer.mobile);
                formData.append('Email', customer.email);
                formData.append('CrNumber', customer.cr);
                formData.append('VatNumber', customer.vat);
                formData.append('Industry', '')
                formData.append('CreditLimit', customer.creditLimit);
                formData.append("PaymentTerm", customer.paymentTerm);
                formData.append("Latitude", customer.location.lat);
                formData.append("Altitude", customer.location.lng);
                formData.append("BuildingNumber", customer.buildingNumber);
                formData.append("StreetName", customer.streetName);
                formData.append("District", customer.district);
                formData.append("City", customer.city);
                formData.append("PostalCode", customer.postalCode);
                formData.append("AdditionalNumber", customer.additionalNumber);
                formData.append("BankName", customer.bankName);
                formData.append("AccountNumber", customer.bankAccount);
                formData.append("Iban", customer.iban);
                formData.append("SwiftCode", customer.swiftCode);
                formData.append("FinanceNotes", customer.financialNotes);
                formData.append("IsBusinessPartner", 'true');
                formData.append("AdditionalNotes", customer.notes);
                customer.attachments.forEach((file, index) => {
                    formData.append(`CustomerAttachments[${index}].attachmentTypeId`, file.id);
                    formData.append(`CustomerAttachments[${index}].attachmentTypeData`, file.file);
                });
                const response = await apiClient.put('/Customers/UpdateCustomerBasedOnBranchType', { params: formData });
                //this.customers = response.data.data;
                console.log(response);
                
            } catch (err) {
                this.error = handleError(err, this.loading);
            }
        }
    }
});
