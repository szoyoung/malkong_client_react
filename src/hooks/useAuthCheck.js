import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function useAuthCheck(redirectPath = '/dashboard') {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      navigate(redirectPath, { replace: true });
      return;
    }
    if (token && !isAuthenticated) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp > currentTime) {
            navigate(redirectPath, { replace: true });
            return;
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, [navigate, isAuthenticated, redirectPath]);
} 