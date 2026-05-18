'use client';

import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBdtecSceneLoadingActions } from '@/utils/three/SceneLoadingContext';
import {
    areSceneTexturesReady,
    collectSceneTextures,
    markSceneTexturesForUpload,
} from '@/utils/three/bdtecScenePrep';

const MAX_WAIT_FRAMES = 120;

type SceneReadyOptions = {
    /** 첫 paint 전에 실행 (WebGPU 재질 패치 등) */
    onBeforeReady?: (scene: THREE.Scene, gl: THREE.WebGLRenderer) => void;
};

/**
 * Suspense 경계 안에서만 사용.
 * useGLTF 등이 resolve된 뒤 마운트되며, 텍스처·재질 준비 후 suspenseReady를 켭니다.
 * (useEffect 대신 useLayoutEffect → 첫 WebGPU draw 전에 완료)
 */
export function useSceneSuspenseReady({ onBeforeReady }: SceneReadyOptions = {}) {
    const scene = useThree((s) => s.scene);
    const gl = useThree((s) => s.gl);
    const { setSuspenseReady } = useBdtecSceneLoadingActions();

    useLayoutEffect(() => {
        let cancelled = false;
        let frames = 0;

        const finish = () => {
            if (cancelled) return;
            onBeforeReady?.(scene, gl);
            setSuspenseReady(true);
        };

        const attempt = () => {
            if (cancelled) return;
            frames += 1;

            const textures = collectSceneTextures(scene);
            markSceneTexturesForUpload(textures);

            if (!areSceneTexturesReady(textures) && frames < MAX_WAIT_FRAMES) {
                requestAnimationFrame(attempt);
                return;
            }

            finish();
        };

        attempt();

        return () => {
            cancelled = true;
            setSuspenseReady(false);
        };
    }, [scene, gl, setSuspenseReady, onBeforeReady]);
}
