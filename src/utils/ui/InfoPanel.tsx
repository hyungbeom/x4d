import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
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
}

function getTeaserPreview(desc: string, extra?: string, maxSentences = 3): string[] {
    const combined = [desc, extra].filter(Boolean).join(' ');
    const sentences =
        combined.match(/[^.!?。]+[.!?。]+|[^.!?。]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [desc];
    return sentences.slice(0, maxSentences);
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

export default function InfoPanel({ isOpen, title, desc, extra, onClose, teaserClassName }: InfoPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const teaserRef = useRef<HTMLDivElement>(null);
    const isCompact = useMediaQuery(COMPACT_BREAKPOINT);
    const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
    const [isExpanded, setIsExpanded] = useState(false);

    const showTeaser = isCompact && isOpen && !isExpanded;
    const showPanel = isOpen && (!isCompact || isExpanded);
    const teaserLines = getTeaserPreview(desc, extra);

    useEffect(() => {
        if (!isOpen) setIsExpanded(false);
    }, [isOpen]);

    useEffect(() => {
        setIsExpanded(false);
    }, [title]);

    useEffect(() => {
        const teaser = teaserRef.current;
        if (!teaser) return;

        gsap.to(teaser, {
            opacity: showTeaser ? 1 : 0,
            pointerEvents: showTeaser ? 'auto' : 'none',
            duration: showTeaser ? 0.4 : 0.3,
            ease: showTeaser ? 'power2.out' : 'power2.in',
        });
    }, [showTeaser]);

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;

        const mm = gsap.matchMedia();

        mm.add('(min-width: 1025px)', () => {
            if (isOpen) {
                gsap.to(panel, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
            } else {
                gsap.to(panel, { x: '100%', y: 0, opacity: 0, duration: 0.5, ease: 'power3.in' });
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
    }, [isOpen, isExpanded]);

    const handleClose = () => {
        if (isCompact && isExpanded) {
            setIsExpanded(false);
            return;
        }
        onClose();
    };

    return (
        <>
            {isCompact && isOpen && (
                <div
                    ref={teaserRef}
                    className={[styles.teaser, teaserClassName].filter(Boolean).join(' ')}
                    style={{ opacity: 0 }}
                >
                    <h3 className={styles.teaserTitle}>{title}</h3>
                    <p className={styles.teaserDesc}>
                        {teaserLines.map((line, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && ' '}
                                {line}
                            </React.Fragment>
                        ))}
                    </p>
                    <button
                        type="button"
                        className={styles.detailBtn}
                        onClick={() => setIsExpanded(true)}
                        disabled={!showTeaser}
                    >
                        자세히 보기
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
                <p className={styles.desc}>{desc}</p>
                {extra && <p className={styles.extra}>{extra}</p>}
            </div>
        </>
    );
}
