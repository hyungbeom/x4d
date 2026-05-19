'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from '@/lib/brochureGsap';
import styles from '@/components/bdtec/BdtecEntryOverlay.module.css';

const HOLD_AT_100_MS = 500;
const FADE_OUT_MS = 0.5;
const FILL_TO_100_SEC = 2;

type DuonEntryOverlayProps = {
    /** Spline 씬 로드 완료 */
    ready: boolean;
    onComplete: () => void;
};

export default function DuonEntryOverlay({ ready, onComplete }: DuonEntryOverlayProps) {
    const shellRef = useRef<HTMLDivElement>(null);
    const loadingLayerRef = useRef<HTMLDivElement>(null);
    const barFillRef = useRef<HTMLDivElement>(null);
    const pctRef = useRef(0);
    const mountTimeRef = useRef(performance.now());
    const fillTo100StartedRef = useRef(false);
    const exitedRef = useRef(false);

    const [displayPct, setDisplayPct] = useState(0);
    const [loadTick, setLoadTick] = useState(0);

    useEffect(() => {
        if (ready) return;
        const id = window.setInterval(() => setLoadTick((n) => n + 1), 120);
        return () => window.clearInterval(id);
    }, [ready]);

    const assetTargetPct = useMemo(() => {
        const elapsed = performance.now() - mountTimeRef.current;
        const timeCap = (elapsed / (FILL_TO_100_SEC * 1000)) * 99;
        const floor = ready ? 72 : Math.min(40, Math.round(timeCap * 0.45));
        return Math.min(99, Math.max(floor, ready ? timeCap : timeCap * 0.85));
    }, [ready, loadTick]);

    const exitOverlay = useCallback(() => {
        if (exitedRef.current) return;
        exitedRef.current = true;

        const shell = shellRef.current;
        const loadingLayer = loadingLayerRef.current;

        onComplete();

        if (!shell || !loadingLayer) return;

        gsap.to(loadingLayer, {
            opacity: 0,
            duration: FADE_OUT_MS,
            ease: 'power2.inOut',
            onComplete: () => {
                shell.style.visibility = 'hidden';
                shell.style.pointerEvents = 'none';
            },
        });
        gsap.to(shell, {
            autoAlpha: 0,
            duration: FADE_OUT_MS,
            ease: 'power2.inOut',
        });
    }, [onComplete]);

    useEffect(() => {
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
    }, [assetTargetPct]);

    useEffect(() => {
        if (!ready || fillTo100StartedRef.current) return;
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
            duration: FILL_TO_100_SEC,
            ease: 'power2.inOut',
            onUpdate: () => {
                const next = Math.round(proxy.value);
                pctRef.current = next;
                setDisplayPct(next);
                bar.style.transform = `scaleX(${next / 100})`;
            },
        });
    }, [ready]);

    useEffect(() => {
        if (!ready || exitedRef.current || displayPct < 100) return;
        const t = window.setTimeout(exitOverlay, HOLD_AT_100_MS);
        return () => window.clearTimeout(t);
    }, [ready, displayPct, exitOverlay]);

    return (
        <div
            ref={shellRef}
            className={styles.shell}
            style={{ position: 'fixed', inset: 0, zIndex: 2000 }}
            aria-busy={!ready || displayPct < 100}
            aria-label="로딩 중"
        >
            <div ref={loadingLayerRef} className={styles.loadingLayer}>
                <Image
                    src="/model/duon/logo.png"
                    alt="DUON"
                    width={240}
                    height={80}
                    priority
                    className={styles.logo}
                />
                <p className={styles.label}>MOBILE-BROCHURE</p>
                <div className={styles.progressBlock}>
                    <div className={styles.barTrack}>
                        <div ref={barFillRef} className={styles.barFill} />
                    </div>
                    <p className={styles.pct}>{displayPct}%</p>
                </div>
            </div>
        </div>
    );
}
