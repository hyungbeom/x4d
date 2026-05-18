import type { MapCameraDeviceType, MapCameraSnapshot } from '@/utils/map/mapCameraPoints';
import { getMapCameraSnapshot } from '@/utils/map/mapCameraPoints';

/** /map?booth= 첫 진입 시 orthographic zoom */
export const MAP_BOOTH_ENTRY_ZOOM = 15;

/** top view — 카메라 Y만 올림 (c.x, c.z·타겟 t 는 스냅샷 유지) */
export const MAP_BOOTH_TOP_VIEW_CAMERA_Y = 880;

/**
 * 부스 URL 진입용 카메라: x·z 유지, c.y 만 top view, zoom 15
 */
export function getMapBoothEntryCameraSnapshot(
    booth: string,
    deviceType: MapCameraDeviceType,
): MapCameraSnapshot {
    const base = getMapCameraSnapshot(booth, deviceType);
    return {
        c: [base.c[0], MAP_BOOTH_TOP_VIEW_CAMERA_Y, base.c[2]],
        t: [base.t[0], base.t[1], base.t[2]],
        z: MAP_BOOTH_ENTRY_ZOOM,
    };
}
