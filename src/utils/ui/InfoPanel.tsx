import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import CompanyList from '@/components/progist/CompanyList';
import CompanyListModal from '@/components/progist/CompanyListModal';
import type { CompanyListItem } from '@/data/map/envexCompanies';
import styles from './InfoPanel.module.css';

const COMPACT_BREAKPOINT = '(max-width: 1024px)';
const MOBILE_BREAKPOINT = '(max-width: 768px)';
const TABLET_BREAKPOINT = '(min-width: 769px) and (max-width: 1024px)';

interface InfoPanelProps {
    isOpen: boolean;
    title: string;
    desc: string;
    extra?: string;
    onClose: () => void;
    /** 하단 네비 위 등 레이아웃용 티저 위치 조정 */
    teaserClassName?: string;
    /** 티저 CTA 버튼 문구 */
    detailButtonLabel?: string;
    /** 있으면 확장 시 기업 리스트 표시 */
    companies?: CompanyListItem[];
}

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(query);
        const update = () => setMatches(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, [query]);

    return matches;
}

export default function InfoPanel({
    isOpen,
    title,
    desc,
    extra,
    onClose,
    teaserClassName,
    detailButtonLabel = '자세히 보기',
    companies,
}: InfoPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const teaserRef = useRef<HTMLDivElement>(null);
    const isCompact = useMediaQuery(COMPACT_BREAKPOINT);
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const [isExpanded, setIsExpanded] = useState(false);
    const [companyListOpen, setCompanyListOpen] = useState(false);

    const hasCompanyList = Boolean(companies && companies.length > 0);
    const showTeaser = isOpen && !isExpanded && !companyListOpen;
    /** 데스크톱+기업목록: 티저만 · 모바일/태블릿: 확장 시 · 데스크톱(목록없음): 바로 패널 */
    const showPanel =
        isOpen &&
        (isCompact ? isExpanded : !hasCompanyList);
    useEffect(() => {
        if (!isOpen) {
            setIsExpanded(false);
            setCompanyListOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        setIsExpanded(false);
        setCompanyListOpen(false);
    }, [title]);

    useEffect(() => {
        const teaser = teaserRef.current;
        if (!teaser || !isCompact) return;

        gsap.to(teaser, {
            opacity: showTeaser ? 1 : 0,
            pointerEvents: showTeaser ? 'auto' : 'none',
            duration: showTeaser ? 0.4 : 0.3,
            ease: showTeaser ? 'power2.out' : 'power2.in',
        });
    }, [showTeaser, isCompact]);

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;

        const mm = gsap.matchMedia();

        mm.add('(min-width: 1025px)', () => {
            if (showPanel) {
                gsap.to(panel, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
            } else {
                gsap.to(panel, { x: '-100%', y: 0, opacity: 0, duration: 0.5, ease: 'power3.in' });
            }
        });

        mm.add(MOBILE_BREAKPOINT, () => {
            if (isExpanded) {
                gsap.to(panel, { y: 0, x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
            } else {
                gsap.to(panel, { y: '100%', x: 0, opacity: 0, duration: 0.4, ease: 'power3.in' });
            }
        });

        mm.add(TABLET_BREAKPOINT, () => {
            if (isExpanded) {
                gsap.to(panel, { y: 0, x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
            } else {
                gsap.to(panel, { y: '150%', x: 0, opacity: 0, duration: 0.5, ease: 'power3.in' });
            }
        });

        return () => mm.revert();
    }, [isOpen, isExpanded, showPanel]);

    useEffect(() => {
        const teaser = teaserRef.current;
        if (!teaser || isCompact) return;

        gsap.to(teaser, {
            x: showTeaser ? 0 : -28,
            opacity: showTeaser ? 1 : 0,
            pointerEvents: showTeaser ? 'auto' : 'none',
            duration: showTeaser ? 0.5 : 0.35,
            ease: showTeaser ? 'power3.out' : 'power2.in',
        });
    }, [showTeaser, isCompact]);

    const handleClose = () => {
        if (companyListOpen) {
            setCompanyListOpen(false);
            return;
        }
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }
        onClose();
    };

    return (
        <>
            {isOpen && (
                <div
                    ref={teaserRef}
                    className={[
                        styles.teaser,
                        isCompact ? teaserClassName : styles.teaserDesktop,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    style={{ opacity: isCompact ? 0 : undefined }}
                >
                    <div className={styles.teaserHeader}>
                        <h3 className={styles.teaserTitle}>{title}</h3>
                        <button
                            type="button"
                            className={styles.teaserCloseBtn}
                            onClick={handleClose}
                            disabled={!showTeaser}
                            aria-label="설명 카드 닫기"
                        >
                            ✕
                        </button>
                    </div>
                    <div className={styles.teaserBody}>
                        <p className={styles.teaserDesc}>{desc}</p>
                        {extra ? <p className={styles.teaserDesc}>{extra}</p> : null}
                    </div>
                    <button
                        type="button"
                        className={styles.detailBtn}
                        onClick={() => {
                            if (hasCompanyList) {
                                setCompanyListOpen(true);
                            } else {
                                setIsExpanded(true);
                            }
                        }}
                        disabled={!showTeaser}
                    >
                        {detailButtonLabel}
                    </button>
                </div>
            )}

            <div
                ref={panelRef}
                className={[
                    styles.panel,
                    isMobile
                        ? styles.panelMobileFullscreen
                        : isCompact
                          ? styles.panelMobileSheet
                          : styles.panelDesktop,
                    showPanel ? '' : styles.panelHidden,
                ].join(' ')}
                aria-hidden={!showPanel}
            >
                <div className={styles.closeRow}>
                    <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="닫기">
                        ✕
                    </button>
                </div>

                <h2 className={styles.title}>{title}</h2>

                {companies && companies.length > 0 ? (
                    <div className={styles.companyListWrap}>
                        <CompanyList companies={companies} />
                    </div>
                ) : (
                    <>
                        <p className={styles.desc}>{desc}</p>
                        {extra && <p className={styles.extra}>{extra}</p>}
                    </>
                )}
            </div>

            {hasCompanyList && (
                <CompanyListModal
                    open={companyListOpen}
                    title={title}
                    companies={companies!}
                    onClose={() => setCompanyListOpen(false)}
                />
            )}
        </>
    );
}
