import createGraph from 'ngraph.graph';
import path from 'ngraph.path';
import * as THREE from 'three';
import { resolveMapCameraPoint } from '@/utils/map/mapCameraPoints';

/** 그래프 2D 좌표 — Three.js에서는 (x, floorY, z) 로 z = data.y */
export type MapNavNodeData = {
    x: number;
    y: number;
};

// ... (상수 선언 부분 생략: 기존과 동일) ...
export const MAP_NAV_ENTRANCE_ID = 'ENTRANCE'; // ✨ 기존 'a'에서 'ENTRANCE'로 수정 권장 (시작점 ID 불일치 방지)
export const MAP_NAV_ENTRANCE_LABEL = '입구';
export const MAP_NAV_SAMPLE_BOOTH = 'A12';
export const MAP_NAV_PATH_Y = 1.2;
export const MAP_NAV_FAST_PATH_Y_OFFSET = 0.5;

// ---------------------------------------------------------
// 1. 노드(점) 데이터 정의
// ---------------------------------------------------------
const RAW_NODES: Record<string, MapNavNodeData> = {
    // 🚪 입구
    ENTRANCE: { x: -83.0, y: -49.0 },

    // 🔴 R1 (가로 1번째 줄 / y: -44.4 고정)
    R1_C1: { x: -92.8, y: -44.4 },
    R1_ENT: { x: -83.0, y: -44.4 },
    R1_C2: { x: -69.6, y: -44.4 },
    R1_C3: { x: -52.5, y: -44.4 },
    R1_C4: { x: -36.2, y: -44.4 },
    R1_C5: { x: -20.0, y: -44.4 },
    R1_C6: { x:   3.0, y: -44.4 },
    R1_C7: { x:  26.0, y: -44.4 },

    // 🔴 R2 (가로 2번째 줄 / y: -36.7)
    R2_C1: { x: -92.8, y: -36.7 },
    R2_C2: { x: -69.6, y: -36.7 },
    R2_C3: { x: -52.5, y: -36.7 },
    R2_C4: { x: -36.2, y: -36.7 },
    R2_C5: { x: -20.0, y: -36.7 },
    R2_C6: { x:   3.0, y: -36.7 },
    R2_C7: { x:  26.0, y: -36.7 },

    // 🔴 R3 (가로 3번째 줄 / y: -29.1)
    R3_C1: { x: -92.8, y: -29.1 },
    R3_C2: { x: -69.6, y: -29.1 },
    R3_C3: { x: -52.5, y: -29.1 },
    R3_C4: { x: -36.2, y: -29.1 },
    R3_C5: { x: -20.0, y: -29.1 },
    R3_C6: { x:   3.0, y: -29.1 },
    R3_C7: { x:  26.0, y: -29.1 },

    // 🔴 R4 (가로 4번째 줄 / y: -21.5)
    R4_C1: { x: -92.8, y: -21.5 },
    R4_C2: { x: -69.6, y: -21.5 },
    R4_C3: { x: -52.5, y: -21.5 },
    R4_C4: { x: -36.2, y: -21.5 },
    R4_C5: { x: -20.0, y: -21.5 },
    R4_MID56: { x: -12, y: -21.5 },
    R4_C6: { x:   3.0, y: -21.5 },
    R4_C7: { x:  26.0, y: -21.5 },

    // 🔴 R5 (가로 5번째 줄)
    R5_C1: { x: -92.8, y: -11.0 },
    R5_MID12: { x: -85.0, y: -11.0 },
    R5_C2_DOWN: { x: -69.6, y: -11.0 },
    R5_C2: { x: -69.6, y: -14.0 },
    R5_C3: { x: -52.5, y: -14.0 },
    R5_C4: { x: -36.2, y: -14.0 },
    R5_C5: { x: -20.0, y: -14.0 },
    R5_C5_DOWN: { x: -20.0, y: -11.0 },
    R5_MID56: { x: -12, y: -11.0 },
    R5_C6: { x:   3.0, y: -11.0 },
    R5_MID67: { x: 18, y: -11.0 },
    R5_C7: { x:  26.0, y: -11.0 },

    // 🔴 R6 (가로 6번째 줄 / y: -6.0 & -3.0)
    R6_C1: { x: -92.8, y: -3.0 },
    R6_MID12: { x: -85.0, y: -3.0 },
    R6_C2: { x: -69.6, y: -6 },
    R6_C3: { x: -52.5, y: -6 },
    R6_C4: { x: -36.2, y: -6 },
    R6_C5: { x: -20.0, y: -6 },
    R6_MID56: { x: -12, y: -6 },
    R6_C6: { x:   3.0, y: -6 },
    R6_MID67: { x: 18, y: -3.0 },
    R6_C7: { x:  26.0, y: -3.0 },

    // 🔴 R7 (가로 7번째 줄)
    R7_C1: { x: -92.8, y: 5 },
    R7_MID12: { x: -85.0, y: 5 },
    R7_C2: { x: -69.6, y: 5 },
    R7_C3: { x: -52.5, y: 5 },
    R7_C4_DOWN: { x: -36.2, y: 5 },
    R7_C4: { x: -36.2, y: 2.0 },
    R7_C5: { x: -20.0, y: 2.0 },
    R7_C6: { x:   3.0, y: 2.0 },
    R7_MID67: { x: 18, y: 2.0 },
    R7_C7: { x:  26.0, y: 2.0 },

    // 🔴 R8 (기존 R7 / y: 13.0)
    R8_C1: { x: -92.8, y: 13.0 },
    R8_C2: { x: -69.6, y: 13.0 },
    R8_C3: { x: -52.5, y: 13.0 },
    R8_C4: { x: -36.2, y: 13.0 },
    R8_C5: { x: -20.0, y: 13.0 },
    R8_C6: { x:   3.0, y: 13.0 },
    R8_C7: { x:  26.0, y: 13.0 },

    // 🔴 R9 (✨ 게이트 쪽으로 뻗어나가는 세로줄을 위한 노드 / y: 21.0)
    R9_C2: { x: -69.6, y: 26.0 },
    R9_C6: { x:   3.0, y: 26.0 },
    R9_C7: { x:   59.5, y: 26.0 },
    R9_C8: { x:   61.0, y: 26.0 },
    R9_C9: { x:   67.8, y: 26.0 },

    R9_C7_up: { x:   59.5, y: 8.0 },
    R9_C8_down: { x:  61.0, y: 47.5 },
    R9_C9_down: { x:  67.8, y: 47.5 },
    R9_C9_up: { x:  67.8, y: 8.0 },
};

