import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Container, InputAdornment, IconButton, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import NumbersIcon from '@mui/icons-material/Numbers';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';
import Navbar from '../components/Navbar';

// Theme constants
const theme = {
  colors: {
    primary: {
      main: '#2C2C2C',
      hover: '#1C1C1C',
      light: '#3C3C3C',
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
    lg: '0px 8px 16px rgba(0, 0, 0, 0.15)',
  },
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif',
      secondary: 'Roboto, sans-serif',
    },
  },
};

// Styled Components
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
  paddingTop: '80px', // Navbar 높이만큼 패딩 추가
});

const ContentContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '80px',
  padding: '40px',
});

const LogoSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

const LogoText = styled(Typography)({
  color: theme.colors.text.primary,
  fontSize: '56px',
  fontFamily: theme.typography.fontFamily.primary,
  fontWeight: 600,
  letterSpacing: '-0.5px',
});

const ResetCard = styled(Box)({
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
  '&:hover': {
    background: theme.colors.primary.hover,
    boxShadow: theme.shadows.md,
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Verification, 3: New Password, 4: Success
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.forgotPassword(email);
      // authService에서 이미 개선된 응답을 반환하므로 다음 단계로 진행
      setStep(2);
    } catch (err) {
      console.log('Password reset error details:', err);
      // authService에서 대부분의 경우를 성공으로 처리하므로 실제 에러만 표시
      const errorMessage = err.message || '비밀번호 재설정 요청에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!verificationCode) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await authService.verifyResetCode(email, verificationCode);
      setStep(3);
    } catch (err) {
      setError(err.message || '인증 코드 확인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(newPassword)) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(email, newPassword);
      setStep(4);
    } catch (err) {
      setError(err.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleRequestReset}>
            <StyledTextField
              label="이메일"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: theme.colors.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? '처리 중...' : '인증 코드 받기'}
            </PrimaryButton>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifyCode}>
            <Typography 
              sx={{ 
                marginBottom: '16px', 
                color: theme.colors.text.secondary,
                fontSize: '14px'
              }}
            >
              {email}로 전송된 6자리 인증 코드를 입력해주세요.
            </Typography>
            <StyledTextField
              label="인증 코드"
              variant="outlined"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NumbersIcon sx={{ color: theme.colors.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? '확인 중...' : '인증 코드 확인'}
            </PrimaryButton>
            <Box sx={{ textAlign: 'center', marginTop: '16px' }}>
              <LinkText onClick={() => handleRequestReset({ preventDefault: () => {} })}>
                인증 코드 다시 받기
              </LinkText>
            </Box>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleResetPassword}>
            <StyledTextField
              label="새 비밀번호"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: theme.colors.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <StyledTextField
              label="새 비밀번호 확인"
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: theme.colors.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? '처리 중...' : '비밀번호 변경'}
            </PrimaryButton>
          </form>
        );
      case 4:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ marginBottom: '24px' }}>
              비밀번호가 성공적으로 변경되었습니다.
            </Typography>
            <PrimaryButton onClick={() => navigate('/login')}>
              로그인 페이지로 이동
            </PrimaryButton>
          </Box>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return '비밀번호 찾기';
      case 2:
        return '인증 코드 확인';
      case 3:
        return '새 비밀번호 설정';
      case 4:
        return '비밀번호 변경 완료';
      default:
        return '비밀번호 찾기';
    }
  };

  return (
    <>
      <Navbar />
      <PageContainer>
        <ContentContainer>
          <LogoSection>
            <LogoText>
              또랑또랑
            </LogoText>
          </LogoSection>

          <ResetCard>
            <FormTitle>
              {getStepTitle()}
            </FormTitle>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {renderStepContent()}
            {step < 4 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                marginTop: '24px',
              }}>
                <LinkText onClick={() => navigate('/login')}>
                  로그인 페이지로 돌아가기
                </LinkText>
              </Box>
            )}
          </ResetCard>
        </ContentContainer>
      </PageContainer>
    </>
  );
};

export default ForgotPassword; 