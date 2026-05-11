"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function DynamicIsland() {
    // 🌟 1. DOM Refs
    const islandRef = useRef<HTMLDivElement>(null);
    const initialContentRef = useRef<HTMLDivElement>(null);
    const chatPanelRef = useRef<HTMLDivElement>(null);

    const inputSectionRef = useRef<HTMLDivElement>(null);
    const thinkingSectionRef = useRef<HTMLDivElement>(null);
    const resultSectionRef = useRef<HTMLDivElement>(null);

    const modalOverlayRef = useRef<HTMLDivElement>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);

    // 🌟 2. 상태(State) 관리
    const [isExpanded, setIsExpanded] = useState(false);
    const [mode, setMode] = useState<'input' | 'thinking' | 'result'>('input');
    const [chatInput, setChatInput] = useState("");
    const [submittedMessage, setSubmittedMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🌟 3. 충돌 방지를 위한 최적화 Refs
    const isFirstRender = useRef(true);
    const prevExpanded = useRef(isExpanded);
    const resetCallRef = useRef<gsap.core.Tween | null>(null);
    const thinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // =======================================================
    // 💡 [Effect 1] 외부 클릭 감지 (아일랜드 닫기)
    // =======================================================
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isModalOpen) return; // 모달 열려있으면 무시
            if (islandRef.current && !islandRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) document.addEventListener('mousedown', handleClickOutside);
        else document.removeEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded, isModalOpen]);

    // =======================================================
    // 💡 [Effect 2] 아일랜드 확장/축소 애니메이션 (버그 해결 핵심)
    // =======================================================
    useEffect(() => {
        if (!islandRef.current || !initialContentRef.current || !chatPanelRef.current) return;

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // 🌟 기존에 실행 중이던 애니메이션 즉시 강제 종료 (꼬임 완벽 방지)
        gsap.killTweensOf([islandRef.current, initialContentRef.current, chatPanelRef.current]);
        if (resetCallRef.current) resetCallRef.current.kill();

        if (isExpanded) {
            // 현재 모드에 따라 열리는 높이를 지능적으로 결정
            const targetHeight = mode === 'input' ? '350px' : mode === 'thinking' ? '200px' : '420px';

            gsap.to(initialContentRef.current, { opacity: 0, duration: 0.2 });
            gsap.to(islandRef.current, { width: '90vw', height: targetHeight, borderRadius: '24px', duration: 0.6, ease: "back.out(1.5)", delay: 0.1 });
            gsap.to(chatPanelRef.current, { opacity: 1, duration: 0.3, delay: 0.4 });
        } else {
            // 아일랜드가 닫힐 때 타이머 청소
            if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);

            gsap.to(chatPanelRef.current, { opacity: 0, duration: 0.2 });
            gsap.to(islandRef.current, { width: '200px', height: '50px', borderRadius: '25px', duration: 0.5, ease: "power3.inOut", delay: 0.1 });
            gsap.to(initialContentRef.current, { opacity: 1, duration: 0.3, delay: 0.4 });

            // 🌟 아일랜드가 완전히 닫힌 뒤(0.6초 후) 안전하게 상태 초기화
            resetCallRef.current = gsap.delayedCall(0.6, () => {
                setMode('input');
                setChatInput("");
                gsap.set(inputSectionRef.current, { opacity: 1, y: 0 });
                gsap.set([thinkingSectionRef.current, resultSectionRef.current], { opacity: 0, y: 10 });
            });
        }
    }, [isExpanded]); // 의존성에서 mode를 제거하여 불필요한 충돌 차단!

    // =======================================================
    // 💡 [Effect 3] Mode (input/thinking/result) 전환 애니메이션
    // =======================================================
    useEffect(() => {
        const justOpened = !prevExpanded.current && isExpanded;
        prevExpanded.current = isExpanded;

        if (!inputSectionRef.current || !thinkingSectionRef.current || !resultSectionRef.current) return;

        // 닫혀있거나, 방금 막 열릴 때는 모드 전환 애니메이션 스킵 (메인 애니메이션과 충돌 방지)
        if (!isExpanded || justOpened) return;

        gsap.killTweensOf([islandRef.current, inputSectionRef.current, thinkingSectionRef.current, resultSectionRef.current]);

        if (mode === 'input') {
            gsap.to(islandRef.current, { height: '350px', duration: 0.4, ease: "power3.out" });
            gsap.to([thinkingSectionRef.current, resultSectionRef.current], { opacity: 0, y: 10, duration: 0.2 });
            gsap.to(inputSectionRef.current, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
        } else if (mode === 'thinking') {
            gsap.to(islandRef.current, { height: '200px', duration: 0.4, ease: "power3.out" });
            gsap.to([inputSectionRef.current, resultSectionRef.current], { opacity: 0, y: -10, duration: 0.2 });
            gsap.to(thinkingSectionRef.current, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
        } else if (mode === 'result') {
            gsap.to(islandRef.current, { height: '420px', duration: 0.4, ease: "power3.out" });
            gsap.to([inputSectionRef.current, thinkingSectionRef.current], { opacity: 0, y: -10, duration: 0.2 });
            gsap.to(resultSectionRef.current, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
        }
    }, [mode, isExpanded]);

    // =======================================================
    // 💡 [Effect 4] 모달 창 열기/닫기 애니메이션
    // =======================================================
    useEffect(() => {
        if (!modalOverlayRef.current || !modalContentRef.current) return;
        gsap.killTweensOf([modalOverlayRef.current, modalContentRef.current]);

        if (isModalOpen) {
            gsap.to(modalOverlayRef.current, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalContentRef.current,
                { opacity: 0, y: 50, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)", delay: 0.1 }
            );
        } else {
            gsap.to(modalContentRef.current, { opacity: 0, y: 20, scale: 0.95, duration: 0.3, ease: "power2.in" });
            gsap.to(modalOverlayRef.current, { opacity: 0, duration: 0.3, delay: 0.1 });
        }
    }, [isModalOpen]);

    // =======================================================
    // 💡 [Event] Enter 키 동작 제어
    // =======================================================
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!chatInput.trim()) return;

            setSubmittedMessage(chatInput);
            setMode('thinking');
            setChatInput("");

            if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
            thinkingTimeoutRef.current = setTimeout(() => setMode('result'), 3000);
        }
    };

    return (
        <>
            {/* --- 다이내믹 아일랜드 메인 --- */}
            <div
                ref={islandRef}
                style={{
                    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 9999, cursor: isExpanded ? 'default' : 'pointer', overflow: 'hidden',
                    width: '200px', height: '50px', backgroundColor: 'rgba(20, 20, 20, 0.85)',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '25px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 15px',
                }}
                onClick={(e) => {
                    // 내부 클릭 시 의도치 않게 닫히는 현상 방지
                    if (isExpanded && chatPanelRef.current && chatPanelRef.current.contains(e.target as Node)) return;
                    setIsExpanded(!isExpanded);
                }}
            >
                {/* 1. 처음 닫힌 모양 */}
                <div
                    ref={initialContentRef}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px', position: 'absolute',
                        opacity: 1, pointerEvents: isExpanded ? 'none' : 'auto', // 🌟 투명할 땐 클릭 완전 무시
                    }}
                >
                    <div style={{ position: 'relative', width: '20px', height: '14px' }}>
                        <div style={{ width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }} />
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: 0 }}>
                            <div style={{ width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
                            <div style={{ width: '4px', height: '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
                        </div>
                    </div>
                    <span style={{ color: '#fff', fontSize: '16px', fontWeight: 600, whiteSpace: 'keep-all' }}>Ask BDTec</span>
                </div>

                {/* 2. 확장 내부 패널 */}
                <div
                    ref={chatPanelRef}
                    style={{
                        position: 'absolute', inset: 0, padding: '25px',
                        opacity: 0, pointerEvents: isExpanded ? 'auto' : 'none' // 🌟 보이지 않을 땐 클릭 완전 무시
                    }}
                >
                    {/* A. 입력 모드 */}
                    <div ref={inputSectionRef} style={{ position: 'absolute', inset: '25px', display: 'flex', flexDirection: 'column', pointerEvents: mode === 'input' ? 'auto' : 'none' }}>
                        <textarea
                            value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask anything..."
                            style={{ flex: 1, width: '100%', backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '18px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: '10px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px', alignSelf: 'flex-end' }}>Press Enter to send</span>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '1.5em' }}>
                                <span style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>How can I guide you?</span>
                            </div>
                        </div>
                    </div>

                    {/* B. 생각 중 모드 */}
                    <div ref={thinkingSectionRef} style={{ position: 'absolute', inset: '25px', display: 'flex', flexDirection: 'column', opacity: 0, transform: 'translateY(10px)', pointerEvents: mode === 'thinking' ? 'auto' : 'none', gap: '15px' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{submittedMessage}</span>
                        </div>
                        <div style={{ height: '50px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Thinking...</span>
                        </div>
                    </div>

                    {/* C. 결과 모드 */}
                    <div ref={resultSectionRef} style={{ position: 'absolute', inset: '25px', display: 'flex', flexDirection: 'column', opacity: 0, transform: 'translateY(10px)', pointerEvents: mode === 'result' ? 'auto' : 'none', gap: '10px' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', display: 'flex', gap: '15px', position: 'relative' }}>
                            <div onClick={() => setIsExpanded(false)} style={{ position: 'absolute', top: '15px', right: '15px', color: '#888', cursor: 'pointer', fontSize: '14px' }}>✕</div>
                            <div style={{ width: '60px', height: '60px', backgroundColor: '#e0e0e0', borderRadius: '12px', flexShrink: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ color: '#5ea2e6', fontSize: '15px', fontWeight: 600 }}>Testing Waters</span>
                                <span style={{ color: '#fff', fontSize: '14px', lineHeight: 1.4 }}>It looks like you're testing the interface!</span>
                                <button onClick={() => setIsModalOpen(true)} style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', cursor: 'pointer', marginTop: '5px' }}>
                                    More →
                                </button>
                            </div>
                        </div>
                        <div onClick={() => setMode('input')} style={{ height: '50px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Another question?</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 모바일 핏(Fit) 풀스크린 모달 --- */}
            <div
                ref={modalOverlayRef}
                style={{
                    position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3vh 5%', boxSizing: 'border-box',
                    opacity: 0, pointerEvents: isModalOpen ? 'auto' : 'none' // 🌟 클릭 가로채기 완벽 차단!
                }}
                onClick={() => setIsModalOpen(false)}
            >
                <div
                    ref={modalContentRef} onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'relative', width: '100%', maxWidth: '420px', height: '100%', maxHeight: '90vh',
                        backgroundColor: '#eef2f6', borderRadius: 'clamp(20px, 4vh, 30px)', padding: 'clamp(16px, 3vh, 24px)',
                        display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vh, 20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <div style={{ width: 'clamp(28px, 4vh, 32px)', height: 'clamp(28px, 4vh, 32px)', backgroundColor: '#dce4ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                                <div style={{ width: '3px', height: '3px', backgroundColor: '#8a99a8', borderRadius: '50%' }}/>
                                <div style={{ width: '3px', height: '3px', backgroundColor: '#8a99a8', borderRadius: '50%' }}/>
                                <div style={{ width: '3px', height: '3px', backgroundColor: '#8a99a8', borderRadius: '50%' }}/>
                                <div style={{ width: '3px', height: '3px', backgroundColor: '#8a99a8', borderRadius: '50%' }}/>
                            </div>
                        </div>
                        <div
                            onClick={() => { setIsModalOpen(false); setIsExpanded(false); }}
                            style={{ fontSize: '11px', fontWeight: 600, color: '#5b6b7c', letterSpacing: '1px', cursor: 'pointer' }}
                        >
                            [ CLOSE ]
                        </div>
                    </div>

                    <div style={{ flex: 1, minHeight: 0, backgroundColor: '#fff', borderRadius: '24px', padding: 'clamp(16px, 3vh, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.5vh, 16px)', boxShadow: '0 10px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#8a99a8', flexShrink: 0 }}>
                            <span style={{ fontSize: '13px', letterSpacing: '2px', fontWeight: 500 }}>▢ ▱ ◯ ▱</span>
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>^</span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: 'clamp(22px, 4vh, 32px)', fontWeight: 500, color: '#2b70c9', flexShrink: 0 }}>Open Curiosity</h2>
                        <div style={{ flex: 1, minHeight: '60px', backgroundColor: '#0c1b2a', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <span style={{ color: '#fff', opacity: 0.5, fontSize: 'clamp(12px, 2vh, 16px)' }}>Image Area</span>
                        </div>
                        <div style={{ backgroundColor: '#e1e8f0', padding: 'clamp(12px, 2vh, 20px)', borderRadius: '16px', flexShrink: 0 }}>
                            <p style={{ margin: 0, color: '#334155', fontSize: 'clamp(12px, 1.8vh, 15px)', lineHeight: 1.4 }}>Whether you're curious about specifications...</p>
                        </div>
                        <button style={{ alignSelf: 'flex-start', backgroundColor: '#1b263b', color: '#fff', border: 'none', borderRadius: '24px', padding: 'clamp(10px, 1.5vh, 12px) 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            View Specs <span>→</span>
                        </button>
                    </div>

                    <div
                        onClick={() => { setIsModalOpen(false); setMode('input'); }}
                        style={{ backgroundColor: '#0a1118', borderRadius: '30px', padding: 'clamp(12px, 2vh, 16px) 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                    >
                        <div style={{ position: 'absolute', left: '20px', display: 'flex', gap: '4px' }}>
                            <div style={{ width: '3px', height: '3px', backgroundColor: '#fff', borderRadius: '50%' }} />
                            <div style={{ width: '3px', height: '3px', backgroundColor: '#fff', borderRadius: '50%' }} />
                            <div style={{ width: '3px', height: '3px', backgroundColor: '#fff', borderRadius: '50%' }} />
                        </div>
                        <span style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>Ask me for more</span>
                    </div>
                </div>
            </div>
        </>
    );
}