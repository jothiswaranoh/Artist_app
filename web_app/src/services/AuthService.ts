import { apiService } from './api';
import { TokenManager } from './TokenManager';
import type { AuthUser, LoginCredentials, SignupData } from '../types';

export const AuthService = {
    login: async (credentials: LoginCredentials) => {
        const response = await apiService.post<{ token: string } & AuthUser>('/login', credentials);
        if (response.success && response.data) {
            TokenManager.setToken(response.data.token);
            // Store only user info separately (strip token)
            const { token, ...userInfo } = response.data;
            localStorage.setItem('user', JSON.stringify(userInfo));
        }
        return response;
    },

    signup: async (userData: SignupData) => {
        const response = await apiService.post<{ user: AuthUser; token: string }>('/signup', { user: userData });
        if (response.success && response.data) {
            TokenManager.setToken(response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response;
    },

    logout: () => {
        TokenManager.clearToken();
        localStorage.removeItem('user');
    },

    getCurrentUser: (): AuthUser | null => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }
};
