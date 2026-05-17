// app/page.tsx (또는 Home.tsx)
"use client";

import React, {Suspense, useCallback, useEffect, useMemo, useRef, useState} from 'react'; // Suspense 추가
import {CameraControls} from '@react-three/drei'
import * as THREE from 'three';
import {ManciniCanvas} from "@/app/brochure/bdtec/mobile/ManciniCanvas";
import {SceneEnvironment} from "@/utils/three/SceneEnvironment";
import {Light_Environment} from "@/utils/three/Light_Environment";
import {BrochureGrid} from "@/utils/three/BrochureGrid";
import {AirProduct} from "@/resources/model/Air_Product";
import {Tank} from "@/resources/model/bdtect/Tank";
import {Modem} from "@/resources/model/bdtect/Modem";
import {SplineSmokeParticles} from "@/utils/three/SplineParticles";
import {Factory} from "@/resources/model/bdtect/Factory";
import {Wifi} from "@/resources/model/bdtect/Wifi";
import {SystemModel} from "@/resources/model/bdtect/SystemModel";
import {DataModel} from "@/resources/model/bdtect/Data";
import LineObj from "@/utils/three/LineObj";
import {SceneReadyGate} from "@/utils/three/SceneReadyGate";
import type CameraControlsImpl from "camera-controls";
import CameraHelper from "@/utils/three/CamHelper";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {SceneLoadingProvider} from "@/utils/three/SceneLoadingContext";
import {WorldModel} from "@/resources/model/progist/WorldMode";


type CameraSnapshot = { c: [number, number, number]; t: [number, number, number]; z: number };
type DeviceType = 'desktop' | 'tablet' | 'mobile';

/** BDI-100 (AirProduct) — cameraConfig[1].t는 항상 이 좌표와 맞출 것 */
const BDI_100_TARGET: [number, number, number] = [-40, 215, 45];

const CAMERA_TRANSITION_SMOOTH_TIME = 0.55;

/** 즉시 스냅 (초기 마운트·리사이즈 deviceType 전환 등) */
function applyCameraSnapshot(controls: CameraControlsImpl, {c, t, z}: CameraSnapshot) {
    controls.setLookAt(c[0], c[1], c[2], t[0], t[1], t[2], false);
    controls.zoomTo(z, false);
    const cam = controls.camera;
    if (cam instanceof THREE.OrthographicCamera) {
        cam.zoom = z;
        cam.updateProjectionMatrix();
    }
    controls.update(0);
}

/** 패널 전환 시 부드럽게 이동 */
function transitionCameraSnapshot(controls: CameraControlsImpl, {c, t, z}: CameraSnapshot) {
    void Promise.all([
        controls.setLookAt(c[0], c[1], c[2], t[0], t[1], t[2], true),
        controls.zoomTo(z, true),
    ]);
}

// 🚀 1. 카메라를 통제하는 핵심 컴포넌트
function CameraController({activePanelId, deviceType}: { activePanelId: number; deviceType: DeviceType }) {
    const cameraControlsRef = useRef<CameraControlsImpl | null>(null);
    const hasInitializedRef = useRef(false);
    const prevDeviceTypeRef = useRef<DeviceType>(deviceType);

    // 🎯 설정 객체: c(카메라 위치), t(타겟 위치), z(줌) — 헬퍼는 deviceType·panelId에 맞는 슬롯에 붙여넣기
    const cameraConfig = useMemo(() => ({
        0: {
            desktop: {c: [0, 200, 800], t: [0, 0, 0], z: 1},
            tablet: {c: [0, 250, 1000], t: [0, 0, 0], z: 1},
            mobile: { c: [806.1, 881.4, 901.9], t: [15.2, 95.0, 14.7], z: 1.97 }
        },
        1: {
            desktop: {c: [-40, 260, 280], t: BDI_100_TARGET, z: 1.3},
            tablet: {c: [-40, 300, 340], t: BDI_100_TARGET, z: 1.2},
            mobile: {c: [-160.8, 438.0, 328.8], t: [3.8, 250.9, 46.8], z: 2.05},
        },
        2: {
            desktop: {c: [-420, 50, 200], t: [-420, 0, -20], z: 1.2},
            tablet: {c: [-420, 80, 250], t: [-420, 0, -20], z: 1.1},
            mobile: {c: [-455.2, 212.6, 78.5], t: [-359.0, 124.5, -45.3], z: 0.94}
        },
        3: {
            desktop: {c: [0, 50, 650], t: [0, 0, 370], z: 1},
            tablet: {c: [0, 80, 750], t: [0, 0, 370], z: 1},
            mobile: {c: [-204.4, 283.8, 783.5], t: [15.3, 152.0, 360.3], z: 1.30}
        },
        4: {
            desktop: {c: [300, 50, 350], t: [300, 0, 88], z: 1},
            tablet: {c: [300, 80, 450], t: [300, 0, 88], z: 1},
            mobile: {c: [525.1, 279.1, 448.5], t: [277.6, 170.6, 55.0], z: 1.09}
        },
        5: {
            desktop: {c: [0, 150, 300], t: [0, 100, 0], z: 1}, tablet: {c: [0, 200, 400], t: [0, 100, 0], z: 1},
            mobile: {c: [744.1, 285.8, 61.6], t: [588.6, 168.6, -117.6], z: 1.00}
        },
    } satisfies Record<number, Record<DeviceType, CameraSnapshot>>), []);

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
        <>
            <CameraControls
                ref={cameraControlsRef}
                makeDefault
                smoothTime={CAMERA_TRANSITION_SMOOTH_TIME}
                draggingSmoothTime={0.12}
            />
            <CameraHelper
                controlsRef={cameraControlsRef}
                activePanelId={activePanelId}
                deviceType={deviceType}
            />
        </>
    );
}


export default function Home() {

    const [activePanelId, setActivePanelId] = useState<number>(0);
    const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');



    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // 🚀 2. 창 크기에 따라 기기 판별 (기준은 필요에 따라 수정하세요)
        const handleResize = () => {
            const width = window.innerWidth;
            const next =
                width <= 768 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop';
            setDeviceType(next);
        };

        handleResize(); // 초기 1회 실행
        window.addEventListener('resize', handleResize);

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <SceneLoadingProvider>
        <ManciniCanvas quality={'default'}>
            <CameraController activePanelId={activePanelId} deviceType={deviceType}/>
            
            <Suspense fallback={null}>
                {/*<SceneEnvironment preset="forest" blur={1} environmentIntensity={0.8}/>*/}
                <SceneEnvironment/>
                <Light_Environment/>



                <WorldModel/>

                <SceneReadyGate/>
            </Suspense>
        </ManciniCanvas>
        </SceneLoadingProvider>
    );
}