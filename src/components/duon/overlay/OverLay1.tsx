import React from 'react';

export default function Overlay1() {
    return (
        <>
            <style>
                {`
                    /* 🚨 핵심: 스크롤해도 화면에 고정되도록 전체를 감싸는 판 */
                    .overlay-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100dvw;
                        height: 100dvh;
                        z-index: 50;
                        pointer-events: none; /* 뒷배경 클릭 가능하게 */
                    }

                    /* --- 1. 좌측 상단 헤더 & 로고 --- */
                    .overlay-header {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        z-index: 10;
                        padding: 15px;
                        text-align: center;
                    }
                    .overlay-text {
                        padding: 10px 15px;
                        font-weight: 800;
                        font-size: 16px;
                        line-height: 1.4;
                        color: #000;
                        text-align: center;
                    }

                    /* 로고 초기 — 가로 중앙, 크게, 슬로건 아래 */
                    .overlay-logo {
                        position: absolute;
                        top: clamp(108px, 20vh, 150px);
                        left: 50%;
                        width: min(90vw, 680px);
                        transform: translateX(-50%);
                        pointer-events: auto;
                        will-change: transform, width, top, left;
                    }

                    /* --- 2. 좌측 하단 정보 카드 (모바일 기준) --- */
                    .info-card {
                        position: absolute;
                        bottom: 15px;
                        left: 15px;
                        width: 260px;
                        padding: 15px;
                        z-index: 10;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(3px);
                        -webkit-backdrop-filter: blur(3px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                        color: #333;
                        word-break: keep-all;
                        pointer-events: none;
                    }
                    .info-card-title {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 12px;
                        line-height: 1.35;
                    }
                    .info-card-desc {
                        font-size: 11px;
                        opacity: 0.9;
                        white-space: normal;
                        line-height: 1.5;
                    }

                    /* 모바일 — 슬로건 상단 중앙, 로고 그 아래 크게 중앙 */
                    @media (max-width: 767px) {
                        .overlay-header {
                            top: calc(8px + env(safe-area-inset-top, 0px));
                            padding: 0 16px;
                        }

                        .overlay-text {
                            padding: 0;
                            font-size: clamp(0.85rem, 3.6vw, 1rem);
                            line-height: 1.35;
                        }

                        .overlay-logo {
                            top: calc(64px + env(safe-area-inset-top, 0px));
                            width: min(92vw, 520px);
                        }

                        .info-card {
                            bottom: calc(8px + env(safe-area-inset-bottom, 0px));
                            left: 12px;
                            width: min(58vw, 220px);
                            padding: 10px 12px;
                        }

                        .info-card-title {
                            font-size: 12px;
                            margin-bottom: 8px;
                        }

                        .info-card-desc {
                            font-size: 10px;
                        }
                    }

                    /* --- 🖥️ 반응형 사이즈 (기존 코드 유지) --- */
                    @media (min-width: 768px) {
                        .overlay-header { padding: 30px; }
                        .overlay-text { padding: 20px 30px; font-size: 20px; }

                        .info-card {
                            bottom: 30px;
                            left: 30px;
                            width: 500px;
                            padding: 20px;
                        }
                        .info-card-title { font-size: 16px; margin-bottom: 16px; }
                        .info-card-desc { font-size: 12px; }
                    }

                    @media (min-width: 1024px) {
                        .info-card {
                            bottom: 40px;
                            left: 40px;
                            width: 700px;
                            padding: 25px;
                        }
                        .info-card-title { font-size: 18px; margin-bottom: 20px; }
                        .info-card-desc { font-size: 14px; line-height: 1.5; }
                    }
                `}
            </style>

            {/* 🚨 전체를 감싸는 fixed 컨테이너 */}
            <div className="overlay-container">

                {/* 1. 스크롤 시 작아질 로고 (GSAP 타겟: .overlay-logo) */}
                <img
                    className="overlay-logo"
                    src="/model/duon/logo.png"
                    alt="듀온 로고"
                />

                {/* 2. 뿌옇게 사라질 대상들 (GSAP 타겟: .fade-out-target) */}
                {/* 헤더 텍스트 */}
                <div className="overlay-header fade-out-target">
                    <div className="overlay-text">
                        <div>차열이 필요한 곳 어디든</div>
                        <div>단 한번의 도장으로 쿨시티 완성</div>
                    </div>
                </div>

                {/* 정보 카드 */}
                <div className="info-card fade-out-target">
                    <div className="info-card-title">
                        믿을 수 있는 KS 인증<br />
                        국내 생산, 국내 제조!
                    </div>
                    <div className="info-card-desc">
                        2000년대 초반 페인트를 통한 적외선 반사 기술의 최초 시도는
                        어드그린코트로부터 시작되었습니다.
                        <br /><br />
                        평균 입자크기 세라믹진구는 태양에너지의 절반을 포함하고 있는
                        적외선을 집중적으로 반사하여 태양에너지의 흡수를 효과적으로 분산시켜줍니다.
                    </div>
                </div>

            </div>
        </>
    );
}