// ---------------------------------------------------------
// 2. 링크(길) 연결 데이터
// ---------------------------------------------------------
const RAW_LINKS: [string, string][] = [
    // 🚪 입구 연결
    ['ENTRANCE', 'R1_ENT'],

    // ------------------------------------
    // ➡️ 가로 도로망 (왼쪽에서 오른쪽으로)
    // ------------------------------------
    ['R1_C1', 'R1_ENT'], ['R1_ENT', 'R1_C2'], ['R1_C2', 'R1_C3'], ['R1_C3', 'R1_C4'], ['R1_C4', 'R1_C5'], ['R1_C5', 'R1_C6'], ['R1_C6', 'R1_C7'],
    ['R2_C1', 'R2_C2'], ['R2_C2', 'R2_C3'], ['R2_C3', 'R2_C4'], ['R2_C4', 'R2_C5'], ['R2_C5', 'R2_C6'], ['R2_C6', 'R2_C7'],
    ['R3_C1', 'R3_C2'], ['R3_C2', 'R3_C3'], ['R3_C3', 'R3_C4'], ['R3_C4', 'R3_C5'], ['R3_C5', 'R3_C6'], ['R3_C6', 'R3_C7'],

    // R4 라인 가로길
    ['R4_C1', 'R4_C2'], ['R4_C2', 'R4_C3'], ['R4_C3', 'R4_C4'], ['R4_C4', 'R4_C5'],
    ['R4_C5', 'R4_MID56'], ['R4_MID56', 'R4_C6'],
    ['R4_C6', 'R4_C7'],

    // R5 라인 (ㄷ자 형태)
    ['R5_C1', 'R5_MID12'],
    ['R5_MID12', 'R5_C2_DOWN'],
    ['R5_C2_DOWN', 'R5_C2'],
    ['R5_C2', 'R5_C3'],
    ['R5_C3', 'R5_C4'],
    ['R5_C4', 'R5_C5'],
    ['R5_C5', 'R5_C5_DOWN'],

    ['R5_C6', 'R5_MID67'], ['R5_MID67', 'R5_C7'],

    // R6 라인 가로 연결
    ['R6_C2', 'R6_C3'], ['R6_C3', 'R6_C4'], ['R6_C4', 'R6_C5'],
    ['R6_C5', 'R6_MID56'], ['R6_MID56', 'R6_C6'],

    // R7 라인 가로길
    ['R7_C1', 'R7_MID12'], ['R7_MID12', 'R7_C2'], ['R7_C2', 'R7_C3'],
    ['R7_C3', 'R7_C4_DOWN'], ['R7_C4_DOWN', 'R7_C4'],
    ['R7_C4', 'R7_C5'], ['R7_C5', 'R7_C6'],
    ['R7_C6', 'R7_MID67'], ['R7_MID67', 'R7_C7'],

    // R8 라인
    ['R8_C1', 'R8_C2'], ['R8_C2', 'R8_C3'], ['R8_C3', 'R8_C4'], ['R8_C4', 'R8_C5'], ['R8_C5', 'R8_C6'], ['R8_C6', 'R8_C7'],

    // ------------------------------------
    // ⬇️ 세로 도로망 (위에서 아래로)
    // ------------------------------------
    // C1 라인
    ['R1_C1', 'R2_C1'], ['R2_C1', 'R3_C1'], ['R3_C1', 'R4_C1'], ['R4_C1', 'R5_C1'], ['R5_C1', 'R6_C1'], ['R6_C1', 'R7_C1'], ['R7_C1', 'R8_C1'],

    // 수직 샛길 1 (왼쪽: C1과 C2 사이)
    ['R5_MID12', 'R6_MID12'], ['R6_MID12', 'R7_MID12'],

    // C2 라인
    ['R1_C2', 'R2_C2'], ['R2_C2', 'R3_C2'], ['R3_C2', 'R4_C2'], ['R4_C2', 'R5_C2'], ['R5_C2_DOWN', 'R6_C2'], ['R6_C2', 'R7_C2'], ['R7_C2', 'R8_C2'], ['R8_C2', 'R9_C2'],

    // C3 라인
    ['R1_C3', 'R2_C3'], ['R2_C3', 'R3_C3'], ['R3_C3', 'R4_C3'], ['R4_C3', 'R5_C3'], ['R5_C3', 'R6_C3'], ['R6_C3', 'R7_C3'], ['R7_C3', 'R8_C3'],

    // C4 라인
    ['R1_C4', 'R2_C4'], ['R2_C4', 'R3_C4'], ['R3_C4', 'R4_C4'], ['R4_C4', 'R5_C4'], ['R5_C4', 'R6_C4'], ['R6_C4', 'R7_C4'], ['R7_C4_DOWN', 'R8_C4'],

    // C5 라인
    ['R1_C5', 'R2_C5'], ['R2_C5', 'R3_C5'], ['R3_C5', 'R4_C5'], ['R4_C5', 'R5_C5'], ['R5_C5_DOWN', 'R6_C5'], ['R6_C5', 'R7_C5'], ['R7_C5', 'R8_C5'],

    // 수직 샛길 3 (중앙)
    ['R4_MID56', 'R5_MID56'], ['R5_MID56', 'R6_MID56'],

    // C6 라인
    ['R1_C6', 'R2_C6'], ['R2_C6', 'R3_C6'], ['R3_C6', 'R4_C6'], ['R4_C6', 'R5_C6'], ['R5_C6', 'R6_C6'], ['R6_C6', 'R7_C6'], ['R7_C6', 'R8_C6'], ['R8_C6', 'R9_C6'],

    // 수직 샛길 2 (오른쪽: C6과 C7 사이)
    ['R5_MID67', 'R6_MID67'], ['R6_MID67', 'R7_MID67'],

    // C7 라인
    ['R1_C7', 'R2_C7'], ['R2_C7', 'R3_C7'], ['R3_C7', 'R4_C7'], ['R4_C7', 'R5_C7'], ['R5_C7', 'R6_C7'], ['R6_C7', 'R7_C7'], ['R7_C7', 'R8_C7'],

    ['R9_C2', 'R9_C6'],      ['R9_C6', 'R9_C7'], ['R9_C7', 'R9_C8'], ['R9_C8', 'R9_C9'],
    ['R9_C7', 'R9_C7_up'],['R9_C8', 'R9_C8_down'],['R9_C9', 'R9_C9_up'],['R9_C9', 'R9_C9_down']
];


