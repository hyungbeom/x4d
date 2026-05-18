'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type CameraControlsImpl from 'camera-controls';
import { MAP_CLICK_TARGET_NAME } from '@/components/map/MapClickCopyHandler';

const MAP_URL = '/model/map.gltf';

type MapModelProps = {
    skipAutoFit?: boolean;
};

export function MapModel({ skipAutoFit = false }: MapModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const fittedRef = useRef(false);
    const { scene } = useGLTF(MAP_URL);
    const controls = useThree((state) => state.controls) as CameraControlsImpl | null;

    const model = useMemo(() => {
        const root = scene.clone(true);
        root.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return root;
    }, [scene]);

    useLayoutEffect(() => {
        const box = new THREE.Box3().setFromObject(model);
        if (box.isEmpty()) return;

        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0 && maxDim < 50) {
            model.scale.setScalar(50 / maxDim);
        }
    }, [model]);

    useFrame(() => {
        if (skipAutoFit || fittedRef.current || !controls?.fitToBox) return;

        const box = new THREE.Box3().setFromObject(model);
        if (box.isEmpty()) return;

        controls.fitToBox(box, true);
        fittedRef.current = true;
    });

    return (
        <group ref={groupRef} name={MAP_CLICK_TARGET_NAME}>
            <primitive object={model} />
        </group>
    );
}

useGLTF.preload(MAP_URL);
