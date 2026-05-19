'use client';

import React, { useEffect, useRef, useState } from 'react';
import DuonEntryOverlay from '@/components/duon/DuonEntryOverlay';
import DuonPaintSection from '@/components/duon/DuonPaintSection';
import ScrollIndicator from '@/utils/ui/ScrollIndicator';
import Overlay1 from '@/components/duon/overlay/OverLay1';
import { DUON_PHASE1_COPY } from './copyContent';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => (
        <div
            style={{
                height: '100dvh',
                width: '100dvw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {DUON_PHASE1_COPY.loading}
        </div>
    ),
});

export default function Home() {
    const [splineReady, setSplineReady] = useState(false);
    const [entryDone, setEntryDone] = useState(false);

    const splineAppRef = useRef<any>(null);
    const paintObjRef = useRef<any>(null);
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const paintSectionRef = useRef<HTMLElement>(null);
    const phase1CopyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });

        const onRefresh = () => ScrollTrigger.refresh();
        window.addEventListener('orientationchange', onRefresh);
        window.visualViewport?.addEventListener('resize', onRefresh);

        return () => {
            window.removeEventListener('orientationchange', onRefresh);
            window.visualViewport?.removeEventListener('resize', onRefresh);
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    useEffect(() => {
        if (!entryDone) return;
        window.scrollTo(0, 0);
    }, [entryDone]);

    useEffect(() => {
        if (!entryDone || !splineAppRef.current || !paintObjRef.current || !mainContainerRef.current) {
            return;
        }

        const app = splineAppRef.current;
        const obj = paintObjRef.current;
        const camera = app.findObjectByName('Camera');

        const copyTop = phase1CopyRef.current?.querySelector('[data-copy="top"]');
        const copyBottom = phase1CopyRef.current?.querySelector('[data-copy="bottom"]');

        const heroState = {
            rotX: obj.rotation.x,
            posY: obj.position.y,
            posZ: obj.position.z,
            scaleX: obj.scale.x,
            scaleY: obj.scale.y,
            scaleZ: obj.scale.z,
            camZ: camera?.position.z ?? 0,
        };

        gsap.set(obj.scale, { x: heroState.scaleX, y: heroState.scaleY, z: heroState.scaleZ });
        gsap.set([copyTop, copyBottom], { opacity: 0 });

        if (app.setVariable) {
            app.setVariable('junkOpacity', 100);
        }

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const holdEnd = 0.18;
        const animEnd = 0.52;
        const animDur = animEnd - holdEnd;
        const targetRotX = (178.7 - 360) * (Math.PI / 180);
        const targetPos = { y: -38.3, z: 1866 };
        const camDelta = isMobile ? -1200 : -3000;
        const scalePeak = isMobile ? 1.35 : 1;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: mainContainerRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                invalidateOnRefresh: true,
            },
        });

        tl.to('.scroll-indicator-wrapper', { opacity: 0, pointerEvents: 'none', ease: 'none' }, holdEnd);

        tl.to(
            '.fade-out-target',
            { opacity: 0, filter: 'blur(15px)', y: -30, ease: 'power2.inOut', immediateRender: false },
            holdEnd,
        );

        tl.to(
            '.overlay-logo',
            {
                top: '20px',
                left: '20px',
                width: '120px',
                xPercent: 0,
                transform: 'none',
                ease: 'power2.inOut',
                immediateRender: false,
            },
            holdEnd,
        );

        tl.fromTo(
            obj.rotation,
            { x: heroState.rotX },
            { x: targetRotX, ease: 'none', duration: animDur, immediateRender: false },
            holdEnd,
        );

        tl.fromTo(
            obj.position,
            { y: heroState.posY, z: heroState.posZ },
            { ...targetPos, ease: 'none', duration: animDur, immediateRender: false },
            holdEnd,
        );

        if (isMobile) {
            tl.fromTo(
                obj.scale,
                { x: heroState.scaleX, y: heroState.scaleY, z: heroState.scaleZ },
                {
                    x: heroState.scaleX * scalePeak,
                    y: heroState.scaleY * scalePeak,
                    z: heroState.scaleZ * scalePeak,
                    ease: 'none',
                    duration: animDur,
                    immediateRender: false,
                },
                holdEnd,
            );
        }

        if (camera) {
            tl.fromTo(
                camera.position,
                { z: heroState.camZ },
                { z: heroState.camZ + camDelta, ease: 'none', duration: animDur, immediateRender: false },
                holdEnd,
            );
        }

        const fadeProxy = { val: 100 };
        tl.to(
            fadeProxy,
            {
                val: 0,
                ease: 'none',
                duration: animDur,
                immediateRender: false,
                onUpdate: () => {
                    if (app.setVariable) {
                        app.setVariable('junkOpacity', fadeProxy.val);
                    }
                },
            },
            holdEnd,
        );

        tl.addLabel('boxAnimDone', animEnd);

        tl.fromTo(
            copyTop,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out', immediateRender: false },
            'boxAnimDone',
        );

        tl.fromTo(
            copyBottom,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out', immediateRender: false },
            'boxAnimDone+=0.06',
        );

        tl.to(
            [copyTop, copyBottom],
            { opacity: 0, y: -24, duration: 0.08, ease: 'power2.inOut', immediateRender: false },
            0.9,
        );

        tl.to(
            '.duon-spline-host',
            { opacity: 0, duration: 0.1, ease: 'power2.inOut', immediateRender: false },
            0.92,
        );

        tl.progress(0);
        ScrollTrigger.refresh();

        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
        };
    }, [entryDone]);

    useEffect(() => {
        if (!entryDone || !paintSectionRef.current) return;

        const ctx = gsap.context(() => {
            gsap.set('.paint-anim', { opacity: 0, y: 28 });
            gsap.to('.paint-anim', {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: paintSectionRef.current,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse',
                },
            });
        }, paintSectionRef);

        return () => ctx.revert();
    }, [entryDone]);

    const onLoad = (app: any) => {
        setSplineReady(true);
        splineAppRef.current = app;

        const obj = app.findObjectByName('main_paint');
        if (!obj) {
            console.warn('main_paint\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.');
            return;
        }

        paintObjRef.current = obj;

        if (app.setVariable) {
            app.setVariable('junkOpacity', 100);
        }

        requestAnimationFrame(() => {
            const canvas = document.querySelector('.duon-spline-host canvas');
            if (canvas instanceof HTMLElement) {
                canvas.style.pointerEvents = 'none';
                canvas.style.touchAction = 'pan-y';
            }
        });
    };

    return (
        <>
            {!entryDone ? (
                <DuonEntryOverlay ready={splineReady} onComplete={() => setEntryDone(true)} />
            ) : null}

            <Overlay1 />
            <div className="scroll-indicator-wrapper">
                <ScrollIndicator />
            </div>

            <main className={styles.pageRoot}>
                <div ref={mainContainerRef} className={styles.scrollMain}>
                    <div className={styles.stickyStage}>
                        <div className={`${styles.splineHost} duon-spline-host`}>
                            <Spline
                                scene="https://prod.spline.design/nTfQzR2xEoTXa0sT/scene.splinecode"
                                onLoad={onLoad}
                            />
                        </div>

                        <div ref={phase1CopyRef} className={styles.phase1Copy}>
                            <div data-copy="top" className={`${styles.copyPanel} ${styles.copyTop}`}>
                                <h1 className={styles.copyTitle}>{DUON_PHASE1_COPY.title}</h1>
                                <p className={styles.copyBody}>{DUON_PHASE1_COPY.body}</p>
                            </div>

                            <div data-copy="bottom" className={`${styles.copyPanel} ${styles.copyBottom}`}>
                                <h2 className={styles.copyTitle}>{DUON_PHASE1_COPY.featuresTitle}</h2>
                                <ul className={styles.featureList}>
                                    {DUON_PHASE1_COPY.features.map((line) => (
                                        <li key={line}>{line}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <section ref={paintSectionRef} className={styles.paintSectionWrap}>
                    <DuonPaintSection />
                </section>
            </main>
        </>
    );
}
