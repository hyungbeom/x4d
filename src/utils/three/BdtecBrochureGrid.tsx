'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const TEXTURE_SIZE = 512;

type BdtecBrochureGridProps = {
    fadeStrength?: number;
    cellSize?: number;
    sectionSize?: number;
    cellColor?: string | number;
    sectionColor?: string | number;
    animateColors?: boolean;
    pulseSpeed?: number;
    cellColorTo?: string | number;
    sectionColorTo?: string | number;
    /** material.color를 1 초과로 펄스 (WebGPU에서도 잘 보임) */
    hdrPulse?: boolean;
};

function drawGridPattern(
    ctx: CanvasRenderingContext2D,
    size: number,
    cellSize: number,
    sectionSize: number,
    cell: THREE.Color,
    section: THREE.Color,
) {
    const cells = Math.round(sectionSize / cellSize);
    const step = size / cells;

    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = cell.getStyle();
    ctx.lineWidth = 1.5;
    for (let i = 1; i < cells; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, size);
        ctx.moveTo(0, i * step);
        ctx.lineTo(size, i * step);
        ctx.stroke();
    }

    ctx.strokeStyle = section.getStyle();
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, size, size);
}

function markCanvasTextureDirty(tex: THREE.CanvasTexture) {
    tex.needsUpdate = true;
    if (tex.source) {
        tex.source.needsUpdate = true;
    }
    tex.version += 1;
}

/** WebGPU 호환 · 월드 고정 무한 그리드 */
export function BdtecBrochureGrid({
    fadeStrength = 0.12,
    cellSize = 32,
    sectionSize = 160,
    cellColor = '#d0c8cc',
    sectionColor = '#6b8fa8',
    animateColors = false,
    pulseSpeed = 2,
    cellColorTo,
    sectionColorTo,
    hdrPulse = false,
    ...props
}: BdtecBrochureGridProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const cellFrom = useMemo(() => new THREE.Color(cellColor), [cellColor]);
    const cellTo = useMemo(() => {
        const c = new THREE.Color(cellColorTo ?? '#ffffff');
        return c;
    }, [cellColor, cellColorTo]);

    const sectionFrom = useMemo(() => new THREE.Color(sectionColor), [sectionColor]);
    const sectionTo = useMemo(() => {
        const c = new THREE.Color(sectionColorTo ?? '#c8e8ff');
        return c;
    }, [sectionColor, sectionColorTo]);

    const paintCell = useRef(new THREE.Color());
    const paintSection = useRef(new THREE.Color());
    const tintColor = useRef(new THREE.Color(1, 1, 1));

    const gridTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = TEXTURE_SIZE;
        canvas.height = TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        ctxRef.current = ctx;
        if (ctx) {
            drawGridPattern(ctx, TEXTURE_SIZE, cellSize, sectionSize, cellFrom, sectionFrom);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, [cellSize, sectionSize, cellFrom, sectionFrom]);

    const alphaTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = TEXTURE_SIZE;
        canvas.height = TEXTURE_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        const safeStrength = THREE.MathUtils.clamp(fadeStrength, 0.01, 0.99);

        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1 - safeStrength, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

        return new THREE.CanvasTexture(canvas);
    }, [fadeStrength]);

    const repaintGrid = (cell: THREE.Color, section: THREE.Color) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        drawGridPattern(ctx, TEXTURE_SIZE, cellSize, sectionSize, cell, section);
        markCanvasTextureDirty(gridTexture);
    };

    useLayoutEffect(() => {
        if (!animateColors) {
            repaintGrid(cellFrom, sectionFrom);
        }
    }, [animateColors, cellFrom, sectionFrom, cellSize, sectionSize]);

    useFrame((state) => {
        const mesh = meshRef.current;
        const cam = state.camera;
        const mat = mesh?.material as THREE.MeshBasicMaterial | undefined;
        if (!mesh || !gridTexture || !mat) return;

        if (animateColors) {
            const t = (1 + Math.sin(state.clock.elapsedTime * pulseSpeed)) / 2;

            paintCell.current.copy(cellFrom).lerp(cellTo, t);
            paintSection.current.copy(sectionFrom).lerp(sectionTo, t);
            repaintGrid(paintCell.current, paintSection.current);

            // WebGPU에서도 확실히 보이도록 map에 곱해지는 tint (예시 코드와 동일 패턴)
            if (hdrPulse) {
                mat.color.setRGB(0.85 + t * 0.35, 0.88 + t * 0.2, 1.05 + t * 0.45);
            } else {
                tintColor.current.copy(cellFrom).lerp(sectionTo, t);
                mat.color.copy(tintColor.current);
            }
            mat.needsUpdate = true;
        }

        let span = 80000;
        if (cam instanceof THREE.OrthographicCamera) {
            const w = (cam.right - cam.left) / cam.zoom;
            const h = (cam.top - cam.bottom) / cam.zoom;
            span = Math.hypot(w, h) * 20;
        } else if (cam instanceof THREE.PerspectiveCamera) {
            span = cam.far * 2;
        }

        mesh.position.x = cam.position.x;
        mesh.position.z = cam.position.z;
        mesh.scale.set(span, span, 1);

        gridTexture.repeat.set(span / sectionSize, span / sectionSize);
        gridTexture.offset.x = (cam.position.x - span / 2) / sectionSize;
        gridTexture.offset.y = (-cam.position.z - span / 2) / sectionSize;
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
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={!hdrPulse}
            />
        </mesh>
    );
};
