"use client";

import React, { createContext, useContext, useRef } from "react";

const BdtecHeroScrollContainerContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export function BdtecHeroScrollContainerProvider({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    return <BdtecHeroScrollContainerContext.Provider value={ref}>{children}</BdtecHeroScrollContainerContext.Provider>;
}

export function useBdtecHeroScrollContainerRef() {
    const ctx = useContext(BdtecHeroScrollContainerContext);
    if (!ctx) {
        throw new Error("BdtecHeroScrollContainerProvider 안에서만 useBdtecHeroScrollContainerRef를 사용하세요.");
    }
    return ctx;
}

/** Canvas 내부 등 Provider 밖 후보에서 사용 시 null 가능 */
export function useOptionalBdtecHeroScrollContainerRef() {
    return useContext(BdtecHeroScrollContainerContext);
}
