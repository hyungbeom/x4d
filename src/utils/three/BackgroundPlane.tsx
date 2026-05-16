'use client';

import React from 'react';
import * as THREE from 'three';

export default function BackgroundPlane() {
    return (
        <mesh
            // 1. Transform: Spline에서 넘어온 정밀한 공간 좌표값 적용
            position={[18.35, -36.5, -310]}

            // 2. Rotation: Spline의 [-90, 0, -90] 도(Degree) 각도를 라디안(Radian)으로 완벽 변환
            // Spline과 R3F의 축 정렬 매칭을 위해 복합 라디안 배열로 주입합니다.
            rotation={[
                THREE.MathUtils.degToRad(-90), // X축 회전
                THREE.MathUtils.degToRad(0),   // Y축 회전
                THREE.MathUtils.degToRad(-90)  // Z축 회전
            ]}
            scale={[1, 1, 1]}
        >
            {/* 3. Shape: 사이즈 [3688, 4306] 및 세그먼트 밀도 지정 */}
            <planeGeometry args={[3688, 4306, 8, 8]} />

            {/* 4. Material: 모바일에 과부하를 주지 않는 경량 최적화 재질 */}
            <meshStandardMaterial
                color="#A1A1A1"
                roughness={0.4}           // 빛이 부드럽게 번지는 무광/반무광 질감
                metalness={0.5}           // 은은한 메탈릭 피드백 (Matcap/Lighting 레이어 대용)
                side={THREE.DoubleSide}   // 직교 카메라 뷰에서 각도에 따라 뒤집혀도 컬링(삭제)되지 않도록 양면 처리
            />
        </mesh>
    );
}