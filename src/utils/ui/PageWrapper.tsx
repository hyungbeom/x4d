'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// 🚀 허용할 애니메이션 타입 목록에 'blindsReverse' 추가!
export type TransitionType = 'slideUp' | 'fade' | 'scale' | 'slideLeft' | 'blinds' | 'blindsReverse';

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

        // 🎯 일반 Blinds & 역순 BlindsReverse 처리
        if (type === 'blinds' || type === 'blindsReverse') {
            gsap.set(target, { opacity: 1 });
            gsap.set('#blinds-container', { visibility: 'visible' }); // 숨겨둔 기둥 컨테이너 표시

            // PageWrapper.tsx 내부 useEffect 코드 중 수정

            if (type === 'blindsReverse') {
                gsap.fromTo('.blind-column',
                    { scaleY: 1, transformOrigin: 'bottom' },
                    {
                        scaleY: 0,
                        duration: 0.6,
                        stagger: { each: 0.05, from: "end" },
                        ease: "power3.inOut",
                        // 🚀 애니메이션 완료 후 완전히 숨겨버리기
                        onComplete: () => {
                            gsap.set('#blinds-container', { display: 'none' });
                        }
                    }
                );
            } else {
                gsap.fromTo('.blind-column',
                    { scaleY: 1, transformOrigin: 'top' },
                    {
                        scaleY: 0,
                        duration: 0.6,
                        stagger: 0.05,
                        ease: "power3.inOut",
                        // 🚀 애니메이션 완료 후 완전히 숨겨버리기
                        onComplete: () => {
                            gsap.set('#blinds-container', { display: 'none' });
                        }
                    }
                );
            }
        } else {
            // 🎯 나머지 기존 애니메이션 로직
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
            <div id="page-wrapper" ref={wrapperRef} style={{ opacity: (type === 'blinds' || type === 'blindsReverse') ? 1 : 0 }}>
                {children}
            </div>

            {/* 🚀 블라인드 효과를 위한 15개의 하얀색 세로 기둥 (평소엔 숨겨둠) */}
            <div
                id="blinds-container"
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100dvw', height: '100dvh',
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