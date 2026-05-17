'use client';

import { useEffect } from 'react';
import { useBdtecSceneLoadingActions } from '@/utils/three/SceneLoadingContext';

/** Suspense 경계 안: 3D 자식이 모두 마운트되면 ready 신호 */
export function SceneReadyGate() {
    const { setSuspenseReady } = useBdtecSceneLoadingActions();

    useEffect(() => {
        setSuspenseReady(true);
        return () => setSuspenseReady(false);
    }, [setSuspenseReady]);

    return null;
}
