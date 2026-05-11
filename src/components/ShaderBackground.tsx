// components/ShaderBackground.tsx
import * as THREE from "three";
import React, { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { Plane, shaderMaterial } from "@react-three/drei";

const DynamicGradientMaterial = shaderMaterial(
    {
        uTime: 0,
        uResolution: new THREE.Vector2(),
        // 💡 참고 이미지 8.png에서 추출한 더 어둡고 깊은 청록색 계열로 조정
        colorA: new THREE.Color("#000a12"), // 깊은 어둠
        colorB: new THREE.Color("#003366"), // 깊은 청색 포인트
    },
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.x, position.y, 0.999, 1.0);
    }
  `,
    `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying vec2 vUv;

    void main() {
      // 그라데이션 베이스 (vUv.y로 위아래 그라데이션)
      vec3 finalColor = mix(colorA, colorB, vUv.y);

      // 움직이는 흐릿한 빛 무리 (움직임을 더 느리고 몽환적으로 조정)
      vec2 spot1Center = vec2(0.2 + sin(uTime * 0.2) * 0.1, 0.8 + cos(uTime * 0.15) * 0.1);
      float spot1 = 1.0 - smoothstep(0.0, 0.6, distance(vUv, spot1Center));
      
      vec2 spot2Center = vec2(0.8 + sin(uTime * 0.25) * 0.1, 0.2 + cos(uTime * 0.2) * 0.1);
      float spot2 = 1.0 - smoothstep(0.0, 0.5, distance(vUv, spot2Center));

      // 빛 무리를 기본 색상에 더하기 (참고 이미지의 청록색 톤)
      finalColor = mix(finalColor, vec3(0.0, 0.5, 0.5), spot1 * 0.4);
      finalColor = mix(finalColor, vec3(0.0, 0.2, 0.4), spot2 * 0.3);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ DynamicGradientMaterial });

// 💡 2. 양자 입자 필드 컴포넌트 (이미지 파일 없이 코드로 직접 입자 텍스처 생성)
function QuantumParticleField({ count = 500 }) {
    const pointsRef = useRef<any>(null);

    // useTexture 대신 Canvas를 이용해 절차적 텍스처(부드러운 원) 생성
    const particleTexture = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext("2d");

        if (context) {
            // 중앙에서 바깥으로 퍼지는 부드러운 그라데이션 원 그리기
            const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // 중앙은 불투명한 흰색
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // 끝은 투명하게

            context.fillStyle = gradient;
            context.fillRect(0, 0, 32, 32);
        }

        return new THREE.CanvasTexture(canvas);
    }, []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push(
                new THREE.Vector3(
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    0
                )
            );
        }
        return temp;
    }, [count]);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry().setFromPoints(particles);
        return geo;
    }, [particles]);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.material.uTime = state.clock.elapsedTime;

            // 위치 데이터 배열을 가져옵니다.
            const positions = pointsRef.current.geometry.attributes.position.array;

            // 💡 forEach 대신 파티클 갯수(count)만큼만 딱 깔끔하게 도는 안전한 코드입니다.
            for (let i = 0; i < count; i++) {
                const i3 = i * 3; // 0, 3, 6, 9... (x좌표의 인덱스)

                // 원래 저장해둔 particles 배열의 초기 좌표를 활용해 미세하게 흔들리게 만듭니다.
                positions[i3] += Math.sin(state.clock.elapsedTime * 0.2 + particles[i].y) * 0.001;     // X 좌표
                positions[i3 + 1] += Math.cos(state.clock.elapsedTime * 0.2 + particles[i].x) * 0.001; // Y 좌표
            }

            // 업데이트 완료를 Three.js에게 알립니다.
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });


    return (
        // @ts-ignore
        <points ref={pointsRef} renderOrder={-0.5} depthTest={false}>
            <bufferGeometry {...geometry} />
            <pointsMaterial
                transparent
                depthWrite={false}
                map={particleTexture}
                size={0.05}
                color="#00ffff"
                opacity={0.3}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// 최종 배경 컴포넌트 (그라데이션 + 입자 필드)
export default function QuantumFieldBackground() {
    const materialRef = useRef<any>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
            materialRef.current.uResolution.set(state.size.width, state.size.height);
        }
    });

    return (
        <>
            <Plane args={[2, 2]} renderOrder={-1}>
                {/* 등록한 커스텀 쉐이더 재질 적용 */}

            </Plane>
            <QuantumParticleField count={800} /> {/* 수백 개의 입자 추가 */}
        </>
    );
}