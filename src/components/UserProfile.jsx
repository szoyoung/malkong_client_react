import React from 'react';
import { Box, Typography, Avatar, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserInfo } from '../store/slices/authSlice';

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  fontSize: '2rem',
  backgroundColor: theme.palette.primary.main
}));

const UserProfile = () => {
  // Use Redux store for user data
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  const handleRefresh = () => {
    dispatch(fetchUserInfo());
  };

  if (!user) {
    return (
      <ProfileContainer>
        <Typography>사용자 정보를 찾을 수 없습니다.</Typography>
        <Button variant="contained" onClick={handleRefresh}>
          새로고침
        </Button>
      </ProfileContainer>
    );
  }

  // Get first letter of name or email for avatar
  const avatarText = user.name 
    ? user.name.charAt(0).toUpperCase() 
    : user.email.charAt(0).toUpperCase();

  return (
    <ProfileContainer>
      <UserAvatar>{avatarText}</UserAvatar>
      
      <Typography variant="h5">
        {user.name || '이름 없음'}
      </Typography>
      
      <Typography variant="body1" color="textSecondary">
        {user.email}
      </Typography>
      
      {user.id && (
        <Typography variant="body2" color="textSecondary">
          ID: {user.id}
        </Typography>
      )}
      
      {user.provider && (
        <Typography variant="body2" color="textSecondary">
          Provider: {user.provider}
        </Typography>
      )}

      <Button 
        variant="outlined" 
        onClick={handleRefresh}
        sx={{ mt: 2 }}
      >
        정보 새로고침
      </Button>
    </ProfileContainer>
  );
};

export default UserProfile; 