'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { useBdtecSceneLoadingActions } from '@/utils/three/SceneLoadingContext';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';
import { BrochureGlassFloor } from '@/utils/three/BrochureGlassFloor';
import { BdtecSceneLoadGate } from '@/utils/three/BdtecSceneLoadGate';
import { BdtecAssetRegistry } from '@/app/brochure/bdtec/mobile/BdtecAssetRegistry';
import { SceneEnvironment } from '@/utils/three/SceneEnvironment';
import { BdtecLightEnvironment } from '@/utils/three/BdtecLightEnvironment';
import type CameraControlsImpl from 'camera-controls';
import { ManciniCanvas } from '@/app/brochure/bdtec/mobile/ManciniCanvas';
import BdtecSceneModels from '@/app/brochure/bdtec/mobile/BdtecSceneModels';

type CameraSnapshot = { c: [number, number, number]; t: [number, number, number]; z: number };
type DeviceType = 'desktop' | 'tablet' | 'mobile';

const BDI_100_TARGET: [number, number, number] = [-40, 215, 45];
const CAMERA_TRANSITION_SMOOTH_TIME = 0.55;
const FLOOR_Y = -12;

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
}: {
    activePanelId: number;
    deviceType: DeviceType;
}) {
    const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
    const hasInitializedRef = useRef(false);
    const prevDeviceTypeRef = useRef<DeviceType>(deviceType);

    const cameraConfig = useMemo(
        () => ({
            0: {
                desktop: { c: [0, 200, 800], t: [0, 0, 0], z: 1 },
                tablet: { c: [0, 250, 1000], t: [0, 0, 0], z: 1 },
                mobile: { c: [875.0, 923.0, 819.3], t: [37.6, 221.1, -95.6], z: 0.36 },
            },
            1: {
                desktop: { c: [-40, 260, 280], t: BDI_100_TARGET, z: 1.3 },
                tablet: { c: [-40, 300, 340], t: BDI_100_TARGET, z: 1.2 },
                mobile: { c: [-160.8, 438.0, 328.8], t: [3.8, 250.9, 46.8], z: 2.05 },
            },
            2: {
                desktop: { c: [-420, 50, 200], t: [-420, 0, -20], z: 1.2 },
                tablet: { c: [-420, 80, 250], t: [-420, 0, -20], z: 1.1 },
                mobile: { c: [-455.2, 212.6, 78.5], t: [-359.0, 124.5, -45.3], z: 0.94 },
            },
            3: {
                desktop: { c: [0, 50, 650], t: [0, 0, 370], z: 1 },
                tablet: { c: [0, 80, 750], t: [0, 0, 370], z: 1 },
                mobile: { c: [-204.4, 283.8, 783.5], t: [15.3, 152.0, 360.3], z: 1.3 },
            },
            4: {
                desktop: { c: [300, 50, 350], t: [300, 0, 88], z: 1 },
                tablet: { c: [300, 80, 450], t: [300, 0, 88], z: 1 },
                mobile: { c: [525.1, 279.1, 448.5], t: [277.6, 170.6, 55.0], z: 1.09 },
            },
            5: {
                desktop: { c: [0, 150, 300], t: [0, 100, 0], z: 1 },
                tablet: { c: [0, 200, 400], t: [0, 100, 0], z: 1 },
                mobile: { c: [744.1, 285.8, 61.6], t: [588.6, 168.6, -117.6], z: 1.0 },
            },
        }) satisfies Record<number, Record<DeviceType, CameraSnapshot>>,
        [],
    );

    const applyConfig = useCallback(() => {
        const controls = cameraControlsRef.current;
        if (!controls) return;

        const targetConfig = cameraConfig[activePanelId as keyof typeof cameraConfig] ?? cameraConfig[0];
        const snapshot = targetConfig[deviceType];
        const deviceTypeChanged = prevDeviceTypeRef.current !== deviceType;
        prevDeviceTypeRef.current = deviceType;

        const mode = !hasInitializedRef.current || deviceTypeChanged ? 'snap' : 'transition';

        if (mode === 'snap') {
            applyCameraSnapshot(controls, snapshot);
            hasInitializedRef.current = true;
        } else {
            transitionCameraSnapshot(controls, snapshot);
        }
    }, [activePanelId, deviceType, cameraConfig]);

    useEffect(() => {
        applyConfig();
    }, [applyConfig]);

    return (
        <CameraControls
            ref={cameraControlsRef}
            makeDefault
            smoothTime={CAMERA_TRANSITION_SMOOTH_TIME}
            draggingSmoothTime={0.12}
        />
    );
}

interface BdtecSceneProps {
    quality: string;
    activePanelId: number;
    deviceType: 'desktop' | 'tablet' | 'mobile';
}

export default function BdtecScene({ quality, activePanelId, deviceType }: BdtecSceneProps) {
    const { setModuleReady } = useBdtecSceneLoadingActions();

    useEffect(() => {
        setModuleReady(true);
        return () => setModuleReady(false);
    }, [setModuleReady]);

    return (
        <ManciniCanvas quality={quality} backgroundColor="#152535">
            <CameraController activePanelId={activePanelId} deviceType={deviceType} />

            <Suspense fallback={null}>
                <BdtecAssetRegistry />
                <SceneEnvironment colorTop="#1e3a52" colorBottom="#101c2a" opaque />
                <BdtecLightEnvironment />
                <BrochureGlassFloor y={FLOOR_Y} tint="#0e1e30" />
                <BdtecSceneModels />
                <BdtecSceneLoadGate />
            </Suspense>
        </ManciniCanvas>
    );
}
