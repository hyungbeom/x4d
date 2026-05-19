'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const FLOOR_Y = -12;
const PLANE_SIZE = 12000;
const FLOOR_OPACITY = 0.88;
const FADE_DAMP = 2.6;

const BG_DARK = new THREE.Color('#152535');
const BG_LIGHT = new THREE.Color('#ffffff');
const FLOOR_TINT_DARK = new THREE.Color('#0e1e30');
const FLOOR_TINT_LIGHT = new THREE.Color('#e8ecef');

const storedOpacity = new WeakMap<THREE.Material, number>();

function applyObjectsBlend(root: THREE.Object3D, blend: number) {
    root.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of materials) {
            if (!mat || !('opacity' in mat)) continue;
            const original = storedOpacity.get(mat) ?? mat.opacity;
            if (!storedOpacity.has(mat)) storedOpacity.set(mat, original);
            mat.transparent = true;
            mat.opacity = original * (1 - blend);
            mat.needsUpdate = true;
        }
    });
}

type BdtecSceneFadeProps = {
    faded: boolean;
    /** true면 흰 화면·객체 opacity 0으로 즉시 맞춤 (시작하기 직후) */
    snapFaded?: boolean;
    children: ReactNode;
};

function applyFadeState(
    scene: THREE.Scene,
    contentRef: React.RefObject<THREE.Group | null>,
    floorMat: THREE.MeshStandardMaterial | null,
    t: number,
    bgTmp: THREE.Color,
) {
    bgTmp.copy(BG_DARK).lerp(BG_LIGHT, t);
    scene.background = bgTmp;

    if (floorMat) {
        floorMat.color.copy(FLOOR_TINT_DARK).lerp(FLOOR_TINT_LIGHT, t);
        floorMat.opacity = THREE.MathUtils.lerp(FLOOR_OPACITY, 0, t);
        floorMat.transparent = true;
    }

    if (contentRef.current) {
        applyObjectsBlend(contentRef.current, t);
    }
}

/** NEXT/PREV — 배경·바닥·씬 객체를 스르르 페이드 */
export function BdtecSceneFade({ faded, snapFaded = false, children }: BdtecSceneFadeProps) {
    const scene = useThree((state) => state.scene);
    const contentRef = useRef<THREE.Group>(null);
    const floorMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const blendRef = useRef(0);
    const targetRef = useRef(0);
    const bgTmp = useMemo(() => new THREE.Color(), []);

    useEffect(() => {
        targetRef.current = faded ? 1 : 0;
    }, [faded]);

    useLayoutEffect(() => {
        if (!snapFaded || !faded) return;
        blendRef.current = 1;
        applyFadeState(scene, contentRef, floorMatRef.current, 1, bgTmp);
    }, [snapFaded, faded, scene, bgTmp]);

    useFrame((_, delta) => {
        if (!(snapFaded && faded)) {
            blendRef.current = THREE.MathUtils.damp(
                blendRef.current,
                targetRef.current,
                FADE_DAMP,
                delta,
            );
        }
        const t = blendRef.current;
        applyFadeState(scene, contentRef, floorMatRef.current, t, bgTmp);
    });

    return (
        <>
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, FLOOR_Y, 0]}
                scale={[PLANE_SIZE, PLANE_SIZE, 1]}
                renderOrder={-1}
                frustumCulled={false}
                receiveShadow
            >
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial
                    ref={floorMatRef}
                    color={FLOOR_TINT_DARK}
                    metalness={0.88}
                    roughness={0.06}
                    opacity={FLOOR_OPACITY}
                    transparent
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <group ref={contentRef}>{children}</group>
        </>
    );
}
