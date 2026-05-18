'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { BDI_GATEWAY_SPECS } from '@/components/bdtec/next-section/gatewaySpecs';
import styles from './BdtecSpecModal.module.css';

const EXPAND_DURATION = 0.55;
const COLLAPSE_DURATION = 0.45;

type BdtecSpecModalProps = {
    visible?: boolean;
};

export default function BdtecSpecModal({ visible = true }: BdtecSpecModalProps) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);

    const btnRef = useRef<HTMLButtonElement>(null);
    const shellRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const originRectRef = useRef<DOMRect | null>(null);
    const animatingRef = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getButtonRect = useCallback(() => {
        return btnRef.current?.getBoundingClientRect() ?? null;
    }, []);

    const openModal = useCallback(() => {
        if (animatingRef.current || open) return;
        const rect = getButtonRect();
        if (!rect) return;
        originRectRef.current = rect;
        animatingRef.current = true;
        setOpen(true);
    }, [getButtonRect, open]);

    const closeModal = useCallback(() => {
        if (animatingRef.current || !open) return;
        const rect = getButtonRect() ?? originRectRef.current;
        const shell = shellRef.current;
        const backdrop = backdropRef.current;
        const panel = panelRef.current;
        if (!rect || !shell || !backdrop || !panel) {
            setOpen(false);
            animatingRef.current = false;
            return;
        }

        animatingRef.current = true;
        gsap.killTweensOf([shell, backdrop, panel]);

        gsap
            .timeline({
                onComplete: () => {
                    setOpen(false);
                    animatingRef.current = false;
                },
            })
            .to(panel, { opacity: 0, y: 8, duration: 0.2, ease: 'power2.in' }, 0)
            .to(backdrop, { opacity: 0, duration: COLLAPSE_DURATION * 0.6 }, 0.05)
            .to(
                shell,
                {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    borderRadius: 999,
                    duration: COLLAPSE_DURATION,
                    ease: 'power3.inOut',
                },
                0.08,
            );
    }, [getButtonRect, open]);

    useLayoutEffect(() => {
        if (!open) return;

        const rect = originRectRef.current;
        const shell = shellRef.current;
        const backdrop = backdropRef.current;
        const panel = panelRef.current;
        if (!rect || !shell || !backdrop || !panel) {
            animatingRef.current = false;
            return;
        }

        gsap.killTweensOf([shell, backdrop, panel]);

        gsap.set(shell, {
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: 999,
            opacity: 1,
            pointerEvents: 'auto',
            boxShadow: '0 12px 40px rgba(74, 143, 212, 0.22)',
        });
        gsap.set(backdrop, { opacity: 0 });
        gsap.set(panel, { opacity: 0, y: 12 });

        gsap
            .timeline({
                onComplete: () => {
                    animatingRef.current = false;
                },
            })
            .to(backdrop, { opacity: 1, duration: EXPAND_DURATION * 0.7, ease: 'power2.out' }, 0)
            .to(
                shell,
                {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    borderRadius: 0,
                    duration: EXPAND_DURATION,
                    ease: 'power3.inOut',
                },
                0,
            )
            .to(
                panel,
                { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
                EXPAND_DURATION * 0.35,
            );
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, closeModal]);

    const modalTree =
        open && mounted ? (
            <div
                ref={shellRef}
                className={styles.shell}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bdtec-spec-title"
            >
                <div
                    ref={backdropRef}
                    className={styles.backdrop}
                    onClick={closeModal}
                    aria-hidden
                />
                <div ref={panelRef} className={styles.panel}>
                    <header className={styles.header}>
                        <div>
                            <p className={styles.eyebrow}>SPEC</p>
                            <h2 id="bdtec-spec-title" className={styles.title}>
                                IoT Gateway 제품 사양
                            </h2>
                            <p className={styles.subtitle}>
                                BDI-100 시리즈 · 주식회사 비디텍
                            </p>
                        </div>
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={closeModal}
                            aria-label="SPEC 닫기"
                        >
                            CLOSE
                        </button>
                    </header>
                    <div className={styles.grid}>
                        {BDI_GATEWAY_SPECS.map((spec) => (
                            <div key={spec.label} className={styles.row}>
                                <span className={styles.label}>{spec.label}</span>
                                <span className={styles.value}>{spec.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : null;

    if (!mounted) return null;

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                className={`${styles.trigger} ${!visible || open ? styles.triggerHidden : ''}`}
                onClick={openModal}
                aria-label="제품 사양 SPEC 보기"
                aria-expanded={open}
            >
                SPEC
            </button>
            {modalTree ? createPortal(modalTree, document.body) : null}
        </>
    );
}
