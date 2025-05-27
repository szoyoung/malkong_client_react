import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { useUserStore } from '../../store/userStore';

/**
 * AuthProvider handles authentication state across the application
 */
const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Get user state and functions from Zustand
  const { user, fetchUserInfo, clearUser } = useUserStore();

  // Fetch user info if authenticated but no user data
  useEffect(() => {
    const loadUserInfo = async () => {
      // 토큰이 실제로 존재하고, 인증된 상태이며, 사용자 정보가 없을 때만 실행
      const token = localStorage.getItem('token');
      if (isAuthenticated && !user && token) {
        try {
          await fetchUserInfo();
        } catch (error) {
          console.error('Failed to load user info:', error);
          // OAuth2 로그인의 경우 사용자 정보를 토큰에서 추출할 수 있으므로
          // 에러가 발생해도 바로 로그아웃하지 않고 경고만 출력
          console.warn('User info loading failed, but user may still be authenticated via OAuth2');
        }
      }
    };
    
    loadUserInfo();
  }, [dispatch, isAuthenticated, user, navigate, fetchUserInfo, clearUser]);

  // Setup interceptor for 401 errors
  useEffect(() => {
    const handleUnauthorized = async () => {
      // On 401 errors, just logout and redirect to login
      dispatch(logout());
      clearUser();
      navigate('/login', { replace: true });
    };

    // Setup event listener for 401 errors
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [dispatch, navigate, clearUser]);

  return <>{children}</>;
};

export default AuthProvider; 