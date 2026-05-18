'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    getMapSearchableCompanies,
    searchMapCompanies,
    type MapSearchableCompany,
} from '@/utils/map/mapCameraPoints';
import { gsap } from '@/lib/brochureGsap';
import styles from './MapNavSearchModal.module.css';

type SelectedBooth = {
    booth: string;
    label: string;
};

type MapNavSearchModalProps = {
    open: boolean;
    onClose: () => void;
    onApplyRoute: (fromBooth: string, toBooth: string) => void;
    initialFromBooth?: string;
    initialToBooth?: string;
};

function findCompanyByBooth(booth: string): SelectedBooth | null {
    const code = booth.trim().toUpperCase();
    if (!code) return null;
    const found = getMapSearchableCompanies().find(
        (c) => c.booth.toUpperCase() === code,
    );
    return found ? { booth: found.booth, label: found.label } : { booth: code, label: code };
}

type BoothSearchFieldProps = {
    id: string;
    label: string;
    labelClassName?: string;
    chipClassName?: string;
    placeholder: string;
    selected: SelectedBooth | null;
    query: string;
    onQueryChange: (value: string) => void;
    onSelect: (company: MapSearchableCompany) => void;
    onClear: () => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
};

function BoothSearchField({
    id,
    label,
    labelClassName,
    chipClassName,
    placeholder,
    selected,
    query,
    onQueryChange,
    onSelect,
    onClear,
    inputRef,
}: BoothSearchFieldProps) {
    const trimmed = query.trim();
    const results = trimmed ? searchMapCompanies(query) : [];
    const showSuggestions = trimmed.length > 0 && !selected;

    return (
        <div className={styles.field}>
            <label htmlFor={id} className={`${styles.fieldLabel} ${labelClassName ?? ''}`}>
                {label}
            </label>

            {selected ? (
                <button
                    type="button"
                    className={`${styles.selectedChip} ${chipClassName ?? ''}`}
                    onClick={onClear}
                    title="다시 검색"
                >
                    <span className={styles.chipBooth}>{selected.booth}</span>
                    <span>{selected.label}</span>
                    <span aria-hidden>×</span>
                </button>
            ) : (
                <input
                    ref={inputRef}
                    id={id}
                    type="search"
                    className={styles.input}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    enterKeyHint="search"
                    autoComplete="off"
                />
            )}

            {showSuggestions && results.length > 0 ? (
                <ul className={styles.suggestList} role="listbox" aria-label={`${label} 검색 결과`}>
                    {results.map((item) => (
                        <li key={item.booth} role="option">
                            <button
                                type="button"
                                className={styles.suggestItem}
                                onClick={() => onSelect(item)}
                            >
                                <span className={styles.suggestBooth}>{item.booth}</span>
                                <span className={styles.suggestLabel}>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}

            {showSuggestions && results.length === 0 ? (
                <p className={styles.noResult}>검색 결과가 없습니다.</p>
            ) : null}
        </div>
    );
}

export default function MapNavSearchModal({
    open,
    onClose,
    onApplyRoute,
    initialFromBooth = '',
    initialToBooth = '',
}: MapNavSearchModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const fromInputRef = useRef<HTMLInputElement>(null);
    const animatingRef = useRef(false);

    const [mounted, setMounted] = useState(false);
    const [fromSelected, setFromSelected] = useState<SelectedBooth | null>(null);
    const [toSelected, setToSelected] = useState<SelectedBooth | null>(null);
    const [fromQuery, setFromQuery] = useState('');
    const [toQuery, setToQuery] = useState('');
    const [error, setError] = useState('');

    const syncFromUrl = useCallback(() => {
        setFromSelected(initialFromBooth ? findCompanyByBooth(initialFromBooth) : null);
        setToSelected(initialToBooth ? findCompanyByBooth(initialToBooth) : null);
        setFromQuery('');
        setToQuery('');
        setError('');
    }, [initialFromBooth, initialToBooth]);

    const reset = useCallback(() => {
        setFromSelected(null);
        setToSelected(null);
        setFromQuery('');
        setToQuery('');
        setError('');
    }, []);

    const runClose = useCallback(() => {
        if (animatingRef.current) return;
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (open) {
            setMounted(true);
            syncFromUrl();
        }
    }, [open, syncFromUrl]);

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
                    focusTimer = window.setTimeout(() => fromInputRef.current?.focus(), 40);
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

    const resolveToBooth = (): SelectedBooth | null => {
        if (toSelected) return toSelected;
        const q = toQuery.trim();
        if (!q) return null;
        const matches = searchMapCompanies(q);
        if (matches.length === 1) return { booth: matches[0].booth, label: matches[0].label };
        return null;
    };

    const resolveFromBooth = (): SelectedBooth | null => {
        if (fromSelected) return fromSelected;
        const q = fromQuery.trim();
        if (!q) return null;
        const matches = searchMapCompanies(q);
        if (matches.length === 1) return { booth: matches[0].booth, label: matches[0].label };
        return null;
    };

    const handleApply = () => {
        const to = resolveToBooth();
        const from = resolveFromBooth();

        if (!to) {
            setError('도착 부스를 선택하거나, 하나만 일치하는 검색어를 입력해 주세요.');
            return;
        }

        if (from && from.booth.toUpperCase() === to.booth.toUpperCase()) {
            setError('출발과 도착 부스가 같을 수 없습니다.');
            return;
        }

        onApplyRoute(from?.booth ?? '', to.booth);
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
                aria-labelledby="map-nav-search-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 id="map-nav-search-title" className={styles.title}>
                        길찾기
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
                    출발을 비우면 입구에서 안내합니다.
                </p>

                <div className={styles.body}>
                    <BoothSearchField
                        id="nav-from-booth"
                        label="출발 부스"
                        labelClassName={styles.fieldLabelFrom}
                        chipClassName={styles.selectedChipFrom}
                        placeholder="출발 — 부스번호 또는 회사명"
                        selected={fromSelected}
                        query={fromQuery}
                        onQueryChange={(v) => {
                            setFromQuery(v);
                            setError('');
                        }}
                        onSelect={(c) => {
                            setFromSelected({ booth: c.booth, label: c.label });
                            setFromQuery('');
                            setError('');
                        }}
                        onClear={() => {
                            setFromSelected(null);
                            setFromQuery('');
                        }}
                        inputRef={fromInputRef}
                    />

                    <BoothSearchField
                        id="nav-to-booth"
                        label="도착 부스"
                        labelClassName={styles.fieldLabelTo}
                        chipClassName={styles.selectedChipTo}
                        placeholder="도착 — 부스번호 또는 회사명"
                        selected={toSelected}
                        query={toQuery}
                        onQueryChange={(v) => {
                            setToQuery(v);
                            setError('');
                        }}
                        onSelect={(c) => {
                            setToSelected({ booth: c.booth, label: c.label });
                            setToQuery('');
                            setError('');
                        }}
                        onClear={() => {
                            setToSelected(null);
                            setToQuery('');
                        }}
                    />
                </div>

                {error ? <p className={styles.error}>{error}</p> : null}

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={() => {
                            reset();
                        }}
                    >
                        초기화
                    </button>
                    <button
                        type="button"
                        className={styles.applyBtn}
                        onClick={handleApply}
                        disabled={!toSelected && !toQuery.trim()}
                    >
                        길찾기 시작
                    </button>
                </div>
            </div>
        </div>
    );
}
