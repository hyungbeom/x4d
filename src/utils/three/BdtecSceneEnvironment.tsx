'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/** 💡 1. 캔버스로 그라데이션 텍스처를 만드는 함수 */
function createGradientTexture(colorTop: string, colorBottom: string) {
    const canvas = document.createElement('canvas');
    // 그라데이션은 세로로만 변하므로 가로 픽셀은 많이 필요 없습니다. 최적화!
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, colorTop);
    gradient.addColorStop(1, colorBottom);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace; // 색상 정확도 향상
    texture.needsUpdate = true;
    return texture;
}

/** 💡 2. 줌을 땡겨도 절대 깨지거나 작아지지 않는 완벽한 평면(Plane) 그라데이션 배경 */
function GradientBackgroundMesh({
                                    colorTop,
                                    colorBottom
                                }: {
    colorTop: string;
    colorBottom: string;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    const material = useMemo(() => {
        const tex = createGradientTexture(colorTop, colorBottom);
        if (!tex) return null;

        return new THREE.MeshBasicMaterial({
            map: tex,
            depthWrite: false, // 💡 다른 모든 3D 모델들 뒤에 배경으로 깔리게 함
            depthTest: false,
            toneMapped: false, // 💡 조명에 의해 배경색이 변질되지 않고 지정한 색 그대로 나오게 함
        });
    }, [colorTop, colorBottom]);

    useLayoutEffect(() => {
        return () => {
            material?.dispose();
        };
    }, [material]);

    useFrame((state) => {
        const mesh = meshRef.current;
        const camera = state.camera;
        if (!mesh || !(camera instanceof THREE.OrthographicCamera)) return;

        // 카메라 위치와 회전을 완벽히 따라갑니다
        mesh.position.copy(camera.position);
        mesh.quaternion.copy(camera.quaternion);

        // 카메라 시야 끝(far) 바로 앞까지 판넬을 쭈욱 밀어냅니다 (뒷배경 역할)
        mesh.translateZ(-camera.far * 0.95);

        // 💡 핵심: 줌(zoom) 상태가 반영된 현재 뷰포트의 가로/세로 길이를 정확히 계산합니다
        const w = (camera.right - camera.left) / camera.zoom;
        const h = (camera.top - camera.bottom) / camera.zoom;

        // 평면이므로 화면의 가로, 세로 길이에 딱 맞게 스케일을 덮어줍니다
        mesh.scale.set(w, h, 1);
    });

    if (!material) return null;

    return (
        <mesh ref={meshRef} renderOrder={-10} frustumCulled={false}>
            {/* 구슬(Sphere) 대신 평면(Plane)을 사용합니다! */}
            <planeGeometry args={[1, 1]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

/**
 * 💡 3. HDRI를 대체하는 스튜디오 조명 + 배경 컴포넌트
 */
export function BdtecSceneEnvironment({
    colorTop = '#dfd4d6',
    colorBottom = '#ebd9d8',
}: {
    colorTop?: string;
    colorBottom?: string;
}) {
    return <GradientBackgroundMesh colorTop={colorTop} colorBottom={colorBottom} />;
}