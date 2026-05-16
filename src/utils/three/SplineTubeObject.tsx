'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// 🚀 [해결] 스플라인 특유의 '구름 노멀 맵'을 코드로 직접 생성합니다.
const createCloudNoiseMap = (size = 256) => {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 구름 형태를 위한 미세한 패턴 그리기
    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < size * size * 4; i += 4) {
        // 부드러운 노이즈 생성 (RGB는 Normal 방향, A는 투명도)
        const v = Math.random() * 255;
        imageData.data[i] = v;     // R (X 변형)
        imageData.data[i + 1] = v; // G (Y 변형)
        imageData.data[i + 2] = 255; // B (정면)
        imageData.data[i + 3] = v > 100 ? v : 0; // A (구름 형태 가리기)
    }
    ctx.putImageData(imageData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; // 🚀 핵심: 무한 반복되도록 설정
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
};

export default function SplineTubeObject(props: any) {
    // 1. Spline 수치 업데이트 (Width 131.2, Height 218.7, Corner 28)
    const curve = useMemo(() => {
        const width = 131.2, height = 218.7, cornerRadius = 28;
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

        const points3d = path.getPoints(150).map((p) => new THREE.Vector3(p.x, p.y, 0));
        return new THREE.CatmullRomCurve3(points3d, true, 'centripetal');
    }, []);

    // 2. 🚀 스플라인의 "구름 노멀 맵" 생성
    const cloudNoiseTexture = useMemo(() => createCloudNoiseMap(), []);

    // 3. 🚀 매 프레임 구름 텍스처 좌표(Offset) 애니메이션
    useFrame((state, delta) => {
        // 스플라인 속도와 맞추기 (예: 1초에 0.1 이동)
        cloudNoiseTexture.offset.x += delta * 0.1;
    });

    return (
        <group {...props}>
            {/* ⚪️ 1. 메인 유리 튜브 (본체) */}
            <mesh>
                <tubeGeometry args={[curve, 150, 5, 64, true]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent={true}       // 🚀 [해결] 유리가 영롱하게 보이려면 true!
                    transmission={1}         // 완전한 유리관 투명도
                    opacity={1}
                    roughness={0.05}         // 유리 표면 매끄러움
                    thickness={5}            // 유리 두께감
                    ior={1.5}                // 유리 굴절률
                    reflectivity={0.9}       // 반사도 (Matcap 느낌)
                    envMapIntensity={2.0}    // 환경 반사 증폭
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                />
            </mesh>

            {/* 🟢 2. 유리관 내부의 흐르는 구름 튜브 (반지름 5.01로 아주 살짝 띄움) */}
            <mesh>
                <tubeGeometry args={[curve, 150, 5.01, 64, true]} />
                <meshPhysicalMaterial
                    color="#00ffcc"           // 스플라인의 형광 연두색
                    normalMap={cloudNoiseTexture} // 🚀 [해결] 구름 텍스처를 노멀 맵에 입힘!
                    transparent={true}        // 구름 구간만 보이게 함
                    opacity={0.8}
                    roughness={0.1}
                    envMapIntensity={0.5}     // 구름은 반사를 줄임
                    depthWrite={false}        // 뒤쪽 깨짐 방지
                    toneMapped={false}        // 칙칙해지지 않게 원본 형광색 유지
                />
            </mesh>
        </group>
    );
}