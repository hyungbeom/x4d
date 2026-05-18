'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';

const PLANE_SIZE = 12000;

type BrochureGlassFloorProps = {
    y?: number;
    fadeStrength?: number;
    tint?: string;
    mirrorContent?: ReactNode;
};

function createEdgeFadeTexture(fadeStrength: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    const safeStrength = THREE.MathUtils.clamp(fadeStrength, 0.05, 0.95);

    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1 - safeStrength * 0.65, 'rgba(255,255,255,0.9)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    return tex;
}

function SceneMirror({
    y,
    opacity = 0.52,
    children,
}: {
    y: number;
    opacity?: number;
    children: ReactNode;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -y - 0.02), [y]);

    const reflectMat = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#9ed0f0',
                metalness: 0.95,
                roughness: 0.06,
                transparent: true,
                opacity,
                envMapIntensity: 0.20,
                depthWrite: false,
            }),
        [opacity],
    );

    useLayoutEffect(() => {
        const root = groupRef.current;
        if (!root) return;

        const saved = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

        root.traverse((obj) => {
            if (!(obj instanceof THREE.Mesh)) return;
            saved.set(obj, obj.material);
            const mat = reflectMat.clone();
            mat.clippingPlanes = [clipPlane];
            mat.clipIntersection = false;
            mat.side = THREE.DoubleSide;
            obj.material = mat;
            obj.castShadow = false;
            obj.receiveShadow = false;
        });

        return () => {
            saved.forEach((material, mesh) => {
                mesh.material = material;
            });
        };
    }, [reflectMat, clipPlane]);

    return (
        <group ref={groupRef} position={[0, y, 0]} scale={[1, -1, 1]} renderOrder={-10}>
            {children}
        </group>
    );
}

/** 유리 거울 바닥 + 오브젝트 반사 */
export function BrochureGlassFloor({
    y = -12,
    fadeStrength = 0.5,
    tint = '#0a1624',
    mirrorContent,
}: BrochureGlassFloorProps) {
    const alphaTexture = useMemo(
        () => createEdgeFadeTexture(fadeStrength),
        [fadeStrength],
    );

    useEffect(() => () => alphaTexture?.dispose(), [alphaTexture]);

    const fade = { alphaMap: alphaTexture ?? undefined, transparent: true as const };

    return (
        <group>
            {mirrorContent ? (
                <SceneMirror y={y} opacity={0.52}>
                    {mirrorContent}
                </SceneMirror>
            ) : null}

            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, y, 0]}
                scale={[PLANE_SIZE, PLANE_SIZE, 1]}
                renderOrder={-1}
                frustumCulled={false}
                receiveShadow
            >
                <planeGeometry args={[1, 1]} />
                <meshPhysicalMaterial
                    color={tint}
                    metalness={0.6}
                    roughness={0.012}
                    transmission={0.22}
                    thickness={0.6}
                    ior={1.5}
                    opacity={0.78}
                    clearcoat={1}
                    clearcoatRoughness={0.004}
                    envMapIntensity={0.35}
                    specularIntensity={2}
                    specularColor="#eef8ff"
                    reflectivity={1}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                    {...fade}
                />
            </mesh>
        </group>
    );
}
