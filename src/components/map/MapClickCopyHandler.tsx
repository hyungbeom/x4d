'use client';

import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { copyMapClickPosition } from '@/utils/map/copyMapCoordinates';

export const MAP_CLICK_TARGET_NAME = 'map-click-target';

const DRAG_THRESHOLD_PX = 10;

type MapClickCopyHandlerProps = {
    enabled: boolean;
    booth?: string;
    onCopied?: (text: string) => void;
    onMapNotReady?: () => void;
};

/** CameraControls와 겹쳐도 맵 클릭 좌표를 레이캐스트로 복사 */
export function MapClickCopyHandler({
    enabled,
    booth,
    onCopied,
    onMapNotReady,
}: MapClickCopyHandlerProps) {
    const { camera, scene, gl } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const pointer = useRef(new THREE.Vector2());
    const pointerDown = useRef<{ x: number; y: number; id: number } | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const canvas = gl.domElement;

        const onPointerDown = (event: PointerEvent) => {
            if (event.button !== 0) return;
            pointerDown.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
        };

        const onPointerUp = (event: PointerEvent) => {
            if (!pointerDown.current || pointerDown.current.id !== event.pointerId) return;

            const dx = event.clientX - pointerDown.current.x;
            const dy = event.clientY - pointerDown.current.y;
            pointerDown.current = null;

            if (dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
                return;
            }

            const mapRoot = scene.getObjectByName(MAP_CLICK_TARGET_NAME);
            if (!mapRoot) {
                onMapNotReady?.();
                return;
            }

            const rect = canvas.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;

            pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.current.setFromCamera(pointer.current, camera);
            const hits = raycaster.current.intersectObject(mapRoot, true);
            if (!hits.length) return;

            const hit = hits[0].point;

            void copyMapClickPosition(hit, {
                booth: booth || undefined,
                asJsonField: Boolean(booth),
            })
                .then((text) => {
                    console.log(`✅ 좌표 복사 완료: ${text}`);
                    onCopied?.(text);
                })
                .catch((err) => {
                    console.error('좌표 복사 실패:', err);
                    const fallback = `[${hit.x.toFixed(1)}, ${hit.y.toFixed(1)}, ${hit.z.toFixed(1)}]`;
                    window.prompt('클립보드 복사에 실패했습니다. 수동으로 복사하세요:', fallback);
                });
        };

        const onPointerCancel = (event: PointerEvent) => {
            if (pointerDown.current?.id === event.pointerId) {
                pointerDown.current = null;
            }
        };

        canvas.addEventListener('pointerdown', onPointerDown, { capture: true });
        canvas.addEventListener('pointerup', onPointerUp, { capture: true });
        canvas.addEventListener('pointercancel', onPointerCancel, { capture: true });

        return () => {
            canvas.removeEventListener('pointerdown', onPointerDown, { capture: true });
            canvas.removeEventListener('pointerup', onPointerUp, { capture: true });
            canvas.removeEventListener('pointercancel', onPointerCancel, { capture: true });
        };
    }, [enabled, booth, camera, scene, gl, onCopied, onMapNotReady]);

    return null;
}
