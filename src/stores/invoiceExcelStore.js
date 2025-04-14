// src/stores/invoiceExcelStore.js
import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export const useInvoiceExcelStore = defineStore({
  id: 'invoiceExcel',
  state: () => ({
    uploadHistory: [],
    loading: useLoadingStore(),
    error: '',
    processingStatus: null
  }),
  actions: {
    async uploadInvoiceExcel(formData) {
      this.loading.setLoading();
      try {
        const response = await apiClient.post('/InvoiceExcelUpload/ImportInvoices', formData);
        var responseRead = await getUploadHistory()
        // this.addToUploadHistory({
        //   id: Date.now().toString(),
        //   filename: formData.get('File').name,
        //   timestamp: new Date().toISOString(),
        //   status: 'success',
        //   note: formData.get('BatchNote') || ''
        // });
        this.loading.resetLoading();
        this.loading.setNotificationInfo('success', response.data.message || 'File uploaded successfully');
        return response.data;
      } catch (err) {
        this.addToUploadHistory({
          id: Date.now().toString(),
          filename: formData.get('File').name,
          timestamp: new Date().toISOString(),
          status: 'error',
          note: formData.get('BatchNote') || ''
        });
        this.loading.resetLoading();
        this.error = handleError(err, this.loading);
        throw err;
      }
    },
    
    async getUploadHistory() {
      this.loading.setLoading();
      try {
        // This would be replaced with an actual API endpoint to get upload history
        const response = await apiClient.get('/InvoiceExcelUpload/ImportedInvoices');
        this.uploadHistory = response.data.data;
        console.log(this.uploadHistory);
        // Simulated response for now
        // setTimeout(() => {
        //   this.uploadHistory = this.uploadHistory.length > 0 ? this.uploadHistory : [
        //     {
        //       id: '1',
        //       filename: 'march_invoices.xlsx',
        //       timestamp: '2025-03-15T10:30:00Z',
        //       status: 'success',
        //       note: 'March invoices batch'
        //     },
        //     {
        //       id: '2',
        //       filename: 'special_clients.xlsx',
        //       timestamp: '2025-03-10T14:45:00Z',
        //       status: 'error',
        //       note: 'Special client invoices'
        //     }
        //   ];
          this.loading.resetLoading();
        // }, 500);
      } catch (err) {
        this.loading.resetLoading();
        this.error = handleError(err, this.loading);
      }
    },
    
    addToUploadHistory(uploadRecord) {
      this.uploadHistory.unshift(uploadRecord);
      // Limit history to last 10 items
      if (this.uploadHistory.length > 10) {
        this.uploadHistory = this.uploadHistory.slice(0, 10);
      }
    },
    
    async checkProcessingStatus(batchId) {
      try {
        // This would be replaced with an actual API endpoint to check processing status
        // const response = await apiClient.get(`/InvoiceExcelUpload/GetProcessingStatus/${batchId}`);
        // this.processingStatus = response.data.data;
        
        // Simulated response for now
        this.processingStatus = {
          id: batchId,
          status: 'completed',
          processedCount: 120,
          errorCount: 3,
          progress: 100
        };
        
        return this.processingStatus;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    }
  }
});