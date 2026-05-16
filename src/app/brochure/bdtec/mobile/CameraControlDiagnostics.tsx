'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

const DEV = process.env.NODE_ENV === 'development';
const PREFIX = '[bdtec cam-debug]';

/** 개발 빌드에서만: 포인터 경로 / R3F 상태 / Orbit 내부 이벤트를 로깅 */
export default function CameraControlDiagnostics() {
    const getThree = useThree((s) => s.get);
    const gl = useThree((s) => s.gl);

    const controlsAbsentWarnRef = useRef(false);
    const orbitDisabledWarnRef = useRef(false);
    const controlsLoggedRef = useRef(false);

    useFrame((state) => {
        if (!DEV) return;

        if (!controlsAbsentWarnRef.current && state.controls == null && state.clock.elapsedTime > 0.25) {
            controlsAbsentWarnRef.current = true;
            console.warn(PREFIX, 'store.controls 없음 (Orbit makeDefault 전이거나 아직 마운트 안 됨)');
        }

        if (
            !orbitDisabledWarnRef.current &&
            state.controls != null &&
            (state.controls as { enabled?: boolean }).enabled === false
        ) {
            orbitDisabledWarnRef.current = true;
            console.warn(PREFIX, 'store.controls.enabled === false');
        }
    });

    useEffect(() => {
        if (!DEV) return;

        const logState = (tag: string) => {
            const s = getThree();
            const events = s.events as { connected?: EventTarget | null };
            const domEl = (s.gl as { domElement?: HTMLCanvasElement }).domElement;

            const ctrls = s.controls as
                | {
                      enabled?: boolean;
                      target?: { toArray(): number[] };
                      getDistance?: () => number;
                      getPolarAngle?: () => number;
                      minDistance?: number;
                      maxDistance?: number;
                  }
                | null
                | undefined;

            const cam = s.camera as { position: { toArray(): number[] } };

            console.log(PREFIX, tag, {
                internalActive: (s as { internal?: { active?: boolean } }).internal?.active,
                frameloop: (s as { frameloop?: string }).frameloop,
                size: `${s.size?.width ?? 0}x${s.size?.height ?? 0}`,
                eventsConnectedIsGlDomElement: events?.connected === domEl,
                glDomTag: domEl?.tagName,
                cameraPosition: cam?.position?.toArray?.(),
                controlsPresent: !!ctrls,
                orbitEnabled: ctrls?.enabled,
                orbitTarget: ctrls?.target?.toArray?.(),
                orbitDistance: ctrls?.getDistance?.(),
                orbitPolarDeg: ctrls?.getPolarAngle != null ? (ctrls.getPolarAngle() * 180) / Math.PI : undefined,
                minDistance: ctrls?.minDistance,
                maxDistance: ctrls?.maxDistance,
            });
        };

        logState('마운트 직후');
        requestAnimationFrame(() => logState('rAF 다음'));
        queueMicrotask(() => logState('microtask'));
        const tid = window.setTimeout(() => logState('약 350ms 후'), 350);
        return () => window.clearTimeout(tid);
    }, [getThree]);

    const controls = useThree((s) => s.controls);

    useEffect(() => {
        if (!DEV || !controls) return;

        const canvas = gl.domElement as HTMLCanvasElement | undefined;

        const ctrls = controls as {
            enabled?: boolean;
            addEventListener?: (type: string, fn: () => void) => void;
            removeEventListener?: (type: string, fn: () => void) => void;
        };

        let changeCount = 0;
        let docMoveCount = 0;
        const onDocPointerMove = () => {
            docMoveCount += 1;
        };

        const onStart = () => {
            changeCount = 0;
            docMoveCount = 0;
            document.addEventListener('pointermove', onDocPointerMove, { capture: true });
            console.log(PREFIX, 'Orbit 이벤트: start', {
                canvasClient: canvas ? { w: canvas.clientWidth, h: canvas.clientHeight } : null,
                힌트: '드래그 시 document pointermove 횟수가 0이면 브라우저/부모가 move를 먹는 것',
            });
        };

        const onEnd = () => {
            document.removeEventListener('pointermove', onDocPointerMove, { capture: true });
            console.log(PREFIX, 'Orbit 이벤트: end', {
                documentPointermoveCount: docMoveCount,
                orbitChangeEventCount: changeCount,
                힌트:
                    docMoveCount === 0
                        ? '손가락을 움직였는데도 move=0 → 터치가 스크롤/제스처로 소비됐을 가능성'
                        : changeCount === 0
                          ? 'move는 있는데 change=0 → 극각/거리 클램프·수치 문제 의심'
                          : '정상에 가깝다면 시각만 안 바뀌는 경우(렌더/카메라)',
            });
        };

        const onChange = () => {
            changeCount += 1;
            if (changeCount === 1 || changeCount % 120 === 0) {
                console.log(PREFIX, 'Orbit 이벤트: change', { count: changeCount });
            }
        };

        if (!controlsLoggedRef.current) {
            controlsLoggedRef.current = true;
            console.log(PREFIX, 'store.controls 에 Orbit 등록됨', { orbitEnabled: ctrls.enabled });
        }

        ctrls.addEventListener?.('start', onStart);
        ctrls.addEventListener?.('end', onEnd);
        ctrls.addEventListener?.('change', onChange);

        return () => {
            document.removeEventListener('pointermove', onDocPointerMove, { capture: true });
            ctrls.removeEventListener?.('start', onStart);
            ctrls.removeEventListener?.('end', onEnd);
            ctrls.removeEventListener?.('change', onChange);
        };
    }, [controls, gl]);

    useEffect(() => {
        if (!DEV) return;
        const dom = gl.domElement as HTMLCanvasElement | undefined;
        if (!dom) return;

        const onCanvasPointerDown = () => {
            console.log(PREFIX, 'pointerdown 가 캔버스까지 도달했음');
        };
        dom.addEventListener('pointerdown', onCanvasPointerDown);

        const onDocCapture = (e: PointerEvent) => {
            const pathSnippet = e
                .composedPath()
                .slice(0, 10)
                .map((n) =>
                    n instanceof HTMLElement
                        ? `${n.tagName}${n.dataset?.bdtecCamDebugMarker ? `[${n.dataset.bdtecCamDebugMarker}]` : ''}`
                        : typeof n === 'object' && n?.constructor?.name
                          ? String(n.constructor.name)
                          : typeof n,
                );

            const leaf = e.target;
            console.log(PREFIX, 'document.pointerdown(capture 단계)', {
                leafTag: leaf instanceof HTMLElement ? leaf.tagName : typeof leaf,
                touchesCanvasSubtree: leaf instanceof Node && dom.contains(leaf as Node),
                pathSnippet,
            });
        };

        document.addEventListener('pointerdown', onDocCapture, true);

        return () => {
            dom.removeEventListener('pointerdown', onCanvasPointerDown);
            document.removeEventListener('pointerdown', onDocCapture, true);
        };
    }, [gl]);

    if (!DEV) return null;

    return null;
}
