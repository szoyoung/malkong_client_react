import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuthValidation from '../hooks/useAuthValidation';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // 토큰 유효성 검사 훅 사용 (라우트 검증 포함)
  useAuthValidation();

  // 토큰 존재 여부와 인증 상태 모두 확인
  const token = localStorage.getItem('token');
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute; 