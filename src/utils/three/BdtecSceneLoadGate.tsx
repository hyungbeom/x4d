'use client';

import { useCallback } from 'react';
import * as THREE from 'three';
import { useSceneSuspenseReady } from '@/utils/three/useSceneSuspenseReady';
import { patchObjectMaterialsForWebGPU } from '@/utils/three/bdtecScenePrep';

/** BDTEC: GLB 로드 완료 → WebGPU 재질 패치 → 텍스처 준비 → suspenseReady */
export function BdtecSceneLoadGate() {
    const onBeforeReady = useCallback((scene: THREE.Scene) => {
        patchObjectMaterialsForWebGPU(scene);
    }, []);

    useSceneSuspenseReady({ onBeforeReady });
    return null;
}
