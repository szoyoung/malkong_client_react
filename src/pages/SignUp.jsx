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
import { validateEmail, validatePassword } from '../api/utils/validation';
import useError from '../hooks/useError';
import useLoading from '../hooks/useLoading';
import theme from '../theme';
import useAuthCheck from '../hooks/useAuthCheck';

const PageWrapper = styled(Box)({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  paddingTop: '-70px',
  boxSizing: 'border-box',
});

const PageContainer = styled(Container)({
  flex: 1,
  minWidth: '100vw',
  width: '100vw',
  maxWidth: '100vw',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 0,
  margin: 0,
  background: '#FFFFFF',
  overflow: 'hidden',
  marginTop: '-140px', // 🔥 fixed navbar 높이
  height: 'calc(100vh - 70px)', // 🔥 남은 높이
});

const ContentContainer = styled(Box)({
  display: 'flex',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  gap: '60px',
  alignItems: 'center',
  justifyContent: 'center',
});

const LeftSection = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  background: '#FFFFFF',
});

const RightSection = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  background: '#FFFFFF',
});

const LogoSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

const LogoImage = styled('img')({
  width: 'auto',
  height: '120px', // 텍스트 크기 72px과 비슷한 높이
  objectFit: 'contain',
});

const SignUpCard = styled(Box)({
  width: '100%',
  maxWidth: '400px',
  padding: '32px',
  borderRadius: '16px',
  background: '#FFFFFF',
  boxShadow: theme.shadows.md,
  border: `1px solid ${theme.palette.border}`,
});

const FormTitle = styled(Typography)({
  color: theme.palette.text.primary,
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
    backgroundColor: '#FFFFFF',
    '& fieldset': {
      borderColor: theme.palette.border,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
});

const PrimaryButton = styled(Button)({
  width: '100%',
  height: '48px',
  borderRadius: '8px',
  background: theme.palette.primary.main,
  color: theme.palette.text.white,
  fontSize: '16px',
  fontFamily: theme.typography.fontFamily.secondary,
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: theme.shadows.sm,
  marginTop: '16px',
  '&:hover': {
    background: theme.palette.primary.dark,
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
  border: `1px solid ${theme.palette.border}`,
  background: '#FFFFFF',
  color: theme.palette.text.primary,
  '&:hover': {
    background: '#F5F5F5',
  },
});

const LinkText = styled(Typography)({
  color: theme.palette.text.primary,
  fontSize: '14px',
  fontFamily: theme.typography.fontFamily.primary,
  textDecoration: 'underline',
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.primary.main,
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
  const { error, setError, resetError } = useError('');
  const { loading, setLoading } = useLoading(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  useAuthCheck('/dashboard');

  // Prevent body scroll on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

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
    <PageWrapper>
      <Navbar />
      <PageContainer>
        <ContentContainer>
          <LeftSection>
            <LogoSection>
              <LogoImage src="/malkong_logo.png" alt="또랑또랑" />
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
    </PageWrapper>
  );
};

export default SignUp;