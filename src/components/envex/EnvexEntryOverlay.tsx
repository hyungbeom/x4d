'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '@/lib/brochureGsap';
import { ENVEX_BROCHURE_PARTNERS } from '@/data/envexBrochurePartners';
import { usePageTransition } from '@/utils/ui/usePageTransition';
import styles from './EnvexEntryOverlay.module.css';
import EnvexLoadingScreen from './EnvexLoadingScreen';
import { useEnvexLoadingProgress } from './useEnvexLoadingProgress';

/** 로딩 100% 도달 후 intro 전환까지 대기 (ms) */
const HOLD_AT_100_MS = 2000;
const INTRO_FADE_MS = 0.5;
type Phase = 'loading' | 'intro' | 'exit' | 'gone';

type EnvexEntryOverlayProps = {
    viewportRef: RefObject<HTMLDivElement | null>;
    onReveal: () => void;
};

export default function EnvexEntryOverlay({ viewportRef, onReveal }: EnvexEntryOverlayProps) {
    const { displayPct, barFillRef } = useEnvexLoadingProgress();
    const navigate = usePageTransition();

    const shellRef = useRef<HTMLDivElement>(null);
    const loadingLayerRef = useRef<HTMLDivElement>(null);
    const introLayerRef = useRef<HTMLDivElement>(null);
    const introContentRef = useRef<HTMLDivElement>(null);
    const startBtnRef = useRef<HTMLButtonElement>(null);
    const transitionedRef = useRef(false);
    const exitStartedRef = useRef(false);

    const [phase, setPhase] = useState<Phase>('loading');
    const [portalReady, setPortalReady] = useState(false);

    useEffect(() => {
        setPortalReady(true);
        const viewport = viewportRef.current;
        if (viewport) {
            gsap.set(viewport, { clearProps: 'opacity,visibility,transform' });
        }
    }, [viewportRef]);

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
        viewportRef.current?.setAttribute('data-scene-blur', '');

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
    }, [viewportRef]);

    useEffect(() => {
        if (transitionedRef.current || displayPct < 100) return;
        const t = window.setTimeout(transitionToIntro, HOLD_AT_100_MS);
        return () => window.clearTimeout(t);
    }, [displayPct, transitionToIntro]);

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

        const canvasLayer = viewport?.querySelector('[data-scene-canvas]') as HTMLElement | null;

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

        if (canvasLayer) {
            tl.to(
                canvasLayer,
                {
                    filter: 'blur(0px)',
                    duration: 0.55,
                    ease: 'power2.inOut',
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

        tl.add(() => {
            viewport?.removeAttribute('data-scene-blur');
            if (canvasLayer) gsap.set(canvasLayer, { clearProps: 'filter' });
        });

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
            <EnvexLoadingScreen
                ref={loadingLayerRef}
                barFillRef={barFillRef}
                displayPct={displayPct}
                className={styles.loadingLayer}
            />

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
                            제47회 <br/>
                            국제환경산업기술
                            <br/>
                            &그린에너지전
                        </h1>
                        <p className={styles.introDesc}>
                            국내 최대 탈탄소 산업기술 전시회,<br/>
                            녹색산업을 선도할 최신 트렌드와 미래를 한눈에 <br/>확인해 보세요.
                        </p>
                    </div>

                    <ul className={styles.brochurePartners} aria-label="참가사 브로슈어">
                        {ENVEX_BROCHURE_PARTNERS.map((partner) => (
                            <li key={partner.id} className={styles.partnerCard}>
                                <div className={styles.partnerLogoWrap}>
                                    {partner.logoSrc ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={partner.logoSrc}
                                            alt={partner.logoAlt}
                                            className={styles.partnerLogo}
                                        />
                                    ) : (
                                        <span className={styles.partnerLogoFallback}>{partner.name}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className={styles.partnerVisitBtn}
                                    onClick={() => navigate(partner.href, 'blinds')}
                                >
                                    방문하기
                                </button>
                            </li>
                        ))}
                    </ul>

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
