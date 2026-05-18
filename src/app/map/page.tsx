'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CameraControls } from '@react-three/drei';
import type CameraControlsImpl from 'camera-controls';
import { ManciniCanvas } from '@/app/brochure/bdtec/mobile/ManciniCanvas';
import { MapModel } from '@/resources/model/MapModel';
import { MapBoothMarks } from '@/resources/model/MapBoothMarks';
import { SceneEnvironment } from '@/utils/three/SceneEnvironment';
import { Light_Environment } from '@/utils/three/Light_Environment';
import { SceneReadyGate } from '@/utils/three/SceneReadyGate';
import MapSceneLoader from '@/components/map/MapSceneLoader';
import MapCompanySearchModal from '@/components/map/MapCompanySearchModal';
import { MapClickCopyHandler } from '@/components/map/MapClickCopyHandler';
import {
    SceneLoadingProvider,
    useBdtecSceneLoadingActions,
} from '@/utils/three/SceneLoadingContext';
import PageWrapper from '@/utils/ui/PageWrapper';
import { usePageTransition } from '@/utils/ui/usePageTransition';
import CameraHelper from '@/utils/three/CamHelper';
import { applyMapCameraSnapshot } from '@/utils/map/applyMapCameraSnapshot';
import { getMapCameraSnapshot, resolveMapCameraPoint } from '@/utils/map/mapCameraPoints';
import { useMapEditTools } from '@/utils/map/useMapEditTools';
import styles from './page.module.css';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

function MapScene({
    deviceType,
    booth,
    mapEditTools,
    onCoordCopied,
    onMapNotReady,
}: {
    deviceType: DeviceType;
    booth: string;
    mapEditTools: boolean;
    onCoordCopied?: (text: string) => void;
    onMapNotReady?: () => void;
}) {
    const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
    const hasBoothCamera = booth.length > 0;

    useEffect(() => {
        const controls = cameraControlsRef.current;
        if (!controls || !hasBoothCamera) return;

        const snapshot = getMapCameraSnapshot(booth, deviceType);
        applyMapCameraSnapshot(controls, snapshot, true);
    }, [booth, deviceType, hasBoothCamera]);

    return (
        <>
            <CameraControls
                ref={cameraControlsRef}
                makeDefault
                smoothTime={0.45}
                draggingSmoothTime={0.12}
            />
            {mapEditTools ? (
                <CameraHelper
                    controlsRef={cameraControlsRef}
                    activePanelId={0}
                    deviceType={deviceType}
                    contextLabel={booth ? `booth ${booth}` : 'map'}
                />
            ) : null}
            <MapModel skipAutoFit={hasBoothCamera} />
            {mapEditTools ? (
                <MapClickCopyHandler
                    enabled
                    booth={booth}
                    onCopied={onCoordCopied}
                    onMapNotReady={onMapNotReady}
                />
            ) : null}
            <MapBoothMarks booth={booth} />
        </>
    );
}

function MapPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const navigate = usePageTransition();
    const { setModuleReady, reset } = useBdtecSceneLoadingActions();
    const booth = useMemo(() => searchParams.get('booth') ?? '', [searchParams]);
    const mapEditTools = useMapEditTools(booth, searchParams);
    const cameraPointLabel = useMemo(() => {
        if (!booth) return '';
        const point = resolveMapCameraPoint(booth);
        return point ? `${point.id} · ${point.label ?? booth}` : booth;
    }, [booth]);
    const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
    const [sceneRevealed, setSceneRevealed] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [copyToast, setCopyToast] = useState<string | null>(null);

    useEffect(() => {
        if (!copyToast) return;
        const timer = window.setTimeout(() => setCopyToast(null), 2800);
        return () => window.clearTimeout(timer);
    }, [copyToast]);

    const goToBooth = useCallback(
        (boothCode: string) => {
            const code = boothCode.trim();
            if (!code) return;
            router.replace(`/map?booth=${encodeURIComponent(code)}`);
        },
        [router],
    );

    useEffect(() => {
        reset();
        setModuleReady(true);
        return () => {
            setModuleReady(false);
            reset();
        };
    }, [reset, setModuleReady]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setDeviceType(width <= 768 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop');
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <MapSceneLoader booth={booth || undefined} onGone={() => setSceneRevealed(true)} />
            <PageWrapper type="blindsReverse">
                <main
                    className={`${styles.mapMain} ${sceneRevealed ? styles.mapMainVisible : styles.mapMainHidden}`}
                >
                    <div className={styles.topBar}>
                        <button
                            type="button"
                            className={styles.backBtn}
                            onClick={() => navigate('/', 'blinds')}
                        >
                            ← 브로슈어로
                        </button>
                        {deviceType === 'mobile' ? (
                            <button
                                type="button"
                                className={styles.findCompanyBtn}
                                onClick={() => setSearchOpen(true)}
                            >
                                기업찾기
                            </button>
                        ) : (
                            <span className={styles.topBarSpacer} aria-hidden />
                        )}
                        {booth ? <span className={styles.boothTag}>부스 {booth}</span> : null}
                        {mapEditTools ? (
                            <span className={styles.copyHint}>
                                {cameraPointLabel
                                    ? `${cameraPointLabel} · 맵 클릭 → markPosition 복사`
                                    : '맵 클릭 → 좌표 복사 · 좌측 카메라 헬퍼'}
                            </span>
                        ) : null}
                    </div>

                    <MapCompanySearchModal
                        open={searchOpen}
                        onClose={() => setSearchOpen(false)}
                        onSelectBooth={goToBooth}
                    />

                    {copyToast ? (
                        <div className={styles.copyToast} role="status">
                            복사됨: {copyToast}
                        </div>
                    ) : null}

                    <div className={styles.canvasLayer}>
                        <ManciniCanvas quality="default" backgroundColor="#b8dff5">
                            <Suspense fallback={null}>
                                <SceneEnvironment colorTop="#7ec8ef" colorBottom="#e8f6ff" />
                                <Light_Environment />
                                <MapScene
                                    deviceType={deviceType}
                                    booth={booth}
                                    mapEditTools={mapEditTools && sceneRevealed}
                                    onCoordCopied={setCopyToast}
                                    onMapNotReady={() =>
                                        setCopyToast('맵 로딩 중… 잠시 후 다시 클릭하세요')
                                    }
                                />

                                <SceneReadyGate />
                            </Suspense>
                        </ManciniCanvas>
                    </div>
                </main>
            </PageWrapper>
        </>
    );
}

export default function MapPage() {
    return (
        <SceneLoadingProvider>
            <Suspense fallback={null}>
                <MapPageContent />
            </Suspense>
        </SceneLoadingProvider>
    );
}
