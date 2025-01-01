import { defineStore } from 'pinia';
import { useLoadingStore } from './loaderStore';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';

export const useUserRoleStore = defineStore({
    id: 'userRole',
    state: () => ({
        roles: [],
        loading: useLoadingStore(),
        error: '',
        permissions: [],
        rolesSelection: [],
        users: []
    }),
    actions: {
        async getRolesWithusers() {
            // this.loading.setLoading();
            try {
                const response = await apiClient.get('/Roles/GetRolesWithUsers');
                this.roles = response.data.data;
                // this.loading.resetLoading();
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
        async GetPageNamesInRole(roleId) {
            // this.loading.setLoading();
            try {
                const response = await apiClient.get(`/PageRoles/GetPageNamesInRole/${roleId}`);
                this.permissions = response.data.data;
                // this.loading.resetLoading();
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
        async GetRolesBasedOnTenant() {
            // this.loading.setLoading();
            try {
                const response = await apiClient.get('/Roles/GetRolesBasedOnTenant');
                this.rolesSelection = response.data.data;
                // this.loading.resetLoading();
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
        async UsersInTenant() {
            // this.loading.setLoading();
            try {
                const response = await apiClient.get('/Users/UsersInTenant');
                this.users = response.data.data;
                // this.loading.resetLoading();
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
        async createRole(payload) {
            // this.loading.setLoading();
            try {
                const response = await apiClient.post('/Roles/CreateRole', payload);
                const newRole = { id: response.data.data.id, name: response.data.data.name, users: [] };
                this.roles.push(newRole);
                // this.loading.resetLoading();
                this.loading.setNotificationInfo('success', response.data.message);
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
        async SavePermission(payload) {
            // this.loading.setLoading();
            try {
                const response = await apiClient.post('/PageRoles/SavePermission', payload);
                // this.loading.resetLoading();
                this.loading.setNotificationInfo('success', response.data.message);
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
        async updateUser(userId,payload) {
            // this.loading.setLoading();
            try {
                const response = await apiClient.post(`/Users/UpdateUser/${userId}`,payload);
                const index = this.users.findIndex((user) => user.id === userId);
                this.users[index] = { ...this.users[index], ...response.data.data }; // Merge the payload into the existing object
                // this.loading.resetLoading();
                this.loading.setNotificationInfo('success', response.data.message);
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
        async deleteUser(userId) {
            // this.loading.setLoading();
            try {
                const response = await apiClient.delete(`/Users/deleteUser/${userId}`);
                const deletedUser = this.users.find(user => user.id === userId);

                if (deletedUser) {
                  // Remove the user from the users array
                  this.users = this.users.filter(user => user.id !== userId);
                  // Remove the user from the roles
                  deletedUser.roles.forEach(role => {
                    const roleToUpdate = this.roles.find(r => r.id === role.id);
                    if (roleToUpdate) {
                      roleToUpdate.users = roleToUpdate.users.filter(username => username !== deletedUser.userName);
                    }
                  });
                }
                // this.loading.resetLoading();
                this.loading.setNotificationInfo('success', response.data.message);
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },

        async updateRole(payload) {
            // this.loading.setLoading();
            try {
                const response = await apiClient.post(`/Roles/UpdateRole`, payload);
                const index = this.roles.findIndex((type) => type.id === payload.id);
                this.roles[index] = { ...this.roles[index], ...{ id: payload.id, name: payload.name, users: this.roles[index].users } }; // Merge the payload into the existing object
                // this.loading.resetLoading();
                this.loading.setNotificationInfo('success', response.data.message);
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
        async createUser(payload) {
            // this.loading.setLoading();
            try {
                const response = await apiClient.post('/Auth/register', payload);
                const newUser = response.data.data;
                this.users.push(newUser);
                newUser.roles.forEach((newRole) => {
                    const role = this.roles.find((r) => r.id === newRole.id);
                    if (role) {
                        role.users = [...role.users, newUser.userName];
                        //   role.users.push(newUser.userName);
                    }
                });
                // this.loading.resetLoading();
                this.loading.setNotificationInfo('success', response.data?.message?.name);
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
        async changePassword(userId,payload) {
            // this.loading.setLoading();
            try {
                const response = await apiClient.post(`/Users/ChangePassword/${userId}`,payload);
                // this.loading.resetLoading();
                this.loading.setNotificationInfo('success', response.data.message);
            } catch (err) {
                // this.loading.resetLoading();
                this.error = handleError(err, this.loading);

            }
        },
    }
});
