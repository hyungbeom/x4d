'use client';

import { Grid, type GridProps } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type BdtecBrochureGridProps = Omit<GridProps, 'infiniteGrid' | 'followCamera'>;

/** 직교·줌에 맞춰 fadeDistance를 키워 화면 안에서는 그리드가 끊기지 않게 함 */
export function BdtecBrochureGrid({
    fadeStrength = 0.12,
    fadeDistance: _fadeDistance,
    ...props
}: BdtecBrochureGridProps) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const mat = ref.current?.material as THREE.ShaderMaterial & {
            uniforms?: {
                fadeDistance?: { value: number };
                fadeStrength?: { value: number };
            };
        };
        const fadeUniform = mat?.uniforms?.fadeDistance;
        if (!fadeUniform) return;

        const cam = state.camera;
        let span = 80000;
        if (cam instanceof THREE.OrthographicCamera) {
            const w = (cam.right - cam.left) / cam.zoom;
            const h = (cam.top - cam.bottom) / cam.zoom;
            span = Math.hypot(w, h) * 120;
        } else if (cam instanceof THREE.PerspectiveCamera) {
            span = cam.far * 4;
        }
        fadeUniform.value = span;
        const strength = mat.uniforms?.fadeStrength;
        if (strength) strength.value = fadeStrength;
    });

    return (
        <Grid
            ref={ref}
            infiniteGrid
            followCamera
            fadeDistance={80000}
            fadeStrength={fadeStrength}
            renderOrder={-1}
            frustumCulled={false}
            {...props}
        />
    );
}
