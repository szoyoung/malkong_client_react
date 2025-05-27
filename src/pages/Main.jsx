import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';

const Main = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // 토큰이 있고 인증된 상태라면 대시보드로 리다이렉트
    if (token && isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // 토큰은 있지만 Redux 상태가 인증되지 않은 경우, 토큰 유효성 확인
    if (token && !isAuthenticated) {
      try {
        // JWT 토큰의 만료 시간을 클라이언트에서 직접 확인
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          // 토큰이 유효하다면 대시보드로 리다이렉트
          if (payload.exp && payload.exp > currentTime) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        // 토큰이 유효하지 않으면 제거
        localStorage.removeItem('token');
      }
    }
  }, [navigate, isAuthenticated]);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter'
    }}>
      <Navbar />
      
      {/* Hero Section */}
      <div style={{
        padding: '200px 80px 20px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '96px',
          fontWeight: '700',
          color: 'black'
        }}>
          또랑또랑
        </div>
        
        <div style={{
          fontSize: '24px',
          fontWeight: '500',
          color: 'rgba(0, 0, 0, 0.75)',
          lineHeight: '36px'
        }}>
          AI 기반 발표 연습 서비스
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          marginTop: '20px'
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
              fontWeight: '400'
            }}>
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
              fontWeight: '400'
            }}>
              로그인
            </div>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '200px',
        padding: '200px 80px',
        maxWidth: '100%',
        margin: '0 0'
      }}>
        {/* Feature 1 */}
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              alignItems: 'flex-end',
              textAlign: 'right'
          }}>
              <div style={{
                  fontSize: '48px',
                  fontWeight: '600',
                  color: 'black'
              }}>
                  AI가 제공하는 피드백 <br/>
                  객관적 데이터로 개선 포인트 제시 <br/>
                  팀을 구성하여 협업하기
              </div>
              <div style={{
                  fontSize: '48px',
                  fontWeight: '600',
                  color: '#2E63BC'
              }}>
                  지금 도전해보세요, 더 나은 발표를 위해
              </div>
          </div>

          {/* Feature 2 */}
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              alignItems: 'flex-start',
              textAlign: 'left'
          }}>
              <div style={{
                  fontSize: '48px',
                  fontWeight: '600',
                  color: 'black'
              }}>
                  AI가 제공하는 피드백
              </div>
              <div style={{
                  fontSize: '32px',
                  fontWeight: '400',
                  lineHeight: '48px',
                  color: 'black'
              }}>
                  또랑또랑은 AI 기술을 활용하여 <br/>
                  여러분의 발표 실력을 향상시켜 드립니다. <br/>
                  사용자가 발표 연습을 녹화하고 올리면 <br/>
                  AI가 분석하여 객관적인 피드백을 제공합니다. <br/>
              </div>
              <div style={{
                  fontSize: '32px',
                  fontWeight: '400',
                  lineHeight: '48px',
                  color: 'black'
              }}>
                  대본 수정이 필요하다면 AI에게 맡겨보세요. <br/>
                  어색한 문장‧군더더기를 다듬을 수 있습니다. <br/>
                  문맥·발표 길이까지 맞춰 '최종본 대본'을 바로 받아보세요. <br/>
              </div>
          </div>

          {/* Feature 3 */}
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              alignItems: 'flex-end',
              textAlign: 'right'
          }}>
              <div style={{
                  fontSize: '48px',
                  fontWeight: '600',
                  color: 'black'
              }}>
                  객관적 데이터로 개선 포인트 제시
              </div>
              <div style={{
                  fontSize: '32px',
                  fontWeight: '400',
                  lineHeight: '48px',
                  color: 'black'
              }}>
                  사용자의 목소리 톤, 말하기 속도, 시선 처리 등 다양한 데이터를 분석하여<br/>
                  여러분의 발표에서 개선할 수 있는 부분을 객관적으로 제시합니다.
              </div>
              <div style={{
                  fontSize: '32px',
                  fontWeight: '400',
                  lineHeight: '48px',
                  color: 'black'
              }}>
                  육각형 레이더 차트로 핵심 지표를 시각화 해 한눈에 강‧약점을 파악할 수 있어요. <br/>
                  면적이 넓을수록 해당 항목에서 우수함을, 꺾인 부분은 집중 개선이 필요함을 보여줍니다. <br/>
                  연습을 반복할수록 그래프가 확장되는 모습을 보며 성장 과정을 직관적으로 확인해 보세요. <br/>
              </div>
          </div>

          {/* Feature 4 */}
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              alignItems: 'flex-start',
              textAlign: 'left'
          }}>
              <div style={{
                  fontSize: '48px',
                  fontWeight: '600',
                  color: 'black'
              }}>
                  팀을 구성하여 협업하기
              </div>
              <div style={{
                  fontSize: '32px',
                  fontWeight: '400',
                  lineHeight: '48px',
                  color: 'black'
              }}>
                  팀원들을 초대해 전용 협업 공간을 만들어 보세요. <br/>
                  발표 영상·대본을 공유하고 실시간 댓글로 피드백을 주고받을 수 있습니다<br/>
              </div>
              <div style={{
                  fontSize: '32px',
                  fontWeight: '400',
                  lineHeight: '48px',
                  color: 'black'
              }}>
                  AI 분석 리포트를 팀 대시보드에서 함께 확인하며 개선 방향을 논의하세요. <br/>
                  모두의 성장 과정을 기록해 협업이 더 즐겁고 효율적입니다. <br/>
              </div>
          </div>
      </div>

        {/* CTA Section */}
        <div style={{
            padding: '200px 80px',
            textAlign: 'center',
            background: '#F5F5F5',
            marginTop: '200px'
        }}>
            <Link to="/login" style={{textDecoration: 'none'}}>
                <div style={{
                    fontSize: '48px',
                    fontWeight: '600',
                    color: '#2E63BC',
                    maxWidth: '800px',
                    margin: '0 auto',
                    cursor: 'pointer'
                }}>
                    지금 도전해보세요, 더 나은 발표를 위해
                </div>
            </Link>
        </div>
    </div>
  );
};

export default Main; 