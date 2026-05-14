"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from "@/lib/brochureGsap";

export default function Overlay3() {
    const titleRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // 💡 Section 3 구간 (스크롤 65% ~ 90%)에서 서서히 나타나도록 애니메이션 설정
            gsap.to(titleRef.current, {
                y: 0, opacity: 1,
                scrollTrigger: { trigger: ".scroll-container", start: "65% top", end: "85% top", scrub: 1 }
            });
            gsap.to(descRef.current, {
                y: 0, opacity: 1,
                scrollTrigger: { trigger: ".scroll-container", start: "65% top", end: "85% top", scrub: 1 }
            });
        });
        return () => ctx.revert();
    }, []);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>

            {/* 좌측 상단: 질문 타이틀 (위에서 아래로 스르륵) */}
            <div ref={titleRef} style={{
                position: 'absolute', top: '20%', left: '10%',
                color: '#111', // 배경이 다시 밝아졌으므로 어두운 글씨
                opacity: 0, transform: 'translateY(-50px)', willChange: 'transform, opacity'
            }}>
                <div style={{ fontSize: '2.5vw', fontWeight: 900, lineHeight: '1.3' }}>
                    비디텍의 IoT 실시간<br/>모니터링시스템은?
                </div>
            </div>

            {/* 우측 하단: 상세 설명 (아래에서 위로 스르륵) */}
            <div ref={descRef} style={{
                position: 'absolute', bottom: '10%', right: '10%',
                color: '#111', textAlign: 'right',
                opacity: 0, transform: 'translateY(50px)', willChange: 'transform, opacity'
            }}>
                <div style={{ fontSize: '1.2vw', fontWeight: 800, marginBottom: '10px' }}>
                    24시간 지속적인 모니터링으로<br/>집진상태 진단과 측정 시스템 제공
                </div>
                <div style={{ fontSize: '0.9vw', fontWeight: 500, lineHeight: '1.5', maxWidth: '600px', float: 'right' }}>
                    This system monitors the operational status of pollution prevention facilities in real-time, 24 hours a day, and securely transmits collected operational data—such as temperature, differential pressure, and current—as secured data to the Korea Environment Corporation server (www.greenlink.or.kr).
                </div>
            </div>

        </div>
    );
}