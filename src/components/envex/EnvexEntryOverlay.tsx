'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '@/lib/brochureGsap';
import {
    isBdtecSceneFullyReady,
    useBdtecSceneLoadingState,
} from '@/utils/three/SceneLoadingContext';
import styles from './EnvexEntryOverlay.module.css';

/** 로딩 100% 도달 후 intro 전환까지 대기 (ms) */
const HOLD_AT_100_MS = 2000;
const INTRO_FADE_MS = 0.5;
const FILL_TO_100_SEC = 2;
type Phase = 'loading' | 'intro' | 'exit' | 'gone';

type EnvexEntryOverlayProps = {
    viewportRef: RefObject<HTMLDivElement | null>;
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

export default function EnvexEntryOverlay({ viewportRef, onReveal }: EnvexEntryOverlayProps) {
    const loading = useBdtecSceneLoadingState();
    const fullyReady = isBdtecSceneFullyReady(loading);

    const shellRef = useRef<HTMLDivElement>(null);
    const loadingLayerRef = useRef<HTMLDivElement>(null);
    const introLayerRef = useRef<HTMLDivElement>(null);
    const introContentRef = useRef<HTMLDivElement>(null);
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
    const [portalReady, setPortalReady] = useState(false);

    useEffect(() => {
        setPortalReady(true);
        const viewport = viewportRef.current;
        if (viewport) {
            gsap.set(viewport, { clearProps: 'opacity,visibility,transform' });
        }
    }, [viewportRef]);

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
                    if (shellRef.current) shellRef.current.style.pointerEvents = 'auto';
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
        const introContent = introContentRef.current;
        const startBtn = startBtnRef.current;
        const viewport = viewportRef.current;

        if (!shell) {
            onReveal();
            setPhase('gone');
            return;
        }

        if (introLayer) introLayer.style.pointerEvents = 'none';
        shell.style.pointerEvents = 'auto';

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

        if (introContent) {
            tl.to(
                introContent,
                {
                    y: -24,
                    opacity: 0,
                    duration: 0.48,
                    ease: 'power2.in',
                },
                0,
            );
        }

        tl.add(() => onReveal(), 0);

        tl.to(
            shell,
            {
                autoAlpha: 0,
                duration: 0.65,
                ease: 'power3.inOut',
            },
            0.1,
        );

        if (viewport) {
            gsap.set(viewport, { clearProps: 'opacity,visibility,transform' });
        }
    }, [viewportRef, onReveal]);

    if (phase === 'gone' || !portalReady) return null;

    return createPortal(
        <div
            ref={shellRef}
            className={styles.shell}
            aria-busy={phase === 'loading'}
            aria-label={phase === 'loading' ? '로딩 중' : 'ENVEX 소개'}
        >
            <div ref={loadingLayerRef} className={styles.loadingLayer}>
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

            <div ref={introLayerRef} className={styles.introLayer}>
                <div className={styles.introScrim} aria-hidden />
                <div ref={introContentRef} className={styles.introContent}>
                    <header className={styles.introTopBar}>
                        <div className={styles.introBrand}>
                            <Image
                                src="/logo.svg"
                                alt="ENVEX Environmental Exhibition"
                                width={200}
                                height={44}
                                priority
                                className={styles.introLogo}
                            />
                        </div>
                        <button
                            type="button"
                            className={styles.soundBtn}
                            aria-label="사운드 설정"
                        >
                            <svg
                                className={styles.soundIcon}
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden
                            >
                                <path
                                    d="M11 5L6 9H3v6h3l5 4V5z"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M15.5 8.5a4.5 4.5 0 010 7"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M18 6a8 8 0 010 12"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </header>

                    <div className={styles.introCopy}>
                        <h1 className={styles.introHeading}>
                            제46회 <br/>
                            국제환경산업기술
                            <br/>
                            &그린에너지전
                        </h1>
                        <p className={styles.introDesc}>
                            국내 최대 환경·탄소중립기술 전시회,<br/>
                            산업을 선도할 최신 트렌드와 미래를 한눈에 <br/>확인해 보세요.
                        </p>
                    </div>

                    <div className={styles.startBtnContainer}>
                        <button
                            ref={startBtnRef}
                            type="button"
                            className={styles.startBtn}
                            onClick={handleStart}
                        >
                            <span className={styles.startBtnLabel}>Explore the 2026 Envex</span>
                            <span className={styles.startBtnChevron} aria-hidden="true">
                                &gt;
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
