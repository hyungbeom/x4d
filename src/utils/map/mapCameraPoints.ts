/**
 * 맵(/map) 부스·포인트별 카메라 시점 (c, t, z)
 *
 * - 포인트 70개: point-001 ~ point-070
 * - CameraHelper로 복사한 `{ c, t, z }` 를 해당 슬롯의 desktop / tablet / mobile 에 붙여넣기
 * - 부스 코드(booth)가 있으면 CompanyList 부스 번호로 조회 가능
 * - 확정된 부스 설정은 `src/data/map/mapCameraOverrides.json` 에서 관리
 */

import mapCameraOverridesJson from '@/data/map/mapCameraOverrides.json';

export type MapCameraDeviceType = 'desktop' | 'tablet' | 'mobile';

/** c = 카메라 위치, t = 타겟, z = orthographic zoom */
export type MapCameraSnapshot = {
    c: [number, number, number];
    t: [number, number, number];
    z: number;
};

export type MapBoothMarkPlacement = {
    booth: string;
    /** 맵 월드 좌표 (map.gltf 센터·스케일 적용 후) */
    position: [number, number, number];
    scale?: number;
};

/** mapCameraOverrides.json 한 항목 */
export type MapCameraOverrideEntry = {
    /** point-001 ~ point-070 */
    pointId: string;
    booth: string;
    label: string;
    markPosition?: [number, number, number];
    /** 지정한 기기만 덮어씀 (보통 mobile) */
    cameras?: Partial<Record<MapCameraDeviceType, MapCameraSnapshot>>;
};

export type MapCameraPointConfig = {
    /** point-001 ~ point-070 또는 overview */
    id: string;
    /** 부스 코드 (예: G04) — URL ?booth= 와 매칭 */
    booth?: string;
    label?: string;
    cameras: Record<MapCameraDeviceType, MapCameraSnapshot>;
    /** 부스 마커(mark.gltf) 표시 위치 — 없으면 mobile.t 사용 가능 */
    markPosition?: [number, number, number];
};

export const MAP_CAMERA_POINT_COUNT = 70;

export const MAP_CAMERA_OVERVIEW_ID = 'overview';

/** 맵 진입 시 기본(전체) 시점 */
export const MAP_CAMERA_OVERVIEW: MapCameraPointConfig = {
    id: MAP_CAMERA_OVERVIEW_ID,
    label: '맵 전체',
    cameras: {
        desktop: { c: [0, 200, 800], t: [0, 0, 0], z: 1 },
        tablet: { c: [0, 250, 1000], t: [0, 0, 0], z: 1 },
        mobile: { c: [806.1, 881.4, 901.9], t: [15.2, 95.0, 14.7], z: 1.97 },
    },
};

const PLACEHOLDER_SNAPSHOT: Record<MapCameraDeviceType, MapCameraSnapshot> = {
    desktop: { c: [0, 200, 800], t: [0, 0, 0], z: 1 },
    tablet: { c: [0, 250, 1000], t: [0, 0, 0], z: 1 },
    mobile: { c: [806.1, 881.4, 901.9], t: [15.2, 95.0, 14.7], z: 1.97 },
};

/** 샘플 부스 — point-001~020 에 미리 연결 (값은 CameraHelper로 채우기) */
const SAMPLE_BOOTH_BY_INDEX: (string | undefined)[] = [
    'G04',
    'G14',
    'B05',
    'C04',
    'A12',
    'W03',
    'D18',
    'B22',
    'E09',
    'F11',
    'G08',
    'H02',
    'I15',
    'C19',
    'W07',
    'E21',
    'P06',
    'B14',
    'P12',
    'A08',
];

function cloneSnapshot(snapshot: MapCameraSnapshot): MapCameraSnapshot {
    return {
        c: [...snapshot.c] as [number, number, number],
        t: [...snapshot.t] as [number, number, number],
        z: snapshot.z,
    };
}

function cloneDeviceSnapshots(
    source: Record<MapCameraDeviceType, MapCameraSnapshot>,
): Record<MapCameraDeviceType, MapCameraSnapshot> {
    return {
        desktop: cloneSnapshot(source.desktop),
        tablet: cloneSnapshot(source.tablet),
        mobile: cloneSnapshot(source.mobile),
    };
}