// ---------------------------------------------------------
// ✨ 마법의 분할 함수 (각 선분을 3등분하여 노드를 2개씩 추가)
// ---------------------------------------------------------
function subdivideGraph(
    originalNodes: Record<string, MapNavNodeData>,
    originalLinks: [string, string][]
) {
    const expandedNodes: Record<string, MapNavNodeData> = { ...originalNodes };
    const expandedLinks: [string, string][] = [];

    originalLinks.forEach(([startId, endId]) => {
        const startNode = originalNodes[startId];
        const endNode = originalNodes[endId];

        // 노드가 없는 등 문제가 있는 연결선은 무시
        if (!startNode || !endNode) return;

        // 새로운 중간 노드 ID 생성
        const mid1Id = `${startId}_to_${endId}_1`;
        const mid2Id = `${startId}_to_${endId}_2`;

        // 3등분 하는 좌표 계산
        const dx = (endNode.x - startNode.x) / 3;
        const dy = (endNode.y - startNode.y) / 3;

        // 새로운 중간 노드를 expandedNodes 객체에 등록
        expandedNodes[mid1Id] = { x: startNode.x + dx, y: startNode.y + dy };
        expandedNodes[mid2Id] = { x: startNode.x + dx * 2, y: startNode.y + dy * 2 };

        // 기존 1개의 긴 선을 3개의 짧은 선으로 교체
        expandedLinks.push([startId, mid1Id]);
        expandedLinks.push([mid1Id, mid2Id]);
        expandedLinks.push([mid2Id, endId]);
    });

    return { SAMPLE_NODES: expandedNodes, SAMPLE_LINKS: expandedLinks };
}

