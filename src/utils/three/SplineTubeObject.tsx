'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// 🚀 일정 길이(7%)의 선명한 막대기를 표현하기 위한 투명도 맵 생성
const createSegmentAlphaMap = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // 경계선을 선명하게 하기 위해 고해상도 사용
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;

    // 1. 전체를 투명하게(안 보이게) 칠함
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 전체 길이의 딱 7% 구간만 하얗게(보이게) 칠함
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, canvas.width * 0.07, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; // 텍스처가 무한 반복되도록 설정
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
};

export default function SplineTubeObject(props: any) {
    // 1. Spline의 최신 수치 반영 (Width 139.9, Height 128.8, Corner 20)
    const curve = useMemo(() => {
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

        const points3d = path.getPoints(150).map((p) => new THREE.Vector3(p.x, p.y, 0));
        return new THREE.CatmullRomCurve3(points3d, true, 'centripetal');
    }, []);

    // 2. 7% 길이의 막대기 텍스처
    const segmentAlphaTexture = useMemo(() => createSegmentAlphaMap(), []);

    // 3. 🚀 매 프레임 막대기 이동 애니메이션 (스플라인의 Offset 애니메이션 역할)
    useFrame((state, delta) => {
        // 8초에 한 바퀴 도는 속도 (1초에 0.125 이동)
        // 반대 방향으로 돌고 싶다면 += 대신 -= 를 사용하세요.
        segmentAlphaTexture.offset.x -= delta * 0.125;
    });

    return (
        <group {...props}>
            {/* ⚪️ 1. 바깥쪽 투명한 본체 유리관 (반지름 5) */}
            <mesh>
                <tubeGeometry args={[curve, 150, 5, 64, true]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent={true}       // 유리의 투명함 유지
                    transmission={1}         // 완전한 유리 재질 활성화
                    opacity={1}
                    roughness={0.05}
                    thickness={5}            // 굴절 두께감
                    ior={1.6}                // 테두리 반사를 위한 굴절률
                    reflectivity={0.9}
                    envMapIntensity={2.0}    // 환경(도시 등) 반사 증폭
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                />
            </mesh>

            {/* 🟢 2. 유리관 안쪽을 돌아다니는 연두색 막대기 (반지름 1로 더 얇게) */}
            {/* 바깥쪽 유리(5)보다 얇게 만들어서 유리관 내부를 타고 도는 것처럼 연출 */}
            <mesh>
                <tubeGeometry args={[curve, 150, 1.5, 64, true]} />
                <meshBasicMaterial
                    color="#00ffcc"           // 스플라인의 형광 연두색
                    alphaMap={segmentAlphaTexture} // 🚀 핵심: 7%만 보이게 자르는 마스크
                    transparent={true}
                    depthWrite={false}        // 내부 객체가 유리와 겹쳐 깨지는 현상 방지
                    toneMapped={false}        // 색상이 칙칙해지지 않게 원본 발광색 유지
                />
            </mesh>
        </group>
    );
}