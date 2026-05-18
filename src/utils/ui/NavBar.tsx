'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import TransitionLink from "@/utils/ui/TransitionLink";

const DynamicIsland = dynamic(() => import('@/utils/DynamicIsland'), { ssr: false });

export interface MenuItem {
    title: string;
    onClick: () => void;
    icon?: React.ReactNode;
}

interface NavBarProps {
    logoSrc?: string;
    menus: MenuItem[];
    contactLink?: string;
    /** 0-based 메뉴 인덱스 (부모 activePanelId 1~5 → index 0~4) */
    activeIndex?: number | null;
    autoTour?: boolean;
    onAutoTourToggle?: () => void;
    /** true면 아이콘만 표시 (툴팁·aria-label은 title 유지) */
    iconMode?: boolean;
    /** 하단 바 높이·패딩 축소 */
    compact?: boolean;
    /** 모바일 상단 바에 AI ASK(DynamicIsland) 표시 */
    showAiAsk?: boolean;
    aiCompanyId?: string;
    /** 로고 클릭 시 (예: 전체 보기 패널 0) */
    onLogoClick?: () => void;
}

export default function NavBar({
    logoSrc,
    menus,
    contactLink = "#",
    activeIndex: activeIndexProp = null,
    autoTour = false,
    onAutoTourToggle,
    iconMode = false,
    compact = false,
    showAiAsk = false,
    aiCompanyId = 'bdtec',
    onLogoClick,
}: NavBarProps) {
    const [activeIndexLocal, setActiveIndexLocal] = useState<number | null>(null);
    const [isDesktopHeader, setIsDesktopHeader] = useState(false);
    const activeIndex = activeIndexProp ?? activeIndexLocal;
    const pillRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const moveHighlight = useCallback((index: number | null) => {
        if (!pillRef.current || window.innerWidth <= 1024) return;

        if (index === null) {
            gsap.to(pillRef.current, { opacity: 0, duration: 0.3 });
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
                ease: "power3.out",
            });
        }
    }, []);

    useEffect(() => {
        moveHighlight(activeIndex);
        const handleResize = () => moveHighlight(activeIndex);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeIndex, moveHighlight]);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1025px)');
        const sync = () => setIsDesktopHeader(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    const handleMenuClick = (index: number) => {
        setActiveIndexLocal(index);
        menus[index].onClick();
    };

    const autoToggleButton = onAutoTourToggle ? (
        <button
            type="button"
            className={`auto-tour-btn ${autoTour ? 'auto-tour-btn--on' : ''}`}
            onClick={onAutoTourToggle}
            aria-pressed={autoTour}
            aria-label={autoTour ? '자동 투어 끄기' : '자동 투어 켜기'}
            title={autoTour ? '자동 투어 OFF' : '자동 투어 ON (5초 간격)'}
        >
            <span className="auto-tour-btn__dot" aria-hidden />
            AUTO
        </button>
    ) : null;

    const logoBlock = (
        <div className="logo-cluster">
            <a
                href="#"
                className="logo"
                onClick={(e) => {
                    e.preventDefault();
                    setActiveIndexLocal(null);
                    onLogoClick?.();
                }}
                aria-label="전체 보기로 이동"
            >
                {logoSrc ? <img src={logoSrc} alt="Logo" /> : <span className="logo-placeholder">Logo</span>}
            </a>
            {autoToggleButton}
        </div>
    );

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
                        background-color: #f7fdfc;
                        border-radius: 999px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        padding: 8px;
                        max-width: 95vw;
                    }

                    .logo-cluster {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        flex-shrink: 0;
                        padding-left: 8px;
                        padding-right: 4px;
                    }

                    .logo {
                        text-decoration: none;
                        display: flex;
                        align-items: center;
                        padding: 0 8px 0 12px;
                        flex-shrink: 0;
                    }
                    .logo img { height: 24px; object-fit: contain; }

                    .auto-tour-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        padding: 5px 10px;
                        border: 1px solid #c5e8e4;
                        border-radius: 999px;
                        background: linear-gradient(180deg, #ffffff 0%, #eef9f7 100%);
                        color: #4a6b6d;
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 0.12em;
                        line-height: 1;
                        cursor: pointer;
                        transition: all 0.25s ease;
                        box-shadow: 0 1px 4px rgba(0, 80, 70, 0.06);
                    }
                    .auto-tour-btn:hover {
                        border-color: #7dd4cc;
                        color: #1a4242;
                        transform: translateY(-1px);
                        box-shadow: 0 3px 10px rgba(0, 200, 180, 0.15);
                    }
                    .auto-tour-btn__dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #9ec4c2;
                        transition: background 0.25s ease, box-shadow 0.25s ease;
                    }
                    .auto-tour-btn--on {
                        border-color: #00c9ba;
                        background: linear-gradient(135deg, #00fce0 0%, #00c9ba 100%);
                        color: #0a2e2e;
                        box-shadow: 0 2px 12px rgba(0, 252, 224, 0.35);
                    }
                    .auto-tour-btn--on .auto-tour-btn__dot {
                        background: #0a2e2e;
                        box-shadow: 0 0 0 2px rgba(10, 46, 46, 0.2);
                        animation: auto-pulse 1.4s ease-in-out infinite;
                    }
                    @keyframes auto-pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.55; transform: scale(0.85); }
                    }

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

                    .nav-item--icon {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        padding: 10px;
                        width: 44px;
                        height: 44px;
                        min-width: 44px;
                        box-sizing: border-box;
                    }

                    .nav-item__icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 0;
                    }

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

                    .navbar-wrapper--compact {
                        bottom: 12px;
                        padding: 4px 6px;
                        border-radius: 20px;
                        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
                    }

                    .navbar-wrapper--compact .logo img { height: 16px; }
                    .navbar-wrapper--compact .logo { padding: 0 4px 0 8px; }
                    .navbar-wrapper--compact .logo-cluster { gap: 6px; padding-left: 4px; }

                    .navbar-wrapper--compact .auto-tour-btn {
                        padding: 3px 7px;
                        font-size: 9px;
                        gap: 4px;
                    }
                    .navbar-wrapper--compact .auto-tour-btn__dot {
                        width: 5px;
                        height: 5px;
                    }

                    .navbar-wrapper--compact .nav-item--icon {
                        width: 32px;
                        height: 32px;
                        min-width: 32px;
                        padding: 6px;
                    }

                    .navbar-wrapper--compact .nav-item__icon svg {
                        width: 18px;
                        height: 18px;
                    }

                    .navbar-wrapper--compact .contact-btn {
                        padding: 8px 14px;
                        font-size: 12px;
                    }

                    .mobile-top-bar { display: none; }

                    @media (max-width: 1024px) {
                        .navbar-wrapper {
                            bottom: 20px;
                            background-color: transparent;
                            box-shadow: none;
                            padding: 0;
                            width: 92vw;
                        }

                    .mobile-top-bar {
                        display: flex;
                        position: fixed;
                        top: 10px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 92vw;
                        justify-content: flex-start;
                        align-items: center;
                        gap: 8px;
                            background-color: #f7fdfc;
                            padding: 8px 10px 38px 12px;
                            border-radius: 999px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                            box-sizing: border-box;
                            z-index: 100;
                        }

                        .mobile-top-bar__contact {
                            margin-left: auto;
                            flex-shrink: 0;
                        }

                        .mobile-top-bar .logo-cluster { padding-left: 4px; gap: 8px; }
                        .mobile-top-bar .logo { padding: 0; }
                        .mobile-top-bar .logo img { height: 20px; }

                        .mobile-top-bar .contact-btn {
                            padding: 10px 20px;
                            font-size: 13px;
                        }

                        .navbar-wrapper > .logo-cluster,
                        .navbar-wrapper > .contact-wrapper { display: none; }

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

                        .nav-item--icon {
                            width: 40px;
                            height: 40px;
                            min-width: 40px;
                            padding: 8px;
                        }

                        .navbar-wrapper--compact {
                            bottom: 10px;
                        }

                        .navbar-wrapper--compact .nav-links-box {
                            padding: 5px 6px;
                            border-radius: 18px;
                            gap: 2px;
                        }

                        .navbar-wrapper--compact .nav-item--icon {
                            width: 30px;
                            height: 30px;
                            min-width: 30px;
                            padding: 5px;
                        }

                        .navbar-wrapper--compact .nav-item__icon svg {
                            width: 17px;
                            height: 17px;
                        }

                        .nav-item.active, .nav-item:hover {
                            background-color: #00fce0;
                        }
                        .highlight-pill { display: none; }
                    }

                    .mobile-top-bar--compact {
                        padding: 5px 8px 34px 10px;
                    }
                    .mobile-top-bar--compact .logo img { height: 16px; }
                    .mobile-top-bar--compact .contact-btn {
                        padding: 7px 14px;
                        font-size: 11px;
                        margin-left: 0;
                    }

                    .header-ai-slot {
                        position: absolute;
                        right: 10px;
                        bottom: 6px;
                        width: 112px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2;
                    }

                    .mobile-top-bar .logo-cluster {
                        flex: 0 1 auto;
                        min-width: 0;
                    }

                    .desktop-header-ai {
                        display: none;
                    }

                    @media (min-width: 1025px) {
                        .desktop-header-ai {
                            display: flex;
                            position: fixed;
                            top: 10px;
                            right: clamp(20px, 3vw, 32px);
                            width: 200px;
                            height: 50px;
                            align-items: center;
                            justify-content: center;
                            z-index: 100;
                            pointer-events: auto;
                        }

                        .header-ai-slot--mobile {
                            display: none;
                        }
                    }
                `}
            </style>

            <div className={`mobile-top-bar${compact ? ' mobile-top-bar--compact' : ''}`}>
                {logoBlock}

                <TransitionLink
                    href={contactLink}
                    className="contact-btn mobile-top-bar__contact"
                    type="blinds"
                >
                    Contact Us
                </TransitionLink>

                {showAiAsk && !isDesktopHeader && (
                    <div className="header-ai-slot header-ai-slot--mobile">
                        <DynamicIsland placement="inline" companyId={aiCompanyId} />
                    </div>
                )}
            </div>

            {showAiAsk && isDesktopHeader && (
                <div className="desktop-header-ai">
                    <DynamicIsland placement="inline" companyId={aiCompanyId} />
                </div>
            )}

            <div className={`navbar-wrapper${compact ? ' navbar-wrapper--compact' : ''}`}>
                {logoBlock}

                <nav className="nav-links-box" onMouseLeave={() => moveHighlight(activeIndex)}>
                    <div className="highlight-pill" ref={pillRef} />
                    {menus.map((menu, index) => (
                        <a
                            key={index}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleMenuClick(index);
                            }}
                            onMouseEnter={() => moveHighlight(index)}
                            title={menu.title}
                            aria-label={menu.title}
                            className={`nav-item ${iconMode && menu.icon ? 'nav-item--icon' : ''} ${activeIndex === index ? 'active' : ''}`}
                        >
                            {iconMode && menu.icon ? (
                                <span className="nav-item__icon">{menu.icon}</span>
                            ) : (
                                menu.title
                            )}
                        </a>
                    ))}
                </nav>

                <div className="contact-wrapper" style={{ marginLeft: '8px' }}>
                    <TransitionLink href={contactLink} className="contact-btn" type="blinds">
                        Contact Us
                    </TransitionLink>
                </div>
            </div>
        </>
    );
}