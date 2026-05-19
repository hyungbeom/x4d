'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const ROWS = 5;
const COLS = 7;
const COUNT = ROWS * COLS;
const TANK_SCALE = 18;
const FADE_DAMP = 2.6;
const GAP = 28;

const storedOpacity = new WeakMap<THREE.Material, number>();

export type Tank2GridProps = {
    visible: boolean;
    center?: [number, number, number];
};

function buildCellPositions(spacingX: number, spacingZ: number): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    const originX = -((COLS - 1) * spacingX) / 2;
    const originZ = -((ROWS - 1) * spacingZ) / 2;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            positions.push(
                new THREE.Vector3(
                    originX + col * spacingX,
                    0,
                    originZ + row * spacingZ,
                ),
            );
        }
    }
    return positions;
}

/** 5행 × 7열 Tank2 — InstancedMesh로 Z-fighting·재질 공유 문제 방지 */
export function Tank2Grid({ visible, center = [0, 100, 0] }: Tank2GridProps) {
    const { nodes, materials }: { nodes: any; materials: any } = useGLTF('/model/bdtec/Tank2.glb');
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const blendRef = useRef(0);
    const targetRef = useRef(0);

    const { geometry, spacingX, spacingZ, centerOffset } = useMemo(() => {
        const geom = nodes.Tank.geometry as THREE.BufferGeometry;
        geom.computeBoundingBox();
        const box = geom.boundingBox ?? new THREE.Box3();
        const size = new THREE.Vector3();
        box.getSize(size);
        const meshCenter = new THREE.Vector3();
        box.getCenter(meshCenter);

        const scaledSizeX = size.x * TANK_SCALE;
        const scaledSizeZ = size.z * TANK_SCALE;

        return {
            geometry: geom,
            spacingX: scaledSizeX + GAP,
            spacingZ: scaledSizeZ + GAP,
            centerOffset: meshCenter.clone().multiplyScalar(-TANK_SCALE),
        };
    }, [nodes.Tank.geometry]);

    const material = useMemo(() => {
        const mat = (materials.White_object as THREE.MeshStandardMaterial).clone();
        mat.needsUpdate = true;
        return mat;
    }, [materials.White_object]);

    const cells = useMemo(
        () => buildCellPositions(spacingX, spacingZ),
        [spacingX, spacingZ],
    );

    useLayoutEffect(() => {
        const mesh = meshRef.current;
        if (!mesh) return;

        const dummy = new THREE.Object3D();
        cells.forEach((cell, index) => {
            dummy.position.copy(cell).add(centerOffset);
            dummy.scale.setScalar(TANK_SCALE);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            mesh.setMatrixAt(index, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
    }, [cells, centerOffset]);

    useEffect(() => {
        targetRef.current = visible ? 1 : 0;
    }, [visible]);

    useEffect(() => {
        return () => material.dispose();
    }, [material]);

    useFrame((_, delta) => {
        blendRef.current = THREE.MathUtils.damp(
            blendRef.current,
            targetRef.current,
            FADE_DAMP,
            delta,
        );
        const blend = blendRef.current;
        const mat = meshRef.current?.material as THREE.MeshStandardMaterial | undefined;
        if (!mat) return;

        const original = storedOpacity.get(mat) ?? 1;
        if (!storedOpacity.has(mat)) storedOpacity.set(mat, original);

        if (blend >= 0.995) {
            mat.transparent = false;
            mat.opacity = 1;
            mat.depthWrite = true;
        } else {
            mat.transparent = true;
            mat.opacity = original * blend;
            mat.depthWrite = false;
        }
        mat.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, COUNT]}
            position={center}
            castShadow
            receiveShadow
            frustumCulled={false}
        />
    );
}
