'use client';

import { useEnvironment } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function skyboxScaleForCamera(camera: THREE.Camera) {
    let scale = 5000;

    if (camera instanceof THREE.OrthographicCamera) {
        const w = (camera.right - camera.left) / camera.zoom;
        const h = (camera.top - camera.bottom) / camera.zoom;
        const depth = camera.far - camera.near;
        scale = Math.hypot(w, h, depth) * 0.65;
    } else if (camera instanceof THREE.PerspectiveCamera) {
        const dist = Math.max(Math.abs(camera.position.z), camera.far * 0.25);
        const vFov = (camera.fov * Math.PI) / 180;
        scale = dist * Math.tan(vFov * 0.5) * 2.5;
    }

    // 🚨 핵심 해결책: 스케일이 카메라의 Far(최대 가시거리)를 넘지 않도록 제한합니다.
    // 카메라 far 값의 90% 크기로 설정해서 클리핑을 방지합니다.
    return Math.min(scale, camera.far * 0.9);
}
function HdriSkyMesh({
                         texture,
                         blur,
                         intensity,
                     }: {
    texture: THREE.Texture;
    blur: number;
    intensity: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    const material = useMemo(() => {
        if (!texture) return null;

        texture.mapping = THREE.EquirectangularReflectionMapping;

        // 💡 핵심: MeshPhysicalMaterial 대신 빛 계산이 필요 없는 MeshBasicMaterial 사용
        return new THREE.MeshBasicMaterial({
            envMap: texture,
            side: THREE.DoubleSide, // 💡 핵심: BackSide 대신 DoubleSide를 써서 면 뒤집힘 이슈를 원천 차단!
            depthWrite: false,
            depthTest: false,
            color: 0xffffff,
        });
    }, [texture]);

    useLayoutEffect(() => {
        return () => {
            material?.dispose();
        };
    }, [material]);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;

        mesh.position.copy(state.camera.position);
        const scale = skyboxScaleForCamera(state.camera);

        // 💡 핵심: 일단 음수(-scale)를 빼고 양수로만 렌더링해 봅니다.
        mesh.scale.set(scale, scale, scale);
    });

    if (!material) return null;

    return (
        <mesh ref={meshRef} frustumCulled={false} renderOrder={-10} >
            <sphereGeometry args={[1, 64, 32]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

export function BdtecSceneEnvironment({
                                          preset = 'sunset',
                                          blur = 1,
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

    if (!texture) return null;

    return <HdriSkyMesh
        texture={texture as THREE.Texture}
        blur={blur}
        intensity={environmentIntensity}
    />
}

BdtecSceneEnvironment.preload = (options?: { preset?: any }) => {
    useEnvironment.preload({ preset: options?.preset ?? 'sunset' });
};