'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three/webgpu';
import {
    Fn,
    float,
    vec4,
    uniform,
    mix,
    pow,
    min,
    abs,
    fract,
    fwidth,
    length,
    positionLocal,
    positionWorld,
    cameraPosition,
    modelWorldMatrix,
    mul,
    sub,
    div,
    add,
} from 'three/tsl';

type BdtecInfiniteGridProps = {
    cellSize?: number;
    sectionSize?: number;
    fadeDistance?: number;
    fadeStrength?: number;
    cellColor?: string;
    sectionColor?: string;
};

function createBdtecGridNodeMaterial({
    cellSize,
    sectionSize,
    fadeDistance,
    fadeStrength,
    cellColor,
    sectionColor,
}: Required<BdtecInfiniteGridProps>) {
    const uCellSize = uniform(float(cellSize));
    const uSectionSize = uniform(float(sectionSize));
    const uFadeDistance = uniform(float(fadeDistance));
    const uFadeStrength = uniform(float(fadeStrength));
    const uCellThickness = uniform(float(0.55));
    const uSectionThickness = uniform(float(1.15));
    const uCellColor = uniform(new THREE.Color(cellColor));
    const uSectionColor = uniform(new THREE.Color(sectionColor));

    const material = new THREE.MeshBasicNodeMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
    });

    material.positionNode = Fn(() => {
        const lp = mul(positionLocal.xzy, add(uFadeDistance, float(1)));
        return modelWorldMatrix.mul(vec4(lp, float(1))).xyz;
    })();

    material.colorNode = Fn(() => {
        const rCell = div(positionWorld.xz, uCellSize);
        const gridCell = div(abs(sub(fract(sub(rCell, float(0.5))), float(0.5))), fwidth(rCell));
        const lineCell = add(min(gridCell.x, gridCell.y), sub(float(1), uCellThickness));
        const g1 = sub(float(1), min(lineCell, float(1)));

        const rSec = div(positionWorld.xz, uSectionSize);
        const gridSec = div(abs(sub(fract(sub(rSec, float(0.5))), float(0.5))), fwidth(rSec));
        const lineSec = add(min(gridSec.x, gridSec.y), sub(float(1), uSectionThickness));
        const g2 = sub(float(1), min(lineSec, float(1)));

        const dist = length(sub(cameraPosition, positionWorld));
        const d = sub(float(1), min(div(dist, uFadeDistance), float(1)));
        const color = mix(uCellColor, uSectionColor, min(float(1), mul(uSectionThickness, g2)));
        const alpha = mul(add(g1, g2), pow(d, uFadeStrength));
        const alphaOut = mix(mul(alpha, float(0.75)), alpha, g2);

        return vec4(color, alphaOut);
    })();

    return material;
}

/**
 * WebGPU(TSL) infinite grid — 멀수록 선 알파 감소
 */
export function BdtecInfiniteGrid({
    cellSize = 32,
    sectionSize = 160,
    fadeDistance = 2200,
    fadeStrength = 1.4,
    cellColor = '#5a6d8f',
    sectionColor = '#b3c4f5',
}: BdtecInfiniteGridProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    const material = useMemo(
        () =>
            createBdtecGridNodeMaterial({
                cellSize,
                sectionSize,
                fadeDistance,
                fadeStrength,
                cellColor,
                sectionColor,
            }),
        [cellSize, sectionSize, fadeDistance, fadeStrength, cellColor, sectionColor],
    );

    useEffect(() => () => material.dispose(), [material]);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;
        mesh.position.x = state.camera.position.x;
        mesh.position.z = state.camera.position.z;
    });

    return (
        <mesh ref={meshRef} frustumCulled={false} renderOrder={-1} position={[0, 0, 0]} material={material}>
            <planeGeometry args={[1, 1]} />
        </mesh>
    );
}

/** @deprecated BdtecInfiniteGrid 사용 */
export const BdtecWebGpuBackdropGrid = BdtecInfiniteGrid;
