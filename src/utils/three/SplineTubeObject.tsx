'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// 🚀 칼같이 잘린 2x10 사이즈 막대기용 마스크 텍스처 생성
const createLineMaskTexture = (pathLength: number, targetLength: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; // 초고해상도로 경계를 날카롭게 만듭니다.
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;

    // 1. 전체 투명하게 초기화
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 전체 궤도 길이(pathLength) 대비 막대기 길이(targetLength=10)의 비율 계산
    const ratio = targetLength / pathLength;
    const lineWidthInPixels = canvas.width * ratio;

    // 3. 딱 그 비율(길이 10)만큼만 하얗게(불투명하게) 칠함
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, lineWidthInPixels, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;

    // 흐릿하게 번지지 않고 단단한 직사각형 형태를 유지하도록 필터 설정
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;

    return tex;
};

export default function SplineTubeObject(props: any) {
    // 1. Spline 궤도(Path) 생성
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

        const points3d = path.getPoints(150).map((p) => new THREE.Vector3(p.x, p.y, 0));
        const curve = new THREE.CatmullRomCurve3(points3d, true, 'centripetal');

        // 궤도의 총 길이 계산 (마스크 텍스처 비율 계산용)
        const pathLength = curve.getLength();

        return { curve, pathLength };
    }, []);

    // 2. 목표 길이 10을 가진 선 마스크 생성
    const lineMaskTexture = useMemo(() => createLineMaskTexture(pathLength, 10), [pathLength]);

    // 3. 매 프레임 선 이동 애니메이션
    useFrame((state, delta) => {
        // 이동 속도 (0.1이면 10초에 한 바퀴)
        lineMaskTexture.offset.x -= delta * 0.1;
    });

    return (
        <group {...props}>
            {/* ⚪️ 1. 바깥쪽 투명한 유리 본체 (반지름 5) */}
            <mesh>
                <tubeGeometry args={[curve, 200, 5, 64, true]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transparent={true}
                    transmission={1}         // 완전 투명 유리
                    opacity={1}
                    roughness={0.05}
                    thickness={5}
                    ior={1.6}                // 굴절률 (테두리 맺힘 효과)
                    clearcoat={1}
                />
            </mesh>

            {/* 🟢 2. 내부를 타고 도는 2x10 사이즈의 연두색 선 */}
            {/* 반지름을 1로 설정하여 폭을 2로 만듦. (길이는 위에서 10으로 맞춤) */}
            <mesh>
                <tubeGeometry args={[curve, 200, 1, 16, true]} />
                <meshStandardMaterial
                    color="#00ffcc"
                    emissive="#00ffcc"
                    emissiveIntensity={2}
                    alphaMap={lineMaskTexture}

                    // 🚀 수정 2: 투명도(transparent)를 끄고, 알파테스트(alphaTest)를 켭니다!
                    transparent={false}
                    alphaTest={0.5} // 하얀색(1) 부분만 남기고 검은색(0) 부분은 가위로 잘라버림

                    side={THREE.DoubleSide}      // 안쪽 면도 렌더링
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}