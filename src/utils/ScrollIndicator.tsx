// components/ScrollIndicator.tsx
import React from 'react';

export default function ScrollIndicator() {
    // --- 인라인 스타일 개체 (수정) ---

    const wrapperStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '30px', // 📱 모바일 기본 위치 (스타일 태그에서 덮어쓰기)
        right: '30px',
        zIndex: 10,
        width: '100px', // 👈 텍스트 중앙 정렬을 위한 넉넉한 컨테이너 너비 추가
        height: '100px', // 👈 화살표 애니메이션 영역을 포함하는 컨테이너 높이 추가
        pointerEvents: 'none', // 전체 컴포넌트 클릭 무시
    };

    const textStyle: React.CSSProperties = {
        position: 'absolute',
        top: '-20px', // 👈 화살표보다 위로 위치를 끌어올림!
        left: '50%',
        transform: 'translateX(-50%)', // 👈 텍스트를 컨테이너 정중앙에 배치 (오른쪽 치우침 해결!)
        fontFamily: '"Helvetica Neue", "Helvetica", Arial, sans-serif',
        fontSize: '12px',
        color: 'black', // 👈 색상을 검은색으로 변경!
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        fontWeight: 800,
        opacity: 0.25,
        animation: 'pulse 2s linear alternate infinite',
    };

    const chevronStyle: React.CSSProperties = {
        position: 'absolute',
        top: '3px', // 화살표 시작 위치
        left: '36px', // 👈 화살표를 컨테이너 중앙에 배치 ((100px - 28px) / 2 = 36px)
        width: '28px',
        height: '8px',
        opacity: 0,
        // transform: 'scale3d(0.5, 0.5, 0.5)', // 애니메이션과 충돌할 수 있어 제거
    };

    // --- (beforeStyle, afterStyle, return 부분은 그대로 유지하되, 리턴 구조 수정) ---

    const beforeStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '51%',
        background: 'black',
        transform: 'skew(0deg, 30deg)',
    };

    const afterStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: '50%',
        background: 'black',
        transform: 'skew(0deg, -30deg)',
    };

    return (
        // 👇 1. 컨테이너에 인라인 스타일 적용
        <div className="scroll-indicator-wrapper" style={wrapperStyle}>
            <style>
                {`
                    /* --- 🖥️ 태블릿 & PC 사이즈 (768px 이상) --- */
                    @media (min-width: 768px) {
                        .scroll-indicator-wrapper {
                            bottom: 50px !important; /* PC 하단 여백 */
                            right: 50px !important;  /* PC 우측 여백 */
                        }
                    }

                    /* 기존 애니메이션 */
                    @keyframes move {
                        25% { opacity: 1; }
                        33% { opacity: 1; transform: translateY(30px); }
                        67% { opacity: 1; transform: translateY(40px); }
                        100% { opacity: 0; transform: translateY(55px) scale3d(0.5, 0.5, 0.5); }
                    }
                    @keyframes pulse {
                        to { opacity: 1; }
                    }
                `}
            </style>

            {/* 👇 2. 텍스트를 화살표 위로 배치 (수정된 textStyle) */}
            <span style={textStyle}>Scroll down</span>

            {/* 첫 번째 화살표 (1초 딜레이) */}
            <div style={{ ...chevronStyle, animation: 'move 3s ease-out 1s infinite' }}>
                <div style={beforeStyle}></div>
                <div style={afterStyle}></div>
            </div>

            {/* 두 번째 화살표 (2초 딜레이) */}
            <div style={{ ...chevronStyle, animation: 'move 3s ease-out 2s infinite' }}>
                <div style={beforeStyle}></div>
                <div style={afterStyle}></div>
            </div>

            {/* 세 번째 화살표 (딜레이 없음) */}
            <div style={{ ...chevronStyle, animation: 'move 3s ease-out infinite' }}>
                <div style={beforeStyle}></div>
                <div style={afterStyle}></div>
            </div>
        </div>
    );
}