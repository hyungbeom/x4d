'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '@/lib/brochureGsap';
import {
    isBdtecSceneFullyReady,
    useBdtecSceneLoadingState,
} from '@/utils/three/SceneLoadingContext';
import { computeEnvexLoadPct } from './computeEnvexLoadPct';

export const ENVEX_FILL_TO_100_SEC = 2;

export function useEnvexLoadingProgress() {
    const loading = useBdtecSceneLoadingState();
    const fullyReady = isBdtecSceneFullyReady(loading);

    const barFillRef = useRef<HTMLDivElement>(null);
    const pctRef = useRef(0);
    const mountTimeRef = useRef(performance.now());
    const fillTo100StartedRef = useRef(false);

    const [displayPct, setDisplayPct] = useState(0);
    const [loadTick, setLoadTick] = useState(0);

    useEffect(() => {
        if (fullyReady) return;
        const id = window.setInterval(() => setLoadTick((n) => n + 1), 120);
        return () => window.clearInterval(id);
    }, [fullyReady]);

    const assetTargetPct = useMemo(() => {
        const raw = computeEnvexLoadPct(loading);
        const elapsed = performance.now() - mountTimeRef.current;
        const timeCap = (elapsed / (ENVEX_FILL_TO_100_SEC * 1000)) * 99;
        return Math.min(99, raw, timeCap);
    }, [loading, fullyReady, loadTick]);

    useEffect(() => {
        if (fullyReady) return;

        const bar = barFillRef.current;
        if (!bar) {
            setDisplayPct(assetTargetPct);
            return;
        }

        const proxy = { value: pctRef.current };
        gsap.killTweensOf(proxy);
        gsap.to(proxy, {
            value: assetTargetPct,
            duration: 0.22,
            ease: 'power2.out',
            onUpdate: () => {
                const next = Math.round(proxy.value);
                pctRef.current = next;
                setDisplayPct(next);
                bar.style.transform = `scaleX(${next / 100})`;
            },
        });
    }, [assetTargetPct, fullyReady]);

    useEffect(() => {
        if (!fullyReady || fillTo100StartedRef.current) return;
        fillTo100StartedRef.current = true;

        const bar = barFillRef.current;
        if (!bar) {
            pctRef.current = 100;
            setDisplayPct(100);
            return;
        }

        const proxy = { value: pctRef.current };
        gsap.killTweensOf(proxy);
        gsap.to(proxy, {
            value: 100,
            duration: ENVEX_FILL_TO_100_SEC,
            ease: 'power2.inOut',
            onUpdate: () => {
                const next = Math.round(proxy.value);
                pctRef.current = next;
                setDisplayPct(next);
                bar.style.transform = `scaleX(${next / 100})`;
            },
        });
    }, [fullyReady]);

    return { displayPct, barFillRef, fullyReady };
}
