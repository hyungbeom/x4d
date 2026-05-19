'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';
import GemmaEntryOverlay from '@/components/gemma/GemmaEntryOverlay';
import GemmaSpecModal, { type GemmaSpecModalHandle } from '@/components/gemma/GemmaSpecModal';
import {
    animateGemmaProductDetailView,
    type DeviceType,
} from '@/components/gemma/gemmaSplineViews';
import Overlay1 from '@/components/gemma/overlay/OverLay1';
import NavBar from '@/utils/ui/NavBar';
import ScrollIndicator from '@/utils/ui/ScrollIndicator';
import { gsap, ScrollTrigger } from '@/lib/brochureGsap';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const SPLINE_SCENE = 'https://prod.spline.design/Lq50G9LvPmfDWegT/scene.splinecode';
const WATER_PRODUCT_NAME = 'Water_Product';
const GEMMA_LOGO = '/model/gemma/gemma_logo.png';

type SplineObject = {
    rotation: { x: number; y: number; z: number };
    position: { x: number; y: number; z: number };
    lookAt?: (x: number, y: number, z: number) => void;
};

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <div className={styles.splineLoading} aria-hidden />,
});

function SplineLoading() {
    return <div className={styles.splineLoading} aria-hidden />;
}

function computeFrontRotation(
    obj: SplineObject,
    camera: { position: { x: number; y: number; z: number } } | null,
    fallback: { x: number; y: number; z: number },
) {
    if (!camera?.position || typeof obj.lookAt !== 'function') {
        return {
            x: fallback.x,
            y: fallback.y + Math.PI * 0.5,
            z: fallback.z,
        };
    }

    const saved = { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z };
    obj.lookAt(camera.position.x, camera.position.y, camera.position.z);
    const target = { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z };
    obj.rotation.x = saved.x;
    obj.rotation.y = saved.y;
    obj.rotation.z = saved.z;
    return target;
}

export default function GemmaBrochurePage() {
    const scrollMainRef = useRef<HTMLDivElement>(null);
    const splineHostRef = useRef<HTMLDivElement>(null);
    const specModalRef = useRef<GemmaSpecModalHandle>(null);
    const productDetailRef = useRef<HTMLButtonElement>(null);
    const splineAppRef = useRef<Application | null>(null);
    const waterProductRef = useRef<SplineObject | null>(null);

    const [splineReady, setSplineReady] = useState(false);
    const [entryDone, setEntryDone] = useState(false);
    const [detailViewActive, setDetailViewActive] = useState(false);
    const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
    const loadGenerationRef = useRef(0);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setDeviceType(width <= 768 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop');
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
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
        if (
            !entryDone ||
            !splineAppRef.current ||
            !waterProductRef.current ||
            !scrollMainRef.current
        ) {
            return;
        }

        const app = splineAppRef.current;
        const obj = waterProductRef.current;
        const camera = app.findObjectByName('Camera') as
            | { position: { x: number; y: number; z: number } }
            | null;

        const heroState = {
            rotX: obj.rotation.x,
            rotY: obj.rotation.y,
            rotZ: obj.rotation.z,
            posY: obj.position.y,
            posZ: obj.position.z,
            camZ: camera?.position.z ?? 0,
        };

        const targetRot = computeFrontRotation(obj, camera, {
            x: heroState.rotX,
            y: heroState.rotY,
            z: heroState.rotZ,
        });

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const holdEnd = 0.12;
        const animEnd = 0.58;
        const animDur = animEnd - holdEnd;
        const camDelta = isMobile ? -900 : -1800;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: scrollMainRef.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                invalidateOnRefresh: true,
            },
        });

        tl.to('.scroll-indicator-wrapper', { opacity: 0, pointerEvents: 'none', ease: 'none' }, holdEnd);

        tl.fromTo(
            obj.rotation,
            { x: heroState.rotX, y: heroState.rotY, z: heroState.rotZ },
            { x: targetRot.x, y: targetRot.y, z: targetRot.z, ease: 'none', duration: animDur },
            holdEnd,
        );

        if (camera) {
            tl.fromTo(
                camera.position,
                { z: heroState.camZ },
                { z: heroState.camZ + camDelta, ease: 'none', duration: animDur },
                holdEnd,
            );
        }

        tl.fromTo(
            obj.position,
            { y: heroState.posY, z: heroState.posZ },
            {
                y: heroState.posY + (isMobile ? 40 : 80),
                z: heroState.posZ + (isMobile ? 120 : 280),
                ease: 'none',
                duration: animDur,
            },
            holdEnd,
        );

        tl.progress(0);
        ScrollTrigger.refresh();

        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
        };
    }, [entryDone]);

    const handleProductDetailClick = useCallback(() => {
        const app = splineAppRef.current;
        if (app) {
            animateGemmaProductDetailView(app, deviceType);
        }
        setDetailViewActive(true);
    }, [deviceType]);

    const handleExitDetailView = useCallback(() => {
        setDetailViewActive(false);
    }, []);

    const onSplineLoad = useCallback((app: Application) => {
        const generation = ++loadGenerationRef.current;
        splineAppRef.current = app;

        requestAnimationFrame(() => {
            if (generation !== loadGenerationRef.current) return;

            const host = splineHostRef.current;
            const { width, height } = host?.getBoundingClientRect() ?? { width: 0, height: 0 };
            if (width > 0 && height > 0) {
                try {
                    app.setSize(width, height);
                } catch {
                    // ParentSize가 크기를 관리할 때는 무시
                }
            }

            const obj = app.findObjectByName(WATER_PRODUCT_NAME) as SplineObject | null;
            if (!obj) {
                console.warn(`[gemma] Spline object "${WATER_PRODUCT_NAME}" not found.`);
            } else {
                waterProductRef.current = obj;
            }

            setSplineReady(true);
        });
    }, []);

    useEffect(() => {
        return () => {
            loadGenerationRef.current += 1;
            splineAppRef.current = null;
            waterProductRef.current = null;
        };
    }, []);

    return (
        <div className={styles.pageRoot}>
            {!entryDone ? (
                <GemmaEntryOverlay ready={splineReady} onComplete={() => setEntryDone(true)} />
            ) : null}

            <div className={styles.brochureUi} aria-hidden={!entryDone}>
                <GemmaSpecModal ref={specModalRef} visible={entryDone && !detailViewActive} />
                {entryDone && detailViewActive ? (
                    <NavBar
                        logoSrc={GEMMA_LOGO}
                        menus={[]}
                        contactLink="/brochure/gemma/contactus"
                        hideBottomNav
                        showAiAsk
                        aiCompanyId="gemma"
                        onLogoClick={handleExitDetailView}
                    />
                ) : null}
            </div>

            <Overlay1
                showProductDetail={entryDone && !detailViewActive}
                hidden={detailViewActive}
                productDetailRef={productDetailRef}
                onProductDetailClick={handleProductDetailClick}
            />

            {entryDone && !detailViewActive ? (
                <div className="scroll-indicator-wrapper">
                    <ScrollIndicator color="white" />
                </div>
            ) : null}

            <main>
                <div ref={scrollMainRef} className={styles.scrollMain}>
                    <div className={styles.stickyStage}>
                        <div
                            ref={splineHostRef}
                            className={`${styles.splineHost} gemma-spline-host`}
                        >
                            <Spline
                                scene={SPLINE_SCENE}
                                onLoad={onSplineLoad}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
