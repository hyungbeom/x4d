import CameraControls from 'camera-controls';
import type CameraControlsImpl from 'camera-controls';
import type { MapViewMode } from '@/utils/map/mapViewCamera';
import { MAP_BOOTH_ENTRY_ZOOM } from '@/utils/map/mapBoothEntryCamera';

const ACTION = CameraControls.ACTION;

const ORTHO_TOUCH_DEFAULTS = {
    one: ACTION.TOUCH_ROTATE,
    two: ACTION.TOUCH_ZOOM_TRUCK,
    three: ACTION.TOUCH_TRUCK,
} as const;

/** 2D: 탑뷰 고정 + 드래그 이동·핀치 줌 / 3D: 자유 시점 */
export function applyMapViewModeControls(
    controls: CameraControlsImpl,
    mode: MapViewMode,
) {
    controls.enabled = true;

    if (mode === '2d') {
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = 0;
        controls.azimuthRotateSpeed = 0;
        controls.polarRotateSpeed = 0;

        controls.mouseButtons.left = ACTION.TRUCK;
        controls.mouseButtons.right = ACTION.TRUCK;
        controls.mouseButtons.middle = ACTION.NONE;
        controls.mouseButtons.wheel = ACTION.ZOOM;

        controls.touches.one = ACTION.TOUCH_TRUCK;
        controls.touches.two = ACTION.TOUCH_ZOOM;
        controls.touches.three = ACTION.NONE;

        controls.minZoom = 4;
        controls.maxZoom = 40;
        controls.truckSpeed = 2.4;
        /** 핀치·휠 줌 — camera-controls: pow(0.95, delta * dollySpeed) */
        controls.dollySpeed = 7.5;
        controls.draggingSmoothTime = 0.05;
        controls.smoothTime = 0.25;
        return;
    }

    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.azimuthRotateSpeed = 1;
    controls.polarRotateSpeed = 1;

    controls.mouseButtons.left = ACTION.ROTATE;
    controls.mouseButtons.right = ACTION.TRUCK;
    controls.mouseButtons.middle = ACTION.DOLLY;
    controls.mouseButtons.wheel = ACTION.ZOOM;

    controls.touches.one = ORTHO_TOUCH_DEFAULTS.one;
    controls.touches.two = ORTHO_TOUCH_DEFAULTS.two;
    controls.touches.three = ORTHO_TOUCH_DEFAULTS.three;

    controls.minZoom = 0.5;
    controls.maxZoom = Math.max(MAP_BOOTH_ENTRY_ZOOM * 2, 30);
    controls.truckSpeed = 2;
    controls.dollySpeed = 1;
    controls.draggingSmoothTime = 0.12;
    controls.smoothTime = 0.45;
}