// ✨ 드디어 쪼개진 데이터를 전역 변수로 저장!
const { SAMPLE_NODES, SAMPLE_LINKS } = subdivideGraph(RAW_NODES, RAW_LINKS);
// ---------------------------------------------------------


/** 전체길: 목적지별 waypoint (비어 있으면 빠른길만) */
const BOOTH_FULL_ROUTE: Record<string, string[]> = {};

let graphInstance: ReturnType<typeof createGraph<MapNavNodeData>> | null = null;

function buildSampleGraph() {
    const graph = createGraph<MapNavNodeData>();

    // ✨ 이제 쪼개진 SAMPLE_NODES가 들어감
    for (const [id, data] of Object.entries(SAMPLE_NODES)) {
        graph.addNode(id, data);
    }

    // ✨ 쪼개진 SAMPLE_LINKS가 들어감
    for (const [from, to] of SAMPLE_LINKS) {
        graph.addLink(from, to);
    }

    return graph;
}

function getGraph() {
    if (!graphInstance) {
        graphInstance = buildSampleGraph();
    }
    return graphInstance;
}

function navNodeToVector3(data: MapNavNodeData): THREE.Vector3 {
    return new THREE.Vector3(data.x, MAP_NAV_PATH_Y, data.y);
}

function pathFromNodeIds(nodeIds: string[]): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    for (const id of nodeIds) {
        const data = SAMPLE_NODES[id]; // ✨ 쪼개진 노드 데이터 참조
        if (data) points.push(navNodeToVector3(data));
    }
    return points;
}

export type MapNavRoutePaths = {
    /** A* 최단 거리 */
    fast: THREE.Vector3[];
    /** 전 구간 경유 (부스1 등 포함) */
    full: THREE.Vector3[];
};

export type NearestNavNodeResult = {
    nodeId: string;
    /** markPosition ↔ 노드 거리 (XZ 평면) */
    distance: number;
};

/** markPosition [x,y,z] 에서 가장 가까운 네비 그래프 노드 */
export function findNearestNavNodeToMarkPosition(
    markPosition: [number, number, number],
): NearestNavNodeResult | null {
    const [mx, , mz] = markPosition;
    let bestId: string | null = null;
    let bestDist = Infinity;

    for (const [id, data] of Object.entries(SAMPLE_NODES)) {
        const dx = data.x - mx;
        const dz = data.y - mz;
        const distSq = dx * dx + dz * dz;
        if (distSq < bestDist) {
            bestDist = distSq;
            bestId = id;
        }
    }

    if (!bestId) return null;
    return { nodeId: bestId, distance: Math.sqrt(bestDist) };
}

/** 부스 markPosition → 최근접 네비 노드 id */
export function boothToNavNodeId(boothCode: string): string | null {
    const mark = getBoothMarkPosition(boothCode);
    if (!mark) return null;
    return findNearestNavNodeToMarkPosition(mark)?.nodeId ?? null;
}

