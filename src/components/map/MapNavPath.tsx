'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { MapBoothMark } from '@/resources/model/MapBoothMark';
import {
    MAP_NAV_ENTRANCE_ID,
    MAP_NAV_FAST_PATH_Y_OFFSET,
    MAP_NAV_PATH_Y,
    findMapNavRoutes,
    getMapNavGraphEdges,
    getMapNavNodePosition,
} from '@/utils/map/mapNavGraph';
import type { ResolvedMapNav } from '@/utils/map/mapNavParams';

/** 입구 등 markPosition 없을 때 노드 좌표 → 마커 배치용 */
function navNodeToMarkPlacement(nodeId: string): [number, number, number] | null {
    const pos = getMapNavNodePosition(nodeId);
    if (!pos) return null;
    return [pos.x, MAP_NAV_PATH_Y - 6.7, pos.z];
}

type MapNavPathProps = {
    nav: ResolvedMapNav | null;
};

/** 노드 사이를 직선으로 연결 */
function createTubeGeometry(points: THREE.Vector3[], radius = 0.55) {
    if (points.length < 2) return null;

    const curvePath = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < points.length - 1; i += 1) {
        curvePath.add(new THREE.LineCurve3(points[i], points[i + 1]));
    }

    return new THREE.TubeGeometry(
        curvePath,
        Math.max(4, (points.length - 1) * 4),
        radius,
        6,
        false,
    );
}

