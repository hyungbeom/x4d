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
                        width: 100vw;
                        height: 100vh;
                        z-index: 50;
                        pointer-events: none; /* 뒷배경 클릭 가능하게 */
                    }

                    /* --- 1. 좌측 상단 헤더 & 로고 --- */
                    .overlay-header {
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 10;
                        padding: 15px; 
                    }
                    .overlay-text {
                        padding: 10px 15px;
                        font-weight: 800;
                        font-size: 16px; 
                        line-height: 1.4;
                        color: #333; /* 글자색 지정 (필요시 수정) */
                    }
                    
                    /* 로고의 처음 (큰) 상태 */
                    .overlay-logo {
                        position: absolute;
                        top: 150px;  /* 초기 Y 위치 (화면 중앙쯤) */
                        left: 50px;  /* 초기 X 위치 */
                        width: 350px; /* 초기 큰 사이즈 */
                        pointer-events: auto;
                        will-change: transform, width, top, left; /* 애니메이션 최적화 */
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
                        color: #333; /* 글자색 지정 */
                        word-break: keep-all;
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
                        
                        /* 데스크탑에서 로고 초기 위치 조금 더 이동하고 싶다면 */
                        .overlay-logo {
                            top: 125px;
                            left: 70px;
                            width: 700px;
                        }
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
                        타이틀 넣어주세요<br/>홍보하고자하는 타이틀을요<br/>제품명이여도 좋습니다.
                    </div>
                    <div className="info-card-desc">
                        Lorem ipsum (/ˌlɔː.rəm ˈɪp.səm/ LOR-əm IP-səm) is a dummy or placeholder text commonly used in
                        graphic design, publishing, and web development. It is typically a corrupted version of De finibus
                        bonorum et malorum, a 1st-century BC text by the Roman statesman and philosopher Cicero, with words
                        altered, added, and
                    </div>
                </div>

            </div>
        </>
    );
}