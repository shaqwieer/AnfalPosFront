import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '../api/apiClient';
import { handleError } from '../utilities/errorHandler';

export const useSessionStore = defineStore({
  id: 'sessionStore',
  state: () => ({
    sessions: <any[]>[],
    sessionData: <any>{},
    salesReps: [],
    attachmentTypes: <any[]>[],
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
    async ApproveSession(payload: any) {
      try {
        const response = await apiClient.post('/ShiftSessions/ApproveShiftSession', payload);
        this.sessions.find((session: any) => session.id === payload.shiftSessionId).statusId = payload.statusId;
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
