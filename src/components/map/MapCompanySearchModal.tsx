'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    searchMapCompanies,
    type MapSearchableCompany,
} from '@/utils/map/mapCameraPoints';
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
    const [results, setResults] = useState<MapSearchableCompany[]>([]);
    const [message, setMessage] = useState('');

    const reset = useCallback(() => {
        setQuery('');
        setResults([]);
        setMessage('');
    }, []);

    const runClose = useCallback(() => {
        if (animatingRef.current) return;
        onClose();
    }, [onClose]);

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

    const handleSearch = () => {
        const matches = searchMapCompanies(query);
        setResults(matches);

        if (matches.length === 0) {
            setMessage(
                '검색 결과가 없습니다. 기업명 또는 부스번호를 확인해 주세요.',
            );
            return;
        }

        if (matches.length === 1) {
            onSelectBooth(matches[0].booth);
            runClose();
            return;
        }

        setMessage(`${matches.length}건이 검색되었습니다. 이동할 기업을 선택하세요.`);
    };

    const handlePick = (booth: string) => {
        onSelectBooth(booth);
        runClose();
    };

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

                <div className={styles.searchRow}>
                    <input
                        ref={inputRef}
                        type="search"
                        className={styles.input}
                        placeholder="기업명 또는 부스번호 (예: A12)"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setMessage('');
                            setResults([]);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch();
                            }
                        }}
                        enterKeyHint="search"
                        autoComplete="off"
                    />
                    <button type="button" className={styles.findBtn} onClick={handleSearch}>
                        찾기
                    </button>
                </div>

                {message ? <p className={styles.message}>{message}</p> : null}

                {results.length > 1 ? (
                    <ul className={styles.resultList}>
                        {results.map((item) => (
                            <li key={item.booth}>
                                <button
                                    type="button"
                                    className={styles.resultItem}
                                    onClick={() => handlePick(item.booth)}
                                >
                                    <span className={styles.resultBooth}>{item.booth}</span>
                                    <span className={styles.resultLabel}>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </div>
    );
}
