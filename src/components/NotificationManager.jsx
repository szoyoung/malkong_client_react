import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setNotifications, addNotification } from '../store/slices/notificationSlice';
import notificationService from '../api/notificationService';
import ToastNotification from './ToastNotification';

const NotificationManager = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const { notifications } = useSelector(state => state.notification);
    const intervalRef = useRef(null);
    const lastNotificationIdRef = useRef(null);
    const [toastNotification, setToastNotification] = useState(null);

    // 브라우저 알림 권한 요청
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // 알림 폴링
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchNotifications = async () => {
            try {
                const notificationsData = await notificationService.getNotifications();
                
                if (notificationsData && notificationsData.length > 0) {
                    // 최신 알림 확인
                    const latestNotification = notificationsData[0];
                    
                    // 알림 ID 추출 (notificationId 또는 id)
                    const notificationId = latestNotification.notificationId || latestNotification.id;
                    
                    // 새 알림이 있는지 확인
                    if (lastNotificationIdRef.current !== notificationId) {
                        // 두 번째 알림부터 표시 (초기 로드 제외)
                        if (lastNotificationIdRef.current !== null) {
                            // 새 알림 표시
                            showBrowserNotification(latestNotification);
                            // 토스트 알림 표시
                            setToastNotification(latestNotification);
                        }
                        lastNotificationIdRef.current = notificationId;
                    }

                    dispatch(setNotifications(notificationsData));
                }
            } catch (error) {
                // 모든 에러를 조용히 처리 (콘솔 로그 없음)
                if (error.response?.status === 401) {
                    // 토큰 문제로 인해 알림 조회 불가
                    return;
                }
            }
        };

        // 초기 로드
        fetchNotifications();

        // 30초마다 폴링 (인증 부담 감소)
        intervalRef.current = setInterval(fetchNotifications, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAuthenticated, dispatch]);

    // 브라우저 알림 표시
    const showBrowserNotification = (notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/logo512.png',
                badge: '/logo192.png',
                tag: notification.id,
                requireInteraction: false,
                renotify: true
            });

            // 클릭 시 해당 페이지로 이동
            browserNotification.onclick = () => {
                window.focus();
                browserNotification.close();
                
                if (notification.relatedId) {
                    if (notification.type === 'AI_ANALYSIS_COMPLETE') {
                        navigate(`/video-analysis/${notification.relatedId}`);
                    } else if (notification.type === 'COMMENT') {
                        navigate(`/presentation/${notification.relatedId}`);
                    }
                }
            };

            // 알림 자동 닫기 (5초 후)
            setTimeout(() => {
                browserNotification.close();
            }, 5000);
        }
    };

    const handleCloseToast = () => {
        setToastNotification(null);
    };

    const handleToastClick = () => {
        if (toastNotification && toastNotification.relatedId) {
            if (toastNotification.type === 'AI_ANALYSIS_COMPLETE') {
                navigate(`/video-analysis/${toastNotification.relatedId}`);
                // 분석 페이지로 이동하면 토스트 닫기
                setToastNotification(null);
            } else if (toastNotification.type === 'COMMENT') {
                navigate(`/presentation/${toastNotification.relatedId}`);
                // 프레젠테이션 페이지로 이동하면 토스트 닫기
                setToastNotification(null);
            }
        }
    };

    return (
        <>
            {toastNotification && (
                <ToastNotification 
                    notification={toastNotification} 
                    onClose={handleCloseToast}
                    onClick={handleToastClick}
                />
            )}
        </>
    );
};

export default NotificationManager;

