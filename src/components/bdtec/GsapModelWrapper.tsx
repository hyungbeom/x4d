"use client";

import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useThree } from '@react-three/fiber';

gsap.registerPlugin(ScrollTrigger);

interface GsapModelWrapperProps {
    children: React.ReactNode;
    setIsAutoRotate: (val: boolean) => void;
    controlsRef: React.MutableRefObject<any>;
    fogRef: React.RefObject<THREE.Fog | null>;
    gridRef: React.RefObject<any>;
}

export default function GsapModelWrapper({
                                             children,
                                             setIsAutoRotate,
                                             controlsRef,
                                             fogRef,
                                             gridRef
                                         }: GsapModelWrapperProps) {

    const groupRef = useRef<THREE.Group>(null);
    const autoRotateRef = useRef(true);
    const cameraTween = useRef<gsap.core.Tween | null>(null);

    const edgeMaterialsRef = useRef<THREE.LineBasicMaterial[]>([]);
    const originalMaterialsRef = useRef<THREE.Material[]>([]);

    const { scene } = useThree();

    useEffect(() => {
        if (!groupRef.current) return;

        // 🌟 1. 모델 스캔 (테두리 생성 및 본체 재질 수집)
        if (edgeMaterialsRef.current.length === 0) {
            groupRef.current.traverse((child: any) => {
                if (child.isMesh) {
                    // --- A. 테두리(Edges) 생성 (기존과 동일) ---
                    let thresholdAngle = 15;
                    if (child.name === 'Case' || (child.material && child.material.name === 'Cab')) {
                        thresholdAngle = 8;
                    }

                    const edgesGeom = new THREE.EdgesGeometry(child.geometry, thresholdAngle);
                    const edgesMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
                    const line = new THREE.LineSegments(edgesGeom, edgesMat);
                    child.add(line);
                    edgeMaterialsRef.current.push(edgesMat);

                    // --- B. [핵심] 본체 재질 복제(Clone)! ---
                    const materials = Array.isArray(child.material) ? child.material : [child.material];

                    // 💡 전역 캐시(원본)를 건드리지 않고 독립된 복제본을 만듭니다!
                    const clonedMaterials = materials.map((mat: any) => {
                        const newMat = mat.clone(); // 재질 복제!

                        if (newMat.userData.originalTransparent === undefined) {
                            newMat.userData.originalTransparent = newMat.transparent || false;
                        }

                        newMat.transparent = true; // 복제본만 투명하게 조작
                        newMat.needsUpdate = true;

                        if (!originalMaterialsRef.current.includes(newMat)) {
                            originalMaterialsRef.current.push(newMat);
                        }
                        return newMat;
                    });

                    // 💡 메쉬에 복제된 재질을 덮어씌웁니다. (이제 GsapModelWrapper 전용 모델이 되었습니다)
                    child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];
                }
            });
        }

        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".scroll-container",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                    onUpdate: (self) => {
                        const isTop = self.progress === 0;

                        if (autoRotateRef.current !== isTop) {
                            autoRotateRef.current = isTop;
                            setIsAutoRotate(isTop);

                            if (!isTop && controlsRef.current) {
                                if (cameraTween.current) cameraTween.current.kill();
                                const currentAngle = controlsRef.current.getAzimuthalAngle();
                                const angleObj = { angle: currentAngle };
                                cameraTween.current = gsap.to(angleObj, {
                                    angle: 0,
                                    duration: 1.5,
                                    ease: "power2.out",
                                    onUpdate: () => {
                                        if (controlsRef.current) controlsRef.current.setAzimuthalAngle(angleObj.angle);
                                    }
                                });
                            } else {
                                if (cameraTween.current) cameraTween.current.kill();
                            }
                        }
                    }
                }
            });

            // --- 🎬 타임라인 ---

            // [0 ~ 1] Section 1 : 줌인 & 배경 암전
            tl.to(groupRef.current!.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1 }, 0)
                .to(groupRef.current!.position, { y: 1.5, z: 3, duration: 1 }, 0);

            if ('backgroundIntensity' in scene) tl.to(scene, { backgroundIntensity: 0, duration: 1 }, 0);
            if (fogRef.current) {
                tl.to(fogRef.current.color, { r: 0, g: 0, b: 0, duration: 1 }, 0);
                tl.to(fogRef.current, { near: 15, far: 40, duration: 1 }, 0);
            }
            if (gridRef.current && gridRef.current.material) {
                tl.to(gridRef.current.material.uniforms.sectionColor.value, { r: 0, g: 0, b: 0, duration: 1 }, 0);
                tl.to(gridRef.current.material.uniforms.cellColor.value, { r: 0, g: 0, b: 0, duration: 1 }, 0);
                if (gridRef.current.material.uniforms.opacity) tl.to(gridRef.current.material.uniforms.opacity, { value: 0, duration: 1 }, 0);
            }

            // [1 ~ 2] Section 2 : 회전하며 홀로그램으로 변신
            tl.to(groupRef.current!.rotation, { y: -Math.PI / 4, duration: 1 }, 1);

            edgeMaterialsRef.current.forEach((mat) => {
                tl.to(mat, { opacity: 1, duration: 1 }, 1);
            });
            originalMaterialsRef.current.forEach((mat) => {
                tl.to(mat, { opacity: 0, duration: 1 }, 1);
            });

            // 💡 [2 ~ 3] 여백(Hold) 구간:
            // 스크롤을 더 내려도 1초(비율) 동안 애니메이션이 멈춰 있게 만듭니다.
            tl.to({}, { duration: 1 }, 2);

        });

        return () => ctx.revert();
    }, [setIsAutoRotate, controlsRef, scene, fogRef, gridRef]);

    return <group ref={groupRef}>{children}</group>;
}