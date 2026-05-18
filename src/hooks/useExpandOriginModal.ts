'use client';

import {
    type RefObject,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import gsap from 'gsap';

const EXPAND_DURATION = 0.55;
const COLLAPSE_DURATION = 0.45;

type UseExpandOriginModalOptions = {
    open: boolean;
    onClose: () => void;
    triggerRef: RefObject<HTMLElement | null>;
};

export function useExpandOriginModal({
    open,
    onClose,
    triggerRef,
}: UseExpandOriginModalOptions) {
    const [mounted, setMounted] = useState(false);
    const shellRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const originRectRef = useRef<DOMRect | null>(null);
    const animatingRef = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getTriggerRect = useCallback(() => {
        return triggerRef.current?.getBoundingClientRect() ?? null;
    }, [triggerRef]);

    const closeModal = useCallback(() => {
        if (animatingRef.current || !open) return;
        const rect = getTriggerRect() ?? originRectRef.current;
        const shell = shellRef.current;
        const backdrop = backdropRef.current;
        const panel = panelRef.current;
        if (!rect || !shell || !backdrop || !panel) {
            onClose();
            animatingRef.current = false;
            return;
        }

        animatingRef.current = true;
        gsap.killTweensOf([shell, backdrop, panel]);

        gsap
            .timeline({
                onComplete: () => {
                    onClose();
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
    }, [getTriggerRect, onClose, open]);

    useLayoutEffect(() => {
        if (!open) return;

        const rect = getTriggerRect();
        if (!rect) {
            animatingRef.current = false;
            onClose();
            return;
        }
        originRectRef.current = rect;

        const shell = shellRef.current;
        const backdrop = backdropRef.current;
        const panel = panelRef.current;
        if (!shell || !backdrop || !panel) {
            animatingRef.current = false;
            return;
        }

        animatingRef.current = true;
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
    }, [getTriggerRect, onClose, open]);

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
    }, [closeModal, open]);

    return {
        mounted,
        shellRef,
        backdropRef,
        panelRef,
        closeModal,
    };
}
