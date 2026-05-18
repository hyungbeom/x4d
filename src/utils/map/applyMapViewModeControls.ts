import type CameraControlsImpl from 'camera-controls';
import type { MapViewMode } from '@/utils/map/mapViewCamera';

/** 2D: 탑뷰 고정(회전 잠금), 3D: 자유 시점 */
export function applyMapViewModeControls(
    controls: CameraControlsImpl,
    mode: MapViewMode,
) {
    if (mode === '2d') {
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = 0;
        controls.azimuthRotateSpeed = 0;
        controls.polarRotateSpeed = 0;
    } else {
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
        controls.azimuthRotateSpeed = 1;
        controls.polarRotateSpeed = 1;
    }
}
