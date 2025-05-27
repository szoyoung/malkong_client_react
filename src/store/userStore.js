import { create } from 'zustand';
import authService from '../api/authService';

export const useUserStore = create((set) => ({
    user: null,
    error: null,

    // 사용자 정보 불러오기
    fetchUserInfo: async () => {
        set({ error: null });
        try {
            const response = await authService.getCurrentUser();
            const user = {
                id: response.userId,
                name: response.name,
                email: response.email,
                provider: response.provider || 'LOCAL' // Provider 정보가 없는 경우 기본값
            };
            set({ user});
            return user;
        } catch (error) {
            set({ error: error.message || '사용자 정보를 불러오는데 실패했습니다.'});
            throw error;
        }
    },

    // 사용자 정보 직접 설정 (로그인 성공 시 사용)
    setUser: (userData) => {
        const user = {
            id: userData.userId || userData.id,
            name: userData.name,
            email: userData.email,
            provider: userData.provider || 'LOCAL'
        };
        set({ user, error: null });
    },

    // 사용자 정보 초기화 (로그아웃 시 사용)
    clearUser: () => set({ user: null, error: null })
}));