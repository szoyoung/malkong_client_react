import React, { useState, useEffect } from 'react';
import './ToastNotification.css';

const ToastNotification = ({ notification, onClose, onClick }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 애니메이션을 위한 딜레이
        setTimeout(() => setIsVisible(true), 10);

        // 자동 닫기 기능 제거 - 사용자가 직접 닫을 때까지 유지
    }, [onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose && onClose(), 300);
    };

    if (!notification) return null;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'AI_ANALYSIS_COMPLETE':
                return '🎬';
            case 'COMMENT':
                return '💬';
            default:
                return '🔔';
        }
    };

    return (
        <div 
            className={`toast-notification ${isVisible ? 'visible' : ''}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="toast-icon">
                {getNotificationIcon(notification.type)}
            </div>
            <div className="toast-content">
                <div className="toast-title">{notification.title}</div>
                <div className="toast-message">{notification.message}</div>
            </div>
            <button 
                className="toast-close" 
                onClick={(e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    handleClose();
                }}
            >
                ×
            </button>
        </div>
    );
};

export default ToastNotification;

