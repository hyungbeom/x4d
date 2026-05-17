'use client';

import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

const MARK_URL = '/model/mark.gltf';

const MARK_TARGET_SIZE = 3;
const MARK_SURFACE_LIFT = 5.5;

function applyRedGlassMaterial(mesh: THREE.Mesh) {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => mat.dispose());

    mesh.material = new THREE.MeshPhysicalMaterial({
        color: '#ff6b7a',
        emissive: '#ff3d55',
        emissiveIntensity: 0.55,
        metalness: 0.05,
        roughness: 0.06,
        transmission: 0.92,
        thickness: 0.65,
        ior: 1.45,
        transparent: true,
        opacity: 0.92,
        attenuationColor: '#ff1744',
        attenuationDistance: 0.85,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
    mesh.renderOrder = 2;
}

/** 맵 위 부스 마커 — mark.gltf */
export function MapBoothMark({
    position,
    scale = 1,
}: {
    position: [number, number, number];
    scale?: number;
}) {
    const { scene } = useGLTF(MARK_URL);
    const [liftY, setLiftY] = useState(0);

    const mark = useMemo(() => {
        const root = scene.clone(true);
        root.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                applyRedGlassMaterial(child);
                child.castShadow = false;
                child.receiveShadow = true;
            }
        });
        return root;
    }, [scene]);

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

    return (
        <group position={[position[0], position[1] + liftY, position[2]]}>
            <pointLight color="#ff8a9b" intensity={12} distance={28} decay={2} />
            <primitive object={mark} />
        </group>
    );
}

useGLTF.preload(MARK_URL);
