import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { useUserStore } from '../store/userStore';
import authService from '../api/authService';

const useAuthValidation = (skipRouteValidation = false) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { clearUser } = useUserStore();
  const isValidatingRef = useRef(false);
  const lastValidationRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const logoutInProgressRef = useRef(false);

  // 로그아웃 처리 함수
  const performLogout = useCallback(() => {
    if (logoutInProgressRef.current) return;
    
    logoutInProgressRef.current = true;
    console.log('Performing logout...');
    
    dispatch(logout());
    clearUser();
    localStorage.removeItem('token');
    
    // 로그인 페이지가 아닌 경우에만 리다이렉트
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
    
    // 잠시 후 플래그 리셋 (다른 컴포넌트에서 로그아웃이 필요할 수 있음)
    setTimeout(() => {
      logoutInProgressRef.current = false;
    }, 1000);
  }, [dispatch, navigate, clearUser, location.pathname]);

  // 토큰 유효성 검사 및 자동 갱신 함수
  const validateToken = useCallback(async () => {
    // 이미 로그아웃 중이거나 검증 중이면 중단
    if (logoutInProgressRef.current || isValidatingRef.current) {
      return false;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      if (isAuthenticated) {
        performLogout();
      }
      return false;
    }

    // 중복 검증 방지 (5초 내 중복 요청 방지)
    const now = Date.now();
    if ((now - lastValidationRef.current) < 5000) {
      return true; // 최근에 검증했으면 true 반환
    }

    isValidatingRef.current = true;
    lastValidationRef.current = now;

    try {
      // JWT 토큰의 만료 시간을 클라이언트에서 직접 확인
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 토큰이 만료되었는지 확인
      if (!payload.exp || payload.exp <= currentTime) {
        console.log('Access token expired, attempting refresh...');
        
        // 리프레시 토큰으로 새 액세스 토큰 요청
        if (isRefreshingRef.current) {
          // 이미 리프레시 중이면 대기
          return false;
        }
        
        isRefreshingRef.current = true;
        
        try {
          const refreshResult = await authService.refreshToken();
          
          if (refreshResult.success) {
            console.log('Token refreshed successfully');
            isRefreshingRef.current = false;
            return true;
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          isRefreshingRef.current = false;
          
          // 모든 리프레시 에러는 로그아웃으로 처리
          // (CORS 에러, 네트워크 에러, 토큰 만료 등 모두 포함)
          console.log('Token refresh failed, logging out...');
          performLogout();
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      
      // 토큰이 유효하지 않음
      console.log('Token invalid, logging out...');
      performLogout();
      return false;
    } finally {
      isValidatingRef.current = false;
    }
  }, [dispatch, navigate, isAuthenticated, clearUser, location.pathname, performLogout]);

  // 서버에서 토큰 검증이 필요한 경우를 위한 함수 (선택적 사용)
  const validateTokenWithServer = useCallback(async () => {
    if (logoutInProgressRef.current) return false;
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }

    try {
      const response = await authService.validateGoogleToken();
      return response && response.valid !== false;
    } catch (error) {
      console.error('Server token validation failed:', error);
      
      // 401 또는 403 에러 시 토큰이 만료되었거나 유효하지 않음
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Server says token is invalid, attempting refresh...');
        
        try {
          const refreshResult = await authService.refreshToken();
          if (refreshResult.success) {
            console.log('Token refreshed successfully after server validation failure');
            return true;
          }
        } catch (refreshError) {
          console.log('Token refresh failed after server validation failure, logging out...');
          performLogout();
          return false;
        }
      }
      return false;
    }
  }, [performLogout]);

  // 보호된 라우트 목록
  const protectedRoutes = ['/dashboard', '/video', '/settings'];
  
  // 현재 경로가 보호된 라우트인지 확인
  const isProtectedRoute = useCallback(() => {
    return protectedRoutes.some(route => location.pathname.startsWith(route));
  }, [location.pathname]);

  // 페이지 이동 시 토큰 검증 (skipRouteValidation이 false일 때만)
  useEffect(() => {
    if (skipRouteValidation) return;

    const checkAuth = async () => {
      // 보호된 라우트에서만 토큰 검증 실행하고, 토큰이 실제로 존재할 때만
      const token = localStorage.getItem('token');
      if (isProtectedRoute() && isAuthenticated && token) {
        await validateToken();
      }
    };

    checkAuth();
  }, [location.pathname, isAuthenticated, isProtectedRoute, validateToken, skipRouteValidation]);

  // 주기적 토큰 검증 (3분마다) - skipRouteValidation이 false일 때만
  useEffect(() => {
    if (skipRouteValidation || !isAuthenticated || logoutInProgressRef.current) return;

    // 토큰이 실제로 존재할 때만 주기적 검증 실행
    const token = localStorage.getItem('token');
    if (!token) return;

    const interval = setInterval(async () => {
      // 로그아웃 중이거나 검증 중이면 스킵
      if (logoutInProgressRef.current || isValidatingRef.current) return;
      
      const currentToken = localStorage.getItem('token');
      if (currentToken && isAuthenticated) {
        await validateToken();
      }
    }, 5 * 60 * 1000); // 5분으로 조정

    return () => clearInterval(interval);
  }, [isAuthenticated, validateToken, skipRouteValidation]);

  return {
    validateToken,
    validateTokenWithServer,
    isProtectedRoute
  };
};

export default useAuthValidation; 