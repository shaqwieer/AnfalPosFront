import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '../api/apiClient';
import { handleError } from '../utilities/errorHandler';

export const useSessionStore = defineStore({
  id: 'sessionStore',
  state: () => ({
    sessions: <any[]>[],
    sessionData: <any>{},
    selectedSession: <any>{},
    salesReps: [],
    attachmentTypes: <any[]>[],
    dataSummary: <any>{},
    visitsSummary: <any>[],
    dashBoardData: <any>{},
    loading: useLoadingStore(),
    error: ''
  }),
  actions: {
    async GetSessions(payload) {
      try {
        const response = await apiClient.post('/ShiftSessions/GetSessionsManagment', payload);
        console.log(response);

        this.sessionData = response.data.data;
        this.sessions = response.data.data.sessionSales;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async GetSessionDetails(payload) {
      try {
        const response = await apiClient.get('/ShiftSessions/GetSessionDetailForSpecificSession/' + payload);
        this.selectedSession = response.data.data;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async ApproveSession(payload: any) {
      try {
        const response = await apiClient.post('/ShiftSessions/ApproveShiftSession', payload);
        this.sessions.find((session: any) => session.id === payload.shiftSessionId).statusId = payload.statusId;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async ApproveSessionTransaction(payload: any) {
      try {
        const response = await apiClient.post('/ShiftSessions/ApproveTransactionOrDepositForSession', payload);
        if (payload.isCashDeposit) this.selectedSession.shiftCashDeposits.find((deposit: any) => deposit.id === payload.approveId).statusId = 2;
        else this.selectedSession.transactions.find((transaction: any) => transaction.id === payload.approveId).statusId = 2;
        if (this.selectedSession.shiftCashDeposits.some((deposit: any) => deposit.statusId === 1) && this.selectedSession.transactions.some((transaction: any) => transaction.statusId === 1)) this.selectedSession.statusId = 1;
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
    },
    async getDashBoardSummary(payload) {
      try {
        const response = await apiClient.post('/ShiftSessions/GetVanSalesDashboard', payload);
        this.dashBoardData = response.data.data;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async getDataSummary(payload) {
      try {
        const response = await apiClient.post('/ShiftSessions/GetVanDashboardCards', payload);
        console.log(response);

        this.dataSummary = response.data.data;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    },
    async getVisitsSummary(payload) {
      try {
        const response = await apiClient.post('/Visits/GetVisitSalesRepForDashboard', payload);
        console.log(response);

        this.visitsSummary = response.data.data;
      } catch (err) {
        this.error = handleError(err, this.loading);
      }
    }
  }
});
