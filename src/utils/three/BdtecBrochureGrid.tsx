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
    [key: string]: any; // 기타 mesh props 허용
};

/** WebGPU 완벽 호환 및 Jitter(흔들림) 완벽 제거: 바닥에 고정된 무한 그리드 착시 */
export function BdtecBrochureGrid({
                                      fadeStrength = 0.12,
                                      cellSize = 32,
                                      sectionSize = 160,
                                      cellColor = '#5a6d8f',
                                      sectionColor = '#b3c4f5',
                                      ...props
                                  }: BdtecBrochureGridProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    // 1. 💡 WebGPU 호환 그리드 텍스처 생성 (Canvas 2D API 사용)
    const gridTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        const size = 512; // 해상도
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const cells = Math.round(sectionSize / cellSize);
        const step = size / cells;

        ctx.clearRect(0, 0, size, size);

        // 안쪽 Cell 라인 그리기
        ctx.strokeStyle = new THREE.Color(cellColor).getStyle();
        ctx.lineWidth = 2; // 선명도를 위해 살짝 두껍게
        for (let i = 1; i < cells; i++) {
            ctx.beginPath();
            ctx.moveTo(i * step, 0); ctx.lineTo(i * step, size);
            ctx.moveTo(0, i * step); ctx.lineTo(size, i * step);
            ctx.stroke();
        }

        // 바깥쪽 Section 라인 그리기 (주요 눈금)
        ctx.strokeStyle = new THREE.Color(sectionColor).getStyle();
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, size, size);

        const tex = new THREE.CanvasTexture(canvas);
        // 💡 핵심: 텍스처가 무한히 반복되도록 설정합니다.
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.needsUpdate = true;
        return tex;
    }, [cellSize, sectionSize, cellColor, sectionColor]);

    // 2. 💡 부드러운 페이드아웃(Infinity 느낌)을 위한 알파맵(투명도 마스크) 생성
    const alphaTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // 중앙에서 바깥으로 갈수록 투명해지는 원형 그라데이션
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

        // 3. 💡 줌/원근에 따라 카메라를 꽉 채우는 판넬 크기(Span) 동적 계산
        let span = 80000;
        if (cam instanceof THREE.OrthographicCamera) {
            // 직교 카메라일 때는 뷰포트 크기에 비례하여 scale 설정
            const w = (cam.right - cam.left) / cam.zoom;
            const h = (cam.top - cam.bottom) / cam.zoom;
            span = Math.hypot(w, h) * 20;
        } else if (cam instanceof THREE.PerspectiveCamera) {
            // 원근 카메라일 때는 far 값에 비례하여 scale 설정
            span = cam.far * 2;
        }

        // 4. 💡 핵심: 흔들림 제거. 메쉬는 카메라를 부드럽게 따라다니게 두고,
        // 텍스처 오프셋을 수학적으로 계산하여 그리드를 월드 좌표에 고정합니다.
        mesh.position.x = cam.position.x;
        mesh.position.z = cam.position.z;
        mesh.scale.set(span, span, 1);

        // 크기에 맞춰 그리드 칸의 물리적 크기가 동일하도록 타일링(Repeat) 비율 조정
        gridTexture.repeat.set(span / sectionSize, span / sectionSize);

        // 💡 마법의 수학: 카메라 좌표를 기반으로 텍스처 오프셋(UV Shift)을 계산하여
        // 바닥에 그려진 그리드 무늬를 월드 좌표(0,0)에 고정합니다. Jitter(흔들림)가 완전히 사라집니다.
        gridTexture.offset.x = (cam.position.x - span / 2) / sectionSize;
        gridTexture.offset.y = (-cam.position.z - span / 2) / sectionSize; // Plane이 X축으로 누워있으므로 Z는 반전
    });

    if (!gridTexture) return null;

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]} // 바닥에 눕히기
            renderOrder={-1}
            frustumCulled={false}
            {...props}
        >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={gridTexture}
                alphaMap={alphaTexture} // 끝부분을 부드럽게 지워주는 그라데이션 마스크
                transparent={true}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}