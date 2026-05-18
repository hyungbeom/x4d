'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
// ❌ drei의 Line 임포트는 지웠습니다! (WebGPU 에러 원인)

const createLineMaskTexture = (pathLength: number, targetLength: number) => {
    if (pathLength <= 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ratio = targetLength / pathLength;
    const lineWidthInPixels = canvas.width * ratio;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, lineWidthInPixels, canvas.height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
};

interface LineObjProps {
    points: THREE.Vector3[];
    isClosed?: boolean;
    type?: 'type1' | 'type2';
    lineWidth?: number; // 🚀 type2 전용 선 굵기
    [key: string]: any;
}

export default function LineObj({
                                    points,
                                    isClosed = false,
                                    type = 'type1',
                                    lineWidth = 2,
                                    tubeRadius = 5,
                                    lightRadius = 1,
                                    speed = 0.15,         // 🚀 2. 기본 속도를 기존과 동일한 0.15로 세팅!
                                    ...props
                                }: LineObjProps) {

    // 🚀 중복 점 제거 로직 (에러 방지용)
    const cleanPoints = useMemo(() => {
        if (!points || points.length < 2) return null;
        const cleaned = [points[0]];
        for (let i = 1; i < points.length; i++) {
            if (points[i].distanceTo(cleaned[cleaned.length - 1]) > 0.001) {
                cleaned.push(points[i]);
            }
        }
        return cleaned;
    }, [points]);

    // --------------------------------------------------------
    // 🟠 Type 2 (무광 오렌지/골드 두꺼운 선 - WebGPU 완벽 호환)
    // --------------------------------------------------------
    const segments = useMemo(() => {
        if (type !== 'type2' || !cleanPoints) return [];
        const segs = [];
        const up = new THREE.Vector3(0, 1, 0);

        for (let i = 0; i < cleanPoints.length - 1; i++) {
            const start = cleanPoints[i];
            const end = cleanPoints[i + 1];
            const distance = start.distanceTo(end);

            // 거리가 너무 짧으면 무시
            if (distance < 0.001) continue;

            const position = start.clone().lerp(end, 0.5);
            const direction = end.clone().sub(start).normalize();

            // 🚀 원기둥을 선 방향으로 눕히는 마법의 회전 수학 (Quaternion)
            const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

            segs.push({ distance, position, quaternion });
        }
        return segs;
    }, [cleanPoints, type]);


    // --------------------------------------------------------
    // ⚪️🟢 Type 1 (유리관 + 빛 애니메이션)
    // --------------------------------------------------------
    const tubeMemo = useMemo(() => {
        if (type !== 'type1' || !cleanPoints || cleanPoints.length < 2) return null;
        const p = [...cleanPoints];
        let autoClosed = isClosed;

        if (p[0].distanceTo(p[p.length - 1]) < 0.001) {
            autoClosed = true;
            p.pop();
        }

        if (p.length < 2) return null;

        const curvePath = new THREE.CurvePath<THREE.Vector3>();
        for (let i = 0; i < p.length - 1; i++) {
            curvePath.add(new THREE.LineCurve3(p[i], p[i + 1]));
        }
        if (autoClosed) {
            curvePath.add(new THREE.LineCurve3(p[p.length - 1], p[0]));
        }
        return { curve: curvePath, pathLength: curvePath.getLength(), finalIsClosed: autoClosed };
    }, [cleanPoints, isClosed, type]);

    const lineMaskTexture = useMemo(() => {
        if (!tubeMemo || tubeMemo.pathLength <= 0) return null;
        return createLineMaskTexture(tubeMemo.pathLength, 40);
    }, [tubeMemo]);

    useFrame((state, delta) => {
        if (lineMaskTexture) {
            lineMaskTexture.offset.x -= delta * speed;
        }
    });

    // ==========================================
    // 렌더링 파트
    // ==========================================

    // 🟠 Type 2 렌더링 (원기둥 + 구 조합)
    if (type === 'type2') {
        if (!cleanPoints || cleanPoints.length < 2) return null;
        const radius = lineWidth / 2;

        return (
            <group {...props}>
                {/* 1. 직선 구간 (원기둥) */}
                {segments.map((seg, idx) => (
                    <mesh key={`seg-${idx}`} position={seg.position} quaternion={seg.quaternion}>
                        <cylinderGeometry args={[radius, radius, seg.distance, 16]} />
                        {/* 무광 오렌지색 설정 */}
                        <meshStandardMaterial color="#FFA500" roughness={0.6} metalness={0.2} />
                    </mesh>
                ))}

                {/* 2. 둥근 관절 & 끝점 (구) - linejoin="round" 역할 */}
                {cleanPoints.map((pt, idx) => (
                    <mesh key={`joint-${idx}`} position={pt}>
                        <sphereGeometry args={[radius, 16, 16]} />
                        <meshStandardMaterial color="#FFA500" roughness={0.6} metalness={0.2} />
                    </mesh>
                ))}
            </group>
        );
    }

    // ⚪️🟢 Type 1 렌더링
    if (!tubeMemo || !lineMaskTexture) return null;

    return (
        <group {...props}>
            <mesh>
                {/* 🚀 5 대신 tubeRadius 적용 */}
                <tubeGeometry args={[tubeMemo.curve, 400, tubeRadius, 64, tubeMemo.finalIsClosed]} />
                <meshStandardMaterial
                    color="#e8f8ff"
                    transparent
                    opacity={0.38}
                    roughness={0.12}
                    metalness={0.15}
                    depthWrite={false}
                />
            </mesh>

            <mesh>
                {/* 🚀 1 대신 lightRadius 적용 */}
                <tubeGeometry args={[tubeMemo.curve, 400, lightRadius, 16, tubeMemo.finalIsClosed]} />
                <meshStandardMaterial
                    color="#00ffcc"
                    emissive="#00ffcc"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.9}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}