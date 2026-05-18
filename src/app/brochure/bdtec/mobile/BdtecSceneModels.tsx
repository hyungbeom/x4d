'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import LineObj from '@/utils/three/LineObj';
import { AirProduct } from '@/resources/model/Air_Product';
import { Factory } from '@/resources/model/bdtect/Factory';
import { Wifi } from '@/resources/model/bdtect/Wifi';
import { SystemModel } from '@/resources/model/bdtect/SystemModel';
import { Modem } from '@/resources/model/bdtect/Modem';
import { DataModel } from '@/resources/model/bdtect/Data';
import { SplineSmokeParticles } from '@/utils/three/SplineParticles';
import { Tank } from '@/resources/model/bdtect/Tank';

function FloatingTankLine() {
    const groupRef = useRef<THREE.Group>(null);
    const tankSurroundPoints = useMemo(
        () => [
            new THREE.Vector3(-200, 40, -70),
            new THREE.Vector3(-200, 40, 200),
            new THREE.Vector3(0, 40, 200),
            new THREE.Vector3(0, 40, -70),
            new THREE.Vector3(-200, 40, -70),
        ],
        [],
    );
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 10;
        }
    });
    return (
        <group ref={groupRef}>
            <LineObj type="type1" points={tankSurroundPoints} tubeRadius={3} lightRadius={1} />
        </group>
    );
}

/** BDTEC 브로슈어 3D 오브젝트 (바닥 반사용으로 동일 트리를 한 번 더 렌더할 수 있음) */
export default function BdtecSceneModels() {
    const PipeLine1 = useMemo(
        () => [new THREE.Vector3(-50, 15, 50), new THREE.Vector3(-50, 15, 300)],
        [],
    );
    const PipeLine2 = useMemo(
        () => [
            new THREE.Vector3(-140, 15, 53),
            new THREE.Vector3(-220, 15, 53),
            new THREE.Vector3(-220, 15, 200),
            new THREE.Vector3(-358, 15, 200),
            new THREE.Vector3(-358, 15, 50),
        ],
        [],
    );
    const PipeLine3 = useMemo(
        () => [
            new THREE.Vector3(75, 33, 50),
            new THREE.Vector3(150, 33, 50),
            new THREE.Vector3(150, 33, -120),
            new THREE.Vector3(265, 33, -120),
            new THREE.Vector3(265, 33, 30),
        ],
        [],
    );
    const PipeLine4 = useMemo(
        () => [
            new THREE.Vector3(-40, 33, 135),
            new THREE.Vector3(-40, 33, -300),
            new THREE.Vector3(320, 33, -300),
            new THREE.Vector3(320, 33, -135),
            new THREE.Vector3(530, 33, -135),
        ],
        [],
    );
    const PipeLine5 = useMemo(
        () => [
            new THREE.Vector3(-40, 80, 135),
            new THREE.Vector3(-40, 80, -300),
            new THREE.Vector3(320, 80, -300),
            new THREE.Vector3(320, 80, -135),
            new THREE.Vector3(570, 80, -135),
        ],
        [],
    );

    return (
        <>
            <FloatingTankLine />

            <AirProduct scale={[20, 20, 20]} position={[-40, 215, 45]} />
            <Tank scale={[80, 80, 80]} position={[0, 0, 370]} rotation={[0, 0, 0]} />
            <Modem scale={[100, 100, 100]} position={[0, 0, 450]} />
            <SplineSmokeParticles spawnPosition={[-350, 200, -5]} count={20} />
            <SplineSmokeParticles spawnPosition={[-350, 200, -45]} count={20} />
            <SplineSmokeParticles spawnPosition={[-310, 200, -45]} count={20} />
            <SplineSmokeParticles spawnPosition={[-310, 200, -5]} count={20} />
            <SplineSmokeParticles spawnPosition={[-545, 110, 20]} count={20} />
            <SplineSmokeParticles spawnPosition={[-545, 110, -20]} count={20} />
            <SplineSmokeParticles spawnPosition={[-545, 110, -60]} count={20} />
            <Factory scale={[58, 58, 58]} rotation={[0, -Math.PI / 2, 0]} position={[-420, -100, -5]} />
            <Modem scale={[100, 100, 100]} position={[-450, 0, 80]} />
            <Wifi scale={[90, 90, 90]} position={[300, 0, 88]} />
            <SystemModel scale={[100, 100, 100]} position={[0, 130, 0]} rotation={[0, 0, 0]} />
            <DataModel scale={[50, 50, 50]} position={[590, 0, -30]} rotation={[0, Math.PI / 2, 0]} />

            <LineObj type="type1" points={PipeLine1} tubeRadius={5} lightRadius={3} speed={1} />
            <LineObj type="type1" points={PipeLine2} tubeRadius={5} lightRadius={3} speed={1} />
            <LineObj type="type1" points={PipeLine3} tubeRadius={5} lightRadius={3} speed={1} />
            <LineObj type="type2" points={PipeLine4} tubeRadius={5} lightRadius={3} speed={1} lineWidth={7} />
            <LineObj type="type1" points={PipeLine5} tubeRadius={18} lightRadius={15} speed={1} />
        </>
    );
}
