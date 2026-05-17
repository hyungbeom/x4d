'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useBdtecSceneLoadingActions } from '@/app/brochure/bdtec/BdtecSceneLoadingContext';

function scheduleUpdate(fn: () => void) {
    queueMicrotask(fn);
}

/** Canvas 내부: LoadingManager → 로더 스토어 (useProgress는 Environment 렌더 중 setState 유발) */
export function BdtecSceneLoadingReporter() {
    const { setCanvasMounted, setProgress } = useBdtecSceneLoadingActions();
    const setProgressRef = useRef(setProgress);
    setProgressRef.current = setProgress;

    const lastSentRef = useRef({ active: false, pct: -1, item: '', total: -1 });

    const pushProgress = useRef((active: boolean, progress: number, item: string, total: number) => {
        const pct = Math.min(100, Math.max(0, Math.round(Number.isFinite(progress) ? progress : 0)));
        const last = lastSentRef.current;
        if (last.active === active && last.pct === pct && last.item === item && last.total === total) {
            return;
        }
        lastSentRef.current = { active, pct, item, total };
        scheduleUpdate(() => {
            setProgressRef.current({ active, progress: pct, item, total });
        });
    });

    useEffect(() => {
        scheduleUpdate(() => setCanvasMounted(true));

        const manager = THREE.DefaultLoadingManager;
        let inProgress = false;

        const emit = (url: string, loaded: number, total: number) => {
            const pct = total > 0 ? (loaded / total) * 100 : inProgress ? 0 : 100;
            pushProgress.current(inProgress, pct, url, total);
        };

        const prevStart = manager.onStart;
        const prevProgress = manager.onProgress;
        const prevLoad = manager.onLoad;
        const prevError = manager.onError;

        manager.onStart = (url, loaded, total) => {
            inProgress = true;
            emit(url, loaded, total);
            prevStart?.(url, loaded, total);
        };

        manager.onProgress = (url, loaded, total) => {
            inProgress = true;
            emit(url, loaded, total);
            prevProgress?.(url, loaded, total);
        };

        manager.onLoad = () => {
            inProgress = false;
            pushProgress.current(false, 100, '', 0);
            prevLoad?.();
        };

        manager.onError = (url) => {
            inProgress = false;
            pushProgress.current(false, 0, url, 0);
            prevError?.(url);
        };

        return () => {
            manager.onStart = prevStart;
            manager.onProgress = prevProgress;
            manager.onLoad = prevLoad;
            manager.onError = prevError;
            scheduleUpdate(() => setCanvasMounted(false));
        };
    }, [setCanvasMounted]);

    return null;
}
