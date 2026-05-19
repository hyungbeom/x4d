'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/brochureGsap';
import EnvexLoadingScreen from '@/components/envex/EnvexLoadingScreen';
import { useEnvexLoadingProgress } from '@/components/envex/useEnvexLoadingProgress';

const HOLD_AT_100_MS = 500;
const FORCE_DONE_MS = 18_000;
const EXIT_FADE_MS = 0.5;

type Phase = 'loading' | 'exit' | 'gone';

type MapSceneLoaderProps = {
    booth?: string;
    onGone?: () => void;
};

export default function MapSceneLoader({ onGone }: MapSceneLoaderProps) {
    const { displayPct, barFillRef } = useEnvexLoadingProgress();

    const layerRef = useRef<HTMLDivElement>(null);
    const [phase, setPhase] = useState<Phase>('loading');
    const doneRef = useRef(false);

    const runExit = useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;

        const layer = layerRef.current;
        if (!layer) {
            setPhase('gone');
            onGone?.();
            return;
        }

        setPhase('exit');
        gsap.to(layer, {
            opacity: 0,
            duration: EXIT_FADE_MS,
            ease: 'power2.inOut',
            onComplete: () => {
                layer.style.pointerEvents = 'none';
                layer.style.visibility = 'hidden';
                setPhase('gone');
                onGone?.();
            },
        });
    }, [onGone]);

    useEffect(() => {
        if (phase !== 'loading' || doneRef.current) return;
        if (displayPct < 100) return;
        const t = window.setTimeout(runExit, HOLD_AT_100_MS);
        return () => window.clearTimeout(t);
    }, [displayPct, phase, runExit]);

    useEffect(() => {
        if (phase !== 'loading' || doneRef.current) return;
        const t = window.setTimeout(() => {
            if (!doneRef.current) runExit();
        }, FORCE_DONE_MS);
        return () => window.clearTimeout(t);
    }, [phase, runExit]);

    useEffect(() => {
        if (phase === 'gone') {
            document.body.style.overflow = '';
            return;
        }
        document.body.style.overflow = 'hidden';
    }, [phase]);

    if (phase === 'gone') return null;

    return (
        <EnvexLoadingScreen
            ref={layerRef}
            barFillRef={barFillRef}
            displayPct={displayPct}
            fixed
        />
    );
}
