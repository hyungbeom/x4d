'use client';

import React, {Suspense, useCallback, useEffect, useMemo, useRef} from 'react';
import {useBdtecSceneLoadingActions} from '@/utils/three/SceneLoadingContext';
import {SceneReadyGate} from '@/utils/three/SceneReadyGate';
import * as THREE from 'three';
import {useFrame} from "@react-three/fiber";
import {CameraControls} from "@react-three/drei";
import {BrochureGrid} from "@/utils/three/BrochureGrid";
import {SceneEnvironment} from "@/utils/three/SceneEnvironment";
import type CameraControlsImpl from 'camera-controls';

// 3D 환경 및 커스텀 컴포넌트
import {ManciniCanvas} from "@/app/brochure/bdtec/mobile/ManciniCanvas";
import LineObj from "@/utils/three/LineObj";

// 3D 모델

import {AirProduct} from "@/resources/model/Air_Product";
import {Factory} from "@/resources/model/bdtect/Factory";
import {Wifi} from "@/resources/model/bdtect/Wifi";
import {SystemModel} from "@/resources/model/bdtect/SystemModel";
import {Modem} from "@/resources/model/bdtect/Modem";
import {DataModel} from "@/resources/model/bdtect/Data";
import {SplineSmokeParticles} from "@/utils/three/SplineParticles";
import {Light_Environment} from "@/utils/three/Light_Environment";
import { Tank } from "@/resources/model/bdtect/Tank";

// ... (FloatingTankLine 컴포넌트 유지) ...
function FloatingTankLine() {
    const groupRef = useRef<THREE.Group>(null);
    const tankSurroundPoints = useMemo(() => [
        new THREE.Vector3(-200, 40, -70), new THREE.Vector3(-200, 40, 200),
        new THREE.Vector3(0, 40, 200), new THREE.Vector3(0, 40, -70), new THREE.Vector3(-200, 40, -70),
    ], []);
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 10;
        }
    });
    return <group ref={groupRef}><LineObj type="type1" points={tankSurroundPoints} tubeRadius={3} lightRadius={1}/>
    </group>;
}

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
            mobile: { c: [875.0, 923.0, 819.3], t: [37.6, 221.1, -95.6], z: 0.36 }
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
            {/*<CameraHelper*/}
            {/*    controlsRef={cameraControlsRef}*/}
            {/*    activePanelId={activePanelId}*/}
            {/*    deviceType={deviceType}*/}
            {/*/>*/}
        </>
    );
}

interface BdtecSceneProps {
    quality: string;
    activePanelId: number;
    deviceType: 'desktop' | 'tablet' | 'mobile';
}

