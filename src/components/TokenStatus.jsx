import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Paper } from '@mui/material';
import useAuthValidation from '../hooks/useAuthValidation';

const TokenStatus = () => {
  const { isAuthenticated, token } = useSelector(state => state.auth);
  const { validateToken } = useAuthValidation(true); // 자동 검증 비활성화
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleManualValidation = async () => {
    setIsValidating(true);
    try {
      const result = await validateToken();
      setValidationResult(result);
    } catch (error) {
      setValidationResult(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Paper sx={{ p: 2, m: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        토큰 상태 (디버깅용)
      </Typography>
      
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>인증 상태:</strong> {isAuthenticated ? '인증됨' : '인증되지 않음'}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>토큰 존재:</strong> {localStorage.getItem('token') ? '있음' : '없음'}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Redux 토큰:</strong> {token ? '있음' : '없음'}
        </Typography>
      </Box>
      
      <Button 
        variant="outlined" 
        onClick={handleManualValidation}
        disabled={isValidating}
        sx={{ mb: 1 }}
      >
        {isValidating ? '검증 중...' : '토큰 검증'}
      </Button>
      
      {validationResult !== null && (
        <Typography 
          variant="body2" 
          color={validationResult ? 'success.main' : 'error.main'}
        >
          검증 결과: {validationResult ? '유효함' : '유효하지 않음'}
        </Typography>
      )}
    </Paper>
  );
};

export default TokenStatus; 