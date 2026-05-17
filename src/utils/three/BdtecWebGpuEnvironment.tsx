'use client';

import { useEnvironment } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three/webgpu';
import {
    vec4,
    context,
    normalWorld,
    cubeTexture,
    float,
    modelViewProjection,
} from 'three/tsl';

type Preset = Parameters<typeof useEnvironment>[0]['preset'];

type BdtecWebGpuEnvironmentProps = {
    preset?: Preset;
    /** 0–1. 1보다 크면 퍼센트로 해석 (예: 20 → 0.2) */
    blur?: number;
    backgroundIntensity?: number;
    environmentIntensity?: number;
};

function normalizeBlurriness(blur: number) {
    if (blur <= 1) return blur;
    return Math.min(blur / 100, 1);
}

/** 직교 카메라에서 내측(BackSide) 구가 화면 전체를 덮도록 반지름 산출 */
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

function BdtecWebGpuSkybox({
    texture,
    blurriness,
    backgroundIntensity,
}: {
    texture: THREE.CubeTexture;
    blurriness: number;
    backgroundIntensity: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    const material = useMemo(() => {
        const mat = new THREE.MeshBasicNodeMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false,
            fog: false,
        });

        // reflectVector(기본값)는 일반 메시에 없어 null — 배경은 normalWorld로 샘플
        const envSample = cubeTexture(texture, normalWorld);
        mat.colorNode = context(vec4(envSample, float(1)).mul(float(backgroundIntensity)), {
            getUV: () => normalWorld,
            getTextureLevel: () => float(blurriness),
        });

        // three Background.mesh 와 동일: 항상 far plane 에 그리기
        let viewProj = modelViewProjection;
        viewProj = viewProj.setZ(viewProj.w);
        mat.vertexNode = viewProj;

        return mat;
    }, [texture, blurriness, backgroundIntensity]);

    useLayoutEffect(() => () => material.dispose(), [material]);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;
        const { camera } = state;
        mesh.position.copy(camera.position);
        const s = skyboxScaleForCamera(camera);
        mesh.scale.set(s, s, s);
    });

    return (
        <mesh ref={meshRef} frustumCulled={false} renderOrder={-2}>
            <sphereGeometry args={[1, 48, 32]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

/**
 * WebGPU HDRI — IBL은 scene.environment, 배경은 직교 카메라용 커스텀 스카이박스.
 */
export function BdtecWebGpuEnvironment({
    preset = 'sunset',
    blur = 0.2,
    backgroundIntensity = 1,
    environmentIntensity = 1,
}: BdtecWebGpuEnvironmentProps) {
    const texture = useEnvironment({ preset });
    const scene = useThree((s) => s.scene);

    const blurriness = normalizeBlurriness(blur);

    useLayoutEffect(() => {
        const prevEnv = scene.environment;
        const prevBg = scene.background;
        const prevBgNode = scene.backgroundNode;
        const prevBgBlur = scene.backgroundBlurriness;
        const prevBgInt = scene.backgroundIntensity;
        const prevEnvInt = scene.environmentIntensity;

        scene.environment = texture;
        scene.background = null;
        scene.backgroundNode = null;
        scene.backgroundBlurriness = 0;
        scene.backgroundIntensity = backgroundIntensity;
        scene.environmentIntensity = environmentIntensity;

        return () => {
            scene.environment = prevEnv;
            scene.background = prevBg;
            scene.backgroundNode = prevBgNode;
            scene.backgroundBlurriness = prevBgBlur;
            scene.backgroundIntensity = prevBgInt;
            scene.environmentIntensity = prevEnvInt;
        };
    }, [texture, scene, backgroundIntensity, environmentIntensity]);

    if (!texture?.image) return null;

    return (
        <BdtecWebGpuSkybox
            texture={texture}
            blurriness={blurriness}
            backgroundIntensity={backgroundIntensity}
        />
    );
}

BdtecWebGpuEnvironment.preload = (options?: { preset?: Preset }) => {
    useEnvironment.preload({ preset: options?.preset ?? 'sunset' });
};
