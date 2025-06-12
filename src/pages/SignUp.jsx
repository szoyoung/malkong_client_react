import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AUTH_ROUTES } from '../api/auth';
import authService from '../api/authService';
import Navbar from '../components/Navbar';

// 로그인과 동일한 테마
const theme = {
  colors: {
    primary: {
      main: '#2C2C2C',
      hover: '#1C1C1C',
    },
    text: {
      primary: '#1E1E1E',
      secondary: '#666666',
      white: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8F8F8',
      hover: '#F5F5F5',
    },
    border: '#E0E0E0',
    error: '#FF4D4F',
  },
  shadows: {
    sm: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif',
      secondary: 'Roboto, sans-serif',
    },
  },
};

const PageContainer = styled(Container)({
  minHeight: '100vh',
  minWidth: '100vw',
  width: '100vw',
  maxWidth: '100vw',
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  margin: 0,
  background: theme.colors.background.default,
  overflowX: 'hidden',
  paddingTop: '80px',
});

const ContentContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  width: '100%',
  minHeight: 'calc(100vh - 80px)', // Navbar 높이 제외
  maxWidth: '1200px', // 전체 최대 너비 제한
  margin: '0 auto', // 중앙 정렬
  gap: '60px', // 좌우 섹션 간 간격 추가
});

const LeftSection = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  background: theme.colors.background.default,
});

const RightSection = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  background: theme.colors.background.default,
});

const LogoSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

const LogoText = styled(Typography)({
  color: theme.colors.text.primary,
  fontSize: '72px', // 크기를 더 크게 조정
  fontFamily: '"SeoulAlrim", "Noto Sans KR"', // 메인 페이지와 동일한 폰트
  fontWeight: 800, // 메인 페이지와 동일한 굵기
  letterSpacing: '-0.5px',
});

const SignUpCard = styled(Box)({
  width: '100%',
  maxWidth: '400px',
  padding: '32px',
  borderRadius: '16px',
  background: theme.colors.background.default,
  boxShadow: theme.shadows.md,
  border: `1px solid ${theme.colors.border}`,
});

const FormTitle = styled(Typography)({
  color: theme.colors.text.primary,
  fontSize: '24px',
  fontFamily: theme.typography.fontFamily.primary,
  fontWeight: 600,
  marginBottom: '24px',
  textAlign: 'center',
});

const StyledTextField = styled(TextField)({
  width: '100%',
  marginBottom: '16px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: theme.colors.background.default,
    '& fieldset': {
      borderColor: theme.colors.border,
    },
    '&:hover fieldset': {
      borderColor: theme.colors.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.colors.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.colors.text.secondary,
  },
});

const PrimaryButton = styled(Button)({
  width: '100%',
  height: '48px',
  borderRadius: '8px',
  background: theme.colors.primary.main,
  color: theme.colors.text.white,
  fontSize: '16px',
  fontFamily: theme.typography.fontFamily.secondary,
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: theme.shadows.sm,
  marginTop: '16px',
  '&:hover': {
    background: theme.colors.primary.hover,
    boxShadow: theme.shadows.md,
  },
});

const OutlinedButton = styled(Button)({
  height: '48px',
  borderRadius: '8px',
  fontSize: '16px',
  fontFamily: theme.typography.fontFamily.secondary,
  fontWeight: 500,
  textTransform: 'none',
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.background.default,
  color: theme.colors.text.primary,
  '&:hover': {
    background: theme.colors.background.hover,
  },
});

const LinkText = styled(Typography)({
  color: theme.colors.text.primary,
  fontSize: '14px',
  fontFamily: theme.typography.fontFamily.primary,
  textDecoration: 'underline',
  cursor: 'pointer',
  '&:hover': {
    color: theme.colors.primary.main,
  },
});

const SignUp = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // 토큰이 있고 인증된 상태라면 대시보드로 리다이렉트
    if (token && isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // 토큰은 있지만 Redux 상태가 인증되지 않은 경우, 토큰 유효성 확인
    if (token && !isAuthenticated) {
      try {
        // JWT 토큰의 만료 시간을 클라이언트에서 직접 확인
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          // 토큰이 유효하다면 대시보드로 리다이렉트
          if (payload.exp && payload.exp > currentTime) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        // 토큰이 유효하지 않으면 제거
        localStorage.removeItem('token');
      }
    }
  }, [navigate, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    setIsSendingCode(true);
    setError('');
    try {
      const result = await authService.sendVerificationCode(formData.email);
      // authService에서 이미 개선된 응답을 반환하므로 메시지 사용
      alert(result.message || '인증 코드가 이메일로 전송되었습니다.');
    } catch (error) {
      console.log('Error details:', error);
      // authService에서 대부분의 경우를 성공으로 처리하므로 실제 에러만 표시
      const errorMessage = error.message || '인증 코드 전송에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      setError('인증 코드를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.verifyEmail(formData.email, verificationCode);
      setIsEmailVerified(true);
      alert('이메일 인증이 완료되었습니다.');
    } catch (error) {
      setError(error.response?.data?.message || '이메일 인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isEmailVerified) {
      setError('이메일 인증이 필요합니다.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await authService.signup({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });
      alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      navigate(AUTH_ROUTES.LOGIN);
    } catch (err) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <PageContainer>
        <ContentContainer>
          <LeftSection>
            <LogoSection>
              <LogoText>또랑또랑</LogoText>
            </LogoSection>
          </LeftSection>
          
          <RightSection>
            <SignUpCard>
              <FormTitle>회원가입</FormTitle>
              {error && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {error}
                </Alert>
              )}
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <StyledTextField
                  required
                  id="name"
                  label="이름"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                />
                <StyledTextField
                  required
                  id="email"
                  label="이메일"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                />
                {!isEmailVerified && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <StyledTextField
                      label="인증 코드"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      disabled={isSendingCode}
                    />
                    <OutlinedButton
                      variant="outlined"
                      onClick={handleSendVerificationCode}
                      disabled={isSendingCode}
                      sx={{ minWidth: 120 }}
                    >
                      {isSendingCode ? <CircularProgress size={24} /> : '코드 전송'}
                    </OutlinedButton>
                    <PrimaryButton
                      variant="contained"
                      onClick={handleVerifyEmail}
                      disabled={!verificationCode || loading}
                      sx={{ minWidth: 80, marginTop: 0 }}
                    >
                      {loading ? <CircularProgress size={24} /> : '인증'}
                    </PrimaryButton>
                  </Box>
                )}
                <StyledTextField
                  required
                  name="password"
                  label="비밀번호"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <StyledTextField
                  required
                  name="confirmPassword"
                  label="비밀번호 확인"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <PrimaryButton
                  type="submit"
                  variant="contained"
                  disabled={loading || !isEmailVerified}
                >
                  {loading ? '처리 중...' : '회원가입'}
                </PrimaryButton>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <LinkText onClick={() => navigate(AUTH_ROUTES.LOGIN)}>
                    이미 계정이 있으신가요? 로그인
                  </LinkText>
                </Box>
              </form>
            </SignUpCard>
          </RightSection>
        </ContentContainer>
      </PageContainer>
    </>
  );
};

export default SignUp;