import React, { useEffect, useRef, useState } from 'react';

const HexagonChart = ({ data, transcriptData, analysisDetails }) => {
    const canvasRef = useRef(null);
    const [activeView, setActiveView] = useState('chart'); // 'chart' 또는 'transcript'
    
    const labels = {
        voice: '음성',
        speed: '속도',
        gesture: '제스처',
        eyeContact: '시선',
        confidence: '자신감',
        clarity: '명확성'
    };

    const colors = {
        background: '#f8f9fa',
        grid: '#e9ecef',
        data: '#2C2C2C',
        dataFill: 'rgba(44, 44, 44, 0.2)',
        text: '#000000'
    };



    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 60;
        const sides = 6;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Helper function to get point on hexagon
        const getHexPoint = (index, radiusMultiplier = 1) => {
            const angle = (index * 2 * Math.PI) / sides - Math.PI / 2;
            return {
                x: centerX + Math.cos(angle) * radius * radiusMultiplier,
                y: centerY + Math.sin(angle) * radius * radiusMultiplier
            };
        };

        // Draw grid lines (concentric hexagons)
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        
        for (let level = 0.2; level <= 1; level += 0.2) {
            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const point = getHexPoint(i, level);
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
            ctx.stroke();
        }

        // Draw axis lines
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        for (let i = 0; i < sides; i++) {
            const point = getHexPoint(i);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        }

        // Draw data polygon
        const dataKeys = Object.keys(data);
        ctx.strokeStyle = colors.data;
        ctx.fillStyle = colors.dataFill;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        dataKeys.forEach((key, index) => {
            const value = data[key] / 100; // Normalize to 0-1
            const point = getHexPoint(index, value);
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw data points
        ctx.fillStyle = colors.data;
        dataKeys.forEach((key, index) => {
            const value = data[key] / 100;
            const point = getHexPoint(index, value);
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = colors.text;
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        dataKeys.forEach((key, index) => {
            const point = getHexPoint(index, 1.2);
            const label = labels[key] || key;
            const score = data[key];
            
            // Draw label
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText(label, point.x, point.y - 8);
            
            // Draw score
            ctx.font = '12px Inter, sans-serif';
            ctx.fillStyle = score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336';
            ctx.fillText(`${score}점`, point.x, point.y + 8);
        });

        // Draw center score
        const averageScore = Math.round(Object.values(data).reduce((a, b) => a + b, 0) / dataKeys.length);
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${averageScore}`, centerX, centerY - 5);
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('평균', centerX, centerY + 10);

    }, [data, activeView]);

    return (
        <div style={{
            width: '100%',
            backgroundColor: colors.background,
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            overflow: 'hidden'
        }}>
            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #e9ecef',
                backgroundColor: '#ffffff'
            }}>
                <button
                    onClick={() => setActiveView('chart')}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: activeView === 'chart' ? '2px solid #2C2C2C' : '2px solid transparent',
                        fontSize: '14px',
                        fontWeight: activeView === 'chart' ? '600' : '400',
                        color: activeView === 'chart' ? '#2C2C2C' : '#666666',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        if (activeView !== 'chart') {
                            e.target.style.color = '#2C2C2C';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeView !== 'chart') {
                            e.target.style.color = '#666666';
                        }
                    }}
                >
                    📊 능력치 분석
                </button>
                <button
                    onClick={() => setActiveView('transcript')}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: activeView === 'transcript' ? '2px solid #2C2C2C' : '2px solid transparent',
                        fontSize: '14px',
                        fontWeight: activeView === 'transcript' ? '600' : '400',
                        color: activeView === 'transcript' ? '#2C2C2C' : '#666666',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        if (activeView !== 'transcript') {
                            e.target.style.color = '#2C2C2C';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeView !== 'transcript') {
                            e.target.style.color = '#666666';
                        }
                    }}
                >
                    📝 발표 대본
                </button>
            </div>

            {/* Content Area */}
            <div style={{
                padding: '20px',
                height: 'calc(100vh - 200px)', // 전체 높이에서 네비게이션과 패딩을 뺀 높이
                overflowY: 'auto'
            }}>
                {activeView === 'chart' ? (
                    // Hexagon Chart and Analysis View
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Hexagon Chart */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '280px',
                            marginBottom: '20px',
                            flexShrink: 0
                        }}>
                            <canvas
                                ref={canvasRef}
                                width={350}
                                height={300}
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto'
                                }}
                            />
                        </div>

                        {/* Detailed Analysis */}
                        {analysisDetails && (
                            <>
                                <h4 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#000000',
                                    margin: '0 0 16px 0',
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    세부 분석
                                </h4>
                                
                                <div style={{
                                    flex: 1,
                                    overflowY: 'auto'
                                }}>
                                    {analysisDetails.map((item, index) => (
                                        <div key={index} style={{
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            marginBottom: '12px',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }}>
                                                <h5 style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#000000',
                                                    margin: 0,
                                                    fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    {item.title}
                                                </h5>
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    color: item.score >= 80 ? '#4CAF50' : item.score >= 60 ? '#FF9800' : '#F44336'
                                                }}>
                                                    {item.score}점
                                                </span>
                                            </div>
                                            
                                            <p style={{
                                                fontSize: '13px',
                                                color: '#666666',
                                                margin: '0 0 12px 0',
                                                lineHeight: '1.4'
                                            }}>
                                                {item.description}
                                            </p>
                                            
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#888888'
                                            }}>
                                                <strong>개선 제안:</strong>
                                                <ul style={{
                                                    margin: '4px 0 0 0',
                                                    paddingLeft: '16px'
                                                }}>
                                                    {item.suggestions.map((suggestion, idx) => (
                                                        <li key={idx} style={{ marginBottom: '2px' }}>
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // Transcript View
                    <>
                        {transcriptData ? (
                            <div style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                padding: '20px',
                                border: '1px solid #e9ecef',
                                height: '100%',
                                overflowY: 'auto'
                            }}>
                                <p style={{
                                    fontSize: '16px',
                                    color: '#333333',
                                    lineHeight: '1.8',
                                    margin: 0,
                                    fontFamily: 'Inter, sans-serif',
                                    textAlign: 'justify'
                                }}>
                                    {transcriptData.fullText}
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                color: '#666666',
                                fontSize: '16px',
                                padding: '40px 20px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    fontSize: '48px',
                                    marginBottom: '16px'
                                }}>
                                    📝
                                </div>
                                <div>대본 데이터가 없습니다</div>
                                <div style={{
                                    fontSize: '14px',
                                    marginTop: '8px'
                                }}>
                                    음성이 포함된 영상을 업로드하면 STT 분석 결과를 확인할 수 있습니다.
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HexagonChart; 