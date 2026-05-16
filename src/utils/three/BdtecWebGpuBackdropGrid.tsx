'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/** WebGPU: drei `<Grid>`는 ShaderMaterial이라 NodeMaterial 파이프와 호환되지 않음 → GridHelper 사용 */
export function BdtecWebGpuBackdropGrid({
    size = 920,
    cellDivisions = 56,
    centerLineColor = 0x00c9ba,
    gridColor = 0x6a9e96,
    /** 튜브(XY 평면) 아래 XZ 바닥 — 튜브 하단(~-114)보다 낮게 */
    position = [0, -158, 0] as [number, number, number],
}: {
    size?: number;
    cellDivisions?: number;
    centerLineColor?: number;
    gridColor?: number;
    position?: [number, number, number];
}) {
    const helper = useMemo(() => {
        const h = new THREE.GridHelper(size, cellDivisions, centerLineColor, gridColor);
        // 기본 자세 = XZ 평면(Y-up 바닥). ManciniCanvas에서 카메라를 비스듬히 두어 원근감 있게 보임.
        h.position.set(...position);
        return h;
    }, [size, cellDivisions, centerLineColor, gridColor, position[0], position[1], position[2]]);

    useEffect(() => {
        return () => {
            helper.geometry.dispose();
            const mats = Array.isArray(helper.material) ? helper.material : [helper.material];
            mats.forEach((m) => m.dispose());
        };
    }, [helper]);

    return <primitive object={helper} />;
}
