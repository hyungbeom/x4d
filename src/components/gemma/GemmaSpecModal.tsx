'use client';

import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
    type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { GEMMA_PRODUCT_SPECS } from '@/components/gemma/gemmaSpecs';
import { useExpandOriginModal } from '@/hooks/useExpandOriginModal';
import styles from './GemmaSpecModal.module.css';

export type GemmaSpecModalHandle = {
    openWithTrigger: (el: HTMLElement | null) => void;
};

type GemmaSpecModalProps = {
    visible?: boolean;
};

const GemmaSpecModal = forwardRef<GemmaSpecModalHandle, GemmaSpecModalProps>(function GemmaSpecModal(
    { visible = true },
    ref,
) {
    const [open, setOpen] = useState(false);
    const specBtnRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);

    const closeModal = useCallback(() => setOpen(false), []);
    const { mounted, shellRef, backdropRef, panelRef, closeModal: closeWithAnim } =
        useExpandOriginModal({
            open,
            onClose: closeModal,
            triggerRef: triggerRef as RefObject<HTMLElement | null>,
        });

    const openWithTrigger = useCallback(
        (el: HTMLElement | null) => {
            if (open) return;
            triggerRef.current = el ?? specBtnRef.current;
            setOpen(true);
        },
        [open],
    );

    useImperativeHandle(ref, () => ({ openWithTrigger }), [openWithTrigger]);

    const openFromSpecBtn = useCallback(() => {
        openWithTrigger(specBtnRef.current);
    }, [openWithTrigger]);

    const modalTree =
        open && mounted ? (
            <div
                ref={shellRef}
                className={styles.shell}
                role="dialog"
                aria-modal="true"
                aria-labelledby="gemma-spec-title"
            >
                <div
                    ref={backdropRef}
                    className={styles.backdrop}
                    onClick={closeWithAnim}
                    aria-hidden
                />
                <div ref={panelRef} className={styles.panel}>
                    <header className={styles.header}>
                        <div>
                            <p className={styles.eyebrow}>SPEC</p>
                            <h2 id="gemma-spec-title" className={styles.title}>
                                제품사양
                            </h2>
                            <p className={styles.subtitle}>(주)젬마 · GEMMA Co., Ltd.</p>
                        </div>
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={closeWithAnim}
                            aria-label="SPEC 닫기"
                        >
                            CLOSE
                        </button>
                    </header>
                    <div className={styles.grid}>
                        {GEMMA_PRODUCT_SPECS.map((spec) => (
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

    const hidden = !visible || open;

    return (
        <>
            <div className={`${styles.triggerStack} ${hidden ? styles.triggerHidden : ''}`}>
                <button
                    ref={specBtnRef}
                    type="button"
                    className={styles.trigger}
                    onClick={openFromSpecBtn}
                    aria-label="제품 사양 SPEC 보기"
                    aria-expanded={open}
                >
                    SPEC
                </button>
            </div>
            {modalTree ? createPortal(modalTree, document.body) : null}
        </>
    );
});

export default GemmaSpecModal;
