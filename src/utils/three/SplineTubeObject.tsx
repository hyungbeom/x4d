'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// 🚀 마스크 텍스처 생성 (가장 깔끔하고 성능 좋은 방법)
const createLineMaskTexture = (pathLength: number, targetLength: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096; // 텍스처 해상도를 2배로 올려서 경계를 더 칼같이 만듭니다.
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ratio = targetLength / pathLength;
    const lineWidthInPixels = canvas.width * ratio;

    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, lineWidthInPixels, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;

    return tex;
};

export default function SplineTubeObject(props: any) {
    const { curve, pathLength } = useMemo(() => {
        const width = 139.9, height = 128.8, cornerRadius = 20;
        const path = new THREE.Path();
        const x = -width / 2; const y = -height / 2;

        path.moveTo(x + cornerRadius, y);
        path.lineTo(x + width - cornerRadius, y);
        path.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
        path.lineTo(x + width, y + height - cornerRadius);
        path.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
        path.lineTo(x + cornerRadius, y + height);
        path.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
        path.lineTo(x, y + cornerRadius);
        path.quadraticCurveTo(x, y, x + cornerRadius, y);

        // 🚀 [해결의 핵심] getPoints 대신 getSpacedPoints를 사용합니다!
        // 1000개의 점을 궤도 위에 "정확히 일정한 간격"으로 찍어서 속도/길이 변형을 원천 차단합니다.
        const points3d = path.getSpacedPoints(1000).map((p) => new THREE.Vector3(p.x, p.y, 0));
        const curve = new THREE.CatmullRomCurve3(points3d, true, 'centripetal');

        // 🚀 텍스처가 곡선에서 우는 현상을 막기 위해 정밀도를 올려줍니다.
        curve.arcLengthDivisions = 1000;

        const pathLength = curve.getLength();

        return { curve, pathLength };
    }, []);

    const lineMaskTexture = useMemo(() => createLineMaskTexture(pathLength, 10), [pathLength]);

    useFrame((state, delta) => {
        // 이동 속도
        lineMaskTexture.offset.x -= delta * 0.15;
    });

    return (
        <group {...props}>
            {/* ⚪️ 1. 바깥쪽 투명한 유리 본체 */}
            <mesh>
                {/* 곡선이 부드럽게 보이도록 튜브 세그먼트를 400으로 높였습니다 */}
                <tubeGeometry args={[curve, 400, 5, 64, true]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent={true}
                    transmission={1}
                    opacity={1}
                    roughness={0.05}
                    thickness={5}
                    ior={1.6}
                    clearcoat={1}
                />
            </mesh>

            {/* 🟢 2. 내부를 타고 도는 2x10 사이즈의 연두색 선 */}
            <mesh>
                <tubeGeometry args={[curve, 400, 1, 16, true]} />
                <meshStandardMaterial
                    color="#00ffcc"
                    emissive="#00ffcc"
                    emissiveIntensity={2}
                    alphaMap={lineMaskTexture}

                    transparent={false}
                    alphaTest={0.5}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}