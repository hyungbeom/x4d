import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface InfoPanelProps {
    isOpen: boolean;
    title: string;
    desc: string;
    extra?: string;
    onClose: () => void;
}

export default function InfoPanel({ isOpen, title, desc, extra, onClose }: InfoPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 🚀 GSAP matchMedia: 화면 크기에 따라 다른 애니메이션을 적용합니다!
        let mm = gsap.matchMedia();

        mm.add("(min-width: 769px)", () => {
            // 🖥️ 데스크탑: 오른쪽에서 왼쪽으로 슬라이드 (기존 동일)
            if (isOpen) {
                gsap.to(panelRef.current, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
            } else {
                gsap.to(panelRef.current, { x: '100%', y: 0, opacity: 0, duration: 0.5, ease: "power3.in" });
            }
        });

        mm.add("(max-width: 768px)", () => {
            // 📱 모바일: 아래에서 위로 올라오는 바텀 시트 (Bottom Sheet) 애니메이션
            if (isOpen) {
                gsap.to(panelRef.current, { y: 0, x: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
            } else {
                gsap.to(panelRef.current, { y: '150%', x: 0, opacity: 0, duration: 0.5, ease: "power3.in" });
            }
        });

        return () => mm.revert(); // 컴포넌트 언마운트 시 클린업
    }, [isOpen]);

    return (
        <>
            <style>
                {`
                    .info-panel {
                        position: absolute;
                        /* 🚀 뒤쪽 3D 씬이 살짝 비치도록 글래스모피즘 효과 적용 */
                        background-color: rgba(255, 255, 255, 0.85); 
                        backdrop-filter: blur(12px); 
                        -webkit-backdrop-filter: blur(12px);
                        z-index: 20;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }

                    /* --- 🖥️ 데스크탑 스타일 --- */
                    @media (min-width: 769px) {
                        .info-panel {
                            top: 0;
                            right: 0;
                            width: 400px;
                            height: 100vh;
                            padding: 60px 40px;
                            box-shadow: -5px 0 25px rgba(0,0,0,0.1);
                            /* 초기 상태: 오른쪽 바깥 */
                            transform: translateX(100%);
                            opacity: 0;
                        }
                    }

                    /* --- 📱 모바일 스타일 (바텀 시트) --- */
                    @media (max-width: 768px) {
                        .info-panel {
                            /* 네비게이션 바(메뉴) 위에 떠 있도록 위치 조정 */
                            bottom: 140px; 
                            left: 5%;
                            width: 90%;
                            height: auto;
                            /* 화면 높이의 40%까지만 차지하게 제한 (스크롤 생김) */
                            max-height: 40vh; 
                            overflow-y: auto; 
                            padding: 24px;
                            border-radius: 24px;
                            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                            /* 초기 상태: 아래쪽 바깥 */
                            transform: translateY(150%);
                            opacity: 0;
                        }

                        /* 모바일 닫기 버튼 크기 조정 */
                        .info-panel-close {
                            font-size: 20px !important;
                            padding: 0 !important;
                        }

                        /* 모바일 텍스트 사이즈 조정 */
                        .info-panel-title { font-size: 24px !important; margin-bottom: 5px !important; }
                        .info-panel-desc { font-size: 14px !important; }
                        .info-panel-extra { font-size: 13px !important; padding: 12px !important; }
                    }
                `}
            </style>

            <div className="info-panel" ref={panelRef}>
                {/* 닫기 버튼 */}
                <div style={{ textAlign: 'right', marginBottom: '-10px' }}>
                    <button
                        className="info-panel-close"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#666' }}
                    >
                        ✕
                    </button>
                </div>

                {/* 제목 */}
                <h2 className="info-panel-title" style={{ fontSize: '32px', color: '#1a4242', marginBottom: '10px', borderBottom: '2px solid #00fce0', paddingBottom: '10px' }}>
                    {title}
                </h2>

                {/* 메인 설명 */}
                <p className="info-panel-desc" style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
                    {desc}
                </p>

                {/* 추가 설명 (박스 형태) */}
                {extra && (
                    <p className="info-panel-extra" style={{ fontSize: '14px', lineHeight: '1.6', color: '#1a4242', backgroundColor: 'rgba(0, 252, 224, 0.15)', padding: '15px', borderRadius: '12px' }}>
                        {extra}
                    </p>
                )}
            </div>
        </>
    );
}