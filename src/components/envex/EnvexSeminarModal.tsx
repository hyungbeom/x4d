'use client';

import { type KeyboardEvent, type RefObject, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    ENVEX_SEMINAR_DATE_FILTERS,
    ENVEX_SEMINAR_SCHEDULE,
    filterEnvexSeminars,
    type EnvexSeminarDateFilterId,
} from '@/data/envexSeminarSchedule';
import { useExpandOriginModal } from '@/hooks/useExpandOriginModal';
import styles from './EnvexSeminarModal.module.css';

type EnvexSeminarModalProps = {
    open: boolean;
    onClose: () => void;
    triggerRef: RefObject<HTMLButtonElement | null>;
};

export default function EnvexSeminarModal({
    open,
    onClose,
    triggerRef,
}: EnvexSeminarModalProps) {
    const [dateFilter, setDateFilter] = useState<EnvexSeminarDateFilterId>('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { mounted, shellRef, backdropRef, panelRef, closeModal } =
        useExpandOriginModal({ open, onClose, triggerRef });

    useEffect(() => {
        if (!open) {
            setSearchInput('');
            setSearchQuery('');
            setDateFilter('all');
        }
    }, [open]);

    const filtered = useMemo(
        () =>
            filterEnvexSeminars(ENVEX_SEMINAR_SCHEDULE, {
                dateFilter,
                query: searchQuery,
            }),
        [dateFilter, searchQuery],
    );

    const handleSearch = () => setSearchQuery(searchInput.trim());

    const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    if (!mounted || !open) return null;

    return createPortal(
        <div
            ref={shellRef}
            className={styles.shell}
            role="dialog"
            aria-modal="true"
            aria-labelledby="envex-seminar-title"
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
                        <p className={styles.eyebrow}>ENVEX 2026</p>
                        <h2 id="envex-seminar-title" className={styles.title}>
                            부대행사 안내
                        </h2>
                        <p className={styles.subtitle}>Check Concurrent Event Schedule</p>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={closeModal}
                        aria-label="세미나 일정 닫기"
                    >
                        CLOSE
                    </button>
                </header>

                <div className={styles.searchRow}>
                    <label className={styles.searchLabel} htmlFor="envex-seminar-search">
                        부대행사 검색
                    </label>
                    <div className={styles.searchBar}>
                        <input
                            id="envex-seminar-search"
                            type="search"
                            className={styles.searchInput}
                            placeholder="부대행사명·주최기관 검색"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            className={styles.searchBtn}
                            onClick={handleSearch}
                        >
                            검색
                        </button>
                    </div>
                </div>

                <div className={styles.filters} role="tablist" aria-label="일정 날짜 필터">
                    {ENVEX_SEMINAR_DATE_FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            type="button"
                            role="tab"
                            aria-selected={dateFilter === filter.id}
                            className={`${styles.filterBtn} ${dateFilter === filter.id ? styles.filterBtnActive : ''}`}
                            onClick={() => setDateFilter(filter.id)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <ul className={styles.list}>
                    {filtered.length > 0 ? (
                        filtered.map((item) => (
                            <li key={item.id} className={styles.card}>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <p className={styles.cardOrganizer}>{item.organizer}</p>
                                <div className={styles.tags}>
                                    <span className={styles.tag}>{item.date}</span>
                                    <span className={styles.tag}>{item.time}</span>
                                    <span className={styles.tag}>{item.place}</span>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className={styles.empty}>
                            {searchQuery ? '검색 결과가 없습니다.' : '일정이 없습니다.'}
                        </li>
                    )}
                </ul>
            </div>
        </div>,
        document.body,
    );
}
