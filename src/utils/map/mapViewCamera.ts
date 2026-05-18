import type { MapCameraDeviceType, MapCameraSnapshot } from '@/utils/map/mapCameraPoints';
import {
    MAP_CAMERA_OVERVIEW,
    getMapCameraSnapshot,
} from '@/utils/map/mapCameraPoints';
import { getBoothMarkPosition } from '@/utils/map/mapNavGraph';
import {
    MAP_BOOTH_ENTRY_ZOOM,
    MAP_BOOTH_TOP_VIEW_CAMERA_Y,
} from '@/utils/map/mapBoothEntryCamera';

export type MapViewMode = '2d' | '3d';

/** 2D 탑뷰 — markPosition 을 화면 중심(타겟)으로 */
export function getMap2DTopViewSnapshot(
    boothCode: string | null | undefined,
    deviceType: MapCameraDeviceType,
): MapCameraSnapshot {
    const mark = boothCode?.trim() ? getBoothMarkPosition(boothCode) : null;

    if (mark) {
        const [x, y, z] = mark;
        return {
            c: [x, MAP_BOOTH_TOP_VIEW_CAMERA_Y, z],
            t: [x, y, z],
            z: MAP_BOOTH_ENTRY_ZOOM,
        };
    }

    const overview = MAP_CAMERA_OVERVIEW.cameras[deviceType];
    return {
        c: [overview.t[0], MAP_BOOTH_TOP_VIEW_CAMERA_Y, overview.t[2]],
        t: [...overview.t],
        z: MAP_BOOTH_ENTRY_ZOOM,
    };
}

/** 3D — mapCameraOverrides cameras (mobile/desktop 등) */
export function getMap3DViewSnapshot(
    boothCode: string | null | undefined,
    deviceType: MapCameraDeviceType,
): MapCameraSnapshot {
    if (boothCode?.trim()) {
        return getMapCameraSnapshot(boothCode, deviceType);
    }
    return MAP_CAMERA_OVERVIEW.cameras[deviceType];
}
