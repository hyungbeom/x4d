'use client';

import React, { useEffect, useRef, useState } from 'react';
import DuonEntryOverlay from '@/components/duon/DuonEntryOverlay';
import DuonHousingBenefits from '@/components/duon/DuonHousingBenefits';
import ScrollIndicator from '@/utils/ui/ScrollIndicator';
import Overlay1 from '@/components/duon/overlay/OverLay1';
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
            3D 로딩 중...
        </div>
    ),
});

const DuonApartmentScene = dynamic(() => import('@/components/duon/DuonApartmentScene'), {
    ssr: false,
    loading: () => <div className={styles.apartmentCanvasWrap} />,
});

export default function Home() {
    const [splineReady, setSplineReady] = useState(false);
    const [entryDone, setEntryDone] = useState(false);

    const splineApp = useRef(null);
    const paintCaseRef = useRef(null);
    const mainContainerRef = useRef<HTMLElement>(null);
    const textTlRef = useRef<HTMLDivElement>(null);
    const textBrRef = useRef<HTMLDivElement>(null);
    const apartmentSectionRef = useRef<HTMLElement>(null);
    const apartmentCanvasRef = useRef<HTMLDivElement>(null);
    const benefitsSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    useEffect(() => {
        if (!entryDone) return;

        const apartmentEl = apartmentCanvasRef.current;
        const benefitsEl = benefitsSectionRef.current;
        if (!apartmentEl || !benefitsEl) return;

        gsap.set('.benefit-card', { opacity: 0, y: 48 });
        gsap.set('.benefits-header-anim', { opacity: 0, y: 32 });

        const apartmentTween = gsap.fromTo(
            apartmentEl,
            { opacity: 0, y: 60, scale: 0.92 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: apartmentSectionRef.current,
                    start: 'top 82%',
                    toggleActions: 'play none none reverse',
                },
            },
        );

        const headerTween = gsap.to('.benefits-header-anim', {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: benefitsEl,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
            },
        });

        const benefitsTween = gsap.to('.benefit-card', {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: benefitsEl,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
            },
        });

        return () => {
            apartmentTween.scrollTrigger?.kill();
            apartmentTween.kill();
            headerTween.scrollTrigger?.kill();
            headerTween.kill();
            benefitsTween.scrollTrigger?.kill();
            benefitsTween.kill();
        };
    }, [entryDone]);

    const onLoad = (app: any) => {
        setSplineReady(true);
        splineApp.current = app;

        const obj = app.findObjectByName('main_paint');
        const camera = app.findObjectByName('Camera');

        if (!obj) {
            console.warn('main_paint\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.');
            return;
        }

        paintCaseRef.current = obj;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: mainContainerRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
            },
        });

        tl.to('.scroll-indicator-wrapper', { opacity: 0, pointerEvents: 'none', ease: 'none' }, 0);

        tl.to(
            '.fade-out-target',
            { opacity: 0, filter: 'blur(15px)', y: -30, ease: 'power2.inOut' },
            0,
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
            },
            0,
        );

        tl.to(obj.rotation, { x: (178.7 - 360) * (Math.PI / 180), ease: 'none' }, 0);
        tl.to(obj.position, { y: -38.3, z: 1866, ease: 'none' }, 0);
        if (camera) {
            tl.to(camera.position, { z: camera.position.z - 3000, ease: 'none' }, 0);
        }

        const fadeProxy = { val: 100 };
        tl.to(fadeProxy, {
            val: 0,
            ease: 'none',
            onUpdate: () => {
                if (app.setVariable) {
                    app.setVariable('junkOpacity', fadeProxy.val);
                }
            },
        }, 0);

        gsap.set([textTlRef.current, textBrRef.current], { opacity: 0 });

        tl.addLabel('boxAnimDone');

        tl.fromTo(
            textTlRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
            'boxAnimDone+=0.5',
        );

        tl.fromTo(
            textBrRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
            '+=0.2',
        );

        tl.to(
            [textTlRef.current, textBrRef.current],
            { opacity: 0, y: -30, duration: 1, ease: 'power2.inOut' },
            '+=0.5',
        );

        tl.to(
            obj.scale,
            { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.inOut' },
            '-=0.5',
        );
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

            <main>
                <div ref={mainContainerRef} className={styles.scrollMain}>
                    <div className={styles.stickyStage}>
                        <div className={styles.splineHost}>
                            <Spline
                                scene="https://prod.spline.design/nTfQzR2xEoTXa0sT/scene.splinecode"
                                onLoad={onLoad}
                            />
                        </div>

                        <div ref={textTlRef} className={`${styles.copyPanel} ${styles.copyTop}`}>
                            <h1 className={styles.copyTitle}>에코그린코트는?</h1>
                            <p className={styles.copyBody}>
                                에코그린코트는 외벽, 옥상 방수, 바닥 등 어디에나 사용할 수 있도록 다양한 제품군을
                                가지고 있습니다. 외벽에서 차열 성능이 필요한 곳은 W, 차열 및 옥상 방수가 필요한 곳은 R,
                                바닥 차열 성능이 필요한 곳은 L. 실내외 선택에 따라 외부 차열, 실내 단열 + 광촉매
                                기능이 있는 P 등 차열페인트 브랜드 중 유일하게 다양한 제품을 보유하고 있어 필요한 곳에
                                맞는 제품을 선택하여 사용할 수 있습니다.
                            </p>
                        </div>

                        <div ref={textBrRef} className={`${styles.copyPanel} ${styles.copyBottom}`}>
                            <h2 className={styles.copyTitle}>에코그린코트 특징</h2>
                            <ul className={styles.featureList}>
                                <li>친환경 수용성 차열페인트로 차열성능 발휘</li>
                                <li>에너지 냉방 23% 이상 절감</li>
                                <li>어드그린코트는 가시광선과 적외선을 모두 반사 혹은 산란하는 제품으로 더 높은 차열 효과가 있음</li>
                                <li>뛰어난 열차단 성능과 노후방지기능으로 도막의 내구성을 향상시켜줍</li>
                                <li>차열페인트중 세계 최다 다양한 색상이 있어 원하는 색상으로 시공 가능</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <section ref={apartmentSectionRef} className={styles.apartmentSection} aria-label="공동주택 모델">
                    <div ref={apartmentCanvasRef} className={styles.apartmentCanvasWrap}>
                        <DuonApartmentScene />
                    </div>
                </section>

                <div ref={benefitsSectionRef}>
                    <DuonHousingBenefits />
                </div>
            </main>
        </>
    );
}
