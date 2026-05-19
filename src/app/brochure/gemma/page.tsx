'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';
import GemmaEntryOverlay from '@/components/gemma/GemmaEntryOverlay';
import GemmaSpecModal, { type GemmaSpecModalHandle } from '@/components/gemma/GemmaSpecModal';
import Overlay1 from '@/components/gemma/overlay/OverLay1';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const SPLINE_SCENE = 'https://prod.spline.design/Lq50G9LvPmfDWegT/scene.splinecode';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <div className={styles.splineLoading} aria-hidden />,
});

function SplineLoading() {
    return <div className={styles.splineLoading} aria-hidden />;
}

export default function GemmaBrochurePage() {
    const hostRef = useRef<HTMLElement>(null);
    const specModalRef = useRef<GemmaSpecModalHandle>(null);
    const productDetailRef = useRef<HTMLButtonElement>(null);
    const [hostReady, setHostReady] = useState(false);
    const [splineReady, setSplineReady] = useState(false);
    const [entryDone, setEntryDone] = useState(false);

    useEffect(() => {
        const el = hostRef.current;
        if (!el) return;

        const update = () => {
            const { width, height } = el.getBoundingClientRect();
            if (width > 0 && height > 0) {
                setHostReady(true);
            }
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const onSplineLoad = useCallback((app: Application) => {
        setSplineReady(true);

        requestAnimationFrame(() => {
            const canvas = hostRef.current?.querySelector('canvas');
            if (canvas instanceof HTMLElement) {
                canvas.style.pointerEvents = 'none';
                canvas.style.touchAction = 'pan-y';
            }
        });

        try {
            app.setSize(
                hostRef.current?.clientWidth ?? window.innerWidth,
                hostRef.current?.clientHeight ?? window.innerHeight,
            );
        } catch {
            // 씬 내부 일부 액션/오디오 참조 오류는 런타임에서 무시 가능
        }
    }, []);

    return (
        <div className={styles.pageRoot}>
            {!entryDone ? (
                <GemmaEntryOverlay ready={splineReady} onComplete={() => setEntryDone(true)} />
            ) : null}

            <div className={styles.brochureUi} aria-hidden={!entryDone}>
                <GemmaSpecModal ref={specModalRef} visible={entryDone} />
            </div>

            <Overlay1
                showProductDetail={entryDone}
                productDetailRef={productDetailRef}
                onProductDetailClick={() =>
                    specModalRef.current?.openWithTrigger(productDetailRef.current)
                }
            />
            <main ref={hostRef} className={`${styles.splineHost} gemma-spline-host`}>
                {hostReady ? (
                    <Spline
                        scene={SPLINE_SCENE}
                        onLoad={onSplineLoad}
                        renderOnDemand
                        style={{ width: '100%', height: '100%' }}
                    />
                ) : (
                    <SplineLoading />
                )}
            </main>
        </div>
    );
}
