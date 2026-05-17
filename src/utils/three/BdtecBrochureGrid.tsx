'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type BdtecBrochureGridProps = {
    fadeStrength?: number;
    cellSize?: number;
    sectionSize?: number;
    cellColor?: string | number;
    sectionColor?: string | number;
    [key: string]: any;
};

/** WebGPU 완벽 호환: 흔들림 현상(Jitter)을 수학적으로 완벽히 제거한 무한 그리드 */
export function BdtecBrochureGrid({
                                      fadeStrength = 0.12,
                                      cellSize = 32,
                                      sectionSize = 160,
                                      cellColor = '#5a6d8f',
                                      sectionColor = '#b3c4f5',
                                      ...props
                                  }: BdtecBrochureGridProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    const gridTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const cells = Math.round(sectionSize / cellSize);
        const step = size / cells;

        ctx.clearRect(0, 0, size, size);

        // 안쪽 Cell 라인
        ctx.strokeStyle = new THREE.Color(cellColor).getStyle();
        ctx.lineWidth = 2;
        for (let i = 1; i < cells; i++) {
            ctx.beginPath();
            ctx.moveTo(i * step, 0); ctx.lineTo(i * step, size);
            ctx.moveTo(0, i * step); ctx.lineTo(size, i * step);
            ctx.stroke();
        }

        // 바깥쪽 Section 라인
        ctx.strokeStyle = new THREE.Color(sectionColor).getStyle();
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, size, size);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.needsUpdate = true;
        return tex;
    }, [cellSize, sectionSize, cellColor, sectionColor]);

    const alphaTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        const safeStrength = THREE.MathUtils.clamp(fadeStrength, 0.01, 0.99);

        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1 - safeStrength, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, [fadeStrength]);

    useFrame((state) => {
        const mesh = meshRef.current;
        const cam = state.camera;
        if (!mesh || !gridTexture) return;

        // 1. 화면에 딱 맞게 판넬 크기(Span) 동적 계산
        let span = 80000;
        if (cam instanceof THREE.OrthographicCamera) {
            const w = (cam.right - cam.left) / cam.zoom;
            const h = (cam.top - cam.bottom) / cam.zoom;
            span = Math.hypot(w, h) * 1.5; // 화면 대각선보다 1.5배 크게 덮어줍니다.
        } else if (cam instanceof THREE.PerspectiveCamera) {
            span = cam.far * 2;
        }

        // 2. 💡 핵심 변경점: 메쉬를 뚝뚝 끊어 스냅하지 않고, 카메라 위치에 1:1로 부드럽게 고정합니다.
        mesh.position.x = cam.position.x;
        mesh.position.z = cam.position.z;
        mesh.scale.set(span, span, 1);

        // 3. 💡 마법의 수학: 메쉬의 크기와 위치가 실시간으로 변해도,
        // 텍스처의 타일링(Repeat)과 오프셋(UV Shift)을 월드 좌표계(0,0)에 완벽하게 고정합니다.
        gridTexture.repeat.set(span / sectionSize, span / sectionSize);
        gridTexture.offset.x = (cam.position.x - span / 2) / sectionSize;
        gridTexture.offset.y = (-cam.position.z - span / 2) / sectionSize; // Plane이 X축으로 누워있으므로 Z는 반전
    });

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            renderOrder={-1}
            frustumCulled={false}
            {...props}
        >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={gridTexture}
                alphaMap={alphaTexture}
                transparent={true}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}