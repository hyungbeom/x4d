'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchMapCompanies } from '@/utils/map/mapCameraPoints';
import { gsap } from '@/lib/brochureGsap';
import styles from './MapCompanySearchModal.module.css';

type MapCompanySearchModalProps = {
    open: boolean;
    onClose: () => void;
    onSelectBooth: (booth: string) => void;
};

export default function MapCompanySearchModal({
    open,
    onClose,
    onSelectBooth,
}: MapCompanySearchModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const animatingRef = useRef(false);

    const [mounted, setMounted] = useState(false);
    const [query, setQuery] = useState('');

    const trimmed = query.trim();
    const results = trimmed ? searchMapCompanies(query) : [];

    const reset = useCallback(() => {
        setQuery('');
    }, []);

    const runClose = useCallback(() => {
        if (animatingRef.current) return;
        onClose();
    }, [onClose]);

    const handlePick = (booth: string) => {
        onSelectBooth(booth);
        runClose();
    };

    const handleSubmit = () => {
        if (results.length === 1) {
            handlePick(results[0].booth);
        }
    };

    useEffect(() => {
        if (open) setMounted(true);
    }, [open]);

    useEffect(() => {
        if (!mounted) return;

        const backdrop = backdropRef.current;
        const modal = modalRef.current;
        if (!backdrop || !modal) return;

        animatingRef.current = true;
        let focusTimer: number | undefined;

        if (open) {
            gsap.killTweensOf([backdrop, modal]);
            gsap.set(backdrop, { opacity: 0 });
            gsap.set(modal, { opacity: 0, y: 56, scale: 0.94 });

            const tl = gsap.timeline({
                onComplete: () => {
                    animatingRef.current = false;
                    focusTimer = window.setTimeout(() => inputRef.current?.focus(), 40);
                },
            });
            tl.to(backdrop, { opacity: 1, duration: 0.3, ease: 'power2.out' }).to(
                modal,
                { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' },
                '-=0.14',
            );

            return () => {
                tl.kill();
                if (focusTimer) window.clearTimeout(focusTimer);
            };
        }

        gsap.killTweensOf([backdrop, modal]);
        const tl = gsap.timeline({
            onComplete: () => {
                animatingRef.current = false;
                setMounted(false);
                reset();
            },
        });
        tl.to(modal, {
            opacity: 0,
            y: 40,
            scale: 0.97,
            duration: 0.28,
            ease: 'power2.in',
        }).to(backdrop, { opacity: 0, duration: 0.22, ease: 'power2.in' }, '-=0.12');

        return () => {
            tl.kill();
        };
    }, [open, mounted, reset]);

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

    if (!mounted) return null;

    return (
        <div
            ref={backdropRef}
            className={styles.backdrop}
            role="presentation"
            onClick={runClose}
        >
            <div
                ref={modalRef}
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="map-company-search-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 id="map-company-search-title" className={styles.title}>
                        기업 검색
                    </h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={runClose}
                        aria-label="닫기"
                    >
                        ×
                    </button>
                </div>

                <p className={styles.hint}>
                    부스번호 또는 회사명을 입력하면 아래에 일치하는 업체가 표시됩니다.
                </p>

                <div className={styles.searchRow}>
                    <input
                        ref={inputRef}
                        type="search"
                        className={styles.input}
                        placeholder="기업명 또는 부스번호 (예: A12)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        enterKeyHint="search"
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={trimmed.length > 0 && results.length > 0}
                        aria-controls="company-search-suggest-list"
                    />
                </div>

                {trimmed && results.length > 0 ? (
                    <ul
                        id="company-search-suggest-list"
                        className={styles.suggestList}
                        role="listbox"
                        aria-label="기업 검색 결과"
                    >
                        {results.map((item) => (
                            <li key={item.booth} role="option">
                                <button
                                    type="button"
                                    className={styles.suggestItem}
                                    onClick={() => handlePick(item.booth)}
                                >
                                    <span className={styles.suggestBooth}>{item.booth}</span>
                                    <span className={styles.suggestLabel}>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {trimmed && results.length === 0 ? (
                    <p className={styles.noResult}>검색 결과가 없습니다.</p>
                ) : null}
            </div>
        </div>
    );
}
