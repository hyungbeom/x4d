'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type CameraControlsImpl from 'camera-controls';
import { copyMapClickPosition } from '@/utils/map/copyMapCoordinates';

const MAP_URL = '/model/map.gltf';

type MapModelProps = {
    skipAutoFit?: boolean;
    /** 맵 클릭 시 월드 좌표 클립보드 복사 (개발·?copy=1) */
    copyCoordsOnClick?: boolean;
    booth?: string;
};

export function MapModel({
    skipAutoFit = false,
    copyCoordsOnClick = false,
    booth,
}: MapModelProps) {
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

    const handleMapClick = useCallback(
        (e: ThreeEvent<MouseEvent>) => {
            if (!copyCoordsOnClick) return;
            e.stopPropagation();

            void copyMapClickPosition(e.point, {
                booth: booth || undefined,
                asJsonField: Boolean(booth),
            })
                .then((copyText) => {
                    console.log(`✅ 좌표 복사 완료: ${copyText}`);
                })
                .catch((err) => {
                    console.error('좌표 복사 실패:', err);
                    const fallback = `[${e.point.x.toFixed(1)}, ${e.point.y.toFixed(1)}, ${e.point.z.toFixed(1)}]`;
                    window.prompt('클립보드 복사에 실패했습니다. 수동으로 복사하세요:', fallback);
                });
        },
        [copyCoordsOnClick, booth],
    );

    return (
        <group ref={groupRef} onClick={copyCoordsOnClick ? handleMapClick : undefined}>
            <primitive object={model} />
        </group>
    );
}

useGLTF.preload(MAP_URL);