/** mapCameraOverrides 의 markPosition */
export function getBoothMarkPosition(
    boothCode: string,
): [number, number, number] | null {
    const point = resolveMapCameraPoint(boothCode.trim());
    return point?.markPosition ?? null;
}

/** 부스 → 최근접 노드 (디버그·UI용) */
export function resolveBoothToNearestNavNode(boothCode: string): {
    booth: string;
    markPosition: [number, number, number];
    nearest: NearestNavNodeResult;
} | null {
    const booth = boothCode.trim().toUpperCase();
    const markPosition = getBoothMarkPosition(booth);
    if (!markPosition) return null;
    const nearest = findNearestNavNodeToMarkPosition(markPosition);
    if (!nearest) return null;
    return { booth, markPosition, nearest };
}

/** 빠른길 — ngraph A* */
export function findMapNavFastPath(
    fromNodeId: string,
    toNodeId: string,
): THREE.Vector3[] {
    if (fromNodeId === toNodeId) return [];

    const graph = getGraph();
    if (!graph.getNode(fromNodeId) || !graph.getNode(toNodeId)) return [];

    const pathFinder = path.aStar(graph, {
        distance(fromNode, toNode) {
            const a = fromNode.data;
            const b = toNode.data;
            if (!a || !b) return 1;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            return Math.sqrt(dx * dx + dy * dy); // ✨ 유클리드 거리로 정확하게 계산
        },
    });

    const foundPath = pathFinder.find(fromNodeId, toNodeId);
    if (!foundPath || foundPath.length === 0) return [];

    const points: THREE.Vector3[] = [];
    for (let i = foundPath.length - 1; i >= 0; i -= 1) {
        const data = foundPath[i].data;
        if (data) points.push(navNodeToVector3(data));
    }

    return points;
}

/** 전체길 — 목적지별 waypoint, 출발 노드부터 slice */
export function findMapNavFullPath(
    fromNodeId: string,
    toNodeId: string,
    destinationBooth: string,
): THREE.Vector3[] {
    const code = destinationBooth.trim().toUpperCase();
    const route = BOOTH_FULL_ROUTE[code];
    if (!route) return [];

    const destIndex = route.indexOf(toNodeId);
    if (destIndex === -1) return [];

    const startIndex = route.indexOf(fromNodeId);
    if (startIndex === -1 || startIndex > destIndex) return [];

    return pathFromNodeIds(route.slice(startIndex, destIndex + 1));
}

export function findMapNavRoutes(
    fromNodeId: string,
    toNodeId: string,
    destinationBooth: string,
): MapNavRoutePaths {
    return {
        fast: findMapNavFastPath(fromNodeId, toNodeId),
        full: findMapNavFullPath(fromNodeId, toNodeId, destinationBooth),
    };
}

/** @deprecated findMapNavRoutes 사용 */
export function findMapNavRoutesToBooth(fromNodeId: string, boothCode: string) {
    const toNodeId = boothToNavNodeId(boothCode);
    if (!toNodeId) return { fast: [], full: [] };
    return findMapNavRoutes(fromNodeId, toNodeId, boothCode);
}

export function getMapNavSampleNodeIds(): string[] {
    return Object.keys(SAMPLE_NODES);
}

export function getMapNavNodePosition(nodeId: string): THREE.Vector3 | null {
    const data = SAMPLE_NODES[nodeId];
    return data ? navNodeToVector3(data) : null;
}

/** 네비 그래프의 모든 간선 — 항상 도로망(파랑)으로 표시 */
export function getMapNavGraphEdges(): Array<[THREE.Vector3, THREE.Vector3]> {
    const out: Array<[THREE.Vector3, THREE.Vector3]> = [];
    for (const [fromId, toId] of SAMPLE_LINKS) {
        const a = SAMPLE_NODES[fromId];
        const b = SAMPLE_NODES[toId];
        if (!a || !b) continue;
        out.push([navNodeToVector3(a), navNodeToVector3(b)]);
    }
    return out;
}

export function isMapNavRoutableBooth(booth: string): boolean {
    return Boolean(boothToNavNodeId(booth));
}

/** @deprecated isMapNavRoutableBooth */
export function isMapNavSampleBooth(booth: string): boolean {
    return isMapNavRoutableBooth(booth);
}