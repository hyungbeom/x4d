'use client';

import Image from 'next/image';
import { Fragment } from 'react';
import styles from './EnvexFooterNav.module.css';

export const ENVEX_FOOTER_ITEMS = [
    { id: 'water', title: '수질', iconSrc: '/icon/water.svg', panelId: 1 },
    { id: 'air', title: '대기', iconSrc: '/icon/air.svg', panelId: 2 },
    { id: 'measure', title: '측정분석', iconSrc: '/icon/measure.svg', panelId: 3 },
    { id: 'leaf', title: '탈탄소', iconSrc: '/icon/leaf.svg', panelId: 4 },
    { id: 'global', title: '외국관', iconSrc: '/icon/global.svg', panelId: 5 },
    { id: 'temp', title: '기관 및 단체', iconSrc: '/icon/temp.svg', panelId: 6 },
] as const;

type EnvexFooterNavProps = {
    /** 0-based, null = none selected */
    activeIndex: number | null;
    onSelect: (panelId: number) => void;
};

export default function EnvexFooterNav({ activeIndex, onSelect }: EnvexFooterNavProps) {
    return (
        <nav className={styles.footer} aria-label="전시 구역 이동">
            {ENVEX_FOOTER_ITEMS.map((item, index) => (
                <Fragment key={item.id}>
                    {index > 0 && <span className={styles.separator} aria-hidden />}
                    <button
                        type="button"
                        className={`${styles.item} ${activeIndex === index ? styles.itemActive : ''}`}
                        onClick={() => onSelect(item.panelId)}
                        aria-label={item.title}
                        aria-current={activeIndex === index ? 'page' : undefined}
                        title={item.title}
                    >
                        <Image
                            src={item.iconSrc}
                            alt=""
                            width={24}
                            height={24}
                            className={styles.icon}
                        />
                    </button>
                </Fragment>
            ))}
        </nav>
    );
}
