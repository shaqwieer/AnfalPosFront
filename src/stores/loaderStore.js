import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', {
    state: () => ({
        isLoading: false,
        isBarLoading: false,
        notificationMessage: '',
        notificationType: '',
        notificationFlag: false
    }),
    getters: {
        NotificationInfo: (state) => {
            return {
                notificationMessage: state.notificationMessage,
                notificationType: state.notificationType,
                notificationFlag: state.notificationFlag
            };
        }
    },
    actions: {
        setBarLoading() {
            this.isBarLoading = true;
        },
        resetBarLoading() {
            this.isBarLoading = false;
        },
        setLoading() {
            this.isLoading = true;
        },
        resetLoading() {
            this.isLoading = false;
        },
        setNotificationInfo(notificationType, notificationMessage) {
            this.notificationFlag = true;
            this.notificationType = notificationType;
            this.notificationMessage = notificationMessage;
        },
        resetNotificationInfo() {
            this.notificationFlag = false;
            this.notificationType = '';
            this.notificationMessage = '';
        }
    }
});
