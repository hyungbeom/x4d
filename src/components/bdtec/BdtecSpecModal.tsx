'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BDI_GATEWAY_SPECS } from '@/components/bdtec/next-section/gatewaySpecs';
import { useExpandOriginModal } from '@/hooks/useExpandOriginModal';
import styles from './BdtecSpecModal.module.css';

type BdtecSpecModalProps = {
    visible?: boolean;
    showPrev?: boolean;
    onNext?: () => void;
    onPrev?: () => void;
};

export default function BdtecSpecModal({
    visible = true,
    showPrev = false,
    onNext,
    onPrev,
}: BdtecSpecModalProps) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);

    const closeModal = useCallback(() => setOpen(false), []);
    const { mounted, shellRef, backdropRef, panelRef, closeModal: closeWithAnim } =
        useExpandOriginModal({
            open,
            onClose: closeModal,
            triggerRef: btnRef,
        });

    const openModal = useCallback(() => {
        if (open) return;
        setOpen(true);
    }, [open]);

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
                    onClick={closeWithAnim}
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
                            onClick={closeWithAnim}
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

    const hidden = !visible || open;

    return (
        <>
            <div className={`${styles.triggerStack} ${hidden ? styles.triggerHidden : ''}`}>
                <button
                    ref={btnRef}
                    type="button"
                    className={styles.trigger}
                    onClick={openModal}
                    aria-label="제품 사양 SPEC 보기"
                    aria-expanded={open}
                >
                    SPEC
                </button>
                {showPrev && onPrev ? (
                    <button
                        type="button"
                        className={styles.trigger}
                        onClick={onPrev}
                        aria-label="이전 화면으로 돌아가기"
                    >
                        PREV
                    </button>
                ) : null}
            </div>
            {modalTree ? createPortal(modalTree, document.body) : null}
        </>
    );
}
