'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { gsap } from '@/lib/brochureGsap';
import Overlay1 from '@/components/bdtec/overlay/OverLay1';
import {
    isBdtecSceneFullyReady,
    useBdtecSceneLoadingState,
} from '@/utils/three/SceneLoadingContext';
import styles from './BdtecEntryOverlay.module.css';

const HOLD_AT_100_MS = 500;
const INTRO_FADE_MS = 0.5;
/** 실제 로딩 완료 후 100%까지 채우는 시간 */
const FILL_TO_100_SEC = 2;
type Phase = 'loading' | 'intro' | 'exit' | 'gone';

type BdtecEntryOverlayProps = {
    blurContainerRef: RefObject<HTMLDivElement | null>;
    canvasHostRef: RefObject<HTMLDivElement | null>;
    brochureUiRef: RefObject<HTMLDivElement | null>;
    onReveal: () => void;
};

function computePct(loading: ReturnType<typeof useBdtecSceneLoadingState>, fullyReady: boolean) {
    const { moduleReady, canvasMounted, webgpuReady, suspenseReady, active, progress } = loading;
    const assetPct = Math.min(100, Math.max(0, Math.round(Number.isFinite(progress) ? progress : 0)));

    let floor = 0;
    if (moduleReady) floor = 12;
    if (canvasMounted) floor = Math.max(floor, 22);
    if (webgpuReady) floor = Math.max(floor, 35);
    if (suspenseReady) floor = Math.max(floor, 72);
    const blended = active ? Math.max(floor, assetPct * 0.85) : Math.max(floor, assetPct);
    return Math.min(99, Math.round(blended));
}

export default function BdtecEntryOverlay({
    blurContainerRef,
    canvasHostRef,
    brochureUiRef,
    onReveal,
}: BdtecEntryOverlayProps) {
    const loading = useBdtecSceneLoadingState();
    const fullyReady = isBdtecSceneFullyReady(loading);

    const shellRef = useRef<HTMLDivElement>(null);
    const loadingLayerRef = useRef<HTMLDivElement>(null);
    const introLayerRef = useRef<HTMLDivElement>(null);
    const overlayContentRef = useRef<HTMLDivElement>(null);
    const startBtnRef = useRef<HTMLButtonElement>(null);
    const barFillRef = useRef<HTMLDivElement>(null);
    const pctRef = useRef(0);
    const mountTimeRef = useRef(performance.now());
    const fillTo100StartedRef = useRef(false);
    const transitionedRef = useRef(false);
    const exitStartedRef = useRef(false);

    const [phase, setPhase] = useState<Phase>('loading');
    const [displayPct, setDisplayPct] = useState(0);
    const [loadTick, setLoadTick] = useState(0);

    useEffect(() => {
        if (fullyReady) return;
        const id = window.setInterval(() => setLoadTick((n) => n + 1), 120);
        return () => window.clearInterval(id);
    }, [fullyReady]);

    const assetTargetPct = useMemo(() => {
        const raw = computePct(loading, fullyReady);
        const elapsed = performance.now() - mountTimeRef.current;
        const timeCap = (elapsed / (FILL_TO_100_SEC * 1000)) * 99;
        return Math.min(99, raw, timeCap);
    }, [loading, fullyReady, loadTick]);

    const transitionToIntro = useCallback(() => {
        if (transitionedRef.current) return;
        transitionedRef.current = true;

        const loadingLayer = loadingLayerRef.current;
        const introLayer = introLayerRef.current;
        if (!loadingLayer || !introLayer) {
            setPhase('intro');
            return;
        }

        setPhase('intro');
        const tl = gsap.timeline();
        tl.to(loadingLayer, {
            opacity: 0,
            duration: INTRO_FADE_MS,
            ease: 'power2.inOut',
            onComplete: () => {
                loadingLayer.style.pointerEvents = 'none';
            },
        }).to(
            introLayer,
            {
                opacity: 1,
                duration: INTRO_FADE_MS,
                ease: 'power2.out',
                onStart: () => {
                    introLayer.style.pointerEvents = 'auto';
                },
            },
            '-=0.25',
        );
    }, []);

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
            duration: FILL_TO_100_SEC,
            ease: 'power2.inOut',
            onUpdate: () => {
                const next = Math.round(proxy.value);
                pctRef.current = next;
                setDisplayPct(next);
                bar.style.transform = `scaleX(${next / 100})`;
            },
        });
    }, [fullyReady]);

    useEffect(() => {
        if (!fullyReady || transitionedRef.current || displayPct < 100) return;
        const t = window.setTimeout(transitionToIntro, HOLD_AT_100_MS);
        return () => window.clearTimeout(t);
    }, [fullyReady, displayPct, transitionToIntro]);

    const handleStart = useCallback(() => {
        if (exitStartedRef.current) return;
        exitStartedRef.current = true;
        setPhase('exit');

        const shell = shellRef.current;
        const introLayer = introLayerRef.current;
        const overlayContent = overlayContentRef.current;
        const startBtn = startBtnRef.current;
        const canvas = canvasHostRef.current;
        const blur = blurContainerRef.current;
        const brochureUi = brochureUiRef.current;

        if (!shell) {
            onReveal();
            setPhase('gone');
            return;
        }

        if (introLayer) introLayer.style.pointerEvents = 'none';
        shell.style.pointerEvents = 'none';

        const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            onComplete: () => {
                shell.style.pointerEvents = 'none';
                shell.style.visibility = 'hidden';
                setPhase('gone');
            },
        });

        if (startBtn) {
            tl.to(startBtn, {
                scale: 0.88,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
            });
        }

        if (overlayContent) {
            tl.to(
                overlayContent,
                {
                    y: -32,
                    opacity: 0,
                    duration: 0.48,
                    ease: 'power2.in',
                },
                0,
            );
        }

        tl.add(() => {
            onReveal();
            if (canvas) {
                gsap.set(canvas, {
                    visibility: 'visible',
                    pointerEvents: 'auto',
                    transformOrigin: '50% 50%',
                });
            }
            if (blur) {
                gsap.set(blur, { clearProps: 'backgroundColor' });
            }
        }, 0.34);

        if (canvas) {
            gsap.set(canvas, { autoAlpha: 0, scale: 1.045 });
            tl.to(
                canvas,
                {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'power2.out',
                },
                0.34,
            );
        }

        if (brochureUi) {
            gsap.set(brochureUi, { autoAlpha: 0, y: 20 });
            tl.to(
                brochureUi,
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                },
                0.58,
            );
        }

        tl.to(
            shell,
            {
                autoAlpha: 0,
                scale: 1.015,
                duration: 0.8,
                ease: 'power3.inOut',
            },
            0.46,
        );
    }, [blurContainerRef, canvasHostRef, brochureUiRef, onReveal]);

    if (phase === 'gone') return null;

    return (
        <div
            ref={shellRef}
            className={styles.shell}
            aria-busy={phase === 'loading'}
            aria-label={phase === 'loading' ? '로딩 중' : '브로슈어 소개'}
        >
            <div ref={loadingLayerRef} className={styles.loadingLayer}>
                <Image
                    src="/model/bdtec/logo.svg"
                    alt="BDTEC"
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

            <div ref={introLayerRef} className={styles.introLayer}>
                <div ref={overlayContentRef} className={styles.overlaySafeZone}>
                    <Overlay1 />
                </div>
                <div className={styles.startBtnContainer}>
                    <button
                        ref={startBtnRef}
                        type="button"
                        className={styles.startBtn}
                        onClick={handleStart}
                    >
                        비디텍 브로슈어 시작하기
                    </button>
                </div>
            </div>
        </div>
    );
}
