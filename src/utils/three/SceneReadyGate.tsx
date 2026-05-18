'use client';

import { useSceneSuspenseReady } from '@/utils/three/useSceneSuspenseReady';

/** Suspense 경계 안: 3D 자식·텍스처 준비 후 ready 신호 (useLayoutEffect) */
export function SceneReadyGate() {
    useSceneSuspenseReady();
    return null;
}