function createPoint(index: number): MapCameraPointConfig {
    const booth = SAMPLE_BOOTH_BY_INDEX[index - 1];
    return {
        id: `point-${String(index).padStart(3, '0')}`,
        booth,
        label: booth ? `부스 ${booth}` : `포인트 ${index}`,
        cameras: cloneDeviceSnapshots(PLACEHOLDER_SNAPSHOT),
    };
}

/**
 * 70개 포인트 카메라 설정
 * — 각 항목의 cameras.desktop / tablet / mobile 을 헬퍼에서 복사한 값으로 교체
 */
export const MAP_CAMERA_POINTS: MapCameraPointConfig[] = Array.from(
    { length: MAP_CAMERA_POINT_COUNT },
    (_, i) => createPoint(i + 1),
);

export const MAP_CAMERA_OVERRIDES: MapCameraOverrideEntry[] =
    mapCameraOverridesJson as MapCameraOverrideEntry[];

const MAP_CAMERA_DEVICE_TYPES: MapCameraDeviceType[] = ['desktop', 'tablet', 'mobile'];

/** mapCameraOverrides.json → MAP_CAMERA_POINTS 에 병합 */
function applyMapCameraOverrides(
    points: MapCameraPointConfig[],
    overrides: MapCameraOverrideEntry[],
) {
    const byId = new Map(points.map((point) => [point.id, point]));

    for (const entry of overrides) {
        const point = byId.get(entry.pointId);
        if (!point) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`[mapCamera] override skipped: unknown pointId "${entry.pointId}"`);
            }
            continue;
        }

        point.booth = entry.booth;
        point.label = entry.label;

        if (entry.markPosition) {
            point.markPosition = [...entry.markPosition] as [number, number, number];
        }

        if (entry.cameras) {
            for (const device of MAP_CAMERA_DEVICE_TYPES) {
                const snapshot = entry.cameras[device];
                if (snapshot) {
                    point.cameras[device] = cloneSnapshot(snapshot);
                }
            }
        }
    }
}

applyMapCameraOverrides(MAP_CAMERA_POINTS, MAP_CAMERA_OVERRIDES);

export const MAP_CAMERA_POINTS_BY_ID: Record<string, MapCameraPointConfig> = {
    [MAP_CAMERA_OVERVIEW_ID]: MAP_CAMERA_OVERVIEW,
    ...Object.fromEntries(MAP_CAMERA_POINTS.map((point) => [point.id, point])),
};

export const MAP_CAMERA_POINTS_BY_BOOTH: Record<string, MapCameraPointConfig> = Object.fromEntries(
    MAP_CAMERA_POINTS.filter((point) => point.booth).map((point) => [
        point.booth!.toUpperCase(),
        point,
    ]),
);

/** point id 또는 부스 코드로 포인트 설정 조회 */
export function resolveMapCameraPoint(key: string): MapCameraPointConfig | undefined {
    const normalized = key.trim();
    if (!normalized) return undefined;

    if (MAP_CAMERA_POINTS_BY_ID[normalized]) {
        return MAP_CAMERA_POINTS_BY_ID[normalized];
    }

    return MAP_CAMERA_POINTS_BY_BOOTH[normalized.toUpperCase()];
}

/** 포인트 id / 부스 코드 → 해당 기기용 c,t,z (없으면 overview) */
export function getMapCameraSnapshot(
    key: string | null | undefined,
    deviceType: MapCameraDeviceType,
): MapCameraSnapshot {
    if (!key) {
        return MAP_CAMERA_OVERVIEW.cameras[deviceType];
    }

    const point = resolveMapCameraPoint(key);
    return point?.cameras[deviceType] ?? MAP_CAMERA_OVERVIEW.cameras[deviceType];
}

export const MAP_CAMERA_ALL_POINTS: MapCameraPointConfig[] = [
    MAP_CAMERA_OVERVIEW,
    ...MAP_CAMERA_POINTS,
];

/** 맵 위 mark.gltf 배치 목록 — boothFilter 있으면 해당 부스만 */
export function getMapBoothMarkPlacements(boothFilter?: string | null): MapBoothMarkPlacement[] {
    const all = MAP_CAMERA_POINTS.filter((point) => point.booth && point.markPosition).map(
        (point) => ({
            booth: point.booth!,
            position: point.markPosition!,
            scale: 1,
        }),
    );

    const key = boothFilter?.trim();
    if (!key) return all;

    const normalized = key.toUpperCase();
    return all.filter((placement) => placement.booth.toUpperCase() === normalized);
}
