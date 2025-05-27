import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import authService from '../api/authService';

const Navbar = ({ isCollapsed, onToggleSidebar, showSidebarToggle = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux에서 로그인 상태 가져오기
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 로그아웃 처리
      dispatch(logout());
      navigate('/');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div style={{
      width: '100%', 
      height: '70px', 
      left: 0, 
      top: 0, 
      position: 'fixed', 
      background: '#ffffff', // White background
      overflow: 'visible',
      zIndex: 1001,
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)', // Light black border
      boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.1)', // Light shadow
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px'
    }}>
      {/* Left Section - Logo and Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Sidebar Toggle Button */}
        {showSidebarToggle && (
          <div 
            style={{
              width: '32px', 
              height: '32px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '8px',
              background: isCollapsed ? '#f5f5f5' : '#e8e8e8', // Light gray backgrounds
              transition: 'all 0.2s ease',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
            onClick={onToggleSidebar}
            onMouseEnter={(e) => {
              e.target.style.background = '#d0d0d0';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isCollapsed ? '#f5f5f5' : '#e8e8e8';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              width: '16px', 
              height: '16px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', 
              transition: 'transform 0.3s ease'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}

        {/* Logo */}
        <div 
          style={{
            color: '#000000', // Black text
            fontSize: '24px', 
            fontFamily: 'Inter, sans-serif', 
            fontWeight: '700', 
            lineHeight: '32px', 
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          onClick={() => handleNavigation(isAuthenticated ? '/dashboard' : '/')}
          onMouseEnter={(e) => e.target.style.color = '#333333'}
          onMouseLeave={(e) => e.target.style.color = '#000000'}
        >
          또랑또랑
        </div>
      </div>

      {/* Right Section - Navigation Menu */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {isAuthenticated ? (
          // 로그인된 경우: 세팅, 로그아웃 버튼
          <>
            <div 
              style={{
                padding: '8px 16px',
                color: '#666666', // Dark gray text
                fontSize: '16px', 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: '500', 
                cursor: 'pointer',
                borderRadius: '20px',
                transition: 'all 0.2s ease',
                background: 'transparent'
              }}
              onClick={() => handleNavigation('/settings')}
              onMouseEnter={(e) => {
                e.target.style.background = '#f5f5f5';
                e.target.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#666666';
              }}
            >
              Settings
            </div>
            <div 
              style={{
                padding: '8px 16px',
                color: '#ffffff', 
                fontSize: '16px', 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: '500', 
                cursor: 'pointer',
                borderRadius: '20px',
                background: '#000000', // Black button
                transition: 'all 0.2s ease',
                border: 'none'
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.target.style.background = '#333333';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#000000';
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Logout
            </div>
          </>
        ) : (
          // 로그인되지 않은 경우: 로그인, 회원가입 버튼
          <>
            <div 
              style={{
                padding: '8px 16px',
                color: '#666666', // Dark gray text
                fontSize: '16px', 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: '500', 
                cursor: 'pointer',
                borderRadius: '20px',
                transition: 'all 0.2s ease',
                background: 'transparent'
              }}
              onClick={() => handleNavigation('/login')}
              onMouseEnter={(e) => {
                e.target.style.background = '#f5f5f5';
                e.target.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#666666';
              }}
            >
              Login
            </div>
            <div 
              style={{
                padding: '8px 16px',
                color: '#ffffff', 
                fontSize: '16px', 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: '500', 
                cursor: 'pointer',
                borderRadius: '20px',
                background: '#000000', // Black button
                transition: 'all 0.2s ease',
                border: 'none'
              }}
              onClick={() => handleNavigation('/signup')}
              onMouseEnter={(e) => {
                e.target.style.background = '#333333';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#000000';
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Sign Up
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar; 