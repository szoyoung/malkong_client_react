import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CollapsibleSidebar from '../components/CollapsibleSidebar';
import HexagonChart from '../components/HexagonChart';

const VideoAnalysis = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [videoData, setVideoData] = useState(null);

    const [analysisData, setAnalysisData] = useState({
        scores: {
            voice: 85,
            speed: 72,
            gesture: 90,
            eyeContact: 68,
            confidence: 78,
            clarity: 82
        },
        details: [
            {
                title: '음성 분석',
                score: 85,
                description: '목소리 톤과 발음이 명확하고 안정적입니다.',
                suggestions: ['더 다양한 톤 변화를 시도해보세요', '감정 표현을 풍부하게 해보세요']
            },
            {
                title: '말하기 속도',
                score: 72,
                description: '적절한 속도로 말하고 있지만 일부 구간에서 빨라집니다.',
                suggestions: ['중요한 부분에서는 천천히 말해보세요', '쉼표 부분에서 잠시 멈춰보세요']
            },
            {
                title: '제스처',
                score: 90,
                description: '자연스럽고 효과적인 손동작을 사용하고 있습니다.',
                suggestions: ['현재 수준을 유지하세요', '더 큰 제스처로 강조해보세요']
            },
            {
                title: '시선 처리',
                score: 68,
                description: '카메라를 보는 시간이 부족합니다.',
                suggestions: ['카메라를 더 자주 바라보세요', '청중과의 아이컨택을 의식해보세요']
            },
            {
                title: '자신감',
                score: 78,
                description: '전반적으로 안정적이지만 개선의 여지가 있습니다.',
                suggestions: ['어깨를 펴고 당당한 자세를 유지하세요', '목소리에 확신을 담아보세요']
            },
            {
                title: '명확성',
                score: 82,
                description: '내용 전달이 명확하고 이해하기 쉽습니다.',
                suggestions: ['핵심 메시지를 더 강조해보세요', '예시를 활용해보세요']
            }
        ],
        transcript: {
            fullText: "안녕하세요, 오늘 발표를 시작하겠습니다. 저희가 준비한 프로젝트는 AI 기반의 발표 연습 서비스입니다. 이 서비스는 사용자의 발표 영상을 분석하여 음성, 제스처, 시선 처리 등 다양한 요소를 평가합니다. 첫 번째로 음성 분석 기능에 대해 말씀드리겠습니다. 우리 시스템은 사용자의 목소리 톤, 발음의 명확성, 말하기 속도를 실시간으로 분석합니다. 두 번째로는 제스처 분석입니다. 손동작과 몸짓을 통해 발표의 효과성을 측정합니다. 마지막으로 시선 처리 분석을 통해 청중과의 아이컨택 정도를 평가합니다. 이러한 종합적인 분석을 통해 사용자는 자신의 발표 능력을 객관적으로 파악하고 개선할 수 있습니다. 감사합니다.",
            segments: [
                {
                    startTime: 0,
                    endTime: 3.5,
                    text: "안녕하세요, 오늘 발표를 시작하겠습니다.",
                    confidence: 0.95
                },
                {
                    startTime: 3.5,
                    endTime: 8.2,
                    text: "저희가 준비한 프로젝트는 AI 기반의 발표 연습 서비스입니다.",
                    confidence: 0.92
                },
                {
                    startTime: 8.2,
                    endTime: 14.1,
                    text: "이 서비스는 사용자의 발표 영상을 분석하여 음성, 제스처, 시선 처리 등 다양한 요소를 평가합니다.",
                    confidence: 0.89
                },
                {
                    startTime: 14.1,
                    endTime: 18.3,
                    text: "첫 번째로 음성 분석 기능에 대해 말씀드리겠습니다.",
                    confidence: 0.94
                },
                {
                    startTime: 18.3,
                    endTime: 25.7,
                    text: "우리 시스템은 사용자의 목소리 톤, 발음의 명확성, 말하기 속도를 실시간으로 분석합니다.",
                    confidence: 0.91
                },
                {
                    startTime: 25.7,
                    endTime: 30.2,
                    text: "두 번째로는 제스처 분석입니다.",
                    confidence: 0.96
                },
                {
                    startTime: 30.2,
                    endTime: 35.8,
                    text: "손동작과 몸짓을 통해 발표의 효과성을 측정합니다.",
                    confidence: 0.88
                },
                {
                    startTime: 35.8,
                    endTime: 42.1,
                    text: "마지막으로 시선 처리 분석을 통해 청중과의 아이컨택 정도를 평가합니다.",
                    confidence: 0.90
                },
                {
                    startTime: 42.1,
                    endTime: 50.5,
                    text: "이러한 종합적인 분석을 통해 사용자는 자신의 발표 능력을 객관적으로 파악하고 개선할 수 있습니다.",
                    confidence: 0.93
                },
                {
                    startTime: 50.5,
                    endTime: 52.0,
                    text: "감사합니다.",
                    confidence: 0.97
                }
            ]
        }
    });

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    useEffect(() => {
        // URL에서 비디오 데이터를 받아오거나 localStorage에서 가져오기
        if (location.state?.videoData) {
            setVideoData(location.state.videoData);
        }
    }, [location]);

    const getScoreColor = (score) => {
        if (score >= 80) return '#4CAF50'; // 녹색
        if (score >= 60) return '#FF9800'; // 주황색
        return '#F44336'; // 빨간색
    };

    const getScoreText = (score) => {
        if (score >= 80) return '우수';
        if (score >= 60) return '보통';
        return '개선 필요';
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            position: 'relative',
            background: 'white',
            overflow: 'hidden'
        }}>
            {/* Navbar */}
            <Navbar 
                isCollapsed={isSidebarCollapsed}
                onToggleSidebar={toggleSidebar}
                showSidebarToggle={true}
            />

            {/* Collapsible Sidebar */}
            <CollapsibleSidebar 
                isCollapsed={isSidebarCollapsed}
            />

            {/* Main Content Area */}
            <div style={{
                marginLeft: isSidebarCollapsed ? 0 : 427,
                marginTop: 70,
                height: 'calc(100vh - 70px)',
                transition: 'margin-left 0.3s ease-in-out',
                display: 'flex'
            }}>
                {/* Video and Analysis Content */}
                <div style={{
                    flex: 1,
                    padding: '30px',
                    overflowY: 'auto'
                }}>
                    {/* Header */}
                    <div style={{
                        marginBottom: '30px'
                    }}>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#000000',
                            margin: '0 0 10px 0',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            발표 분석 결과
                        </h1>
                        <p style={{
                            fontSize: '16px',
                            color: '#666666',
                            margin: 0,
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            AI가 분석한 당신의 발표 능력을 확인해보세요
                        </p>
                    </div>

                    {/* Video Player */}
                    <div style={{
                        width: '100%',
                        maxWidth: '800px',
                        marginBottom: '40px'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '450px',
                            backgroundColor: '#000000',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            {videoData ? (
                                <video
                                    controls
                                    src={videoData.url}
                                    onLoadedMetadata={(e) => {
                                        const video = e.target;
                                        const hasAudio = video.mozHasAudio || 
                                                        Boolean(video.webkitAudioDecodedByteCount) || 
                                                        Boolean(video.audioTracks && video.audioTracks.length);
                                        console.log('비디오 오디오 포함 여부:', hasAudio);
                                        if (!hasAudio) {
                                            console.warn('이 비디오에는 오디오가 포함되어 있지 않습니다.');
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '12px'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    color: '#ffffff',
                                    fontSize: '18px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎥</div>
                                    <div>분석된 영상이 여기에 표시됩니다</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Overall Score */}
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '30px',
                        border: '1px solid #e9ecef'
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#000000',
                            margin: '0 0 16px 0',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            종합 점수
                        </h3>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                fontWeight: '700',
                                color: getScoreColor(Math.round(Object.values(analysisData.scores).reduce((a, b) => a + b, 0) / 6))
                            }}>
                                {Math.round(Object.values(analysisData.scores).reduce((a, b) => a + b, 0) / 6)}점
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    color: '#000000',
                                    marginBottom: '4px'
                                }}>
                                    {getScoreText(Math.round(Object.values(analysisData.scores).reduce((a, b) => a + b, 0) / 6))}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#666666'
                                }}>
                                    전체 평균 점수
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#2C2C2C',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1C1C1C';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#2C2C2C';
                        }}
                    >
                        대시보드로 돌아가기
                    </button>
                </div>

                {/* Right Sidebar - Analysis Results */}
                <div style={{
                    width: '400px',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    borderLeft: '1px solid #e9ecef',
                    overflowY: 'auto',
                    padding: '30px 20px'
                }}>
                    {/* Hexagon Chart */}
                    <HexagonChart 
                        data={analysisData.scores} 
                        transcriptData={analysisData.transcript}
                        analysisDetails={analysisData.details}
                    />


                </div>
            </div>
        </div>
    );
};

export default VideoAnalysis; 