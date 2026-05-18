'use client';

import * as THREE from 'three';

const PLANE_SIZE = 12000;

type BrochureGlassFloorProps = {
    y?: number;
    tint?: string;
};

/** WebGPU 호환 유리·거울 바닥 (alphaMap·씬 복제 미사용) */
export function BrochureGlassFloor({
    y = -12,
    tint = '#0a1624',
}: BrochureGlassFloorProps) {
    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, y, 0]}
            scale={[PLANE_SIZE, PLANE_SIZE, 1]}
            renderOrder={-1}
            frustumCulled={false}
            receiveShadow
        >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
                color={tint}
                metalness={0.88}
                roughness={0.06}
                opacity={0.88}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}
