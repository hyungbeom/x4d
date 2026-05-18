'use client';

import { useMemo } from 'react';

/**
 * /map — 카메라 헬퍼 + 레이캐스트 좌표 복사
 * - /map 기본 ON (부스·카메라 편집)
 * - NEXT_PUBLIC_MAP_EDIT_TOOLS=false 로 끌 수 있음
 */
export function useMapEditTools(booth: string, searchParams: URLSearchParams): boolean {
    return useMemo(() => {
        if (process.env.NEXT_PUBLIC_MAP_EDIT_TOOLS === 'false') return false;
        if (process.env.NEXT_PUBLIC_MAP_EDIT_TOOLS === 'true') return true;
        if (process.env.NODE_ENV === 'development') return true;
        if (searchParams.get('copy') === '1') return true;
        if (searchParams.get('edit') === '0') return false;
        if (booth.trim().length > 0) return true;
        return true;
    }, [booth, searchParams]);
}