function PathTube({
                      points,
                      color,
                      radius = 0.55,
                      opacity = 0.92,
                      renderOrder = 12,
                  }: {
    points: THREE.Vector3[];
    color: string;
    radius?: number;
    opacity?: number;
    renderOrder?: number;
}) {
    const geometry = useMemo(
        () => createTubeGeometry(points, radius),
        [points, radius],
    );

    if (!geometry) return null;

    return (
        <mesh geometry={geometry} renderOrder={renderOrder}>
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
}

function EndpointMarker({ nodeId, color }: { nodeId: string; color: string }) {
    const position = getMapNavNodePosition(nodeId);
    if (!position) return null;

    return (
        <mesh position={position} renderOrder={13}>
            <sphereGeometry args={[0.65, 10, 10]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.85}
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
}

/** 부스 markPosition ↔ 스냅된 네비 노드 연결선 */
function MarkToNodeConnector({
    markPosition,
    nodeId,
    color,
}: {
    markPosition: [number, number, number];
    nodeId: string;
    color: string;
}) {
    const nodePos = getMapNavNodePosition(nodeId);
    const points = useMemo(() => {
        if (!nodePos) return null;
        return [
            new THREE.Vector3(markPosition[0], MAP_NAV_PATH_Y, markPosition[2]),
            new THREE.Vector3(nodePos.x, nodePos.y, nodePos.z),
        ];
    }, [markPosition, nodePos]);

    if (!points) return null;

    return (
        <PathTube
            points={points}
            color={color}
            radius={0.22}
            opacity={0.65}
            renderOrder={14}
        />
    );
}

/** 도로망(항상 파랑) + 선택 시 빠른길·전체길 */
export function MapNavPath({ nav }: MapNavPathProps) {
    const baseRoadEdges = useMemo(() => getMapNavGraphEdges(), []);

    const routes = useMemo(() => {
        if (!nav) return { fast: [] as THREE.Vector3[], full: [] as THREE.Vector3[] };
        if (nav.fromNodeId === nav.toNodeId) {
            return { fast: [] as THREE.Vector3[], full: [] as THREE.Vector3[] };
        }
        return findMapNavRoutes(nav.fromNodeId, nav.toNodeId, nav.query.toBooth);
    }, [nav]);

    const departureMarkPosition = useMemo((): [number, number, number] | null => {
        if (!nav) return null;
        if (nav.fromMarkPosition) return nav.fromMarkPosition;
        if (nav.fromNodeId === MAP_NAV_ENTRANCE_ID) {
            return navNodeToMarkPlacement(MAP_NAV_ENTRANCE_ID);
        }
        return navNodeToMarkPlacement(nav.fromNodeId);
    }, [nav]);

    const hasAnyPath = routes.fast.length >= 2 || routes.full.length >= 2;
    const showRouteOverlay = Boolean(nav && hasAnyPath);
    const showEndpoints = Boolean(nav && nav.fromNodeId !== nav.toNodeId && hasAnyPath);
    const showDepartureMark = Boolean(nav && departureMarkPosition);

    const activeFromId = nav?.fromNodeId;
    const activeToId = nav?.toNodeId;

    const fastPathPointsYLowered = useMemo(() => {
        if (routes.fast.length < 2) return [] as THREE.Vector3[];
        return routes.fast.map(
            (p) => new THREE.Vector3(p.x, p.y + MAP_NAV_FAST_PATH_Y_OFFSET, p.z),
        );
    }, [routes.fast]);

    // ✨ 긴 배열 [a,b,c]를 [[a,b], [b,c]] 형태의 짧은 마디로 쪼개줍니다.
    const createSegments = (points: THREE.Vector3[]) => {
        const segments: Array<[THREE.Vector3, THREE.Vector3]> = [];
        for (let i = 0; i < points.length - 1; i++) {
            segments.push([points[i], points[i + 1]]);
        }
        return segments;
    };

    // ✨ 배열 쪼개기 실행
    const fastSegments = useMemo(() => createSegments(fastPathPointsYLowered), [fastPathPointsYLowered]);
    const fullSegments = useMemo(() => createSegments(routes.full), [routes.full]);

    return (
        <group name="map-nav-path">

            <group name="map-nav-base-roads">
                {baseRoadEdges.map(([from, to], i) => (
                    <PathTube
                        key={`nav-base-${i}`}
                        points={[from, to]}
                        color="#2563eb"
                        radius={0.34}
                        opacity={0.58}
                        renderOrder={6}
                    />
                ))}
            </group>

            {showRouteOverlay ? (
                <group name="map-nav-routes">
                    {/* ✨ 전체길 렌더링 변경 (통째로 렌더링 -> 마디마디 렌더링) */}
                    {fullSegments.map(([from, to], i) => (
                        <PathTube
                            key={`nav-full-${i}`}
                            points={[from, to]}
                            color="#f97316"
                            radius={0.62}
                            opacity={0.88}
                            renderOrder={11}
                        />
                    ))}

                    {/* ✨ 빠른길 렌더링 변경 (통째로 렌더링 -> 마디마디 렌더링) */}
                    {fastSegments.map(([from, to], i) => (
                        <PathTube
                            key={`nav-fast-${i}`}
                            points={[from, to]}
                            color="#ef4444"
                            radius={0.48}
                            opacity={0.92}
                            renderOrder={12}
                        />
                    ))}
                </group>
            ) : null}

            {showDepartureMark && departureMarkPosition && activeFromId ? (
                <group name="map-nav-departure">
                    <MapBoothMark
                        position={departureMarkPosition}
                        variant="departure"
                        scale={1.05}
                    />
                    <MarkToNodeConnector
                        markPosition={departureMarkPosition}
                        nodeId={activeFromId}
                        color="#22c55e"
                    />
                </group>
            ) : null}

            {showEndpoints && activeFromId && activeToId && nav ? (
                <>
                    {nav.toMarkPosition ? (
                        <MarkToNodeConnector
                            markPosition={nav.toMarkPosition}
                            nodeId={activeToId}
                            color="#ef4444"
                        />
                    ) : null}
                    <EndpointMarker nodeId={activeToId} color="#ef4444" />
                </>
            ) : null}
        </group>
    );
}

export function getMapNavPathLabel(nav: ResolvedMapNav | null): string | null {
    if (!nav) return null;
    return `도로망(파랑) · 빠른길(빨강) · ${nav.fromLabel}(${nav.fromNodeId}) → ${nav.toLabel}(${nav.toNodeId})`;
}