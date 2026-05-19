'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { useBdtecSceneLoadingActions } from '@/utils/three/SceneLoadingContext';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';
import { BdtecSceneFade } from '@/app/brochure/bdtec/mobile/BdtecSceneFade';
import { BdtecSceneLoadGate } from '@/utils/three/BdtecSceneLoadGate';
import { BdtecAssetRegistry } from '@/app/brochure/bdtec/mobile/BdtecAssetRegistry';
import { BdtecLightEnvironment } from '@/utils/three/BdtecLightEnvironment';
import type CameraControlsImpl from 'camera-controls';
import { ManciniCanvas } from '@/app/brochure/bdtec/mobile/ManciniCanvas';
import BdtecSceneModels from '@/app/brochure/bdtec/mobile/BdtecSceneModels';
import CameraHelper from '@/utils/three/CamHelper';
import { Tank2Grid } from '@/resources/model/bdtect/Tank2Grid';

type CameraSnapshot = { c: [number, number, number]; t: [number, number, number]; z: number };
type DeviceType = 'desktop' | 'tablet' | 'mobile';

const BDI_100_TARGET: [number, number, number] = [-40, 215, 45];
const CAMERA_TRANSITION_SMOOTH_TIME = 0.55;

/** 흰 화면 + Tank2 그리드 카메라 (기기별) */
const TANK_GRID_CAMERA: Record<DeviceType, CameraSnapshot> = {
    desktop: { c: [-363.8, 159.0, 129.9], t: [-420.0, 0.0, -20.0], z: 4.17 },
    tablet: { c: [-561.9, 136.2, 198.2], t: [-415.5, 0.8, -0.7], z: 7.2 },
    mobile: { c: [-173.7, 423.3, 329.4], t: [-26.7, 222.8, 46.9], z: 6.14 },
};

/** NEXT 흰 화면 — Tank2 그리드 중심 (패널별 카메라 lookAt) */
const PANEL_LOOK_TARGETS: Record<number, [number, number, number]> = {
    0: [-18.6, 214.1, 66.4],
    1: BDI_100_TARGET,
    2: [-420, 0, -20],
    3: [0, 0, 370],
    4: [300, 0, 88],
    5: [0, 100, 0],
};

function applyCameraSnapshot(controls: CameraControlsImpl, { c, t, z }: CameraSnapshot) {
    controls.setLookAt(c[0], c[1], c[2], t[0], t[1], t[2], false);
    controls.zoomTo(z, false);
    const cam = controls.camera;
    if (cam instanceof THREE.OrthographicCamera) {
        cam.zoom = z;
        cam.updateProjectionMatrix();
    }
    controls.update(0);
}

function transitionCameraSnapshot(controls: CameraControlsImpl, { c, t, z }: CameraSnapshot) {
    void Promise.all([
        controls.setLookAt(c[0], c[1], c[2], t[0], t[1], t[2], true),
        controls.zoomTo(z, true),
    ]);
}

