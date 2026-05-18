import type { ReadonlyURLSearchParams } from 'next/navigation';
import {
    MAP_NAV_ENTRANCE_ID,
    MAP_NAV_ENTRANCE_LABEL,
    boothToNavNodeId,
    getBoothMarkPosition,
} from '@/utils/map/mapNavGraph';

/** URL 쿼리 — ?booth= 목적지, ?from= 출발(기업찾기) */
export type MapNavQuery = {
    /** 목적지 부스 (?booth 또는 ?to) */
    toBooth: string;
    /** 출발 부스 (?from) — 없으면 입구 */
    fromBooth: string;
};

export type ResolvedMapNav = {
    query: MapNavQuery;
    fromNodeId: string;
    toNodeId: string;
    fromLabel: string;
    toLabel: string;
    /** 출발 부스 markPosition (from 없으면 입구 노드만) */
    fromMarkPosition: [number, number, number] | null;
    /** 목적지 부스 markPosition */
    toMarkPosition: [number, number, number] | null;
};

export function parseMapNavQuery(
    searchParams: URLSearchParams | ReadonlyURLSearchParams,
): MapNavQuery {
    return {
        toBooth: (searchParams.get('booth') ?? searchParams.get('to') ?? '').trim(),
        fromBooth: (searchParams.get('from') ?? '').trim(),
    };
}

/** 목적지가 있을 때만 길찾기 엔드포인트 반환 */
export function resolveMapNav(
    searchParams: URLSearchParams | ReadonlyURLSearchParams,
): ResolvedMapNav | null {
    const query = parseMapNavQuery(searchParams);
    if (!query.toBooth) return null;

    const toNodeId = boothToNavNodeId(query.toBooth);
    if (!toNodeId) return null;

    const toMarkPosition = getBoothMarkPosition(query.toBooth);

    if (query.fromBooth) {
        const fromNodeId = boothToNavNodeId(query.fromBooth);
        if (!fromNodeId) return null;
        return {
            query,
            fromNodeId,
            toNodeId,
            fromLabel: query.fromBooth.toUpperCase(),
            toLabel: query.toBooth.toUpperCase(),
            fromMarkPosition: getBoothMarkPosition(query.fromBooth),
            toMarkPosition,
        };
    }

    return {
        query,
        fromNodeId: MAP_NAV_ENTRANCE_ID,
        toNodeId,
        fromLabel: MAP_NAV_ENTRANCE_LABEL,
        toLabel: query.toBooth.toUpperCase(),
        fromMarkPosition: null,
        toMarkPosition,
    };
}

/** 기업찾기 선택 → 출발지 갱신 (목적지 ?booth= 는 유지) */
export function buildMapUrlAfterCompanySelect(
    current: URLSearchParams | ReadonlyURLSearchParams,
    selectedBooth: string,
): string {
    const code = selectedBooth.trim();
    const params = new URLSearchParams(current.toString());
    const dest = (params.get('booth') ?? params.get('to') ?? '').trim();

    if (dest) {
        if (dest.toUpperCase() === code.toUpperCase()) {
            params.delete('from');
        } else {
            params.set('from', code);
        }
    } else {
        params.set('from', code);
        params.delete('booth');
        params.delete('to');
    }

    const qs = params.toString();
    return qs ? `/map?${qs}` : '/map';
}

/** 목적지 부스 URL (?booth=) — 기존 출발지 유지 */
export function buildMapUrlForDestination(
    current: URLSearchParams | ReadonlyURLSearchParams,
    destinationBooth: string,
): string {
    const code = destinationBooth.trim();
    if (!code) return '/map';

    const params = new URLSearchParams(current.toString());
    params.set('booth', code);
    params.delete('to');

    const qs = params.toString();
    return qs ? `/map?${qs}` : '/map';
}

/** 길찾기 모달 — 출발·도착 부스 동시 설정 */
export function buildMapUrlForNavRoute(
    current: URLSearchParams | ReadonlyURLSearchParams,
    fromBooth: string,
    toBooth: string,
): string {
    const to = toBooth.trim();
    if (!to) return '/map';

    const params = new URLSearchParams(current.toString());
    params.set('booth', to);
    params.delete('to');

    const from = fromBooth.trim();
    if (from) params.set('from', from);
    else params.delete('from');

    const qs = params.toString();
    return qs ? `/map?${qs}` : '/map';
}
