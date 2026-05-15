'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// 🚀 허용할 애니메이션 타입 목록에 'blinds' 추가!
export type TransitionType = 'slideUp' | 'fade' | 'scale' | 'slideLeft' | 'blinds';

interface PageWrapperProps {
    children: React.ReactNode;
    type?: TransitionType;
}

export default function PageWrapper({ children, type = 'slideUp' }: PageWrapperProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!wrapperRef.current) return;
        const target = wrapperRef.current;
        const duration = 0.6;
        const ease = "power3.out";

        if (type === 'blinds') {
            // 🎯 Blinds 타입: 본문은 처음부터 보이게 두고, 덮고 있던 흰색 기둥들을 위로 차르륵 치워줍니다.
            gsap.set(target, { opacity: 1 });
            gsap.set('#blinds-container', { visibility: 'visible' }); // 숨겨둔 기둥 컨테이너 표시
            gsap.fromTo('.blind-column',
                { scaleY: 1, transformOrigin: 'top' }, // 완전히 덮여있는 상태에서
                { scaleY: 0, duration: 0.6, stagger: 0.05, ease: "power3.inOut" } // 높이를 0으로 만들며 사라짐
            );
        } else {
            // 🎯 기존 애니메이션 로직
            switch (type) {
                case 'slideUp':
                    gsap.fromTo(target, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration, ease });
                    break;
                case 'fade':
                    gsap.fromTo(target, { opacity: 0 }, { opacity: 1, duration, ease });
                    break;
                case 'scale':
                    gsap.fromTo(target, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration, ease });
                    break;
                case 'slideLeft':
                    gsap.fromTo(target, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration, ease });
                    break;
            }
        }
    }, [type]);

    return (
        <>
            {/* 실제 페이지 내용물 */}
            <div id="page-wrapper" ref={wrapperRef} style={{ opacity: type === 'blinds' ? 1 : 0 }}>
                {children}
            </div>

            {/* 🚀 블라인드 효과를 위한 15개의 하얀색 세로 기둥 (평소엔 숨겨둠) */}
            <div
                id="blinds-container"
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    display: 'flex', zIndex: 9999, pointerEvents: 'none', visibility: 'hidden'
                }}
            >
                {[...Array(15)].map((_, i) => (
                    <div
                        className="blind-column"
                        key={i}
                        style={{ flex: 1, height: '100%', backgroundColor: 'white' }}
                    />
                ))}
            </div>
        </>
    );
}