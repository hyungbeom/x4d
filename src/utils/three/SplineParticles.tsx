'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SplineSmokeParticles({
                                         // 💡 굴뚝 입구 좌표로 맞춰주세요. (예: SystemModel 내 굴뚝 위치)
                                         spawnPosition = [0, -95, 0] as [number, number, number],
                                         count = 100
                                     }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const colorA = useMemo(() => new THREE.Color('#FFFFFF'), []);
    const colorB = useMemo(() => new THREE.Color('#B0B8C1'), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            // 💡 처음에 한꺼번에 겹쳐있지 않도록 수명과 시작 수평 위치를 랜덤하게 퍼트립니다.
            age: Math.random() * 5,
            lifetime: 4 + Math.random() * 2,
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 6, // X축 좁은 퍼짐 (굴뚝 너비 고려)
                2, // 💡 Y축 시작 위치는 굴뚝 바로 위 ( spawnPosition Y축 기준 +2)
                (Math.random() - 0.5) * 6  // Z축 좁은 퍼짐
            ),
            velocity: new THREE.Vector3(0, 4 + Math.random() * 3, 0), // 💡 위로(Y) 상승 속도 증가
            baseScale: 2 + Math.random() * 2,
            randomSeed: Math.random() * 100
        }));
    }, [count]);

    // 💡 가장 중요한 애니메이션 useFrame 로직입니다.
    // 이 전체 코드가useFrame 바깥으로 나가면 안 됩니다.
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        particles.forEach((p, i) => {
            p.age += delta;

            // 1. 수명이 다하면 다시 굴뚝 입구 바로 위로 리스폰
            if (p.age >= p.lifetime) {
                p.age = 0;
                p.position.set(
                    (Math.random() - 0.5) * 6,
                    2,
                    (Math.random() - 0.5) * 6
                );
            }

            // 💡 2. 위로 상승 (가장 중요한 부분!)
            // 이제 p.velocity.y 값이 4~7 사이이므로 초당 그만큼 위로 올라갑니다.
            p.position.y += p.velocity.y * delta;

            // 3. 바람에 흩날리는 효과 (좌우로 흔들림)
            p.position.x += Math.sin(p.age * 2 + p.randomSeed) * 0.05;
            p.position.z += Math.cos(p.age * 2 + p.randomSeed) * 0.05;

            // 4. 진행도에 따른 크기 변화 (팽창하다가 사라짐)
            const progress = p.age / p.lifetime;
            let currentScale = p.baseScale * (1 + progress * 2.5); // 올라갈수록 기본 크기의 최대 3.5배까지 팽창

            // 수명이 다 되어갈 때 크기를 줄여서 자연스럽게 사라지게 함 (Fuzzy 효과 흉내)
            if (progress > 0.8) {
                currentScale *= (1 - progress) * 5; // 마지막 20% 기간 동안 크기를 0으로 줄임
            }

            dummy.position.copy(p.position);
            dummy.scale.set(currentScale, currentScale, currentScale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            // 5. 색상 변화 (흰색 -> 회색)
            tempColor.lerpColors(colorA, colorB, progress);
            meshRef.current!.setColorAt(i, tempColor);
        });

        // 💡 6. 렌더러에 업데이트 요청 (매터리얼 업데이트 추가)
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
    }); // 💡 useFrame 종료 (괄호 확인 필수!)

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={spawnPosition}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
                transparent={true}
                opacity={0.3}
                depthWrite={false}
                roughness={1}
                blending={THREE.NormalBlending}
            />
        </instancedMesh>
    );
}