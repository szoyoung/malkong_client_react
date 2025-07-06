import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, fetchUserInfo, setUser } from '../../store/slices/authSlice';

/**
 * AuthProvider handles authentication state across the application
 */
const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const user = useSelector(state => state.auth.user);

  // Fetch user info if authenticated but no user data
  useEffect(() => {
    const loadUserInfo = async () => {
      // 토큰이 실제로 존재하고, 인증된 상태이며, 사용자 정보가 없을 때만 실행
      const token = localStorage.getItem('token');
      if (isAuthenticated && !user && token && token !== 'undefined' && token !== 'null') {
        try {
          // JWT 토큰인지 확인
          const parts = token.split('.');
          if (parts.length === 3) {
            // JWT 토큰인 경우 (일반 로그인) - API 호출 없이 직접 파싱
            try {
              const payload = JSON.parse(atob(parts[1]));
              const userData = {
                email: payload.sub || payload.email,
                name: payload.name || (payload.sub || payload.email)?.split('@')[0],
                provider: 'LOCAL'
              };
              
              // Set user info directly
              dispatch(setUser(userData));
              console.log('AuthProvider: JWT 토큰에서 사용자 정보 추출 완료');
            } catch (jwtError) {
              console.error('AuthProvider: JWT 파싱 실패:', jwtError);
            }
          } else {
            // Google OAuth 토큰인 경우 - 사용자 정보가 없으면 Google API에서 직접 가져오기
            console.log('Google OAuth 토큰 감지됨. 사용자 정보 확인 중...');
            
            try {
              const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
              if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json();
                const userData = {
                  email: userInfo.email,
                  name: userInfo.name || userInfo.email.split('@')[0],
                  picture: userInfo.picture,
                  provider: 'GOOGLE'
                };
                
                dispatch(setUser(userData));
                console.log('AuthProvider: Google API에서 사용자 정보 가져오기 완료:', userData);
              } else {
                console.error('Google API 사용자 정보 조회 실패:', userInfoResponse.status);
              }
            } catch (error) {
              console.error('Google API 사용자 정보 조회 중 오류:', error);
            }
          }
        } catch (error) {
          console.error('Failed to load user info:', error);
          // 사용자 정보 로딩 실패 시 경고만 출력하고 로그아웃하지 않음
          // OAuth2 로그인의 경우 이미 OAuth2RedirectHandler에서 사용자 정보가 설정되어야 함
          console.warn('User info loading failed. This might be expected for OAuth2 users.');
        }
      }
    };
    
    // 약간의 지연을 두어 OAuth2RedirectHandler가 사용자 정보를 먼저 설정할 수 있도록 함
    const timeoutId = setTimeout(loadUserInfo, 100);
    
    return () => clearTimeout(timeoutId);
  }, [dispatch, isAuthenticated, user, navigate]);

  // Setup interceptor for 401 errors
  useEffect(() => {
    const handleUnauthorized = async () => {
      console.log('AuthProvider: auth:unauthorized 이벤트 수신, 로그아웃 및 리다이렉트 처리');
      // On 401 errors, just logout and redirect to login
      dispatch(logout());
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    };

    // Setup event listener for 401 errors
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    console.log('AuthProvider: auth:unauthorized 이벤트 리스너 등록 완료');

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [dispatch, navigate]);

  return <>{children}</>;
};

export default AuthProvider; 