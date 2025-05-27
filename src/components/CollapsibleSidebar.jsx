import React, { useState } from 'react';

const CollapsibleSidebar = ({ isCollapsed }) => {
    const [isPrivateExpanded, setIsPrivateExpanded] = useState(true);
    const [isTeamExpanded, setIsTeamExpanded] = useState(true);
    const [privateItems, setPrivateItems] = useState([
        { id: 1, name: '개인 프로젝트 1', type: 'folder' },
        { id: 2, name: '발표 연습 1', type: 'video' }
    ]);
    const [teamItems, setTeamItems] = useState([
        { id: 1, name: '팀 프로젝트 A', type: 'folder' },
        { id: 2, name: '팀 발표 1', type: 'video' }
    ]);

    const handleAddPrivateItem = () => {
        const name = prompt('새 개인 항목 이름을 입력하세요:');
        if (name) {
            const newItem = {
                id: Date.now(),
                name: name,
                type: 'folder'
            };
            setPrivateItems(prev => [...prev, newItem]);
        }
    };

    const handleAddTeamItem = () => {
        const name = prompt('새 팀 항목 이름을 입력하세요:');
        if (name) {
            const newItem = {
                id: Date.now(),
                name: name,
                type: 'folder'
            };
            setTeamItems(prev => [...prev, newItem]);
        }
    };

    const renderItems = (items) => {
        return items.map((item, index) => (
            <div key={item.id} style={{
                width: '100%',
                height: '44px',
                paddingLeft: '32px',
                paddingRight: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                borderRadius: '8px',
                margin: '2px 8px'
            }}
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
            }}>
                <div style={{
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                }}>
                    {item.type === 'folder' ? '📁' : '🎥'}
                </div>
                <div style={{
                    flex: 1,
                    color: '#000000',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '400',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {item.name}
                </div>
            </div>
        ));
    };

    return (
        <>
            {/* Sidebar Content */}
            <div style={{
                position: 'fixed',
                left: isCollapsed ? -427 : 0,
                top: 0,
                width: 427,
                height: '100vh',
                background: '#ffffff',
                transition: 'left 0.3s ease-in-out',
                zIndex: 999,
                borderRight: isCollapsed ? 'none' : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: isCollapsed ? 'none' : '2px 0px 8px rgba(0, 0, 0, 0.1)',
                overflowY: 'auto'
            }}>
                {/* Top spacing for navbar area */}
                <div style={{ height: '70px' }}></div>

                {/* Private Section */}
                <div style={{
                    margin: '20px 16px 16px 16px'
                }}>
                    {/* Private Header */}
                    <div 
                        onClick={() => setIsPrivateExpanded(!isPrivateExpanded)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            transition: 'background-color 0.2s ease',
                            userSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                transform: isPrivateExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }}>
                                ▶
                            </div>
                            <div style={{
                                color: '#000000',
                                fontSize: '20px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: '700'
                            }}>
                                Private
                            </div>
                        </div>
                        <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddPrivateItem();
                            }}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#2C2C2C',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#1C1C1C';
                                e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#2C2C2C';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            +
                        </div>
                    </div>

                    {/* Private Items */}
                    {isPrivateExpanded && (
                        <div style={{
                            marginTop: '8px',
                            paddingLeft: '8px'
                        }}>
                            {renderItems(privateItems)}
                        </div>
                    )}
                </div>

                {/* Team Section */}
                <div style={{
                    margin: '20px 16px 16px 16px'
                }}>
                    {/* Team Header */}
                    <div 
                        onClick={() => setIsTeamExpanded(!isTeamExpanded)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            transition: 'background-color 0.2s ease',
                            userSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                transform: isTeamExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }}>
                                ▶
                            </div>
                            <div style={{
                                color: '#000000',
                                fontSize: '20px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: '700'
                            }}>
                                Team
                            </div>
                        </div>
                        <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddTeamItem();
                            }}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#2C2C2C',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#1C1C1C';
                                e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#2C2C2C';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            +
                        </div>
                    </div>

                    {/* Team Items */}
                    {isTeamExpanded && (
                        <div style={{
                            marginTop: '8px',
                            paddingLeft: '8px'
                        }}>
                            {renderItems(teamItems)}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CollapsibleSidebar; 