function CameraController({
    activePanelId,
    deviceType,
    whiteBackground,
}: {
    activePanelId: number;
    deviceType: DeviceType;
    whiteBackground: boolean;
}) {
    const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
    const hasInitializedRef = useRef(false);
    const prevDeviceTypeRef = useRef<DeviceType>(deviceType);

    const cameraConfig = useMemo(
        () => ({
            0: {
                desktop: { c: [-156.4, 322.8, 229.0], t: [-18.6, 214.1, 66.4], z: 6.25 },
                tablet:{ c: [-134.4, 413.2, 261.4], t: [-15.0, 217.0, 57.8], z: 4.47 },
                mobile: { c: [-174.0, 392.5, 351.3], t: [-9.4, 205.4, 69.3], z: 3.05 },
            },
            1: {
                desktop: { c: [-40, 260, 280], t: BDI_100_TARGET, z: 1.3 },
                tablet: { c: [-160.6, 323.8, 298.1], t: [-1.1, 236.7, 50.6], z: 3.94 },
                mobile: { c: [-160.8, 438.0, 328.8], t: [3.8, 250.9, 46.8], z: 2.05 },
            },
            2: {
                desktop: { c: [-420, 50, 200], t: [-420, 0, -20], z: 1.2 },
                tablet: { c: [-500.4, 245.7, 135.6], t: [-392.8, 90.3, -73.2], z: 2.13 },
                mobile: { c: [-455.2, 212.6, 78.5], t: [-359.0, 124.5, -45.3], z: 0.94 },
            },
            3: {
                desktop: { c: [0, 50, 650], t: [0, 0, 370], z: 1 },
                tablet: { c: [-130.0, 305.0, 555.5], t: [59.8, 75.9, 306.0], z: 2.04 },
                mobile: { c: [-204.4, 283.8, 783.5], t: [15.3, 152.0, 360.3], z: 1.3 },
            },
            4: {
                desktop: { c: [300, 50, 350], t: [300, 0, 88], z: 1 },
                tablet: { c: [450.6, 267.2, 244.0], t: [184.3, 194.0, -3.3], z: 1.57 },
                mobile: { c: [525.1, 279.1, 448.5], t: [277.6, 170.6, 55.0], z: 1.09 },
            },
            5: {
                desktop: { c: [0, 150, 300], t: [0, 100, 0], z: 1 },
                tablet: { c: [682.0, 188.8, 18.0], t: [415.7, 115.6, -229.3], z: 2.06 },
                mobile: { c: [744.1, 285.8, 61.6], t: [588.6, 168.6, -117.6], z: 1.0 },
            },
        }) satisfies Record<number, Record<DeviceType, CameraSnapshot>>,
        [],
    );

    const applyConfig = useCallback(() => {
        const controls = cameraControlsRef.current;
        if (!controls) return;

        const targetConfig = cameraConfig[activePanelId as keyof typeof cameraConfig] ?? cameraConfig[0];
        const snapshot = whiteBackground
            ? TANK_GRID_CAMERA[deviceType]
            : targetConfig[deviceType];
        const deviceTypeChanged = prevDeviceTypeRef.current !== deviceType;
        prevDeviceTypeRef.current = deviceType;

        const mode = !hasInitializedRef.current || deviceTypeChanged ? 'snap' : 'transition';

        if (mode === 'snap') {
            applyCameraSnapshot(controls, snapshot);
            hasInitializedRef.current = true;
        } else {
            transitionCameraSnapshot(controls, snapshot);
        }
    }, [activePanelId, deviceType, whiteBackground, cameraConfig]);

    useEffect(() => {
        applyConfig();
    }, [applyConfig]);

    return (
        <>
            <CameraControls
                ref={cameraControlsRef}
                makeDefault
                smoothTime={CAMERA_TRANSITION_SMOOTH_TIME}
                draggingSmoothTime={0.12}
            />
            {/*{process.env.NODE_ENV === 'development' ? (*/}
            {/*    <CameraHelper*/}
            {/*        controlsRef={cameraControlsRef}*/}
            {/*        activePanelId={activePanelId}*/}
            {/*        deviceType={deviceType}*/}
            {/*        contextLabel={`bdtec panel ${activePanelId}`}*/}
            {/*    />*/}
            {/*) : null}*/}
        </>
    );
}

interface BdtecSceneProps {
    quality: string;
    activePanelId: number;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    whiteBackground?: boolean;
    snapSceneFade?: boolean;
}

export default function BdtecScene({
    quality,
    activePanelId,
    deviceType,
    whiteBackground = false,
    snapSceneFade = false,
}: BdtecSceneProps) {
    const { setModuleReady } = useBdtecSceneLoadingActions();

    useEffect(() => {
        setModuleReady(true);
        return () => setModuleReady(false);
    }, [setModuleReady]);

    return (
        <ManciniCanvas quality={quality} backgroundColor="#152535">
            <CameraController
                activePanelId={activePanelId}
                deviceType={deviceType}
                whiteBackground={whiteBackground}
            />

            <Suspense fallback={null}>
                <BdtecAssetRegistry />
                <BdtecLightEnvironment />
                <BdtecSceneFade faded={whiteBackground} snapFaded={snapSceneFade}>
                    <BdtecSceneModels />
                </BdtecSceneFade>
                <Tank2Grid
                    visible={whiteBackground}
                    center={
                        whiteBackground
                            ? TANK_GRID_CAMERA[deviceType].t
                            : (PANEL_LOOK_TARGETS[activePanelId] ?? PANEL_LOOK_TARGETS[0])
                    }
                />
                <BdtecSceneLoadGate />
            </Suspense>
        </ManciniCanvas>
    );
}
