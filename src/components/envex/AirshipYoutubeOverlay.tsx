'use client';

import { createPortal } from 'react-dom';
import styles from './AirshipYoutubeOverlay.module.css';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=alV3wILz3Os';

function getYoutubeEmbedUrl(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
}

type AirshipYoutubeOverlayProps = {
    open: boolean;
    youtubeUrl?: string;
    onClose: () => void;
};

export default function AirshipYoutubeOverlay({
    open,
    youtubeUrl = YOUTUBE_URL,
    onClose,
}: AirshipYoutubeOverlayProps) {
    if (!open || typeof document === 'undefined') return null;

    const embedUrl = getYoutubeEmbedUrl(youtubeUrl);
    if (!embedUrl) return null;

    return createPortal(
        <div className={styles.backdrop} role="presentation" onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="닫기"
                >
                    ✕
                </button>
                <iframe
                    className={styles.iframe}
                    src={embedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </div>,
        document.body,
    );
}
