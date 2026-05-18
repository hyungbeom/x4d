'use client';

import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

const MARK_URL = '/model/mark.gltf';

const MARK_TARGET_SIZE = 3;
const MARK_SURFACE_LIFT = 5.5;

export type MapBoothMarkVariant = 'booth' | 'departure';

function applyMarkMaterial(mesh: THREE.Mesh, variant: MapBoothMarkVariant) {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => mat.dispose());

    const isDeparture = variant === 'departure';

    mesh.material = new THREE.MeshPhysicalMaterial({
        color: isDeparture ? '#4ade80' : '#ff6b7a',
        emissive: isDeparture ? '#22c55e' : '#ff3d55',
        emissiveIntensity: 0.55,
        metalness: 0.05,
        roughness: 0.06,
        transmission: 0.92,
        thickness: 0.65,
        ior: 1.45,
        transparent: true,
        opacity: 0.92,
        attenuationColor: isDeparture ? '#16a34a' : '#ff1744',
        attenuationDistance: 0.85,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
    mesh.renderOrder = variant === 'departure' ? 4 : 2;
}

/** 맵 위 부스 마커 — mark.gltf */
export function MapBoothMark({
    position,
    scale = 1,
    variant = 'booth',
}: {
    position: [number, number, number];
    scale?: number;
    variant?: MapBoothMarkVariant;
}) {
    const { scene } = useGLTF(MARK_URL);
    const [liftY, setLiftY] = useState(0);

    const mark = useMemo(() => {
        const root = scene.clone(true);
        root.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                applyMarkMaterial(child, variant);
                child.castShadow = false;
                child.receiveShadow = true;
            }
        });
        return root;
    }, [scene, variant]);

    useLayoutEffect(() => {
        const box = new THREE.Box3().setFromObject(mark);
        if (box.isEmpty()) return;

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const uniformScale = maxDim > 0 ? (MARK_TARGET_SIZE * scale) / maxDim : 1;

        mark.scale.setScalar(uniformScale);

        const grounded = new THREE.Box3().setFromObject(mark);
        const center = grounded.getCenter(new THREE.Vector3());
        mark.position.set(-center.x, -grounded.min.y, -center.z);

        const height = grounded.max.y - grounded.min.y;
        setLiftY(MARK_SURFACE_LIFT + height * 0.05);
    }, [mark, scale]);

    const lightColor = variant === 'departure' ? '#86efac' : '#ff8a9b';

    return (
        <group position={[position[0], position[1] + liftY, position[2]]}>
            <pointLight color={lightColor} intensity={12} distance={28} decay={2} />
            <primitive object={mark} />
        </group>
    );
}

useGLTF.preload(MARK_URL);
