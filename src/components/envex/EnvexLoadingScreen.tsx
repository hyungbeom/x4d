'use client';

import Image from 'next/image';
import { forwardRef } from 'react';
import styles from './EnvexLoadingScreen.module.css';

type EnvexLoadingScreenProps = {
    displayPct: number;
    fixed?: boolean;
    className?: string;
    barFillRef?: React.Ref<HTMLDivElement>;
};

const EnvexLoadingScreen = forwardRef<HTMLDivElement, EnvexLoadingScreenProps>(function EnvexLoadingScreen(
    { displayPct, fixed = false, className, barFillRef },
    ref,
) {
    return (
        <div
            ref={ref}
            className={[styles.layer, fixed ? styles.layerFixed : '', className].filter(Boolean).join(' ')}
            aria-busy="true"
            aria-label="로딩 중"
        >
            <Image
                src="/logo.svg"
                alt="ENVEX"
                width={280}
                height={61}
                priority
                className={styles.logo}
            />
            <div className={styles.progressBlock}>
                <p className={styles.loadingLabel}>Loading ...</p>
                <div className={styles.barTrack}>
                    <div ref={barFillRef} className={styles.barFill} />
                </div>
                <p className={styles.pct}>{displayPct}%</p>
            </div>
        </div>
    );
});

export default EnvexLoadingScreen;
