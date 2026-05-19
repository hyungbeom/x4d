import type { useBdtecSceneLoadingState } from '@/utils/three/SceneLoadingContext';

export function computeEnvexLoadPct(loading: ReturnType<typeof useBdtecSceneLoadingState>) {
    const { moduleReady, canvasMounted, webgpuReady, suspenseReady, active, progress } = loading;
    const assetPct = Math.min(100, Math.max(0, Math.round(Number.isFinite(progress) ? progress : 0)));

    let floor = 0;
    if (moduleReady) floor = 12;
    if (canvasMounted) floor = Math.max(floor, 22);
    if (webgpuReady) floor = Math.max(floor, 35);
    if (suspenseReady) floor = Math.max(floor, 72);
    const blended = active ? Math.max(floor, assetPct * 0.85) : Math.max(floor, assetPct);
    return Math.min(99, Math.round(blended));
}
