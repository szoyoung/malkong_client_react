// src/pages/OAuth2RedirectHandler.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { loginSuccess } from '../store/slices/authSlice';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleOAuth2Callback = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const accessToken = params.get('access_token');
                const error = params.get('error');

                if (error) {
                    console.error('OAuth2 error:', error);
                    navigate(`/login?error=${encodeURIComponent(error)}`);
                    return;
                }

                if (!accessToken) {
                    console.error('Missing access token');
                    navigate(`/login?error=${encodeURIComponent('인증 토큰을 받지 못했습니다.')}`);
                    return;
                }

                // 액세스 토큰만 localStorage에 저장 (리프레시 토큰은 저장하지 않음)
                localStorage.setItem('token', accessToken);

                // 토큰에서 사용자 정보 추출
                let userInfo = null;
                try {
                    const payload = JSON.parse(atob(accessToken.split('.')[1]));
                    const email = payload.sub;
                    userInfo = {
                        email: email,
                        name: email.split('@')[0],
                        provider: 'GOOGLE'
                    };
                } catch (e) {
                    console.warn('Could not extract user info from token');
                }

                // Redux 상태 업데이트
                dispatch(loginSuccess({
                    accessToken,
                    user: userInfo
                }));

                // 메인 페이지로 리다이렉트
                navigate('/dashboard');
            } catch (error) {
                console.error('OAuth2 callback error:', error);
                navigate(`/login?error=${encodeURIComponent('OAuth2 로그인 처리 중 오류가 발생했습니다.')}`);
            }
        };

        handleOAuth2Callback();
    }, [location, navigate, dispatch]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: 2
            }}
        >
            <CircularProgress />
            <Typography variant="h6">
                로그인 처리 중입니다...
            </Typography>
        </Box>
    );
};

export default OAuth2RedirectHandler;
