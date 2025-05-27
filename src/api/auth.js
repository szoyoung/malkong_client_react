import authService from './authService';

export const AUTH_ROUTES = {
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password'
};

export { authService };
export default authService;