'use client';

import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

type SceneEnvironmentProps = {
    colorTop?: string;
    colorBottom?: string;
    /** true: scene.background 단색 (WebGPU 안전) / false: CSS 그라데이션 노출 */
    opaque?: boolean;
};

function mixColors(top: string, bottom: string, mix = 0.42) {
    return new THREE.Color(top).lerp(new THREE.Color(bottom), mix);
}

/**
 * WebGPU 호환 배경 — CanvasTexture 그라데이션 평면 미사용 (NodeSampledTexture 오류 방지)
 */
export function SceneEnvironment({
    colorTop = '#dfd4d6',
    colorBottom = '#ebd9d8',
    opaque = false,
}: SceneEnvironmentProps) {
    const scene = useThree((state) => state.scene);

    useLayoutEffect(() => {
        scene.background = opaque ? mixColors(colorTop, colorBottom) : null;
    }, [scene, colorTop, colorBottom, opaque]);

    return null;
}
