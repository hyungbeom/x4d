import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// TypeScript 환경을 위한 Props 정의
interface InfoPanelProps {
    isOpen: boolean;        // 열림/닫힘 상태
    title: string;          // 패널 제목
    desc: string;           // 패널 설명
    extra?: string;         // 추가 설명 (선택 사항)
    onClose: () => void;    // 닫기 버튼 눌렀을 때 실행할 함수
}

export default function InfoPanel({ isOpen, title, desc, extra, onClose }: InfoPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // 🚀 isOpen 값이 바뀔 때마다 GSAP 애니메이션 실행!
    useEffect(() => {
        if (isOpen) {
            // 열릴 때: 오른쪽 화면 밖에서 원래 위치(x: 0)로
            gsap.to(panelRef.current, {
                x: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power3.out"
            });
        } else {
            // 닫힐 때: 다시 오른쪽 화면 밖(x: '100%')으로
            gsap.to(panelRef.current, {
                x: '100%',
                opacity: 0,
                duration: 0.6,
                ease: "power3.in"
            });
        }
    }, [isOpen]);

    return (
        <div
            ref={panelRef}
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '400px', // 필요에 따라 크기 조절 가능
                height: '100vh',
                backgroundColor: 'white',
                boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
                zIndex: 20,
                padding: '60px 40px',
                // 초기 상태: 화면 오른쪽 바깥
                transform: 'translateX(100%)',
                opacity: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}
        >
            {/* 닫기 버튼 */}
            <div style={{ textAlign: 'right' }}>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
                >
                    ✕
                </button>
            </div>

            {/* 전달받은 데이터(Props) 렌더링 */}
            <h2 style={{ fontSize: '32px', color: '#1a4242', marginBottom: '10px', borderBottom: '2px solid #00fce0', paddingBottom: '10px' }}>
                {title}
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
                {desc}
            </p>
            {extra && (
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666', backgroundColor: '#f0f8f8', padding: '15px', borderRadius: '8px' }}>
                    {extra}
                </p>
            )}
        </div>
    );
}