'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { openCompanyHomepage, type CompanyListItem } from '@/data/map/envexCompanies';
import { usePageTransition } from '@/utils/ui/usePageTransition';
import styles from './CompanyListModal.module.css';

type CompanyListModalProps = {
    open: boolean;
    title: string;
    companies: CompanyListItem[];
    onClose: () => void;
};

function HeaderCurve() {
    return (
        <div className={styles.headerCurve} aria-hidden>
            <svg viewBox="0 0 390 22" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 H390 V6 Q195 22 0 6 Z" fill="currentColor" />
            </svg>
        </div>
    );
}

export default function CompanyListModal({
    open,
    title,
    companies,
    onClose,
}: CompanyListModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const animatingRef = useRef(false);
    const [mounted, setMounted] = useState(false);
    const navigate = usePageTransition();

    const runClose = useCallback(() => {
        if (animatingRef.current) return;
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (open) setMounted(true);
    }, [open]);

    useEffect(() => {
        if (!mounted) return;

        const overlay = overlayRef.current;
        const backdrop = backdropRef.current;
        const dialog = dialogRef.current;
        if (!overlay || !backdrop || !dialog) return;

        animatingRef.current = true;
        gsap.killTweensOf([backdrop, dialog]);

        const mm = gsap.matchMedia();

        mm.add('(min-width: 1025px)', () => {
            if (open) {
                gsap.set(overlay, { pointerEvents: 'auto' });
                gsap.set(backdrop, { opacity: 0 });
                gsap.set(dialog, { scale: 0.94, opacity: 0, y: 12 });
                gsap.to(backdrop, {
                    opacity: 1,
                    duration: 0.32,
                    ease: 'power2.out',
                });
                gsap.to(dialog, {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.48,
                    ease: 'power3.out',
                    onComplete: () => {
                        animatingRef.current = false;
                    },
                });
            } else {
                gsap.to(backdrop, {
                    opacity: 0,
                    duration: 0.28,
                    ease: 'power2.in',
                });
                gsap.to(dialog, {
                    scale: 0.96,
                    opacity: 0,
                    y: 8,
                    duration: 0.32,
                    ease: 'power2.in',
                    onComplete: () => {
                        animatingRef.current = false;
                        gsap.set(overlay, { pointerEvents: 'none' });
                        setMounted(false);
                    },
                });
            }
        });

        mm.add('(max-width: 1024px)', () => {
            if (open) {
                gsap.set(overlay, { pointerEvents: 'auto' });
                gsap.set(backdrop, { opacity: 0 });
                gsap.set(dialog, { y: '100%', opacity: 1, scale: 1 });
                gsap.to(backdrop, {
                    opacity: 1,
                    duration: 0.35,
                    ease: 'power2.out',
                });
                gsap.to(dialog, {
                    y: 0,
                    duration: 0.55,
                    ease: 'power3.out',
                    onComplete: () => {
                        animatingRef.current = false;
                    },
                });
            } else {
                gsap.to(dialog, {
                    y: '100%',
                    duration: 0.42,
                    ease: 'power3.in',
                });
                gsap.to(backdrop, {
                    opacity: 0,
                    duration: 0.32,
                    ease: 'power2.in',
                    onComplete: () => {
                        animatingRef.current = false;
                        gsap.set(overlay, { pointerEvents: 'none' });
                        setMounted(false);
                    },
                });
            }
        });

        return () => {
            gsap.killTweensOf([backdrop, dialog]);
            mm.revert();
        };
    }, [open, mounted]);

    useEffect(() => {
        if (!mounted || !open) return;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mounted, open]);

    useEffect(() => {
        if (!mounted || !open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !animatingRef.current) runClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mounted, open, runClose]);

    if (!mounted || typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={overlayRef}
            className={styles.overlay}
            role="presentation"
            style={{ pointerEvents: open ? 'auto' : 'none' }}
        >
            <button
                ref={backdropRef}
                type="button"
                className={styles.backdrop}
                onClick={runClose}
                aria-label="기업 리스트 닫기"
                tabIndex={open ? 0 : -1}
            />
            <div
                ref={dialogRef}
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="company-list-modal-title"
            >
                <div className={styles.headerBlock}>
                    <h1 id="company-list-modal-title" className={styles.headerTitle}>
                        {title}
                    </h1>
                    <HeaderCurve />
                    <span className={styles.headerStem} aria-hidden />
                </div>

                <div className={styles.body}>
                    <div className={styles.toolbar}>
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={runClose}
                            aria-label="닫기"
                        >
                            ←
                        </button>
                    </div>

                    <div className={styles.listWrap}>
                        <ul className={styles.list}>
                            {companies.map((company) => {
                                const hasHomepage = Boolean(company.homepage);
                                return (
                                    <li
                                        key={company.id}
                                        className={[styles.row, hasHomepage ? styles.rowClickable : '']
                                            .filter(Boolean)
                                            .join(' ')}
                                        onClick={
                                            hasHomepage
                                                ? () => openCompanyHomepage(company.homepage)
                                                : undefined
                                        }
                                        onKeyDown={
                                            hasHomepage
                                                ? (e) => {
                                                      if (e.key === 'Enter' || e.key === ' ') {
                                                          e.preventDefault();
                                                          openCompanyHomepage(company.homepage);
                                                      }
                                                  }
                                                : undefined
                                        }
                                        role={hasHomepage ? 'button' : undefined}
                                        tabIndex={hasHomepage ? 0 : undefined}
                                        aria-label={
                                            hasHomepage ? `${company.nameKo} 홈페이지 열기` : undefined
                                        }
                                    >
                                        <div className={styles.logo}>
                                            {company.logoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={company.logoUrl}
                                                    alt=""
                                                    className={styles.logoImg}
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <span className={styles.logoFallback} aria-hidden>
                                                    {company.logoInitials ?? '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.textBlock}>
                                            <p className={styles.nameEn}>{company.nameEn}</p>
                                            <p className={styles.nameKo}>{company.nameKo}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className={styles.booth}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(
                                                    `/map?booth=${encodeURIComponent(company.booth)}`,
                                                    'blinds',
                                                );
                                            }}
                                        >
                                            {company.booth}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
