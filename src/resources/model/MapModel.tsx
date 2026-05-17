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
            // onClick={(e) => {
            //     // 1. 뒤에 있는 물체가 중복 클릭되는 것 방지
            //     e.stopPropagation();
            //
            //     // 2. 좌표를 보기 좋게 소수점 2자리까지만 자르기
            //     const x = e.point.x.toFixed(2);
            //     const y = e.point.y.toFixed(2);
            //     const z = e.point.z.toFixed(2);
            //
            //     // 3. 코드에 바로 붙여넣기 편하게 배열 포맷의 문자열로 만들기
            //     const copyText = `[${x}, ${y}, ${z}]`;
            //
            //     // 4. 클립보드에 바로 복사!
            //     navigator.clipboard.writeText(copyText)
            //         .then(() => {
            //             // 복사가 잘 되었는지 확인하기 위해 알림창과 콘솔 띄우기
            //             console.log(`✅ 좌표 복사 완료: ${copyText}`);
            //             alert(`좌표가 복사되었습니다!\n${copyText}`);
            //         })
            //         .catch((err) => {
            //             console.error('복사 실패:', err);
            //         });
            // }}
        >
            <primitive object={model} />
        </group>
    );
}

useGLTF.preload(MAP_URL);
