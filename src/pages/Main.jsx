import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAuthCheck from '../hooks/useAuthCheck';

const Main = () => {

  // 애니메이션 상태
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [visibleSections, setVisibleSections] = useState([]);

  // 섹션 refs
  const sectionRefs = useRef([]);
  const statsRef = useRef(null);

  // 로그인 상태 확인 및 리다이렉트
  useAuthCheck('/dashboard');

  // Hero 애니메이션
  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 200);
  }, []);

  // 스크롤 기반 애니메이션
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '-50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === statsRef.current) {
          setStatsVisible(entry.isIntersecting);
        } else {
          const index = parseInt(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setVisibleSections(prev => [...new Set([...prev, index])]);
          }
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    if (statsRef.current) observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Inter", "Noto Sans KR", sans-serif',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>
      {/* Hero Section - 미니멀 디자인 */}
      <div style={{
        background: '#0f172a',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* 메인 콘텐츠 */}
        <div style={{
          maxWidth: '1000px',
          textAlign: 'center',
          zIndex: 1,
          padding: '0 8%',
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              fontWeight: '500',
              letterSpacing: '0.3px'
            }}>
              AI 기반 발표 연습 서비스
            </span>
          </div>

          <h1 style={{
            fontSize: '68px',
            fontWeight: '800',
            color: 'white',
            margin: '0 0 24px 0',
            lineHeight: '1.1',
            letterSpacing: '-2px'
          }}>
            더 나은 발표를<br />말콩과 함께
          </h1>

          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0 0 40px 0',
            lineHeight: '1.7',
            fontWeight: '400'
          }}>
            AI가 당신의 발표를 분석하고 객관적인 피드백을 제공합니다.<br />
            빠르게 성장하는 발표 연습 경험을 시작하세요.
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'white',
                borderRadius: '10px',
                color: '#0f172a',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'white';
              }}>
                무료로 시작하기
              </div>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}>
                로그인
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 가치 제안 섹션 - Why 말콩? */}
      <div
        ref={statsRef}
        style={{
          padding: '100px 8%',
          background: '#ffffff',
          opacity: statsVisible ? 1 : 0,
          transform: statsVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s ease',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: '#1a1a1a',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            이런 분들께 추천합니다
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6c757d',
            textAlign: 'center',
            marginBottom: '70px'
          }}>
            누구나 자신 있게 말할 수 있도록, 말콩이 함께합니다
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px'
          }}>
            <div style={{
              padding: '40px 30px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0f172a';
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                fontSize: '40px',
                marginBottom: '20px'
              }}>
                ✏️
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '12px'
              }}>
                대학생
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6c757d',
                lineHeight: '1.7',
                margin: 0
              }}>
                발표 과제가 많은 대학생들의 프레젠테이션 스킬 향상과 학점 관리에 도움을 드립니다.
              </p>
            </div>
            <div style={{
              padding: '40px 30px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0f172a';
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                fontSize: '40px',
                marginBottom: '20px'
              }}>
                🖥️
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '12px'
              }}>
                직장인
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6c757d',
                lineHeight: '1.7',
                margin: 0
              }}>
                업무 발표, 회의, 프레젠테이션이 잦은 직장인들의 커리어 성장을 지원합니다.
              </p>
            </div>
            <div style={{
              padding: '40px 30px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0f172a';
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                fontSize: '40px',
                marginBottom: '20px'
              }}>
                🔗
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '12px'
              }}>
                팀 프로젝트
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6c757d',
                lineHeight: '1.7',
                margin: 0
              }}>
                팀 단위로 발표를 준비하는 모든 분들께 협업 기반 연습 환경을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - 카드 형태로 개선 */}
      <div style={{
        padding: '100px 8%',
        background: '#f8fafc',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#1a1a1a',
              margin: '0 0 20px 0'
            }}>
              말콩이 제공하는 핵심 기능
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#6c757d',
              margin: 0
            }}>
              AI 기술로 당신의 발표 실력을 한 단계 높여보세요
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginBottom: '60px'
          }}>
          {/* Feature 1 - AI 피드백 */}
          <div
            ref={el => sectionRefs.current[0] = el}
            data-index="0"
            style={{
              padding: '50px 40px',
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.5s ease',
              opacity: visibleSections.includes(0) ? 1 : 0,
              transform: visibleSections.includes(0) ? 'translateY(0)' : 'translateY(40px)',
              cursor: 'pointer',
              border: '1px solid #f0f0f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={{
              width: '70px',
              height: '70px',
              background: '#0f172a',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              marginBottom: '30px'
            }}>
              💡
            </div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 20px 0'
            }}>
              AI 피드백
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6c757d',
              lineHeight: '1.8',
              margin: 0
            }}>
              발표 영상을 업로드하면 AI가 음성 톤, 속도, 표정 등을 분석하여 객관적이고 상세한 피드백을 제공합니다. 대본 수정 또한 AI에게 맡겨보세요.
            </p>
          </div>

          {/* Feature 2 - 데이터 분석 */}
          <div
            ref={el => sectionRefs.current[1] = el}
            data-index="1"
            style={{
              padding: '50px 40px',
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.5s ease',
              opacity: visibleSections.includes(1) ? 1 : 0,
              transform: visibleSections.includes(1) ? 'translateY(0)' : 'translateY(40px)',
              cursor: 'pointer',
              border: '1px solid #f0f0f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={{
              width: '70px',
              height: '70px',
              background: '#0f172a',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              marginBottom: '30px'
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 20px 0'
            }}>
              시각화된 분석
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6c757d',
              lineHeight: '1.8',
              margin: 0
            }}>
              오각형 레이더 차트로 핵심 지표를 한눈에 파악하세요. 연습을 반복하고 그래프를 비교하며 성장 과정을 직관적으로 확인할 수 있습니다.
            </p>
          </div>

          {/* Feature 3 - 팀 협업 */}
          <div
            ref={el => sectionRefs.current[2] = el}
            data-index="2"
            style={{
              padding: '50px 40px',
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.5s ease',
              opacity: visibleSections.includes(2) ? 1 : 0,
              transform: visibleSections.includes(2) ? 'translateY(0)' : 'translateY(40px)',
              cursor: 'pointer',
              border: '1px solid #f0f0f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={{
              width: '70px',
              height: '70px',
              background: '#0f172a',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              marginBottom: '30px'
            }}>
              👥
            </div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 20px 0'
            }}>
              팀 협업
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6c757d',
              lineHeight: '1.8',
              margin: 0
            }}>
              팀원들과 전용 협업 공간을 만들어 발표 영상과 대본을 공유하고, 실시간 댓글로 피드백을 주고받으며 함께 성장하세요.
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* CTA Section - 행동 유도 */}
      <div style={{
        background: '#ffffff',
        padding: '100px 8%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 20px 0',
            lineHeight: '1.3'
          }}>
            지금 시작하세요
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            margin: '0 0 40px 0',
            lineHeight: '1.7'
          }}>
            무료로 회원가입하고 AI 기반 발표 연습을 경험해보세요.<br />
            더 나은 발표자로 성장하는 여정이 시작됩니다.
          </p>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: '#0f172a',
              borderRadius: '10px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = '#0f172a';
            }}>
              시작하기 →
            </div>
          </Link>
        </div>
      </div>

      {/* Footer - 간소화 */}
      <footer style={{
        background: '#0f172a',
        padding: '60px 8% 40px 8%',
        color: 'white',
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '800',
            marginBottom: '12px',
            color: 'white'
          }}>
            말콩
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: '1.6',
            margin: '0 0 8px 0'
          }}>
            AI 기반 발표 연습 서비스 - 더 나은 발표를 위한 완벽한 파트너
          </p>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: '0 0 30px 0'
          }}>
            <a href="mailto:team.malkong@gmail.com" style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}>
              team.malkong@gmail.com
            </a>
          </p>
          <p style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.4)',
            margin: 0
          }}>
            © 2025 말콩. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Main;
