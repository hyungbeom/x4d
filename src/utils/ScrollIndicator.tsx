import React from 'react';

export default function ScrollIndicator() {
    // 공통 스타일 정의
    const containerStyle = {
        position: 'relative',
        width: '24px',
        height: '24px',
    };

    const chevronStyle = {
        position: 'absolute',
        width: '28px',
        height: '8px',
        opacity: 0,
        transform: 'scale3d(0.5, 0.5, 0.5)',
    };

    // :before, :after를 대체할 내부 div 스타일
    const beforeStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '51%',
        background: '#fff',
        transform: 'skew(0deg, 30deg)',
    };

    const afterStyle = {
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: '50%',
        background: '#fff',
        transform: 'skew(0deg, -30deg)',
    };

    const textStyle = {
        display: 'block',
        marginTop: '75px',
        marginLeft: '-30px',
        fontFamily: '"Helvetica Neue", "Helvetica", Arial, sans-serif',
        fontSize: '12px',
        color: '#fff',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        opacity: 0.25,
        animation: 'pulse 2s linear alternate infinite',
    };

    return (
        <div style={containerStyle}>
            {/* 리액트 인라인 스타일에서 지원하지 않는 keyframes는 style 태그로 주입합니다 */}
            <style>
                {`
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

            <span style={textStyle}>Scroll down</span>

        </div>
    );
}