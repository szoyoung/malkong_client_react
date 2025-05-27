import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Container,
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Divider,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Avatar,
    IconButton
} from '@mui/material';
import {
    Edit as EditIcon,
    Security as SecurityIcon,
    AccountCircle as AccountIcon,
    Notifications as NotificationsIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import authService from '../api/authService';
import { logout } from '../store/slices/authSlice';

const Settings = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    
    // 사용자 정보 상태
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        provider: 'LOCAL'
    });
    
    // 비밀번호 변경 상태
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // UI 상태
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    // 알림 설정
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        marketing: false
    });

    useEffect(() => {
        if (user) {
            setUserInfo({
                name: user.name || '',
                email: user.email || '',
                provider: user.provider || 'LOCAL'
            });
        }
    }, [user]);

    const handleProfileUpdate = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        
        try {
            await authService.updateProfile(userInfo);
            setMessage('프로필이 성공적으로 업데이트되었습니다.');
            setIsEditingProfile(false);
        } catch (err) {
            setError(err.message || '프로필 업데이트에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');
        
        try {
            await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
            setMessage('비밀번호가 성공적으로 변경되었습니다.');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError(err.message || '비밀번호 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccountDelete = async () => {
        setLoading(true);
        try {
            await authService.deleteAccount();
            dispatch(logout());
            setMessage('계정이 성공적으로 삭제되었습니다.');
        } catch (err) {
            setError(err.message || '계정 삭제에 실패했습니다.');
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    const isGoogleUser = userInfo.provider === 'GOOGLE';

    return (
        <>
            <Navbar showSidebarToggle={false} />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4, paddingTop: '80px' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    설정
                </Typography>

                {message && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* 프로필 설정 */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <AccountIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">프로필 정보</Typography>
                                    {!isEditingProfile && (
                                        <IconButton 
                                            onClick={() => setIsEditingProfile(true)}
                                            sx={{ ml: 'auto' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </Box>

                                <Box display="flex" alignItems="center" mb={3}>
                                    <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
                                        {userInfo.name?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">{userInfo.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {userInfo.email}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {isGoogleUser ? 'Google 계정' : '일반 계정'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {isEditingProfile ? (
                                    <Box>
                                        <TextField
                                            fullWidth
                                            label="이름"
                                            value={userInfo.name}
                                            onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                                            margin="normal"
                                        />
                                        <TextField
                                            fullWidth
                                            label="이메일"
                                            value={userInfo.email}
                                            disabled
                                            margin="normal"
                                            helperText="이메일은 변경할 수 없습니다."
                                        />
                                        <Box mt={2}>
                                            <Button
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                onClick={handleProfileUpdate}
                                                disabled={loading}
                                                sx={{ mr: 1 }}
                                            >
                                                저장
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CancelIcon />}
                                                onClick={() => setIsEditingProfile(false)}
                                            >
                                                취소
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : null}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 비밀번호 변경 (일반 계정만) */}
                    {!isGoogleUser && (
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <SecurityIcon sx={{ mr: 1 }} />
                                        <Typography variant="h6">비밀번호 변경</Typography>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="현재 비밀번호"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="새 비밀번호"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        margin="normal"
                                    />
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label="새 비밀번호 확인"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        margin="normal"
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handlePasswordChange}
                                        disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                                        sx={{ mt: 2 }}
                                    >
                                        비밀번호 변경
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* 알림 설정 */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <NotificationsIcon sx={{ mr: 1 }} />
                                    <Typography variant="h6">알림 설정</Typography>
                                </Box>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifications.email}
                                            onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                                        />
                                    }
                                    label="이메일 알림"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifications.push}
                                            onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                                        />
                                    }
                                    label="푸시 알림"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifications.marketing}
                                            onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})}
                                        />
                                    }
                                    label="마케팅 알림"
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 계정 삭제 */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="error" gutterBottom>
                                    위험 구역
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    계정 삭제
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* 계정 삭제 확인 다이얼로그 */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>계정 삭제 확인</DialogTitle>
                    <DialogContent>
                        <Typography>
                            정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 
                            모든 데이터가 영구적으로 삭제됩니다.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>
                            취소
                        </Button>
                        <Button 
                            onClick={handleAccountDelete} 
                            color="error" 
                            disabled={loading}
                        >
                            삭제
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
};

export default Settings; 