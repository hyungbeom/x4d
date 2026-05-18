'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './AirshipVideoOverlay.module.css';

const DEFAULT_VIDEO_SRC = '/movie.mp4';

export type AirshipVideoUi = 'none' | 'confirm' | 'player';

type AirshipVideoOverlayProps = {
    ui: AirshipVideoUi;
    videoSrc?: string;
    onUiChange: (ui: AirshipVideoUi) => void;
};

export default function AirshipVideoOverlay({
    ui,
    videoSrc = DEFAULT_VIDEO_SRC,
    onUiChange,
}: AirshipVideoOverlayProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const closeAll = useCallback(() => onUiChange('none'), [onUiChange]);

    useEffect(() => {
        if (ui === 'none') return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAll();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [ui, closeAll]);

    useEffect(() => {
        if (ui !== 'player') return;

        const video = videoRef.current;
        if (!video) return;

        const playWhenReady = () => {
            void video.play().catch(() => {});
        };

        if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
            playWhenReady();
            return;
        }

        video.addEventListener('canplay', playWhenReady, { once: true });
        return () => video.removeEventListener('canplay', playWhenReady);
    }, [ui]);

    if (ui === 'none' || typeof document === 'undefined') return null;

    if (ui === 'confirm') {
        return createPortal(
            <div className={styles.backdrop} role="presentation" onClick={closeAll}>
                <div
                    className={styles.confirmCard}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="airship-video-confirm-title"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p id="airship-video-confirm-title" className={styles.confirmTitle}>
                        동영상 재생
                    </p>
                    <p className={styles.confirmMessage}>동영상을 시청하시겠습니까?</p>
                    <div className={styles.confirmActions}>
                        <button
                            type="button"
                            className={styles.confirmBtn}
                            onClick={() => onUiChange('player')}
                        >
                            예
                        </button>
                        <button type="button" className={styles.cancelBtn} onClick={closeAll}>
                            아니오
                        </button>
                    </div>
                </div>
            </div>,
            document.body,
        );
    }

    return createPortal(
        <div className={styles.playerShell} role="dialog" aria-modal="true">
            <header className={styles.playerHeader}>
                <p className={styles.playerTitle}>ENVEX 소개 영상</p>
                <button type="button" className={styles.closeBtn} onClick={closeAll}>
                    닫기
                </button>
            </header>
            <div className={styles.playerBody}>
                <video
                    ref={videoRef}
                    className={styles.video}
                    src={videoSrc}
                    controls
                    playsInline
                    preload="auto"
                    muted
                />
            </div>
        </div>,
        document.body,
    );
}
