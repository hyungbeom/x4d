'use client';

import { useEnvironment } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function skyboxScaleForCamera(camera: THREE.Camera) {
    if (camera instanceof THREE.OrthographicCamera) {
        const w = (camera.right - camera.left) / camera.zoom;
        const h = (camera.top - camera.bottom) / camera.zoom;
        const depth = camera.far - camera.near;
        return Math.hypot(w, h, depth) * 0.65;
    }
    if (camera instanceof THREE.PerspectiveCamera) {
        const dist = Math.max(Math.abs(camera.position.z), camera.far * 0.25);
        const vFov = (camera.fov * Math.PI) / 180;
        return dist * Math.tan(vFov * 0.5) * 2.5;
    }
    return 5000;
}

/** PMREM 의존성 제거, 네이티브 envMap + roughness 활용 */
function HdriSkyMesh({
                         texture,
                         blur,
                         intensity, // 밝기 동기화를 위해 추가
                     }: {
    texture: THREE.Texture;
    blur: number;
    intensity: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    const material = useMemo(() => {
        if (!texture) return null;
        const roughness = THREE.MathUtils.clamp(blur, 0, 1);

        return new THREE.MeshPhysicalMaterial({

            roughness,
            metalness: 1, // 배경을 거울처럼 100% 반사하도록 1로 설정
            color: 0xffffff, // 디퓨즈(Diffuse) 색상의 간섭을 막기 위해 검은색으로 설정
            envMapIntensity: intensity,
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false,
            fog: false,
            toneMapped: true,
        });
    }, [texture, blur, intensity]);

    useLayoutEffect(() => {
        return () => {
            material?.dispose();
        };
    }, [material]);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;

        // 1. 카메라 위치 따라가기
        mesh.position.copy(state.camera.position);

        // 2. 스케일 계산
        const scale = skyboxScaleForCamera(state.camera);

        // 3. X축 스케일을 반전시켜서 좌우가 뒤집힌 이미지를 원래대로 복구
        mesh.scale.set(-scale, scale, scale);
    });

    if (!material) return null;

    return (
        <mesh ref={meshRef} frustumCulled={false} renderOrder={-10}>
            <sphereGeometry args={[1, 64, 32]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

/**
 * HDRI — 모델 IBL(scene.environment) + 직교 카메라용 배경 스카이박스
 */
export function BdtecSceneEnvironment({
                                          preset = 'sunset',
                                          blur = 0.35,
                                          environmentIntensity = 1.15,
                                      }: {
    preset?: any;
    blur?: number;
    environmentIntensity?: number;
}) {
    const texture = useEnvironment({ preset });
    const scene = useThree((s) => s.scene);

    useLayoutEffect(() => {
        const prevEnv = scene.environment;
        const prevBg = scene.background;
        const prevInt = scene.environmentIntensity;

        scene.environment = texture;
        scene.background = null;
        scene.environmentIntensity = environmentIntensity;

        return () => {
            scene.environment = prevEnv;
            scene.background = prevBg;
            scene.environmentIntensity = prevInt;
        };
    }, [texture, scene, environmentIntensity]);

    // useEnvironment는 기본적으로 Suspense를 타므로 텍스처가 존재함을 보장합니다.
    if (!texture) return null;

    return <HdriSkyMesh
        texture={texture as THREE.Texture}
        blur={blur}
        intensity={environmentIntensity} // 💡 추가됨
    />
}

BdtecSceneEnvironment.preload = (options?: { preset?: any }) => {
    useEnvironment.preload({ preset: options?.preset ?? 'sunset' });
};