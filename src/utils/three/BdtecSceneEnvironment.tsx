'use client';

import {useEnvironment} from '@react-three/drei';
import {useFrame, useThree} from '@react-three/fiber';
import {useLayoutEffect, useMemo, useRef, useState} from 'react';
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

/** PMREM + roughness로 HDRI 배경 블러 (직교 카메라 스카이박스) */
function HdriSkyMesh({
                         texture,
                         blur,
                     }: {
    texture: THREE.CubeTexture;
    blur: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const gl = useThree((s) => s.gl);
    const [envMap, setEnvMap] = useState<THREE.Texture | null>(null);
    const pmremTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

    useLayoutEffect(() => {
        if (!texture?.image) return;

        const pmremGenerator = new THREE.PMREMGenerator(gl);
        pmremGenerator.compileCubemapShader();
        const rt = pmremGenerator.fromCubemap(texture);
        pmremGenerator.dispose();

        pmremTargetRef.current?.dispose();
        pmremTargetRef.current = rt;
        setEnvMap(rt.texture);

        return () => {
            rt.dispose();
            pmremTargetRef.current = null;
            setEnvMap(null);
        };
    }, [texture, gl]);

    const material = useMemo(() => {
        if (!envMap) return null;
        const roughness = THREE.MathUtils.clamp(blur, 0, 1);
        return new THREE.MeshPhysicalMaterial({
            envMap,
            roughness,
            metalness: 0,
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false,
            fog: false,
            toneMapped: true,
        });
    }, [envMap, blur]);

    useLayoutEffect(() => () => material?.dispose(), [material]);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;
        mesh.position.copy(state.camera.position);
        mesh.scale.setScalar(skyboxScaleForCamera(state.camera));
    });

    if (!material) return null;

    return (
        <mesh ref={meshRef} frustumCulled={false} renderOrder={-10}>
            <sphereGeometry args={[1, 64, 32]}/>
            <primitive object={material} attach="material"/>
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
    /** 0–1, 클수록 배경 HDRI가 더 흐림 */
    blur?: number;
    environmentIntensity?: number;
}) {
    const texture = useEnvironment({preset});
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

    if (!texture?.image) return null;

    // @ts-ignore
    return <HdriSkyMesh texture={texture} blur={blur}/>;
}

BdtecSceneEnvironment.preload = (options?: { preset?: any }) => {
    useEnvironment.preload({preset: options?.preset ?? 'sunset'});
};
