'use client';

import { useEffect } from 'react';
import { useBdtecSceneLoadingActions } from '@/app/brochure/bdtec/BdtecSceneLoadingContext';

/** Suspense 경계 안: 3D 자식이 모두 마운트되면 ready 신호 */
export function BdtecSceneReadyGate() {
    const { setSuspenseReady } = useBdtecSceneLoadingActions();

    useEffect(() => {
        setSuspenseReady(true);
        return () => setSuspenseReady(false);
    }, [setSuspenseReady]);

    return null;
}
