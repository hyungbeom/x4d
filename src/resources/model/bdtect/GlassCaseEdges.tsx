'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { BDTEC_GLASS_EDGE_COLOR } from '@/resources/model/bdtect/bdtecGlassMaterial';

type GlassCaseEdgesProps = {
    geometry: THREE.BufferGeometry;
    threshold?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
};

/** WebGPU 호환 유리관 모서리 (drei Edges / LineMaterial 대신 LineBasicMaterial) */
export function GlassCaseEdges({
    geometry,
    threshold = 12,
    position,
    rotation,
    scale,
}: GlassCaseEdgesProps) {
    const edgesGeometry = useMemo(
        () => new THREE.EdgesGeometry(geometry, threshold),
        [geometry, threshold],
    );

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <lineSegments geometry={edgesGeometry} raycast={() => null}>
                <lineBasicMaterial
                    color={BDTEC_GLASS_EDGE_COLOR}
                    transparent
                    opacity={0.92}
                    depthWrite={false}
                    toneMapped={false}
                />
            </lineSegments>
        </group>
    );
}
