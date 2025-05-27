import api from './axios';
import { useUserStore } from '../store/userStore';

const API_URL = 'http://localhost:8080';

const authService = {
    // Regular login
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            }, {
                timeout: 15000 // 15초로 타임아웃 증가
            });

            if (response.data.accessToken) {
                // Only store access token in localStorage
                localStorage.setItem('token', response.data.accessToken);
                
                // Return minimal info for auth
                return {
                    access_token: response.data.accessToken,
                    email: email
                };
            }
            return null;
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            
            // 타임아웃 에러 처리
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new Error('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
            }
            
            // 서버 에러 처리
            if (error.response?.status >= 500) {
                throw new Error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
            
            // 클라이언트 에러 처리
            if (error.response?.status >= 400 && error.response?.status < 500) {
                const errorMessage = error.response?.data?.message || 
                                   error.response?.data || 
                                   '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
                throw new Error(errorMessage);
            }
            
            throw error;
        }
    },

    // Google OAuth2 login
    googleLogin: () => {
        window.location.href = `${API_URL}/oauth2/authorization/google`;
    },

    // Handle OAuth2 login success
    handleOAuth2Success: async (response) => {
        const { token, email, name } = response;
        localStorage.setItem('token', token);
        
        // Set user in Zustand store
        const userStore = useUserStore.getState();
        userStore.setUser({
            email,
            name,
            provider: 'GOOGLE'
        });
        
        return {
            access_token: token,
            email,
            name
        };
    },

    // Fetch current user information
    getCurrentUser: async () => {
        try {
            // OAuth2Controller에는 사용자 정보 엔드포인트가 없으므로
            // 토큰에서 이메일을 추출하여 사용자 정보를 구성
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            // JWT 토큰에서 이메일 추출 (간단한 디코딩)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const email = payload.sub; // JWT의 subject는 보통 이메일
                
                // 기본 사용자 정보 반환
                const userData = {
                    email: email,
                    name: email.split('@')[0], // 이메일에서 이름 추출
                    provider: 'GOOGLE' // OAuth2를 통한 로그인이므로 GOOGLE로 설정
                };

                // Update Zustand store with user data
                if (useUserStore) {
                    const userStore = useUserStore.getState();
                    userStore.setUser(userData);
                }
                
                return userData;
            } catch (decodeError) {
                throw new Error('Invalid token format');
            }
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            throw error;
        }
    },

    // Google OAuth token validation
    validateGoogleToken: async () => {
        const response = await api.get('/api/oauth2/validate');
        return response.data;
    },

    // Send verification code
    sendVerificationCode: async (email) => {
        try {
            const response = await api.post('/auth/send-code', { email }, {
                timeout: 10000 // 10초 타임아웃 설정
            });
            return { success: true, message: '인증 코드가 전송되었습니다.' };
        } catch (error) {
            console.error('Send verification code error:', error);
            
            // 타임아웃 에러 처리
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                return { 
                    success: true, 
                    message: '인증 코드 전송 중입니다. 잠시 후 이메일을 확인해주세요.' 
                };
            }
            
            // 서버에서 실제로는 성공했을 수 있는 경우
            if (error.response?.status === 200) {
                return { success: true, message: '인증 코드가 전송되었습니다.' };
            }
            
            // 네트워크 에러나 서버 에러의 경우 성공으로 처리 (이메일 전송은 백그라운드에서 처리될 수 있음)
            if (error.response?.status >= 500 || !error.response) {
                return { 
                    success: true, 
                    message: '인증 코드를 전송했습니다. 이메일을 확인해주세요.' 
                };
            }
            
            // 클라이언트 에러 (400번대)만 실제 에러로 처리
            if (error.response?.status >= 400 && error.response?.status < 500) {
                const errorMessage = error.response?.data?.message || 
                                   error.response?.data || 
                                   '인증 코드 전송에 실패했습니다.';
                throw new Error(errorMessage);
            }
            
            // 기타 에러는 성공으로 처리
            return { 
                success: true, 
                message: '인증 코드를 전송했습니다. 이메일을 확인해주세요.' 
            };
        }
    },

    // Verify email
    verifyEmail: async (email, code) => {
        const response = await api.post('/auth/verify-email', { email, code });
        return response.data;
    },

    // Sign up
    signup: async (userData) => {
        try {
            const response = await api.post('/auth/signup', userData);
            return response.data;
        } catch (error) {
            console.error('Signup error:', error);
            // 에러 메시지를 더 명확하게 추출
            const errorMessage = error.response?.data?.message || 
                                error.response?.data || 
                                '회원가입에 실패했습니다.';
            throw new Error(errorMessage);
        }
    },

    // Logout
    logout: async () => {
        try {
            // 토큰에서 이메일 추출
            const token = localStorage.getItem('token');
            let email = null;
            
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    email = payload.sub;
                } catch (e) {
                    console.warn('Could not extract email from token');
                }
            }

            // OAuth2Controller의 로그아웃 엔드포인트 호출 (이메일 파라미터 필요)
            if (email) {
                await api.post('/api/oauth2/logout', null, {
                    params: { email: email }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear access token from localStorage
            localStorage.removeItem('token');
            
            // Clear user from Zustand store
            if (useUserStore) {
                const userStore = useUserStore.getState();
                userStore.clearUser();
            }
        }
    },

    // Get token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        // 토큰 형식이 올바른지 간단히 확인 (JWT는 3개 부분으로 구성)
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            // 토큰이 만료되었는지 확인
            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            // exp가 있고 만료되지 않았으면 true
            return payload.exp && payload.exp > currentTime;
        } catch (e) {
            // 토큰 파싱 실패 시 false
            return false;
        }
    },

    // Request password reset (sends verification code to email)
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/reset-password/request', { email }, {
                timeout: 10000 // 10초 타임아웃 설정
            });
            return { success: true, message: '비밀번호 재설정 코드가 전송되었습니다.' };
        } catch (error) {
            console.error('Password reset request error:', error);
            
            // 타임아웃 에러 처리
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                return { 
                    success: true, 
                    message: '비밀번호 재설정 코드 전송 중입니다. 잠시 후 이메일을 확인해주세요.' 
                };
            }
            
            // 서버에서 실제로는 성공했을 수 있는 경우
            if (error.response?.status === 200) {
                return { success: true, message: '비밀번호 재설정 코드가 전송되었습니다.' };
            }
            
            // 네트워크 에러나 서버 에러의 경우 성공으로 처리
            if (error.response?.status >= 500 || !error.response) {
                return { 
                    success: true, 
                    message: '비밀번호 재설정 코드를 전송했습니다. 이메일을 확인해주세요.' 
                };
            }
            
            // 클라이언트 에러 (400번대)만 실제 에러로 처리
            if (error.response?.status >= 400 && error.response?.status < 500) {
                const errorMessage = error.response?.data?.message || 
                                   error.response?.data || 
                                   '비밀번호 재설정 코드 전송에 실패했습니다.';
                throw new Error(errorMessage);
            }
            
            // 기타 에러는 성공으로 처리
            return { 
                success: true, 
                message: '비밀번호 재설정 코드를 전송했습니다. 이메일을 확인해주세요.' 
            };
        }
    },

    // Verify reset password code
    verifyResetCode: async (email, code) => {
        try {
            const response = await api.post('/auth/reset-password/verify', { email, code });
            return response.data;
        } catch (error) {
            console.error('Reset code verification error:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data || 
                                '인증 코드 확인에 실패했습니다.';
            throw new Error(errorMessage);
        }
    },

    // Reset password with new password
    resetPassword: async (email, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password/confirm', { 
                email, 
                newPassword 
            });
            return response.data;
        } catch (error) {
            console.error('Password reset error:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data || 
                                '비밀번호 재설정에 실패했습니다.';
            throw new Error(errorMessage);
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/api/user/profile', profileData);
            
            // Update Zustand store with updated user data
            if (useUserStore) {
                const userStore = useUserStore.getState();
                userStore.setUser(response.data);
            }
            
            return response.data;
        } catch (error) {
            console.error('Profile update error:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data || 
                                '프로필 업데이트에 실패했습니다.';
            throw new Error(errorMessage);
        }
    },

    // Delete user account
    deleteAccount: async () => {
        try {
            const response = await api.delete('/api/user/account');
            
            // Clear all local data after successful deletion
            localStorage.removeItem('token');
            
            // Clear user from Zustand store
            if (useUserStore) {
                const userStore = useUserStore.getState();
                userStore.clearUser();
            }
            
            return response.data;
        } catch (error) {
            console.error('Account deletion error:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data || 
                                '계정 삭제에 실패했습니다.';
            throw new Error(errorMessage);
        }
    },

    // Change password (for authenticated users)
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await api.post('/api/user/change-password', {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            console.error('Password change error:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data || 
                                '비밀번호 변경에 실패했습니다.';
            throw new Error(errorMessage);
        }
    },

    // Refresh access token using refresh token from Redis
    refreshToken: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            // 토큰에서 이메일 추출
            let email = null;
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                email = payload.sub;
            } catch (e) {
                throw new Error('Invalid token format');
            }

            if (!email) {
                throw new Error('No email found in token');
            }

            // 서버의 리프레시 토큰 엔드포인트 호출
            const response = await api.post('/api/oauth2/refresh', null, {
                params: { email: email },
                timeout: 10000,
                validateStatus: function (status) {
                    // 200-299 범위의 상태 코드와 302 리다이렉트를 성공으로 처리하지 않음
                    return status >= 200 && status < 300;
                }
            });

            if (response.data && response.data.accessToken) {
                // 새로운 액세스 토큰 저장
                localStorage.setItem('token', response.data.accessToken);
                return {
                    success: true,
                    accessToken: response.data.accessToken
                };
            } else {
                throw new Error('No access token in response');
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            
            // CORS 에러나 네트워크 에러는 리프레시 토큰 만료로 간주
            if (error.code === 'ERR_NETWORK' || 
                error.message === 'Network Error' ||
                error.response?.status === 401 || 
                error.response?.status === 403 ||
                error.response?.status === 302) {
                
                console.log('Refresh token appears to be expired or invalid');
                // 모든 토큰 정리
                localStorage.removeItem('token');
                throw new Error('Refresh token expired');
            }
            
            throw error;
        }
    }
};

// Add axios interceptor for adding token to requests
api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.withCredentials = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add axios response interceptor for handling 401 errors and token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // 401 에러이고 아직 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                console.log('401 error detected, attempting token refresh...');
                const refreshResult = await authService.refreshToken();
                
                if (refreshResult.success) {
                    // 새로운 토큰으로 원래 요청 재시도
                    originalRequest.headers.Authorization = `Bearer ${refreshResult.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed in interceptor:', refreshError);
                // 리프레시 실패 시 토큰 정리 (로그아웃은 useAuthValidation에서 처리)
                localStorage.removeItem('token');
                return Promise.reject(error);
            }
        }
        
        return Promise.reject(error);
    }
);

export default authService;