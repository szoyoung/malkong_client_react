import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { CircularProgress, Box, Typography } from '@mui/material';

const OAuth2Callback = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const error = searchParams.get('error');

        if (error) {
            console.error('OAuth2 로그인 오류:', error);
            navigate('/login?error=' + encodeURIComponent(error));
            return;
        }

        if (accessToken) {
            // 액세스 토큰만 localStorage에 저장 (리프레시 토큰은 저장하지 않음)
            localStorage.setItem('token', accessToken);

            // Redux 상태 업데이트
            dispatch(loginSuccess({
                accessToken,
                user: null // 사용자 정보는 별도로 가져올 예정
            }));

            // 메인 페이지로 리다이렉트
            navigate('/dashboard');
        } else {
            console.error('액세스 토큰이 없습니다.');
            navigate('/login?error=' + encodeURIComponent('인증 토큰을 받지 못했습니다.'));
        }
    }, [searchParams, navigate, dispatch]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            bgcolor="#f5f5f5"
        >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
                로그인 처리 중...
            </Typography>
        </Box>
    );
};

export default OAuth2Callback; 