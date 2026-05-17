'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useSyncExternalStore,
} from 'react';

export type BdtecSceneLoadingSnapshot = {
    moduleReady: boolean;
    canvasMounted: boolean;
    webgpuReady: boolean;
    suspenseReady: boolean;
    active: boolean;
    progress: number;
    item: string;
    total: number;
};

const initial: BdtecSceneLoadingSnapshot = {
    moduleReady: false,
    canvasMounted: false,
    webgpuReady: false,
    suspenseReady: false,
    active: false,
    progress: 0,
    item: '',
    total: 0,
};

type BdtecSceneLoadingActions = {
    setModuleReady: (v: boolean) => void;
    setCanvasMounted: (v: boolean) => void;
    setWebgpuReady: (v: boolean) => void;
    setSuspenseReady: (v: boolean) => void;
    setProgress: (patch: Partial<Pick<BdtecSceneLoadingSnapshot, 'active' | 'progress' | 'item' | 'total'>>) => void;
    reset: () => void;
};

const ActionsContext = createContext<BdtecSceneLoadingActions | null>(null);

/** 로더 UI 전용 — 진행률 변경 시에만 리렌더 */
function useLoadingStore(): BdtecSceneLoadingSnapshot {
    const storeRef = useContext(LoadingStoreRefContext);
    if (!storeRef) {
        throw new Error('useBdtecSceneLoadingState must be used within SceneLoadingProvider');
    }

    return useSyncExternalStore(
        storeRef.current.subscribe,
        storeRef.current.getSnapshot,
        storeRef.current.getSnapshot,
    );
}

type LoadingStore = {
    getSnapshot: () => BdtecSceneLoadingSnapshot;
    subscribe: (listener: () => void) => () => void;
    setState: (patch: Partial<BdtecSceneLoadingSnapshot>) => void;
    reset: () => void;
};

const LoadingStoreRefContext = createContext<React.RefObject<LoadingStore> | null>(null);

function createLoadingStore(): LoadingStore {
    let snapshot = { ...initial };
    const listeners = new Set<() => void>();

    return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        setState: (patch) => {
            snapshot = { ...snapshot, ...patch };
            queueMicrotask(() => {
                listeners.forEach((l) => l());
            });
        },
        reset: () => {
            snapshot = { ...initial };
            queueMicrotask(() => {
                listeners.forEach((l) => l());
            });
        },
    };
}

export function SceneLoadingProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<LoadingStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = createLoadingStore();
    }

    const setModuleReady = useCallback((moduleReady: boolean) => {
        storeRef.current?.setState({ moduleReady });
    }, []);

    const setCanvasMounted = useCallback((canvasMounted: boolean) => {
        storeRef.current?.setState({ canvasMounted });
    }, []);

    const setWebgpuReady = useCallback((webgpuReady: boolean) => {
        storeRef.current?.setState({ webgpuReady });
    }, []);

    const setSuspenseReady = useCallback((suspenseReady: boolean) => {
        storeRef.current?.setState({ suspenseReady });
    }, []);

    const setProgress = useCallback(
        (patch: Partial<Pick<BdtecSceneLoadingSnapshot, 'active' | 'progress' | 'item' | 'total'>>) => {
            storeRef.current?.setState(patch);
        },
        [],
    );

    const reset = useCallback(() => {
        storeRef.current?.reset();
    }, []);

    const actions = useMemo<BdtecSceneLoadingActions>(
        () => ({
            setModuleReady,
            setCanvasMounted,
            setWebgpuReady,
            setSuspenseReady,
            setProgress,
            reset,
        }),
        [setModuleReady, setCanvasMounted, setWebgpuReady, setSuspenseReady, setProgress, reset],
    );

    return (
        <LoadingStoreRefContext.Provider value={storeRef}>
            <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
        </LoadingStoreRefContext.Provider>
    );
}

/** Canvas·씬 — 진행률 변경 시 리렌더 없음 */
export function useBdtecSceneLoadingActions(): BdtecSceneLoadingActions {
    const ctx = useContext(ActionsContext);
    if (!ctx) {
        throw new Error('useBdtecSceneLoadingActions must be used within SceneLoadingProvider');
    }
    return ctx;
}

/** 로더 UI */
export function useBdtecSceneLoadingState(): BdtecSceneLoadingSnapshot {
    return useLoadingStore();
}

/** @deprecated 로더에서만 사용. Canvas 쪽은 useBdtecSceneLoadingActions */
export function useBdtecSceneLoading(): BdtecSceneLoadingSnapshot & BdtecSceneLoadingActions {
    return { ...useLoadingStore(), ...useBdtecSceneLoadingActions() };
}

/** 렌더러 + Suspense + 에셋 로딩 모두 준비됐는지 */
export function isBdtecSceneFullyReady(s: BdtecSceneLoadingSnapshot) {
    const pct = Math.min(100, Math.max(0, Math.round(Number.isFinite(s.progress) ? s.progress : 0)));
    const assetsDone =
        !s.active && (pct >= 100 || (s.suspenseReady && s.total === 0));
    return (
        s.moduleReady &&
        s.canvasMounted &&
        s.webgpuReady &&
        s.suspenseReady &&
        assetsDone
    );
}
