"use client";

import React, { useCallback, useState, useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ChatAnswerContent from '@/components/chat/ChatAnswerContent';
import { flushSseRemainder, parseSseBuffer } from '@/utils/prepareChatHtml';

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
    const panelPadPx = isMobile ? 12 : 25;
    const paddingIsland = `${panelPadPx}px`;

    const closedWidth = isInline ? '112px' : isMobile ? '110px' : '200px';
    const closedHeight = isInline ? '32px' : isMobile ? '32px' : '50px';

    /** 입력·답변 영역 1줄 높이 (font-size × line-height 1.5) */
    const lineHeightPx = isMobile ? 18 : 24;
    const panelLines = (collapsed: boolean) => (collapsed ? 5 : 12);
    const collapseBarH = isMobile ? 18 : 22;
    const panelGap = 6;
    const inputFooterH = isMobile ? 50 : 76;
    const resultActionH = isMobile ? 32 : 50;
    const thinkingStatusH = isMobile ? 32 : 50;
    const thinkingMsgH = isMobile ? 36 : 52;

    const getTargetHeight = useCallback(
        (m: typeof mode, collapsed: boolean) => {
            const lines = panelLines(collapsed);
            const textH = lines * lineHeightPx;
            const chrome = panelPadPx * 2 + panelGap + collapseBarH;

            if (m === 'input') {
                return chrome + textH + inputFooterH;
            }
            if (m === 'thinking') {
                return chrome + thinkingMsgH + (isMobile ? 8 : 15) + thinkingStatusH;
            }
            const resultGap = isMobile ? 6 : 10;
            return chrome + textH + resultGap + resultActionH;
        },
        [
            isMobile,
            lineHeightPx,
            panelPadPx,
            collapseBarH,
            panelGap,
            inputFooterH,
            resultActionH,
            thinkingStatusH,
            thinkingMsgH,
        ],
    );

    // 1. DOM Refs
    const islandRef = useRef<HTMLDivElement>(null);
    const initialContentRef = useRef<HTMLDivElement>(null);
    const chatPanelRef = useRef<HTMLDivElement>(null);
    const chatContentRef = useRef<HTMLDivElement>(null);

    const inputSectionRef = useRef<HTMLFormElement>(null);
    const thinkingSectionRef = useRef<HTMLDivElement>(null);
    const resultSectionRef = useRef<HTMLDivElement>(null);

    const modalOverlayRef = useRef<HTMLDivElement>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);

    // 2. 상태(State) 관리
    const [isExpanded, setIsExpanded] = useState(false);
    /** true = 5줄(기본), false = 12줄(펼침) */
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(true);
    /** inline: 상단 바 슬롯에 붙어 있는 상태 (닫힘 애니메이션 끝난 뒤만 true) */
    const [inlineDocked, setInlineDocked] = useState(true);
    const [mode, setMode] = useState<'input' | 'thinking' | 'result'>('input');
    const [chatInput, setChatInput] = useState("");
    const [submittedMessage, setSubmittedMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🌟 백엔드 연동 관련 추가 상태
    const [aiResponse, setAiResponse] = useState(''); // AI가 보내주는 실시간 텍스트 누적
    const [chatStreaming, setChatStreaming] = useState(false);
    const [companyId] = useState(companyIdProp);
    const chatAbortRef = useRef<AbortController | null>(null);

    const [chatId] = useState(() => Math.random().toString(36).substring(2, 12));

    // 3. 충돌 방지를 위한 최적화 Refs
    const isFirstRender = useRef(true);
    const prevExpanded = useRef(isExpanded);
    const prevExpandedForAnim = useRef(isExpanded);
    const resetCallRef = useRef<gsap.core.Tween | null>(null);

    // 컴포넌트 언마운트 시 클린업
    useEffect(() => {
        return () => {
            if (resetCallRef.current) resetCallRef.current.kill();
            chatAbortRef.current?.abort();
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

    // 💡 [Effect 2] 아일랜드 확장/축소 애니메이션 (isExpanded 변경 시에만)
    useLayoutEffect(() => {
        if (!islandRef.current || !initialContentRef.current || !chatPanelRef.current) return;
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        if (prevExpandedForAnim.current === isExpanded) return;
        prevExpandedForAnim.current = isExpanded;

        const island = islandRef.current;
        const initialContent = initialContentRef.current;
        const chatPanel = chatPanelRef.current;
        const slot = isInline ? island.parentElement : null;
        const slotRect = slot?.getBoundingClientRect();

        gsap.killTweensOf([island, initialContent, chatPanel]);
        if (resetCallRef.current) resetCallRef.current.kill();

        const targetHeight = getTargetHeight(mode, isPanelCollapsed);
        const openWidth = Math.min(window.innerWidth * 0.92, isMobile ? 400 : 420);
        const openTop = Math.max(12, 10);

        if (isExpanded) {
            if (isInline) {
                setInlineDocked(false);
                if (slotRect) {
                    gsap.set(island, {
                        position: 'fixed',
                        left: slotRect.left + slotRect.width / 2,
                        top: slotRect.top,
                        xPercent: -50,
                        yPercent: 0,
                        width: slotRect.width,
                        height: slotRect.height,
                        maxWidth: slotRect.width,
                        right: 'auto',
                        transform: 'none',
                    });
                }
            }

            gsap.to(initialContent, { opacity: 0, duration: 0.2 });
            gsap.to(island, {
                position: 'fixed',
                left: '50%',
                top: openTop,
                xPercent: -50,
                yPercent: 0,
                right: 'auto',
                transform: 'none',
                width: openWidth,
                maxWidth: openWidth,
                minWidth: 0,
                height: targetHeight,
                borderRadius: isMobile ? '16px' : '24px',
                duration: 0.55,
                ease: 'power3.out',
                delay: 0.08,
            });
            gsap.to(chatPanel, { opacity: 1, duration: 0.3, delay: 0.35 });
        } else {
            // 🌟 아일랜드가 닫힐 때 통신 진행 중이라면 끊어주기
            chatAbortRef.current?.abort();
            chatAbortRef.current = null;

            gsap.to(chatPanel, { opacity: 0, duration: 0.2 });

            if (isInline && slotRect) {
                gsap.to(island, {
                    width: slotRect.width,
                    maxWidth: slotRect.width,
                    height: slotRect.height,
                    left: slotRect.left + slotRect.width / 2,
                    top: slotRect.top,
                    xPercent: -50,
                    borderRadius: '25px',
                    duration: 0.42,
                    ease: 'power3.inOut',
                    delay: 0.08,
                    onComplete: () => {
                        gsap.set(island, {
                            clearProps:
                                'position,left,top,right,width,height,maxWidth,minWidth,transform,xPercent,yPercent',
                        });
                        setInlineDocked(true);
                    },
                });
            } else {
                gsap.to(island, {
                    width: closedWidth,
                    maxWidth: closedWidth,
                    height: closedHeight,
                    borderRadius: '25px',
                    duration: 0.5,
                    ease: 'power3.inOut',
                    delay: 0.1,
                });
            }

            gsap.to(initialContent, { opacity: 1, duration: 0.3, delay: 0.35 });

            resetCallRef.current = gsap.delayedCall(0.6, () => {
                setMode('input');
                setIsPanelCollapsed(true);
                setChatInput("");
                setAiResponse(""); // 텍스트 초기화
                gsap.set(inputSectionRef.current, { opacity: 1, y: 0 });
                gsap.set([thinkingSectionRef.current, resultSectionRef.current], { opacity: 0, y: 10 });
            });
        }
    }, [isExpanded, isMobile, isInline, closedWidth, closedHeight, mode, isPanelCollapsed, getTargetHeight]);

    // 💡 [Effect 2b] 5줄 ↔ 12줄 높이 전환
    useLayoutEffect(() => {
        if (!islandRef.current || !isExpanded) return;
        const h = getTargetHeight(mode, isPanelCollapsed);
        gsap.to(islandRef.current, { height: h, duration: 0.35, ease: 'power3.out' });
    }, [isPanelCollapsed, isExpanded, mode, getTargetHeight]);

    // 💡 [Effect 3] Mode 전환 애니메이션
    useEffect(() => {
        const justOpened = !prevExpanded.current && isExpanded;
        prevExpanded.current = isExpanded;

        if (!inputSectionRef.current || !thinkingSectionRef.current || !resultSectionRef.current) return;
        if (!isExpanded || justOpened) return;

        gsap.killTweensOf([islandRef.current, inputSectionRef.current, thinkingSectionRef.current, resultSectionRef.current]);

        const h = getTargetHeight(mode, isPanelCollapsed);

        if (mode === 'input') {
            gsap.to(islandRef.current, { height: h, duration: 0.4, ease: "power3.out" });
            gsap.to([thinkingSectionRef.current, resultSectionRef.current], { opacity: 0, y: 10, duration: 0.2 });
            gsap.to(inputSectionRef.current, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
        } else if (mode === 'thinking') {
            gsap.to(islandRef.current, { height: h, duration: 0.4, ease: "power3.out" });
            gsap.to([inputSectionRef.current, resultSectionRef.current], { opacity: 0, y: -10, duration: 0.2 });
            gsap.to(thinkingSectionRef.current, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
        } else if (mode === 'result') {
            gsap.to(islandRef.current, { height: h, duration: 0.4, ease: "power3.out" });
            gsap.to([inputSectionRef.current, thinkingSectionRef.current], { opacity: 0, y: -10, duration: 0.2 });
            gsap.to(resultSectionRef.current, { opacity: 1, y: 0, duration: 0.3, delay: 0.2 });
        }
    }, [mode, isExpanded, isPanelCollapsed, getTargetHeight]);

    const togglePanelCollapsed = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPanelCollapsed((v) => !v);
    }, []);

    const panelResizeToggle = (
        <button
            type="button"
            aria-expanded={!isPanelCollapsed}
            aria-label={isPanelCollapsed ? '채팅창 펼치기' : '채팅창 접기'}
            onClick={togglePanelCollapsed}
            style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                height: collapseBarH,
                margin: 0,
                padding: 0,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
            }}
        >
            <span
                style={{
                    width: isMobile ? '28px' : '36px',
                    height: '3px',
                    borderRadius: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                }}
            />
            <span
                style={{
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontSize: isMobile ? '9px' : '10px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                }}
            >
                {isPanelCollapsed ? '펼치기' : '접기'}
            </span>
            <span
                style={{
                    color: 'rgba(255, 255, 255, 0.55)',
                    fontSize: isMobile ? '8px' : '9px',
                    lineHeight: 1,
                }}
            >
                {isPanelCollapsed ? '▼' : '▲'}
            </span>
        </button>
    );

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

    const submitChat = useCallback(
        (question: string) => {
            setSubmittedMessage(question);
            setMode('thinking');
            setChatInput('');
            setAiResponse('');
            setChatStreaming(true);

            chatAbortRef.current?.abort();
            const abort = new AbortController();
            chatAbortRef.current = abort;

            const url = `/api/chat/${encodeURIComponent(companyId)}?message=${encodeURIComponent(question)}&chatId=${encodeURIComponent(chatId)}`;

            void (async () => {
                try {
                    const res = await fetch(url, {
                        signal: abort.signal,
                        headers: { Accept: 'text/event-stream' },
                    });

                    if (!res.ok) {
                        const errText = await res.text().catch(() => '');
                        throw new Error(errText || `HTTP ${res.status}`);
                    }

                    const reader = res.body?.getReader();
                    if (!reader) throw new Error('no stream');

                    const decoder = new TextDecoder();
                    let buffer = '';
                    let gotChunk = false;
                    const appendPayload = (payload: string) => {
                        if (!payload || payload === '[DONE]') return;
                        if (!gotChunk) {
                            gotChunk = true;
                            setMode('result');
                        }
                        setAiResponse((prev) => prev + payload);
                    };

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        buffer = parseSseBuffer(buffer, appendPayload);
                    }

                    flushSseRemainder(buffer, appendPayload);

                    if (!gotChunk) {
                        setMode('result');
                        setAiResponse(
                            'AI 서버가 빈 응답을 반환했습니다. 로컬 백엔드(8080)를 쓰는 경우 CHAT_API_BASE 또는 API 키 설정을 확인해 주세요.',
                        );
                    }
                } catch (err) {
                    if (abort.signal.aborted) return;
                    setChatStreaming(false);
                    setMode('result');
                    setAiResponse(
                        err instanceof Error && err.message
                            ? `답변을 가져오지 못했습니다. (${err.message})`
                            : '답변을 생성하는 도중 오류가 발생했습니다.',
                    );
                } finally {
                    setChatStreaming(false);
                    if (chatAbortRef.current === abort) {
                        chatAbortRef.current = null;
                    }
                }
            })();
        },
        [chatId, companyId],
    );

    const handleChatSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const question = chatInput.trim();
            if (!question) return;
            submitChat(question);
        },
        [chatInput, submitChat],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            const question = chatInput.trim();
            if (!question) return;
            submitChat(question);
        }
    };

    const closedSizeStyle =
        isExpanded && !inlineDocked
            ? {}
            : {
                  width: isInline && inlineDocked ? '100%' : closedWidth,
                  height: isInline && inlineDocked ? '100%' : closedHeight,
                  minWidth: isInline && inlineDocked ? closedWidth : undefined,
                  maxWidth: isInline && inlineDocked ? closedWidth : undefined,
              };

    return (
        <>
            <div
                ref={islandRef}
                style={{
                    position: isInline && inlineDocked ? 'relative' : isInline ? undefined : 'fixed',
                    top: isInline && inlineDocked ? undefined : isInline ? undefined : '10px',
                    left: isInline && inlineDocked ? undefined : isInline ? undefined : '50%',
                    right: 'auto',
                    transform: isInline && inlineDocked ? undefined : isInline ? undefined : 'translateX(-50%)',
                    flexShrink: isInline && inlineDocked ? 0 : undefined,
                    zIndex: 9999,
                    cursor: isExpanded ? 'default' : 'pointer',
                    overflow: 'hidden',
                    ...closedSizeStyle,
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
                        position: 'absolute',
                        inset: 0,
                        padding: paddingIsland,
                        display: 'flex',
                        flexDirection: 'column',
                        opacity: 0,
                        pointerEvents: isExpanded ? 'auto' : 'none',
                        boxSizing: 'border-box',
                    }}
                >
                    <div
                        ref={chatContentRef}
                        style={{
                            flex: 1,
                            position: 'relative',
                            minHeight: 0,
                            overflow: 'hidden',
                        }}
                    >
                    {/* A. 입력 모드 */}
                    <form
                        ref={inputSectionRef}
                        onSubmit={handleChatSubmit}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            pointerEvents: mode === 'input' ? 'auto' : 'none',
                            margin: 0,
                        }}
                    >
                        <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything..."
                            rows={panelLines(isPanelCollapsed)}
                            style={{
                                flex: '0 0 auto',
                                width: '100%',
                                height: panelLines(isPanelCollapsed) * lineHeightPx,
                                minHeight: 5 * lineHeightPx,
                                maxHeight: 12 * lineHeightPx,
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: fzTitle,
                                lineHeight: 1.5,
                                outline: 'none',
                                resize: 'none',
                                fontFamily: 'inherit',
                                overflowY: 'auto',
                                boxSizing: 'border-box',
                            }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: isMobile ? '4px' : '8px' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: isMobile ? '9px' : '13px', alignSelf: 'flex-end' }}>Press Enter</span>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '1.5em' }}>
                                <span style={{ color: '#fff', fontSize: fzTitle, fontWeight: 600 }}>How can I guide you?</span>
                            </div>
                        </div>
                    </form>

                    {/* B. 생각 중 모드 (서버에 요청 후 응답이 올 때까지 대기) */}
                    <div ref={thinkingSectionRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', opacity: 0, transform: 'translateY(10px)', pointerEvents: mode === 'thinking' ? 'auto' : 'none', gap: isMobile ? '8px' : '15px' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: isMobile ? '12px' : '20px', padding: isMobile ? '8px 12px' : '15px 20px', display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
                            <div style={{ width: isMobile ? '10px' : '14px', height: isMobile ? '10px' : '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: fzText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{submittedMessage}</span>
                        </div>
                        <div style={{ height: isMobile ? '32px' : '50px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: isMobile ? '11px' : '14px', fontWeight: 600 }}>서버와 연결 중...</span>
                        </div>
                    </div>

                    {/* C. 결과 모드 — 질문 + 답변 */}
                    <div ref={resultSectionRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', minHeight: 0, opacity: 0, transform: 'translateY(10px)', pointerEvents: mode === 'result' ? 'auto' : 'none', gap: isMobile ? '6px' : '10px' }}>
                        <div style={{ flex: 1, minHeight: 0, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: isMobile ? '12px' : '20px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: isMobile ? '12px' : '20px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                            <div onClick={() => setIsExpanded(false)} style={{ position: 'absolute', top: isMobile ? '10px' : '15px', right: isMobile ? '10px' : '15px', color: '#888', cursor: 'pointer', fontSize: isMobile ? '10px' : '14px' }}>✕</div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: isMobile ? '10px' : '14px',
                                    overflowY: 'auto',
                                    flex: 1,
                                    minHeight: 5 * lineHeightPx,
                                    maxHeight: 12 * lineHeightPx,
                                    height: panelLines(isPanelCollapsed) * lineHeightPx,
                                    paddingRight: '10px',
                                    paddingTop: isMobile ? '4px' : '8px',
                                    boxSizing: 'border-box',
                                }}
                            >
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
                                <ChatAnswerContent raw={aiResponse} streaming={chatStreaming} />
                            </div>
                        </div>
                        {/* 다시 질문하기 버튼 */}
                        <div onClick={() => setMode('input')} style={{ height: isMobile ? '32px' : '50px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: isMobile ? '11px' : '14px', fontWeight: 600 }}>다른 질문하기</span>
                        </div>
                    </div>
                    </div>
                    {panelResizeToggle}
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