export default function BdtecScene({quality, activePanelId, deviceType}: BdtecSceneProps) {
    const {setModuleReady} = useBdtecSceneLoadingActions();

    useEffect(() => {
        setModuleReady(true);

        return () => setModuleReady(false);
    }, [setModuleReady]);

    const PipeLine1 = useMemo(() => [new THREE.Vector3(-50, 15, 50), new THREE.Vector3(-50, 15, 300)], []);
    const PipeLine2 = useMemo(() => [new THREE.Vector3(-140, 15, 53), new THREE.Vector3(-220, 15, 53), new THREE.Vector3(-220, 15, 200), new THREE.Vector3(-358, 15, 200), new THREE.Vector3(-358, 15, 50)], []);
    const PipeLine3 = useMemo(() => [new THREE.Vector3(75, 33, 50), new THREE.Vector3(150, 33, 50), new THREE.Vector3(150, 33, -120), new THREE.Vector3(265, 33, -120), new THREE.Vector3(265, 33, 30)], []);
    const PipeLine4 = useMemo(() => [new THREE.Vector3(-40, 33, 135), new THREE.Vector3(-40, 33, -300), new THREE.Vector3(320, 33, -300), new THREE.Vector3(320, 33, -135), new THREE.Vector3(530, 33, -135)], []);
    const PipeLine5 = useMemo(() => [new THREE.Vector3(-40, 80, 135), new THREE.Vector3(-40, 80, -300), new THREE.Vector3(320, 80, -300), new THREE.Vector3(320, 80, -135), new THREE.Vector3(570, 80, -135)], []);

    return (
        <ManciniCanvas quality={quality} backgroundColor="#b8dff5">
            <CameraController activePanelId={activePanelId} deviceType={deviceType}/>

            <Suspense fallback={null}>
                {/*<SceneEnvironment preset="forest" blur={1} environmentIntensity={0.8}/>*/}
                <SceneEnvironment colorTop="#a8d4f0" colorBottom="#ffffff" />
                <Light_Environment />
                <BrochureGrid
                    cellSize={32}
                    sectionSize={160}
                    cellColor="#d0c8cc"
                    sectionColor="#1a4d8c"
                    animateColors
                    pulseSpeed={2}
                    cellColorTo="#ffffff"
                    sectionColorTo="#2563b3"
                    hdrPulse
                />

                <FloatingTankLine/>

                <AirProduct scale={[20, 20, 20]} position={[-40, 215, 45]}/>
                <Tank scale={[80, 80, 80]} position={[0, 0, 370]} rotation={[0,0, 0]}/>
                <Modem scale={[100, 100, 100]} position={[0, 0, 450]}/>
                <SplineSmokeParticles
                    spawnPosition={[-350, 200, -5]} // 카메라가 보고 있는 메인 모델 근처 좌표로 설정
                    count={20}    // 기본 크기의 20배로 뻥튀기 (눈에 보일 때까지 올려보세요)
                />
                <SplineSmokeParticles
                    spawnPosition={[-350, 200, -45]} // 카메라가 보고 있는 메인 모델 근처 좌표로 설정
                    count={20}    // 기본 크기의 20배로 뻥튀기 (눈에 보일 때까지 올려보세요)
                />

                <SplineSmokeParticles
                    spawnPosition={[-310, 200, -45]} // 카메라가 보고 있는 메인 모델 근처 좌표로 설정
                    count={20}    // 기본 크기의 20배로 뻥튀기 (눈에 보일 때까지 올려보세요)
                />
                <SplineSmokeParticles
                    spawnPosition={[-310, 200, -5]} // 카메라가 보고 있는 메인 모델 근처 좌표로 설정
                    count={20}    // 기본 크기의 20배로 뻥튀기 (눈에 보일 때까지 올려보세요)
                />

                <SplineSmokeParticles
                    spawnPosition={[-545, 110, 20]} // 카메라가 보고 있는 메인 모델 근처 좌표로 설정
                    count={20}    // 기본 크기의 20배로 뻥튀기 (눈에 보일 때까지 올려보세요)
                />
                <SplineSmokeParticles
                    spawnPosition={[-545, 110, -20]} // 카메라가 보고 있는 메인 모델 근처 좌표로 설정
                    count={20}    // 기본 크기의 20배로 뻥튀기 (눈에 보일 때까지 올려보세요)
                />
                <SplineSmokeParticles
                    spawnPosition={[-545, 110, -60]} // 카메라가 보고 있는 메인 모델 근처 좌표로 설정
                    count={20}    // 기본 크기의 20배로 뻥튀기 (눈에 보일 때까지 올려보세요)
                />
                <Factory scale={[58, 58, 58]} rotation={[0, -Math.PI / 2, 0]} position={[-420, -100, -5]}/>
                <Modem scale={[100, 100, 100]} position={[-450, 0, 80]}/>
                <Wifi scale={[90, 90, 90]} position={[300, 0, 88]}/>
                <SystemModel scale={[100, 100, 100]} position={[0, 130, 0]} rotation={[0, 0, 0]}/>
                <DataModel scale={[50, 50, 50]} position={[590, 0, -30]} rotation={[0, Math.PI / 2, 0]}/>

                <LineObj type="type1" points={PipeLine1} tubeRadius={5} lightRadius={3} speed={1}/>
                <LineObj type="type1" points={PipeLine2} tubeRadius={5} lightRadius={3} speed={1}/>
                <LineObj type="type1" points={PipeLine3} tubeRadius={5} lightRadius={3} speed={1}/>
                <LineObj type="type2" points={PipeLine4} tubeRadius={5} lightRadius={3} speed={1} lineWidth={7}/>
                <LineObj type="type1" points={PipeLine5} tubeRadius={18} lightRadius={15} speed={1}/>

                <SceneReadyGate/>
            </Suspense>
        </ManciniCanvas>
    );
}
