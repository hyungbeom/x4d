"use client";

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

// 🌟 커스텀 훅: 화면 너비 감지
function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 1200,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({ width: window.innerWidth });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
}

type DynamicIslandProps = {
    /** fixed: 상단 중앙 플로팅(기본) · inline: 상단 바 안에 배치 */
    placement?: 'fixed' | 'inline';
    companyId?: string;
};

export default function DynamicIsland({
    placement = 'fixed',
    companyId: companyIdProp = 'bdtec',
}: DynamicIslandProps) {
    const { width } = useWindowSize();
    const isMobile = width <= 768;
    const isInline = placement === 'inline';
    const isCompactClosed = isMobile || isInline;

    // 모바일/PC 반응형 크기 변수
    const fzTitle = isMobile ? '12px' : '16px';
    const fzText = isMobile ? '11px' : '15px';
    const paddingIsland = isMobile ? '12px' : '25px';

    const closedWidth = isInline ? '112px' : isMobile ? '110px' : '200px';
    const closedHeight = isInline ? '32px' : isMobile ? '32px' : '50px';

    const openInputHeight = isMobile ? '200px' : '350px';
    const openThinkingHeight = isMobile ? '110px' : '200px';
    const openResultHeight = isMobile ? '250px' : '420px';

    // 1. DOM Refs
    const islandRef = useRef<HTMLDivElement>(null);
    const initialContentRef = useRef<HTMLDivElement>(null);
    const chatPanelRef = useRef<HTMLDivElement>(null);

    const inputSectionRef = useRef<HTMLDivElement>(null);
    const thinkingSectionRef = useRef<HTMLDivElement>(null);
    const resultSectionRef = useRef<HTMLDivElement>(null);

    const modalOverlayRef = useRef<HTMLDivElement>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);

    // 2. 상태(State) 관리
    const [isExpanded, setIsExpanded] = useState(false);
    /** inline: 상단 바 슬롯에 붙어 있는 상태 (닫힘 애니메이션 끝난 뒤만 true) */
    const [inlineDocked, setInlineDocked] = useState(true);
    const [mode, setMode] = useState<'input' | 'thinking' | 'result'>('input');
    const [chatInput, setChatInput] = useState("");
    const [submittedMessage, setSubmittedMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🌟 백엔드 연동 관련 추가 상태
    const [aiResponse, setAiResponse] = useState(""); // AI가 보내주는 실시간 텍스트 누적
    const [companyId] = useState(companyIdProp);
    const eventSourceRef = useRef<EventSource | null>(null); // 통신 객체 보관용

    const [chatId] = useState(() => Math.random().toString(36).substring(2, 12));

    // 3. 충돌 방지를 위한 최적화 Refs
    const isFirstRender = useRef(true);
    const prevExpanded = useRef(isExpanded);
    const resetCallRef = useRef<gsap.core.Tween | null>(null);

    // 컴포넌트 언마운트 시 클린업
    useEffect(() => {
        return () => {
            if (resetCallRef.current) resetCallRef.current.kill();
            if (eventSourceRef.current) {
                eventSourceRef.current.close(); // 열려있는 통신 강제 종료
            }
            const nodes = [islandRef.current, initialContentRef.current, chatPanelRef.current, inputSectionRef.current, thinkingSectionRef.current, resultSectionRef.current, modalOverlayRef.current, modalContentRef.current].filter(Boolean);
            if (nodes.length) gsap.killTweensOf(nodes);
        };
    }, []);

    // 💡 [Effect 1] 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isModalOpen) return;
            if (islandRef.current && !islandRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) document.addEventListener('mousedown', handleClickOutside);
        else document.removeEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded, isModalOpen]);

    // 💡 [Effect 2] 아일랜드 확장/축소 애니메이션
    useEffect(() => {
        if (!islandRef.current || !initialContentRef.current || !chatPanelRef.current) return;
        if (isFirstRender.current) { isFirstRender.current = false; return; }

        gsap.killTweensOf([islandRef.current, initialContentRef.current, chatPanelRef.current]);
        if (resetCallRef.current) resetCallRef.current.kill();

        if (isExpanded) {
            if (isInline) setInlineDocked(false);

            const targetHeight = mode === 'input' ? openInputHeight
                : mode === 'thinking' ? openThinkingHeight
                    : openResultHeight;

            gsap.to(initialContentRef.current, { opacity: 0, duration: 0.2 });
            gsap.to(islandRef.current, { width: '90vw', maxWidth: '350px', height: targetHeight, borderRadius: isMobile ? '16px' : '24px', duration: 0.6, ease: "back.out(1.5)", delay: 0.1 });
            gsap.to(chatPanelRef.current, { opacity: 1, duration: 0.3, delay: 0.4 });
        } else {
            // 🌟 아일랜드가 닫힐 때 통신 진행 중이라면 끊어주기
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }

            gsap.to(chatPanelRef.current, { opacity: 0, duration: 0.2 });
            gsap.to(islandRef.current, {
                width: closedWidth,
                maxWidth: closedWidth,
                height: closedHeight,
                borderRadius: '25px',
                duration: 0.5,
                ease: 'power3.inOut',
                delay: 0.1,
                onComplete: () => {
                    if (!isInline || !islandRef.current) return;
                    gsap.set(islandRef.current, {
                        width: closedWidth,
                        maxWidth: closedWidth,
                        height: closedHeight,
                        borderRadius: '25px',
                    });
                    setInlineDocked(true);
                },
            });
            gsap.to(initialContentRef.current, { opacity: 1, duration: 0.3, delay: 0.4 });

            resetCallRef.current = gsap.delayedCall(0.6, () => {
                setMode('input');
                setChatInput("");
                setAiResponse(""); // 텍스트 초기화
                gsap.set(inputSectionRef.current, { opacity: 1, y: 0 });
                gsap.set([thinkingSectionRef.current, resultSectionRef.current], { opacity: 0, y: 10 });
            });
        }
    }, [isExpanded, mode, isMobile, isInline, closedWidth, closedHeight]);

    // 💡 [Effect 3] Mode 전환 애니메이션
    useEffect(() => {
        const justOpened = !prevExpanded.current && isExpanded;
        prevExpanded.current = isExpanded;

        if (!inputSectionRef.current || !thinkingSectionRef.current || !resultSectionRef.current) return;
        if (!isExpanded || justOpened) return;

        gsap.killTweensOf([islandRef.current, inputSectionRef.current, thinkingSectionRef.current, resultSectionRef.current]);

        if (mode === 'input') {
            gsap.to(islandRef.current, { height: openInputHeight, duration: 0.4, ease: "power3.out" });
            gsap.to([thinkingSectionRef.current, resultSectionRef.current], { opacity: 0, y: 10, duration: 0.2 });
            gsap.to(inputSectionRef.current, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
        } else if (mode === 'thinking') {
            gsap.to(islandRef.current, { height: openThinkingHeight, duration: 0.4, ease: "power3.out" });
            gsap.to([inputSectionRef.current, resultSectionRef.current], { opacity: 0, y: -10, duration: 0.2 });
            gsap.to(thinkingSectionRef.current, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
        } else if (mode === 'result') {
            gsap.to(islandRef.current, { height: openResultHeight, duration: 0.4, ease: "power3.out" });
            gsap.to([inputSectionRef.current, thinkingSectionRef.current], { opacity: 0, y: -10, duration: 0.2 });
            gsap.to(resultSectionRef.current, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
        }
    }, [mode, isExpanded, isMobile]);

    // 💡 [Effect 4] 모달 창 열기/닫기 애니메이션
    useEffect(() => {
        // 모달 애니메이션 코드 동일...
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

    // 💡 [Event] Enter 키 동작 및 백엔드 연동 핵심 로직
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!chatInput.trim()) return;

            const question = chatInput.trim();
            setSubmittedMessage(question);
            setMode('result');
            setChatInput("");
            setAiResponse(""); // 이전 답변 초기화

            // 기존에 연결된 SSE가 있다면 종료
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            // 🌟 백엔드 API 연결
            const url = `http://localhost:8080/api/chat/${companyId}?message=${encodeURIComponent(question)}&chatId=${chatId}`;
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            let isFirstMessage = true;

            // 서버에서 글자가 한 글자씩 날아올 때마다 실행됨
            eventSource.onmessage = (event) => {
                if (isFirstMessage) {
                    setMode('result'); // 첫 글자가 오면 결과창 모드로 부드럽게 전환!
                    isFirstMessage = false;
                }
                setAiResponse((prev) => prev + event.data);
            };

            // 서버 통신이 종료되거나 에러가 났을 때
            eventSource.onerror = (error) => {
                eventSource.close();
                eventSourceRef.current = null;

                // 만약 에러로 끝났는데 아직 첫 글자도 못 받았다면 강제로 결과창 전환
                if (isFirstMessage) {
                    setMode('result');
                    setAiResponse("답변을 생성하는 도중 오류가 발생했습니다.");
                }
            };
        }
    };

    return (
        <>
            <div
                ref={islandRef}
                style={{
                    position: isInline && inlineDocked ? 'relative' : 'fixed',
                    top: isInline && inlineDocked ? undefined : '10px',
                    left: isInline && inlineDocked ? undefined : isInline ? 'auto' : '50%',
                    right: isInline && inlineDocked ? undefined : isInline ? 'clamp(16px, 3vw, 28px)' : undefined,
                    transform: isInline && inlineDocked ? undefined : isInline ? 'none' : 'translateX(-50%)',
                    flexShrink: isInline && inlineDocked ? 0 : undefined,
                    zIndex: 9999,
                    cursor: isExpanded ? 'default' : 'pointer',
                    overflow: 'hidden',
                    width: isInline && inlineDocked ? '100%' : closedWidth,
                    height: isInline && inlineDocked ? '100%' : closedHeight,
                    minWidth: isInline && inlineDocked ? closedWidth : undefined,
                    backgroundColor: 'rgba(20, 20, 20, 0.85)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '25px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isInline && inlineDocked ? '0 10px' : '0 12px',
                    boxSizing: 'border-box',
                }}
                onClick={(e) => {
                    if (isExpanded && chatPanelRef.current && chatPanelRef.current.contains(e.target as Node)) return;
                    setIsExpanded(!isExpanded);
                }}
            >
                {/* 1. 처음 닫힌 모양 */}
                <div
                    ref={initialContentRef}
                    style={{
                        display: 'flex', alignItems: 'center',                         gap: isCompactClosed ? '6px' : '8px', position: 'absolute',
                        opacity: 1, pointerEvents: isExpanded ? 'none' : 'auto',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <div style={{ position: 'relative', width: isCompactClosed ? '12px' : '20px', height: isCompactClosed ? '8px' : '14px', flexShrink: 0 }}>
                        <div style={{ width: isCompactClosed ? '3px' : '4px', height: isCompactClosed ? '3px' : '4px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }} />
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: 0 }}>
                            <div style={{ width: isCompactClosed ? '3px' : '4px', height: isCompactClosed ? '3px' : '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
                            <div style={{ width: isCompactClosed ? '3px' : '4px', height: isCompactClosed ? '3px' : '4px', backgroundColor: '#fff', borderRadius: '50%' }} />
                        </div>
                    </div>
                    <span style={{ color: '#fff', fontSize: isCompactClosed ? '11px' : '16px', fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: isCompactClosed ? '-0.5px' : 'normal' }}>AI ASK</span>
                </div>

                {/* 2. 확장 내부 패널 */}
                <div
                    ref={chatPanelRef}
                    style={{
                        position: 'absolute', inset: 0, padding: paddingIsland,
                        opacity: 0, pointerEvents: isExpanded ? 'auto' : 'none'
                    }}
                >
                    {/* A. 입력 모드 */}
                    <div ref={inputSectionRef} style={{ position: 'absolute', inset: paddingIsland, display: 'flex', flexDirection: 'column', pointerEvents: mode === 'input' ? 'auto' : 'none' }}>
                        <textarea
                            value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask anything..."
                            style={{ flex: 1, width: '100%', backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: fzTitle, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: isMobile ? '4px' : '8px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: isMobile ? '9px' : '13px', alignSelf: 'flex-end' }}>Press Enter</span>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '1.5em' }}>
                                <span style={{ color: '#fff', fontSize: fzTitle, fontWeight: 600 }}>How can I guide you?</span>
                            </div>
                        </div>
                    </div>

                    {/* B. 생각 중 모드 (서버에 요청 후 응답이 올 때까지 대기) */}
                    <div ref={thinkingSectionRef} style={{ position: 'absolute', inset: paddingIsland, display: 'flex', flexDirection: 'column', opacity: 0, transform: 'translateY(10px)', pointerEvents: mode === 'thinking' ? 'auto' : 'none', gap: isMobile ? '8px' : '15px' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: isMobile ? '12px' : '20px', padding: isMobile ? '8px 12px' : '15px 20px', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
                            <div style={{ width: isMobile ? '10px' : '14px', height: isMobile ? '10px' : '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: fzText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{submittedMessage}</span>
                        </div>
                        <div style={{ height: isMobile ? '32px' : '50px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: isMobile ? '11px' : '14px', fontWeight: 600 }}>서버와 연결 중...</span>
                        </div>
                    </div>

                    {/* C. 결과 모드 — 질문 + 답변 */}
                    <div ref={resultSectionRef} style={{ position: 'absolute', inset: paddingIsland, display: 'flex', flexDirection: 'column', opacity: 0, transform: 'translateY(10px)', pointerEvents: mode === 'result' ? 'auto' : 'none', gap: isMobile ? '6px' : '10px' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: isMobile ? '12px' : '20px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: isMobile ? '12px' : '20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: 0 }}>
                            <div onClick={() => setIsExpanded(false)} style={{ position: 'absolute', top: isMobile ? '10px' : '15px', right: isMobile ? '10px' : '15px', color: '#888', cursor: 'pointer', fontSize: isMobile ? '10px' : '14px' }}>✕</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '14px', overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '10px', paddingTop: isMobile ? '4px' : '8px' }}>
                                {submittedMessage ? (
                                    <p
                                        style={{
                                            margin: 0,
                                            color: 'rgba(255, 255, 255, 0.88)',
                                            fontSize: isMobile ? '11px' : '13px',
                                            lineHeight: 1.45,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {submittedMessage}
                                    </p>
                                ) : null}
                                <p
                                    style={{
                                        margin: 0,
                                        color: '#fff',
                                        fontSize: isMobile ? '12px' : '14px',
                                        lineHeight: 1.55,
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {aiResponse || '답변을 불러오는 중입니다...'}
                                </p>
                            </div>
                        </div>
                        {/* 다시 질문하기 버튼 */}
                        <div onClick={() => setMode('input')} style={{ height: isMobile ? '32px' : '50px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: isMobile ? '11px' : '14px', fontWeight: 600 }}>다른 질문하기</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 모달 영역 유지 --- */}
            <div
                ref={modalOverlayRef}
                style={{
                    position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3vh 5%', boxSizing: 'border-box',
                    opacity: 0, pointerEvents: isModalOpen ? 'auto' : 'none'
                }}
                onClick={() => setIsModalOpen(false)}
            >
                <div
                    ref={modalContentRef} onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'relative', width: '100%', maxWidth: '420px', height: '100%', maxHeight: '90vh',
                        backgroundColor: '#eef2f6', borderRadius: 'clamp(20px, 4vh, 30px)', padding: 'clamp(12px, 2.5vh, 24px)',
                        display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.5vh, 20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <div style={{ width: 'clamp(24px, 3vh, 32px)', height: 'clamp(24px, 3vh, 32px)', backgroundColor: '#dce4ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                                <div style={{ width: '3px', height: '3px', backgroundColor: '#8a99a8', borderRadius: '50%' }}/>
                                <div style={{ width: '3px', height: '3px', backgroundColor: '#8a99a8', borderRadius: '50%' }}/>
                                <div style={{ width: '3px', height: '3px', backgroundColor: '#8a99a8', borderRadius: '50%' }}/>
                                <div style={{ width: '3px', height: '3px', backgroundColor: '#8a99a8', borderRadius: '50%' }}/>
                            </div>
                        </div>
                        <div
                            onClick={() => { setIsModalOpen(false); setIsExpanded(false); }}
                            style={{ fontSize: '10px', fontWeight: 600, color: '#5b6b7c', letterSpacing: '1px', cursor: 'pointer' }}
                        >
                            [ CLOSE ]
                        </div>
                    </div>

                    <div style={{ flex: 1, minHeight: 0, backgroundColor: '#fff', borderRadius: '20px', padding: 'clamp(14px, 2.5vh, 24px)', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.2vh, 16px)', boxShadow: '0 10px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#8a99a8', flexShrink: 0 }}>
                            <span style={{ fontSize: '11px', letterSpacing: '2px', fontWeight: 500 }}>▢ ▱ ◯ ▱</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>^</span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: 'clamp(18px, 3.5vh, 32px)', fontWeight: 500, color: '#2b70c9', flexShrink: 0 }}>Open Curiosity</h2>
                        <div style={{ flex: 1, minHeight: '50px', backgroundColor: '#0c1b2a', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <span style={{ color: '#fff', opacity: 0.5, fontSize: 'clamp(11px, 1.8vh, 16px)' }}>Image Area</span>
                        </div>
                        <div style={{ backgroundColor: '#e1e8f0', padding: 'clamp(10px, 1.5vh, 20px)', borderRadius: '14px', flexShrink: 0 }}>
                            <p style={{ margin: 0, color: '#334155', fontSize: 'clamp(11px, 1.6vh, 15px)', lineHeight: 1.4 }}>Whether you're curious about specifications...</p>
                        </div>
                        <button style={{ alignSelf: 'flex-start', backgroundColor: '#1b263b', color: '#fff', border: 'none', borderRadius: '20px', padding: 'clamp(8px, 1.2vh, 12px) 20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            View Specs <span>→</span>
                        </button>
                    </div>

                    <div
                        onClick={() => { setIsModalOpen(false); setMode('input'); }}
                        style={{ backgroundColor: '#0a1118', borderRadius: '25px', padding: 'clamp(10px, 1.5vh, 16px) 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                    >
                        <div style={{ position: 'absolute', left: '15px', display: 'flex', gap: '4px' }}>
                            <div style={{ width: '3px', height: '3px', backgroundColor: '#fff', borderRadius: '50%' }} />
                            <div style={{ width: '3px', height: '3px', backgroundColor: '#fff', borderRadius: '50%' }} />
                            <div style={{ width: '3px', height: '3px', backgroundColor: '#fff', borderRadius: '50%' }} />
                        </div>
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Ask me for more</span>
                    </div>
                </div>
            </div>
        </>
    );
}