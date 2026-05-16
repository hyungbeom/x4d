import React, {useState, useRef, useEffect, useCallback} from 'react';
import gsap from 'gsap';
import TransitionLink from "@/utils/ui/TransitionLink";

interface MenuItem {
    title: string;
    onClick: () => void;
}

interface NavBarProps {
    logoSrc?: string;
    menus: MenuItem[];
    contactLink?: string;
}

export default function NavBar({logoSrc, menus, contactLink = "#"}: NavBarProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const pillRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const moveHighlight = useCallback((index: number | null) => {
        if (!pillRef.current || window.innerWidth <= 1024) return;

        if (index === null) {
            gsap.to(pillRef.current, {opacity: 0, duration: 0.3});
            return;
        }

        const target = itemRefs.current[index];
        if (target) {
            gsap.to(pillRef.current, {
                opacity: 1,
                x: target.offsetLeft,
                y: target.offsetTop,
                width: target.offsetWidth,
                height: target.offsetHeight,
                duration: 0.5,
                ease: "power3.out"
            });
        }
    }, []);

    useEffect(() => {
        moveHighlight(activeIndex);
        const handleResize = () => moveHighlight(activeIndex);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeIndex, moveHighlight]);

    return (
        <>
            <style>
                {`
                    /* --- 🖥️ 데스크탑 공통 스타일 (기존 유지) --- */
                    .navbar-wrapper {
                        position: absolute; 
                        bottom: 40px; 
                        left: 50%; 
                        transform: translateX(-50%); 
                        z-index: 50; 
                        display: flex;
                        align-items: center;
                        background-color: #f7fdfc; 
                        border-radius: 999px; 
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); 
                        padding: 8px;
                        max-width: 95vw; 
                    }

                    .logo {
                        text-decoration: none;
                        display: flex;
                        align-items: center;
                        padding: 0 20px;
                        flex-shrink: 0; 
                    }
                    .logo img { height: 24px; object-fit: contain; }

                    .nav-links-box {
                        position: relative;
                        display: flex;
                        align-items: center;
                        border-left: 1px solid #e0f2f1;
                    }

                    .highlight-pill {
                        position: absolute;
                        top: 0; left: 0;
                        background-color: #00fce0; 
                        border-radius: 999px;
                        z-index: 0; 
                        pointer-events: none;
                        opacity: 0; 
                    }

                    .nav-item {
                        position: relative; 
                        z-index: 1; 
                        text-decoration: none;
                        color: #3b5658; 
                        font-size: 15px;
                        font-weight: 500; 
                        padding: 10px 22px;
                        border-radius: 999px;
                        transition: color 0.2s ease;
                        white-space: nowrap; 
                    }
                    .nav-item.active, .nav-item:hover { color: #1a4242; }

                    .contact-btn {
                        text-decoration: none;
                        color: #315152;
                        background-color: #bce0de; 
                        font-size: 15px;
                        padding: 14px 24px;
                        border-radius: 999px;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                    }
                    .contact-btn:hover { background-color: #a8d4d1; transform: scale(1.02); }

                    /* 데스크탑에서는 상단 캡슐 숨김 */
                    .mobile-top-bar { display: none; }

                    /* --- 📱 모바일/태블릿 반응형 (1024px 이하) --- */
                    @media (max-width: 1024px) {
                        /* 하단 메뉴 컨테이너 */
                        .navbar-wrapper {
                            bottom: 20px;
                            background-color: transparent; 
                            box-shadow: none;
                            padding: 0;
                            width: 92vw;
                        }

                        /* 🚀 모바일 전용 상단 캡슐 (천장에 고정!) */
                       .mobile-top-bar {
        display: flex;
        position: fixed; 
        
        /* 태블릿에서는 천장에 딱 붙이거나(0px) 살짝만 띄움(10px) */
        top: 10px;       
        
        left: 50%;
        transform: translateX(-50%);
        width: 92vw;
        justify-content: space-between;
        align-items: center;
        background-color: #f7fdfc; 
        padding: 8px 10px 8px 16px; 
        border-radius: 999px; 
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        box-sizing: border-box;
        z-index: 100;
    }

                        .mobile-top-bar .logo { padding: 0; }
                        .mobile-top-bar .logo img { height: 20px; }
                        
                        .mobile-top-bar .contact-btn {
                            padding: 10px 20px;
                            font-size: 13px;
                        }

                        /* 데스크탑 버전 요소 숨김 */
                        .navbar-wrapper > .logo, 
                        .navbar-wrapper > .contact-wrapper { display: none; }

                        /* 메뉴판 카드 (바닥에 유지) */
                        .nav-links-box {
                            width: 100%;
                            background-color: #f7fdfc;
                            border-radius: 24px;
                            padding: 10px;
                            flex-wrap: wrap;
                            justify-content: center;
                            border-left: none;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                            gap: 4px;
                        }

                        .nav-item {
                            font-size: 13px;
                            padding: 8px 14px;
                        }

                        .nav-item.active, .nav-item:hover {
                            background-color: #00fce0;
                        }
                        .highlight-pill { display: none; }
                    }
                `}
            </style>

            {/* 🚀 모바일 전용 상단 캡슐 */}
            <div className="mobile-top-bar">
                <a href="#" className="logo">
                    {logoSrc ? <img src={logoSrc} alt="Logo"/> : <span className="logo-placeholder">Logo</span>}
                </a>
                <TransitionLink href={contactLink} className="contact-btn" type="blinds">
                    Contact Us
                </TransitionLink>
            </div>

            {/* 하단 네비게이션 래퍼 */}
            <div className="navbar-wrapper">

                {/* 🖥️ 데스크탑 로고 */}
                <a href="#" className="logo">
                    {logoSrc ? <img src={logoSrc} alt="Logo"/> : <span className="logo-placeholder">Logo</span>}
                </a>

                {/* 🔗 메뉴 영역 (바닥) */}
                <nav className="nav-links-box" onMouseLeave={() => moveHighlight(activeIndex)}>
                    <div className="highlight-pill" ref={pillRef}></div>
                    {menus.map((menu, index) => (
                        <a
                            key={index}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveIndex(index);
                                menu.onClick();
                            }}
                            onMouseEnter={() => moveHighlight(index)}
                            className={`nav-item ${activeIndex === index ? 'active' : ''}`}
                        >
                            {menu.title}
                        </a>
                    ))}
                </nav>

                {/* 🖥️ 데스크탑 Contact Us */}
                <div className="contact-wrapper" style={{marginLeft: '8px'}}>
                    <TransitionLink href={contactLink} className="contact-btn" type="blinds">
                        Contact Us
                    </TransitionLink>
                </div>
            </div>
        </>
    );
}