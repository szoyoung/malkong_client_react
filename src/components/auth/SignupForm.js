import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signup, sendVerificationCode, verifyEmail } from '../../store/slices/authSlice';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';

const steps = ['이메일 인증', '회원정보 입력'];

const SignupForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, emailVerified } = useSelector((state) => state.auth);

    const handleSendVerificationCode = async () => {
        const result = await dispatch(sendVerificationCode(email));
        if (!result.error) {
            setCodeSent(true);
        }
    };

    const handleVerifyEmail = async () => {
        const result = await dispatch(verifyEmail({ email, code: verificationCode }));
        if (!result.error) {
            setActiveStep(1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(signup({ email, password, name }));
        if (!result.error) {
            navigate('/login');
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="이메일"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={codeSent}
                        />
                        {!codeSent ? (
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleSendVerificationCode}
                                disabled={loading || !email}
                            >
                                {loading ? <CircularProgress size={24} /> : '인증 코드 전송'}
                            </Button>
                        ) : (
                            <>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="verificationCode"
                                    label="인증 코드"
                                    name="verificationCode"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    onClick={handleVerifyEmail}
                                    disabled={loading || !verificationCode}
                                >
                                    {loading ? <CircularProgress size={24} /> : '인증하기'}
                                </Button>
                            </>
                        )}
                    </Box>
                );
            case 1:
                return (
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="name"
                            label="이름"
                            name="name"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="비밀번호"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || !name || !password}
                        >
                            {loading ? <CircularProgress size={24} /> : '회원가입'}
                        </Button>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    회원가입
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                        {error}
                    </Alert>
                )}
                <Stepper activeStep={activeStep} sx={{ width: '100%', mt: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {renderStepContent(activeStep)}
                <Button
                    fullWidth
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ mt: 2 }}
                >
                    이미 계정이 있으신가요? 로그인
                </Button>
            </Box>
        </Container>
    );
};

export default SignupForm; 