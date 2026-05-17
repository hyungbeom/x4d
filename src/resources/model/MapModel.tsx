'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type CameraControlsImpl from 'camera-controls';

const MAP_URL = '/model/map.gltf';

export function MapModel({ skipAutoFit = false }: { skipAutoFit?: boolean }) {
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
        <group
            ref={groupRef}
            onClick={(e) => {
                // 💡 1. 뒤에 있는 다른 모델까지 중복 클릭되는 것을 방지합니다. (필수 권장)
                e.stopPropagation();

                // 💡 2. 마우스로 찍은 바로 그 지점의 정확한 3D 좌표 (World Coordinate)
                const clickedPoint = e.point;
                console.log('🎯 클릭한 3D 좌표 (x, y, z):', clickedPoint.x, clickedPoint.y, clickedPoint.z);

                // 💡 3. (보너스) 내가 클릭한 정확한 메쉬(Mesh) 부품이 무엇인지 알고 싶을 때
                const clickedMesh = e.object;
                console.log('📦 클릭한 부품 이름:', clickedMesh.name);
            }}
        >
            <primitive object={model} />
        </group>
    );
}

useGLTF.preload(MAP_URL);
