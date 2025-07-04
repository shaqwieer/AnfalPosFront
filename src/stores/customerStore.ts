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
    error: ''
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
    async CreateCustomerBasedOnBranchType(customer: any) {
      try {
        console.log(customer);
        // debugger;
        const formData = new FormData();
        formData.append('Name', customer.name);
        formData.append('PrimaryPhone', customer.mobile);
        formData.append('Email', customer.email);
        formData.append('CrNumber', customer.cr);
        formData.append('VatNumber', customer.vat);
        formData.append('Industry', '');
        //formData.append('CreditLimit', customer.creditLimit);
        formData.append('PaymentTerm', customer.paymentTerm);
        formData.append('Latitude', customer.location.lat);
        formData.append('Altitude', customer.location.lng);
        formData.append('BuildingNumber', customer.buildingNumber);
        formData.append('StreetName', customer.streetName);
        formData.append('District', customer.district);
        formData.append('City', customer.city);
        formData.append('PostalCode', customer.postalCode);
        formData.append('AdditionalNumber', customer.additionalNumber);
        formData.append('BankName', customer.bankName);
        formData.append('AccountNumber', customer.bankAccount);
        formData.append('Iban', customer.iban);
        formData.append('SwiftCode', customer.swiftCode);
        formData.append('FinanceNotes', customer.financialNotes);
        formData.append('IsBusinessPartner', 'true');
        formData.append('AdditionalNotes', customer.notes);
        formData.append('PaymentTermId', customer.paymentTerm);
        formData.append('RegionId', customer.Region);
        formData.append('BranchId', customer.branchId);
        customer.attachments.forEach((file, index) => {
          formData.append(`CustomerAttachments[${index}].attachmentTypeId`, file.id);
          formData.append(`CustomerAttachments[${index}].attachmentTypeData`, file.file);
        });
        const response = await apiClient.post('/Customers/CreateCustomerBasedOnBranchType', formData);
        await this.GetCustomerBasedOnBranchType();
        // this.customer.push(response.data.data);
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async EditCustomerBasedOnBranchType(customer: any) {
      try {
        console.log(customer);
        // debugger;

        const formData = new FormData();
        formData.append('Id', customer.id);
        formData.append('Name', customer.name || '');
        formData.append('PrimaryPhone', customer.mobile || '');
        formData.append('Email', customer.email || '');
        formData.append('CrNumber', customer.cr || '');
        formData.append('VatNumber', customer.vat || '');
        formData.append('Industry', '');
        //formData.append('CreditLimit', customer.creditLimit?.toString() || '0');

        if (customer.location) {
          formData.append('Latitude', customer.location.lat?.toString() || '0');
          formData.append('Altitude', customer.location.lng?.toString() || '0');
        }

        // formData.append('Latitude', customer.location.lat);
        // formData.append('Altitude', customer.location.lng);

        formData.append('BuildingNumber', customer.buildingNumber);
        formData.append('StreetName', customer.streetName);
        formData.append('District', customer.district);
        formData.append('City', customer.city);
        formData.append('PostalCode', customer.postalCode);
        formData.append('AdditionalNumber', customer.additionalNumber);
        formData.append('BankName', customer.bankName);
        formData.append('AccountNumber', customer.bankAccount);
        formData.append('Iban', customer.iban);
        formData.append('SwiftCode', customer.swiftCode);
        formData.append('FinanceNotes', customer.financialNotes);
        formData.append('IsBusinessPartner', 'true');
        formData.append('AdditionalNotes', customer.notes);
        formData.append('PaymentTermId', customer.paymentTerm);
        formData.append('RegionId', customer.Region);
        formData.append('BranchId', customer.branchId);

        if (customer.attachments && Array.isArray(customer.attachments)) {
          customer.attachments.forEach((file, index) => {
            if (file.id && file.file) {
              formData.append(`CustomerAttachments[${index}].attachmentTypeId`, file.id.toString());
              formData.append(`CustomerAttachments[${index}].attachmentTypeData`, file.file);
            } else {
              console.warn(`تحذير: الملف رقم ${index} غير مكتمل`);
            }
          });
        }

        // customer.attachments.forEach((file, index) => {
        //   formData.append(`CustomerAttachments[${index}].attachmentTypeId`, file.id);
        //   formData.append(`CustomerAttachments[${index}].attachmentTypeData`, file.file);
        // });

        const response = await apiClient.put('/Customers/UpdateCustomerBasedOnBranchType', formData);
        await this.GetCustomerBasedOnBranchType();

        // if (!response || !response.data || !response.data.data) {
        //   throw new Error('استجابة غير صحيحة من السيرفر');
        // }

        // const index = this.customers.findIndex((c) => c.id === customer.id);
        // if (index !== -1) {
        //   this.customers[index] = response.data.data;
        // }

        // this.customers[index] = response.data.data;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },

    async ApproveCustomer(customer: any) {
      try {
        const formData = {
          customerId: customer.id,
          approve: true
        };
        await apiClient.put('/Customers/MarkAsApprovedOrRejected', formData);
        customer.status = 'active';
        customer.approvalStatus = 'approved';
        customer.approvedDate = new Date().toISOString().split('T')[0];
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async RejectCustomer(customer: any) {
      try {
        const formData = {
          customerId: customer.id,
          approve: false
        };
        await apiClient.put('/Customers/MarkAsApprovedOrRejected', formData);
        customer.status = 'rejected';
        customer.approvalStatus = 'rejected';
        customer.approvedDate = new Date().toISOString().split('T')[0];
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    }
  }
});
