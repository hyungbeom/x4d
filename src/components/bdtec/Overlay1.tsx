// components/Overlay1.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollIndicator from "@/utils/ScrollIndicator";

gsap.registerPlugin(ScrollTrigger);

export default function Overlay1() {
    const logoRef = useRef<HTMLImageElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.to(logoRef.current, { scale: 0.3, y: -35, transformOrigin: "top left", scrollTrigger: { trigger: ".scroll-container", start: "top top", end: "bottom bottom", scrub: 1 } });
            gsap.to(textRef.current, { opacity: 0, y: -20, scrollTrigger: { trigger: ".scroll-container", start: "top top", end: "30% top", scrub: 1 } });
            gsap.to(boxRef.current, { x: -150, opacity: 0, scrollTrigger: { trigger: ".scroll-container", start: "top top", end: "50% top", scrub: 1 } });
            gsap.to(indicatorRef.current, { opacity: 0, y: 20, scrollTrigger: { trigger: ".scroll-container", start: "top top", end: "15% top", scrub: 1 } });
        });
        return () => ctx.revert();
    }, []);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
            {/* 상단 로고 및 텍스트 */}
            <div
                style={{
                    position: 'absolute',
                    fontSize: '13px',
                    fontFamily: 'Meslo',
                    lineHeight: '1.6em',
                    whiteSpace: 'pre',
                    pointerEvents: 'none',
                    width: '100%',
                }}
            >
                <div style={{padding: 20}}>
                    <div>
                        <div style={{width: '100%', textAlign: 'right', paddingBottom: 15, pointerEvents: 'none'}}>
                            <span
                                style={{
                                    border: '1px dashed white',
                                    padding: '7px 12px',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    color: 'white',
                                    pointerEvents: 'auto',
                                    display: 'inline-block',
                                    cursor: 'pointer',
                                }}
                            >
                                MENU
                            </span>
                        </div>
                        <img ref={logoRef} src="/model/bdtec/Logo.svg" width={'100%'} alt="" style={{willChange: 'transform', pointerEvents: 'none'}} />
                        <div ref={textRef} style={{float : 'right', fontWeight : 600, fontSize : 13}}>
                            <div style={{ width: 250, color : 'white', whiteSpace: 'normal', wordBreak: 'keep-all', lineHeight: '1.4em' }}>
                                Specialized in the management of small-scale air emission facilities, this product tracks operational status, collects data, and provides real-time monitoring.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 좌측 하단 박스 */}
            <div ref={boxRef} style={{
                position: 'absolute', bottom: '10px', left: '10px', width: '180px', padding: '10px',
                background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
                border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                color: '#ffffff', wordBreak: 'keep-all', willChange: 'transform, opacity',
                pointerEvents: 'none',
            }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
                    IoT GATEWAY <br/>(Environmental IoT)<br/>BDI-100
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9,  whiteSpace: 'normal' }}>
                    Specialized in the management of small-scale air emission facilities...
                </div>
            </div>

            {/* 우측 하단 인디케이터 */}
            <div
                ref={indicatorRef}
                style={{
                    position: 'absolute',
                    bottom: 50,
                    right: 50,
                    fontSize: '13px',
                    willChange: 'opacity, transform',
                    pointerEvents: 'none',
                }}
            >
                <ScrollIndicator/>
            </div>
        </div>
    );
}