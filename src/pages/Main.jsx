import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';

const Main = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  // 애니메이션 상태
  const [logoVisible, setLogoVisible] = useState(false);        // 로고 애니메이션
  const [subtitleVisible, setSubtitleVisible] = useState(false); // 부제목 애니메이션
  const [buttonsVisible, setButtonsVisible] = useState(false);   // 버튼 애니메이션
  const [visibleTexts, setVisibleTexts] = useState([]);         // 오른쪽 텍스트 애니메이션
  const [visibleSections, setVisibleSections] = useState([]);
  
  // 섹션 refs
  const sectionRefs = useRef([]);

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    if (token && !isAuthenticated) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp > currentTime) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
      }
    }
  }, [navigate, isAuthenticated]);

  // 순차 애니메이션: 왼쪽 요소들 동시에 → 오른쪽 텍스트들 순차적으로
  useEffect(() => {
    // 1. 왼쪽 요소들 모두 동시에 페이드인 (0.5초 후)
    setTimeout(() => {
      setLogoVisible(true);
      setSubtitleVisible(true);
      setButtonsVisible(true);
    }, 500);

    // 2. 오른쪽 텍스트들 순차 애니메이션 (2.0초 후부터 시작)
    const messages = [
      'AI가 제공하는 피드백',
      '객관적 데이터로 개선 포인트 제시', 
      '팀을 구성하여 협업하기',
      '지금 도전해보세요, 더 나은 발표를 위해'
    ];

    messages.forEach((_, index) => {
      setTimeout(() => {
        setVisibleTexts(prev => [...prev, index]);
      }, 2000 + (index * 800)); // 2.0초 후 시작, 0.8초 간격
    });
  }, []);

  // 스크롤 기반 섹션 애니메이션
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,  // 15%가 보이면 트리거 (더 일찍 시작)
      rootMargin: '-80px 0px'  // 80px 일찍 트리거
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = parseInt(entry.target.dataset.index);
        if (entry.isIntersecting) {
          setVisibleSections(prev => [...new Set([...prev, index])]);
        } else {
          setVisibleSections(prev => prev.filter(i => i !== index));
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"SeoulAlrim", "Noto Sans KR"'
    }}>
      <Navbar />
      
      {/* Hero Section */}
      <div style={{
        padding: '150px 80px 40px 80px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        minHeight: '100vh',
        width: '100%'
      }}>
        {/* 왼쪽: 로고, 부제목, 버튼 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'flex-start',
          flex: 1,
          alignSelf: 'flex-start',
          paddingTop: '0px'
        }}>
          {/* 로고 - 왼쪽에서 오른쪽으로 슬라이드 애니메이션 */}
          <div style={{
            fontSize: '120px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '800',
            color: 'black',
            marginBottom: '0px',
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'translateX(0)' : 'translateX(-80px)',
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            또랑또랑
          </div>
          
          {/* 부제목 - 페이드인 애니메이션 */}
          <div style={{
            fontSize: '24px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            color: 'rgba(0, 0, 0, 0.75)',
            lineHeight: '36px',
            marginBottom: '10px',
            opacity: subtitleVisible ? 1 : 0,
            transform: subtitleVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease'
          }}>
            AI 기반 발표 연습 서비스
          </div>

          {/* 버튼들 - 페이드인 애니메이션 */}
          <div style={{
            display: 'flex',
            gap: '15px',
            opacity: buttonsVisible ? 1 : 0,
            transform: buttonsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease'
          }}>
            <Link to="/signup" style={{textDecoration: 'none'}}>
              <div style={{
                width: '124px',
                height: '63px',
                padding: '8px',
                background: 'white',
                borderRadius: '15px',
                border: '0.5px solid #767676',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#1E1E1E',
                fontSize: '16px',
                fontFamily: '"SeoulAlrim", "Noto Sans KR"',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              >
                회원가입
              </div>
            </Link>
            <Link to="/login" style={{textDecoration: 'none'}}>
              <div style={{
                width: '124px',
                height: '63px',
                padding: '8px',
                background: '#2C2C2C',
                borderRadius: '15px',
                border: '1px solid #2C2C2C',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#F5F5F5',
                fontSize: '16px',
                fontFamily: '"SeoulAlrim", "Noto Sans KR"',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              >
                로그인
              </div>
            </Link>
          </div>
        </div>

        {/* 오른쪽: 순차 애니메이션 텍스트들 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'flex-end',
          textAlign: 'right',
          flex: 1,
          alignSelf: 'flex-end',
          paddingBottom: '80px'
        }}>
          <div style={{
            fontSize: '48px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            color: 'black',
            opacity: visibleTexts.includes(0) ? 1 : 0,
            transform: visibleTexts.includes(0) ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease'
          }}>
            AI가 제공하는 피드백
          </div>
          
          <div style={{
            fontSize: '48px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            color: 'black',
            opacity: visibleTexts.includes(1) ? 1 : 0,
            transform: visibleTexts.includes(1) ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease'
          }}>
            객관적 데이터로 개선 포인트 제시
          </div>
          
          <div style={{
            fontSize: '48px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            color: 'black',
            opacity: visibleTexts.includes(2) ? 1 : 0,
            transform: visibleTexts.includes(2) ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease'
          }}>
            팀을 구성하여 협업하기
          </div>
          
          <div style={{
            fontSize: '48px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            color: '#2E63BC',
            opacity: visibleTexts.includes(3) ? 1 : 0,
            transform: visibleTexts.includes(3) ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease'
          }}>
            지금 도전해보세요, 더 나은 발표를 위해
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '300px',
        padding: '50px 80px 600px 80px',  // 하단 패딩을 300px → 600px로 증가
        width: '100%'
      }}>
        {/* Feature 1 - AI 피드백 */}
        <div 
          ref={el => sectionRefs.current[0] = el}
          data-index="0"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            alignItems: 'flex-start',
            textAlign: 'left',
            opacity: visibleSections.includes(0) ? 1 : 0,
            transform: visibleSections.includes(0) ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{
            fontSize: '48px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '700',  // 500 → 700으로 볼드체 변경
            color: 'black'
          }}>
            AI가 제공하는 피드백
          </div>
          <div style={{
            fontSize: '32px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            lineHeight: '48px',
            color: 'black'
          }}>
            또랑또랑은 AI 기술을 활용하여 <br/>
            여러분의 발표 실력을 향상시켜 드립니다<br/>
            사용자가 발표 연습을 녹화하고 올리면 <br/>
            AI가 분석하여 객관적인 피드백을 제공합니다
          </div>
          <div style={{
            fontSize: '32px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            lineHeight: '48px',
            color: 'black'
          }}>
            대본 수정이 필요하다면 AI에게 맡겨보세요<br/>
            어색한 문장‧군더더기를 다듬을 수 있습니다<br/>
            문맥·발표 길이까지 맞춰 '최종본 대본'을 바로 받아보세요
          </div>
        </div>

        {/* Feature 2 - 데이터 분석 */}
        <div 
          ref={el => sectionRefs.current[1] = el}
          data-index="1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            alignItems: 'flex-end',
            textAlign: 'right',
            opacity: visibleSections.includes(1) ? 1 : 0,
            transform: visibleSections.includes(1) ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{
            fontSize: '48px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '700',  // 500 → 700으로 볼드체 변경
            color: 'black'
          }}>
            객관적 데이터로 개선 포인트 제시
          </div>
          <div style={{
            fontSize: '32px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            lineHeight: '48px',
            color: 'black'
          }}>
            사용자의 목소리 톤, 말하기 속도, 시선 처리 등 다양한 데이터를 분석하여<br/>
            여러분의 발표에서 개선할 수 있는 부분을 객관적으로 제시합니다
          </div>
          <div style={{
            fontSize: '32px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            lineHeight: '48px',
            color: 'black'
          }}>
            육각형 레이더 차트로 핵심 지표를 시각화 해 한눈에 강‧약점을 파악할 수 있어요<br/>
            면적이 넓을수록 해당 항목에서 우수함을, 꺾인 부분은 집중 개선이 필요함을 보여줍니다<br/>
            연습을 반복할수록 그래프가 확장되는 모습을 보며 성장 과정을 직관적으로 확인해 보세요
          </div>
        </div>

        {/* Feature 3 - 팀 협업 */}
        <div 
          ref={el => sectionRefs.current[2] = el}
          data-index="2"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            alignItems: 'flex-start',
            textAlign: 'left',
            opacity: visibleSections.includes(2) ? 1 : 0,
            transform: visibleSections.includes(2) ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{
            fontSize: '48px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '700',  // 500 → 700으로 볼드체 변경
            color: 'black'
          }}>
            팀을 구성하여 협업하기
          </div>
          <div style={{
            fontSize: '32px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            lineHeight: '48px',
            color: 'black'
          }}>
            팀원들을 초대해 전용 협업 공간을 만들어 보세요<br/>
            발표 영상·대본을 공유하고 실시간 댓글로 피드백을 주고받을 수 있습니다
          </div>
          <div style={{
            fontSize: '32px',
            fontFamily: '"SeoulAlrim", "Noto Sans KR"',
            fontWeight: '500',
            lineHeight: '48px',
            color: 'black'
          }}>
            AI 분석 리포트를 팀 대시보드에서 함께 확인하며 개선 방향을 논의하세요<br/>
            모두의 성장 과정을 기록해 협업이 더 즐겁고 효율적입니다
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;