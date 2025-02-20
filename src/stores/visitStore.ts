import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '../api/apiClient';
import { handleError } from '../utilities/errorHandler';

export const useVisitStore = defineStore({
  id: 'visitStore',
  state: () => ({
    visits: <any[]>[],
    visitData: <any>{},
    selectedVisit: <any>{},
    salesReps: [],
    attachmentTypes: <any[]>[],
    loading: useLoadingStore(),
    error: ''
  }),
  actions: {
    async GetVisits(payload) {
      try {
        const response = await apiClient.post('/ShiftSessions/GetVanSalesDashboard', payload);
        console.log(response);

        this.visitData = response.data.data;
        this.visits = response.data.data.sessionSales;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async GetVisitDetails(payload) {
      try {
        const response = await apiClient.get('/ShiftSessions/GetSessionDetailForSpecificSession/' + payload);
        this.selectedVisit = response.data.data;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async ApproveVisit(payload: any) {
      try {
        const response = await apiClient.post('/ShiftSessions/ApproveShiftSession', payload);
        this.visits.find((visit: any) => visit.id === payload.shiftSessionId).statusId = payload.statusId;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async ApproveVisitTransaction(payload: any) {
      try {
        const response = await apiClient.post('/ShiftSessions/ApproveTransactionOrDepositForSession', payload);
        if (payload.isCashDeposit) this.selectedVisit.shiftCashDeposits.find((deposit: any) => deposit.id === payload.approveId).statusId = 2;
        else this.selectedVisit.transactions.find((transaction: any) => transaction.id === payload.approveId).statusId = 2;
        if (this.selectedVisit.shiftCashDeposits.some((deposit: any) => deposit.statusId === 1) && this.selectedVisit.transactions.some((transaction: any) => transaction.statusId === 1)) this.selectedVisit.statusId = 1;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async GetSalesReps() {
      try {
        const response = await apiClient.get('/BusinessEntities/GetUserVanSaleInBranch');
        this.salesReps = response.data.data;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    }
  }
});
