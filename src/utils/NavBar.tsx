import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import TransitionLink from "@/utils/TransitionLink";

interface MenuItem {
    title: string;
    onClick: () => void;
}

interface NavBarProps {
    logoSrc?: string;
    menus: MenuItem[];
    contactLink?: string;
}

export default function NavBar({ logoSrc, menus, contactLink = "#" }: NavBarProps) {
    const [activeIndex, setActiveIndex] = useState(null);

    // 🚀 DOM 요소를 참조하기 위한 Refs
    const navLinksRef = useRef<HTMLDivElement>(null);
    const pillRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    // 🎯 특정 인덱스의 메뉴 위치로 하이라이트(Pill)를 이동시키는 함수
    const moveHighlight = useCallback((index: number) => {
        const targetElement = itemRefs.current[index];
        if (targetElement && pillRef.current) {
            // GSAP으로 x(왼쪽 여백)와 width(너비)를 동시에 애니메이션!
            gsap.to(pillRef.current, {
                x: targetElement.offsetLeft,
                width: targetElement.offsetWidth,
                duration: 0.5,
                ease: "elastic.out(1, 0.75)" // 👈 슬라임처럼 통통 튀는 쫀득한 효과!
            });
        }
    }, []);

    // 1️⃣ 처음 렌더링되거나 활성 메뉴가 바뀔 때 하이라이트 이동
    useEffect(() => {
        moveHighlight(activeIndex);

        // 창 크기가 바뀔 때 위치가 틀어지지 않도록 재계산
        const handleResize = () => moveHighlight(activeIndex);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeIndex, moveHighlight]);

    // 2️⃣ 마우스가 특정 메뉴 위로 올라갔을 때 (Hover)
    const handleMouseEnter = (index: number) => {
        moveHighlight(index);
    };

    // 3️⃣ 마우스가 메뉴 밖으로 아예 나갔을 때 (원래 자리로 복귀)
    const handleMouseLeave = () => {
        moveHighlight(activeIndex);
    };

    // 4️⃣ 메뉴를 클릭했을 때
    const handleMenuClick = (e: React.MouseEvent, index: number, onClickCallback: () => void) => {
        e.preventDefault();
        setActiveIndex(index);
        onClickCallback();
    };

    return (
        <>
            <style>
                {`
                    .navbar-wrapper {
                        position: absolute; 
                        bottom: 40px; 
                        left: 50%; 
                        transform: translateX(-50%); 
                        z-index: 50; 
                        display: flex;
                        align-items: center;
                        gap: 16px; 
                    }

                    .main-nav {
                        display: flex;
                        align-items: center;
                        background-color: #f7fdfc; 
                        padding: 8px 16px;
                        border-radius: 999px; 
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); 
                        gap: 24px; 
                    }

                    .logo {
                        text-decoration: none;
                        display: flex;
                        align-items: center;
                        margin-left: 8px;
                    }
                    
                    .logo img {
                        height: 24px;
                        object-fit: contain;
                    }

                    .logo-placeholder {
                        background-color: #8be0db;
                        color: #12333b;
                        font-weight: bold;
                        padding: 6px 12px;
                        border-radius: 12px;
                        font-style: italic;
                    }

                    /* 🚀 하이라이트 애니메이션을 위한 뼈대 구조 변경 */
                    .nav-links {
                        position: relative; /* 자식인 pill(하이라이트)의 절대 좌표 기준점 */
                        display: flex;
                        align-items: center;
                        gap: 8px; 
                    }

                    /* 🚀 따라다니는 형광색 알약 모양 (Highlight Pill) */
                    .highlight-pill {
                        position: absolute;
                        top: 0;
                        left: 0;
                        height: 100%;
                        background-color: #00fce0; /* 형광 청록색 */
                        border-radius: 999px;
                        z-index: 0; /* 글씨보다 뒤에 있게 */
                        pointer-events: none; /* 마우스 이벤트 방해 금지 */
                    }

                    /* 개별 메뉴 항목 */
                    .nav-item {
                        position: relative; /* 텍스트를 위로 올리기 위함 */
                        z-index: 1; /* highlight-pill보다 위에 오게 설정 */
                        text-decoration: none;
                        color: #3b5658; 
                        font-size: 15px;
                        font-weight: 400;
                        padding: 10px 20px;
                        border-radius: 999px;
                        /* 기존의 background-color 호버 효과는 지웁니다 (GSAP이 대신하니까요!) */
                        transition: color 0.2s ease;
                    }

                    /* 활성화된(혹은 하이라이트 된) 메뉴 항목의 글씨색 변경 */
                    .nav-item.active,
                    .nav-item:hover {
                        color: #1a4242; 
                        font-weight: 500;
                    }

                    .contact-btn {
                        text-decoration: none;
                        color: #315152;
                        background-color: #bce0de; 
                        font-size: 15px;
                        font-weight: 400;
                        padding: 14px 24px;
                        border-radius: 999px;
                        transition: background-color 0.2s ease;
                    }

                    .contact-btn:hover {
                        background-color: #a8d4d1; 
                    }
                `}
            </style>

            <div className="navbar-wrapper">
                <nav className="main-nav">
                    <a href="#" className="logo">
                        {logoSrc ? (
                            <img src={logoSrc} alt="Logo" />
                        ) : (
                            <span className="logo-placeholder">Logo</span>
                        )}
                    </a>

                    {/* onMouseLeave를 컨테이너에 걸어서 마우스가 나가면 원래 자리로 돌아가게 합니다 */}
                    <div className="nav-links" ref={navLinksRef} onMouseLeave={handleMouseLeave}>

                        {/* 🚀 이 녀석이 마우스를 따라다니는 배경입니다! */}
                        <div className="highlight-pill" ref={pillRef}></div>

                        {menus.map((menu, index) => (
                            <a
                                key={index}
                                // 각 메뉴 태그의 DOM 위치를 수집합니다
                                ref={(el) => { itemRefs.current[index] = el; }}
                                href="#"
                                onClick={(e) => handleMenuClick(e, index, menu.onClick)}
                                onMouseEnter={() => handleMouseEnter(index)}
                                className={`nav-item ${activeIndex === index ? 'active' : ''}`}
                            >
                                {menu.title}
                            </a>
                        ))}
                    </div>
                </nav>

                <TransitionLink href={contactLink} className="contact-btn" type="blinds">
                    Contact Us
                </TransitionLink>
            </div>
        </>
    );
}