'use client';

import type { MapViewMode } from '@/utils/map/mapViewCamera';
import styles from './MapViewModeToggle.module.css';

type MapViewModeToggleProps = {
    mode: MapViewMode;
    onChange: (mode: MapViewMode) => void;
    /** fixed: 우하단(데스크톱), inline: 하단 액션바 안 */
    placement?: 'fixed' | 'inline';
};

export function MapViewModeToggle({
    mode,
    onChange,
    placement = 'fixed',
}: MapViewModeToggleProps) {
    return (
        <div
            className={`${styles.toggle} ${placement === 'inline' ? styles.toggleInline : ''}`}
            role="group"
            aria-label="맵 보기 모드"
        >
            <button
                type="button"
                className={`${styles.btn} ${mode === '2d' ? styles.btnActive : ''}`}
                onClick={() => onChange('2d')}
                aria-pressed={mode === '2d'}
            >
                2D
            </button>
            <button
                type="button"
                className={`${styles.btn} ${mode === '3d' ? styles.btnActive : ''}`}
                onClick={() => onChange('3d')}
                aria-pressed={mode === '3d'}
            >
                3D
            </button>
        </div>
    );
}
