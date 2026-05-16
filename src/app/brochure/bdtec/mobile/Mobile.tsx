'use client';

import React, {useEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import { useFrame } from "@react-three/fiber";
import {CameraControls, Environment } from "@react-three/drei";

// 3D 환경 및 커스텀 컴포넌트
import { ManciniCanvas } from "@/app/brochure/bdtec/mobile/ManciniCanvas";
import { Light_Environment } from "@/utils/three/Light_Environment";
import LineObj from "@/utils/three/LineObj";
import { BdtecWebGpuBackdropGrid } from "@/utils/three/BdtecWebGpuBackdropGrid";

// 3D 모델
import { Tank } from "@/resources/model/bdtect/Tank";
import { AirProduct } from "@/resources/model/Air_Product";
import { Factory } from "@/resources/model/bdtect/Factory";
import { Wifi } from "@/resources/model/bdtect/Wifi";
import { SystemModel } from "@/resources/model/bdtect/SystemModel";
import { Modem } from "@/resources/model/bdtect/Modem";

// 애니메이션이 들어간 둥둥 떠다니는 파이프라인
function FloatingTankLine() {
    const groupRef = useRef<THREE.Group>(null);

    const tankSurroundPoints = useMemo(() => [
        new THREE.Vector3(-200, 40, -70),
        new THREE.Vector3(-200, 40, 200),
        new THREE.Vector3(0, 40, 200),
        new THREE.Vector3(0, 40, -70),
        new THREE.Vector3(-200, 40, -70),
    ], []);

    useFrame((state) => {
        if (groupRef.current) {
            const speed = 3;
            const amplitude = 10;
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * speed) * amplitude;
        }
    });

    return (
        <group ref={groupRef}>
            <LineObj
                type="type1"
                points={tankSurroundPoints}
                tubeRadius={3}
                lightRadius={1}
            />
        </group>
    );
}

// 부모로부터 quality 값을 전달받을 수 있도록 Props 정의
interface MobileSceneProps {
    quality: string;
    activePanelId: number;
}

export default function MobileScene({ quality, activePanelId }: MobileSceneProps) {


    const cameraControlsRef = useRef<any>(null);


    useEffect(() => {
        const controls = cameraControlsRef.current;
        if (!controls) return;

        // 카메라 이동 함수: moveCamera(카메라X, 카메라Y, 카메라Z, 타겟X, 타겟Y, 타겟Z)
        const moveCamera = (cX: number, cY: number, cZ: number, tX: number, tY: number, tZ: number) => {
            controls.setLookAt(cX, cY, cZ, tX, tY, tZ, true); // true = 부드러운 애니메이션
        };

        // 각 버튼(ID)에 매칭되는 모델의 포지션으로 카메라 이동
        switch (activePanelId) {
            case 1: // BDI-100 (AirProduct: [-40, 215, 45])
                // 모델보다 살짝 위, 앞으로 카메라를 띄웁니다.
                moveCamera(-40, 250, 250, -40, 215, 45);
                break;
            case 2: // 배출시설 (Factory: [-420, 0, -20])
                moveCamera(-420, 50, 200, -420, 0, -20);
                break;
            case 3: // 방지시설 (Tank: [0, 0, 370])
                moveCamera(0, 50, 650, 0, 0, 370);
                break;
            case 4: // 통신교류 (Wifi: [300, 0, 88])
                moveCamera(300, 50, 350, 300, 0, 88);
                break;
            case 5: // (기존에 있던) IoT Gateway
                moveCamera(0, 150, 300, 0, 100, 0);
                break;
            default: // 0 (초기 상태 또는 닫기 눌렀을 때 전체 뷰)
                // 전체 씬이 다 보이는 멀찍한 기본 포지션 (상황에 맞게 조절하세요)
                moveCamera(0, 200, 800, 0, 0, 0);
                break;
        }
    }, [activePanelId]); // activePanelId가 바뀔 때마다 실행


    // 💡 기존 page.tsx에 있던 파이프라인 데이터를 모바일 씬 내부로 이동
    const PipeLine1 = useMemo(() => [
        new THREE.Vector3(-50, 15, 50),
        new THREE.Vector3(-50, 15, 300),
    ], []);

    const PipeLine2 = useMemo(() => [
        new THREE.Vector3(-140, 15, 53),
        new THREE.Vector3(-220, 15, 53),
        new THREE.Vector3(-220, 15, 200),
        new THREE.Vector3(-358, 15, 200),
        new THREE.Vector3(-358, 15, 50),
    ], []);

    const PipeLine3 = useMemo(() => [
        new THREE.Vector3(75, 33, 50),
        new THREE.Vector3(150, 33, 50),
        new THREE.Vector3(150, 33, -120),
        new THREE.Vector3(265, 33, -120),
        new THREE.Vector3(265, 33, 30),
    ], []);

    const PipeLine4 = useMemo(() => [
        new THREE.Vector3(-40, 33, 135),
        new THREE.Vector3(-40, 33, -300),
        new THREE.Vector3(320, 33, -300),
        new THREE.Vector3(320, 33, -135),
        new THREE.Vector3(530, 33, -135),
    ], []);

    const PipeLine5 = useMemo(() => [
        new THREE.Vector3(-40, 80, 135),
        new THREE.Vector3(-40, 80, -300),
        new THREE.Vector3(320, 80, -300),
        new THREE.Vector3(320, 80, -135),
        new THREE.Vector3(530, 80, -135),
    ], []);

    return (
        <ManciniCanvas quality={quality}>

            <CameraControls ref={cameraControlsRef} />
            <Environment preset="city" blur={0} />


            <Light_Environment />
            <BdtecWebGpuBackdropGrid />

            <FloatingTankLine />

            <AirProduct scale={[20, 20, 20]} position={[-40, 215, 45]} />

            <Tank scale={[70, 70, 70]} position={[0, 0, 370]} rotation={[0, -Math.PI / 2, 0]} />
            <Modem scale={[100, 100, 100]} position={[0, 0, 450]} />

            <Factory scale={[40, 40, 40]} rotation={[0, -Math.PI / 2, 0]} position={[-420, 0, -20]} />
            <Modem scale={[100, 100, 100]} position={[-450, 0, 80]} />

            <Wifi scale={[150, 150, 150]} position={[300, 0, 88]} />
            <SystemModel scale={[100, 100, 100]} position={[0, 130, 0]} rotation={[0, 0, 0]} />

            <LineObj type="type1" points={PipeLine1} tubeRadius={5} lightRadius={3} speed={1} />
            <LineObj type="type1" points={PipeLine2} tubeRadius={5} lightRadius={3} speed={1} />
            <LineObj type="type1" points={PipeLine3} tubeRadius={5} lightRadius={3} speed={1} />
            <LineObj type="type2" points={PipeLine4} tubeRadius={5} lightRadius={3} speed={1} lineWidth={7} />
            <LineObj type="type1" points={PipeLine5} tubeRadius={18} lightRadius={15} speed={1} />
        </ManciniCanvas>
    );
}