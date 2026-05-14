
import React from 'react';

export default function Overlay1() {
    return (
        <>
            <style>
                {`
                    /* --- 1. 좌측 상단 헤더 & 로고 --- */
                    .overlay-header {
                    color : white;
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 10;
                        padding: 15px; /* 모바일 기본 패딩 */
                    }
                    .overlay-text {
                        padding: 10px 15px;
                        font-weight: 600;
                        font-size: 16px; /* 모바일 글자 크기 */
                        line-height: 1.4;
                    }
                    .overlay-logo {
                        width: 80%; /* 모바일 로고 크기 */
                        margin-top: 10px;
                        margin-left: 15px;
                    }

                    /* --- 2. 좌측 하단 정보 카드 (모바일 기준) --- */
                    .info-card {
                        position: absolute;
                        bottom: 15px;
                        left: 15px;
                        width: 260px; /* 📱 모바일 너비 */
                        padding: 15px;
                        z-index: 10;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(3px);
                        -webkit-backdrop-filter: blur(3px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                        color: #ffffff;
                        word-break: keep-all;
                        will-change: transform, opacity;
                        pointer-events: none;
                    }
                    .info-card-title {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 12px;
                    }
                    .info-card-desc {
                        font-size: 11px;
                        opacity: 0.9;
                        white-space: normal;
                    }

                    /* --- 🖥️ 태블릿 사이즈 (768px 이상) --- */
                    @media (min-width: 768px) {
                        .overlay-header { padding: 30px; }
                        .overlay-text { padding: 20px 30px; font-size: 20px; }
                        .overlay-logo { width: auto; margin-left: 30px; }
                        
                        .info-card {
                            bottom: 30px;
                            left: 30px;
                            width: 500px; /* 💻 태블릿 너비 */
                            padding: 20px;
                        }
                        .info-card-title { font-size: 16px; margin-bottom: 16px; }
                        .info-card-desc { font-size: 12px; }
                    }

                    /* --- 🖥️ 데스크탑 사이즈 (1024px 이상) --- */
                    @media (min-width: 1024px) {
                        .info-card {
                            bottom: 40px;
                            left: 40px;
                            width: 700px; /* 🖥️ 데스크탑 너비 */
                            padding: 25px;
                        }
                        .info-card-title { font-size: 18px; margin-bottom: 20px; }
                        .info-card-desc { font-size: 14px; line-height: 1.5; }
                        .overlay-logo {
                            width : 300px;
                        }
                    }
                `}
            </style>

            {/* 좌측 상단 헤더 영역 */}
            <div className="overlay-header">
                <div className="overlay-text" style={{textAlign : 'left'}}>
                    <div>Environmental Iot</div>
                    <div>Total Technology Company</div>
                </div>
                <img className="overlay-logo" src="/model/bdtec/logo.svg"  alt="듀온 로고" />
            </div>

            {/* 좌측 하단 정보 카드 영역 */}
            <div className="info-card">
                <div className="info-card-title">
                   IoT Gateway(환경 사물인터넷) <br/> BDI - 100 <br/>
                </div>
                <div className="info-card-desc">
                   24시간 지속적인 모니터링으로 집진상태 판단과 측정 시스템 제공
                    <br/>
                    <br/>
                    오염 방지 시설의 가동여부를 24시간 실시간으로 모니터링하고 온도/차압/전류 등의 방지시설 운영 수집정보로 환경관리공단 서버(www.greenlink.or.kr)에 보안된 데이터로 안전하게 전송하는 시스템 입니다.
                </div>
            </div>
        </>
    );
}