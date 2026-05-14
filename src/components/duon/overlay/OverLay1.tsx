// components/OverlayHeader.tsx
import React from 'react';

export default function Overlay1() {
    return (
        <>
            <style>
                {`
                    /* --- 1. 좌측 상단 헤더 & 로고 --- */
                    .overlay-header {
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 10;
                        padding: 15px; /* 모바일 기본 패딩 */
                    }
                    .overlay-text {
                        padding: 10px 15px;
                        font-weight: 800;
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
                    }
                `}
            </style>

            {/* 좌측 상단 헤더 영역 */}
            <div className="overlay-header">
                <div className="overlay-text">
                    <div>차열이 필요한 곳 어디든</div>
                    <div>단 한번의 도장으로 쿨시티 완성</div>
                </div>
                <img className="overlay-logo" src="/model/duon/logo.png" alt="듀온 로고" />
            </div>

            {/* 좌측 하단 정보 카드 영역 */}
            <div className="info-card">
                <div className="info-card-title">
                    타이틀 넣어주세요<br/>홍보하고자하는 타이틀을요<br/>제품명이여도 좋습니다.
                </div>
                <div className="info-card-desc">
                    Lorem ipsum (/ˌlɔː.rəm ˈɪp.səm/ LOR-əm IP-səm) is a dummy or placeholder text commonly used in graphic design, publishing, and web development. It is typically a corrupted version of De finibus bonorum et malorum, a 1st-century BC text by the Roman statesman and philosopher Cicero, with words altered, added, and
                </div>
            </div>
        </>
    );
}