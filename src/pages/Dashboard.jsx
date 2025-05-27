import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CollapsibleSidebar from '../components/CollapsibleSidebar';
import Navbar from '../components/Navbar';
import VideoUploader from '../components/VideoUploader';
import { CameraRecorder as CameraRecorderUtil, formatTime } from '../utils/cameraUtils';
import authService from '../api/authService';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showUploader, setShowUploader] = useState(false);
    const [videoFiles, setVideoFiles] = useState([]);
    const [currentStream, setCurrentStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState(null);
    const [showTokenPanel, setShowTokenPanel] = useState(false);
    const [currentToken, setCurrentToken] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshMessage, setRefreshMessage] = useState('');
    
    const videoRef = useRef(null);
    const recorderRef = useRef(null);
    const timerRef = useRef(null);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // 토큰 관련 함수들
    const loadCurrentToken = () => {
        const token = authService.getToken();
        if (token) {
            setCurrentToken(token);
            
            // 토큰 정보 분석
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const exp = payload.exp;
                const currentTime = Math.floor(Date.now() / 1000);
                const timeLeft = exp - currentTime;
                
                if (timeLeft > 0) {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    console.log(`토큰 만료까지: ${minutes}분 ${seconds}초`);
                    setRefreshMessage(`토큰 만료까지: ${minutes}분 ${seconds}초`);
                } else {
                    console.log('토큰이 만료되었습니다');
                    setRefreshMessage('토큰이 만료되었습니다');
                }
            } catch (e) {
                console.error('토큰 분석 실패:', e);
                setRefreshMessage('토큰 형식 오류');
            }
        } else {
            setCurrentToken('토큰이 없습니다');
            setRefreshMessage('로그인이 필요합니다');
        }
    };

    const refreshAccessToken = async () => {
        setIsRefreshing(true);
        setRefreshMessage('');
        
        try {
            console.log('토큰 재발급 시도 중...');
            
            // 현재 토큰에서 이메일 추출
            const currentTokenValue = authService.getToken();
            if (!currentTokenValue) {
                setRefreshMessage('현재 토큰이 없습니다. 다시 로그인해주세요.');
                setIsRefreshing(false);
                return;
            }

            let email = null;
            try {
                const payload = JSON.parse(atob(currentTokenValue.split('.')[1]));
                email = payload.sub;
                console.log('토큰에서 추출한 이메일:', email);
            } catch (e) {
                console.error('토큰 파싱 실패:', e);
                setRefreshMessage('토큰 형식이 올바르지 않습니다.');
                setIsRefreshing(false);
                return;
            }

            if (!email) {
                setRefreshMessage('토큰에서 이메일을 찾을 수 없습니다.');
                setIsRefreshing(false);
                return;
            }

            // 리프레시 토큰으로 새 액세스 토큰 요청
            const response = await fetch(`http://localhost:8080/api/oauth2/refresh?email=${encodeURIComponent(email)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            console.log('응답 상태:', response.status);

            if (response.status === 200) {
                const data = await response.json();
                if (data.accessToken) {
                    localStorage.setItem('token', data.accessToken);
                    setCurrentToken(data.accessToken);
                    setRefreshMessage('토큰이 성공적으로 재발급되었습니다.');
                    console.log('토큰 재발급 성공');
                } else {
                    setRefreshMessage('서버에서 새 토큰을 받지 못했습니다.');
                }
            } else if (response.status === 401) {
                const errorData = await response.json();
                if (errorData.error === 'refresh_token_expired') {
                    setRefreshMessage('리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.');
                } else {
                    setRefreshMessage('토큰 재발급에 실패했습니다.');
                }
            } else {
                setRefreshMessage(`토큰 재발급 실패 (${response.status})`);
            }

        } catch (error) {
            console.error('Token refresh error:', error);
            setRefreshMessage(`토큰 재발급 실패: ${error.message}`);
        } finally {
            setIsRefreshing(false);
        }
    };

    const copyTokenToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(currentToken);
            setRefreshMessage('토큰이 클립보드에 복사되었습니다.');
            setTimeout(() => setRefreshMessage(''), 3000);
        } catch (error) {
            setRefreshMessage('클립보드 복사에 실패했습니다.');
        }
    };

    // 컴포넌트 마운트 시 현재 토큰 로드
    useEffect(() => {
        if (showTokenPanel) {
            loadCurrentToken();
        }
    }, [showTokenPanel]);

    // 카메라 녹화 관련 함수들
    useEffect(() => {
        recorderRef.current = new CameraRecorderUtil();
        
        return () => {
            if (recorderRef.current) {
                recorderRef.current.cancelRecording();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            setError(null);
            
            const result = await recorderRef.current.startRecording();
            
            if (result.success) {
                setIsRecording(true);
                setRecordingTime(0);
                setCurrentStream(result.stream);
                
                // 오디오 트랙 확인
                const audioTracks = result.stream.getAudioTracks();
                if (audioTracks.length === 0) {
                    setError('마이크가 감지되지 않았습니다. 오디오 없이 녹화됩니다.');
                } else {
                    console.log('오디오 녹화 준비 완료');
                }
                
                // 성능 최적화된 타이머 (부드러운 업데이트)
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
                
                // 메모리 정리를 위한 가비지 컬렉션 힌트
                if (window.gc) {
                    setTimeout(() => window.gc(), 1000);
                }
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const stopRecording = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        const result = await recorderRef.current.stopRecording();
        setIsRecording(false);
        setCurrentStream(null);
        
        if (result) {
            // 녹화 완료 처리
            const newVideoFile = {
                id: Date.now(),
                name: `camera_recording_${Date.now()}.webm`,
                blob: result.blob,
                url: result.url,
                type: 'recording',
                createdAt: new Date()
            };
            
            setVideoFiles(prev => [...prev, newVideoFile]);
            
            // 분석 페이지로 이동
            navigate('/video-analysis', { 
                state: { 
                    videoData: newVideoFile 
                } 
            });
        }
    };

    const cancelRecording = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        recorderRef.current.cancelRecording();
        setIsRecording(false);
        setRecordingTime(0);
        setCurrentStream(null);
        setError(null);
    };



    const handleFileUpload = async (file) => {
        try {
            // 여기서 서버로 파일을 업로드할 수 있습니다
            console.log('파일 업로드:', file);
            
            // 임시로 로컬 상태에 저장
            const newVideoFile = {
                id: Date.now(),
                name: file.name,
                file: file,
                url: URL.createObjectURL(file),
                type: 'upload',
                createdAt: new Date()
            };
            
            setVideoFiles(prev => [...prev, newVideoFile]);
            setShowUploader(false);
            
            // 분석 페이지로 이동
            navigate('/video-analysis', { 
                state: { 
                    videoData: newVideoFile 
                } 
            });
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            throw new Error('파일 업로드 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        if (currentStream && videoRef.current) {
            videoRef.current.srcObject = currentStream;
        }
    }, [currentStream]);

    return (
        <div style={{
            width: '100%', 
            height: '100vh', 
            position: 'relative', 
            background: 'white', 
            overflow: 'hidden'
        }}>
            {/* New Navbar with sidebar toggle */}
            <Navbar 
                isCollapsed={isSidebarCollapsed}
                onToggleSidebar={toggleSidebar}
                showSidebarToggle={true}
            />

            {/* Collapsible Sidebar */}
            <CollapsibleSidebar 
                isCollapsed={isSidebarCollapsed}
            />

            {/* Main Video Area - 카메라 녹화 표시 영역 */}
            <div style={{
                width: 691, 
                height: 518, 
                left: isSidebarCollapsed ? 362 : 565, 
                top: 150, // Adjusted for smaller navbar height (70px + margin)
                position: 'absolute', 
                background: '#000000', 
                borderRadius: 20,
                transition: 'left 0.3s ease-in-out',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {currentStream ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 20,
                                transform: 'scaleX(-1)', // 거울 효과 (전면 카메라처럼)
                                willChange: 'transform', // GPU 가속 최적화
                                backfaceVisibility: 'hidden' // 렌더링 최적화
                            }}
                        />
                        
                        {/* 녹화 상태 오버레이 */}
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: '#ffffff',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            {isRecording && (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#ff4444',
                                    borderRadius: '50%',
                                    animation: 'pulse 1s infinite'
                                }} />
                            )}
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                {isRecording ? `REC ${formatTime(recordingTime)}` : 'READY'}
                            </span>
                        </div>
                    </>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        color: '#ffffff',
                        fontSize: '18px'
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px'
                        }}>
                            📹
                        </div>
                        <div>카메라 녹화를 시작하면 여기에 표시됩니다</div>
                        
                        {error && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: 'rgba(255, 68, 68, 0.2)',
                                borderRadius: '8px',
                                color: '#ff4444',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Button - enhanced with click handler */}
            <div 
                onClick={() => setShowUploader(true)}
                data-has-icon-end="false" 
                data-has-icon-start="false" 
                data-size="Medium" 
                data-state="Default" 
                data-variant="Primary" 
                style={{
                    width: 91, 
                    height: 45, 
                    padding: 12, 
                    left: isSidebarCollapsed ? 962 : 1165, 
                    top: 680, // Adjusted for smaller navbar height
                    position: 'absolute', 
                    background: '#2C2C2C', 
                    overflow: 'hidden', 
                    borderRadius: 15, 
                    outline: '1px #2C2C2C solid', 
                    outlineOffset: '-1px', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: 8, 
                    display: 'inline-flex',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#404040';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0px 4px 12px rgba(44, 44, 44, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = '#2C2C2C';
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                }}
            >
                <div style={{
                    color: '#F5F5F5', 
                    fontSize: 16, 
                    fontFamily: 'Inter', 
                    fontWeight: '400', 
                    lineHeight: 16, 
                    wordWrap: 'break-word'
                }}>
                    Upload
                </div>
            </div>

            {/* Record Button - enhanced with click handler */}
            <div 
                onClick={isRecording ? stopRecording : startRecording}
                data-has-icon-end="false" 
                data-has-icon-start="false" 
                data-size="Medium" 
                data-state="Default" 
                data-variant="Primary" 
                style={{
                    width: 85, 
                    height: 45, 
                    padding: 12, 
                    left: isSidebarCollapsed ? 868 : 1070, 
                    top: 680, // Adjusted for smaller navbar height
                    position: 'absolute', 
                    background: isRecording ? '#000000' : '#EC221F', 
                    overflow: 'hidden', 
                    borderRadius: 15, 
                    outline: `1px ${isRecording ? '#000000' : '#EC221F'} solid`, 
                    outlineOffset: '-1px', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: 8, 
                    display: 'inline-flex',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                    if (isRecording) {
                        e.target.style.background = '#333333';
                    } else {
                        e.target.style.background = '#ff3333';
                    }
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0px 4px 12px rgba(${isRecording ? '0, 0, 0' : '236, 34, 31'}, 0.3)`;
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = isRecording ? '#000000' : '#EC221F';
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                }}
            >
                <div style={{
                    color: '#F5F5F5', 
                    fontSize: 16, 
                    fontFamily: 'Inter', 
                    fontWeight: '400', 
                    lineHeight: 16, 
                    wordWrap: 'break-word'
                }}>
                    {isRecording ? 'Stop' : 'Record'}
                </div>
            </div>

            {/* Cancel Button - 녹화 중일 때만 표시 */}
            {isRecording && (
                <div 
                    onClick={cancelRecording}
                    style={{
                        width: 85, 
                        height: 45, 
                        padding: 12, 
                        left: isSidebarCollapsed ? 775 : 977, 
                        top: 680,
                        position: 'absolute', 
                        background: '#666666', 
                        overflow: 'hidden', 
                        borderRadius: 15, 
                        outline: '1px #666666 solid', 
                        outlineOffset: '-1px', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                        display: 'inline-flex',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#888888';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0px 4px 12px rgba(102, 102, 102, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#666666';
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    <div style={{
                        color: '#F5F5F5', 
                        fontSize: 16, 
                        fontFamily: 'Inter', 
                        fontWeight: '400', 
                        lineHeight: 16, 
                        wordWrap: 'break-word'
                    }}>
                        Cancel
                    </div>
                </div>
            )}

            {/* Token Panel Button */}
            <div 
                onClick={() => setShowTokenPanel(!showTokenPanel)}
                style={{
                    width: 100, 
                    height: 45, 
                    padding: 12, 
                    left: isSidebarCollapsed ? 565 : 768, 
                    top: 680,
                    position: 'absolute', 
                    background: '#4CAF50', 
                    overflow: 'hidden', 
                    borderRadius: 15, 
                    outline: '1px #4CAF50 solid', 
                    outlineOffset: '-1px', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: 8, 
                    display: 'inline-flex',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#45a049';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0px 4px 12px rgba(76, 175, 80, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = '#4CAF50';
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = 'none';
                }}
            >
                <div style={{
                    color: '#F5F5F5', 
                    fontSize: 16, 
                    fontFamily: 'Inter', 
                    fontWeight: '400', 
                    lineHeight: 16, 
                    wordWrap: 'break-word'
                }}>
                    Token
                </div>
            </div>

            {/* Token Panel */}
            {showTokenPanel && (
                <div style={{
                    position: 'absolute',
                    left: isSidebarCollapsed ? 362 : 565,
                    top: 730,
                    width: 691,
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                    padding: '20px',
                    border: '1px solid #e9ecef',
                    transition: 'left 0.3s ease-in-out',
                    zIndex: 1000
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#000000',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            액세스 토큰 관리
                        </h3>
                        <button
                            onClick={() => setShowTokenPanel(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                color: '#666666',
                                padding: '4px'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{
                        marginBottom: '16px'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#333333',
                            marginBottom: '8px',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            현재 액세스 토큰:
                        </label>
                        <div style={{
                            display: 'flex',
                            gap: '8px'
                        }}>
                            <textarea
                                value={currentToken}
                                readOnly
                                style={{
                                    flex: 1,
                                    height: '80px',
                                    padding: '12px',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                    backgroundColor: '#f8f9fa',
                                    color: '#333333',
                                    resize: 'none',
                                    wordBreak: 'break-all'
                                }}
                                placeholder="토큰이 없습니다"
                            />
                            <button
                                onClick={copyTokenToClipboard}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#6c757d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#5a6268';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#6c757d';
                                }}
                            >
                                복사
                            </button>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={refreshAccessToken}
                            disabled={isRefreshing}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: isRefreshing ? '#cccccc' : '#007bff',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!isRefreshing) {
                                    e.target.style.backgroundColor = '#0056b3';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isRefreshing) {
                                    e.target.style.backgroundColor = '#007bff';
                                }
                            }}
                        >
                            {isRefreshing ? '재발급 중...' : '토큰 재발급'}
                        </button>

                        <button
                            onClick={loadCurrentToken}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#218838';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#28a745';
                            }}
                        >
                            새로고침
                        </button>
                    </div>

                    {refreshMessage && (
                        <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: 
                                refreshMessage.includes('성공') ? '#d4edda' :
                                refreshMessage.includes('실패') || refreshMessage.includes('만료') || refreshMessage.includes('오류') ? '#f8d7da' :
                                refreshMessage.includes('복사') ? '#d1ecf1' : '#fff3cd',
                            color: 
                                refreshMessage.includes('성공') ? '#155724' :
                                refreshMessage.includes('실패') || refreshMessage.includes('만료') || refreshMessage.includes('오류') ? '#721c24' :
                                refreshMessage.includes('복사') ? '#0c5460' : '#856404',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontFamily: 'Inter, sans-serif',
                            border: `1px solid ${
                                refreshMessage.includes('성공') ? '#c3e6cb' :
                                refreshMessage.includes('실패') || refreshMessage.includes('만료') || refreshMessage.includes('오류') ? '#f5c6cb' :
                                refreshMessage.includes('복사') ? '#bee5eb' : '#ffeaa7'
                            }`
                        }}>
                            {refreshMessage}
                        </div>
                    )}
                </div>
            )}

            {/* Video Files List - 업로드된/녹화된 파일들 표시 */}
            {videoFiles.length > 0 && (
                <div style={{
                    position: 'absolute',
                    right: '20px',
                    top: '100px',
                    width: '300px',
                    maxHeight: '400px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    padding: '16px',
                    overflowY: 'auto'
                }}>
                    <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#000000'
                    }}>
                        비디오 파일 ({videoFiles.length})
                    </h3>
                    
                    {videoFiles.map((file) => (
                        <div key={file.id} style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '8px',
                            border: '1px solid #e9ecef'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#000000',
                                marginBottom: '4px'
                            }}>
                                {file.name}
                            </div>
                            
                            <div style={{
                                fontSize: '12px',
                                color: '#666666',
                                marginBottom: '8px'
                            }}>
                                {file.type === 'recording' ? '📹 녹화' : '📁 업로드'} • {file.createdAt.toLocaleTimeString()}
                            </div>
                            
                            <video 
                                controls 
                                src={file.url}
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    borderRadius: '4px',
                                    backgroundColor: '#000000'
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Video Uploader Modal */}
            {showUploader && (
                <VideoUploader
                    onFileUpload={handleFileUpload}
                    onClose={() => setShowUploader(false)}
                />
            )}
            
            {/* CSS 애니메이션 */}
            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default Dashboard; 