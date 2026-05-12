"use client";

import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { gsap } from "@/lib/brochureGsap";
import { useOptionalBdtecHeroScrollContainerRef } from "@/components/bdtec/BdtecHeroScrollContainer";
import { applyHologramEdgeSetup } from "@/components/bdtec/hologram/applyHologramEdgeSetup";

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
    gridRef,
}: GsapModelWrapperProps) {
    const groupRef = useRef<THREE.Group>(null);
    const autoRotateRef = useRef(true);
    const cameraTween = useRef<gsap.core.Tween | null>(null);

    const edgeMaterialsRef = useRef<THREE.LineBasicMaterial[]>([]);
    const originalMaterialsRef = useRef<THREE.Material[]>([]);

    const { scene } = useThree();
    const heroScrollContainerRef = useOptionalBdtecHeroScrollContainerRef();

    useEffect(() => {
        if (!groupRef.current) return;

        if (edgeMaterialsRef.current.length === 0) {
            const { edgeMaterials, originalMaterials } = applyHologramEdgeSetup(groupRef.current);
            edgeMaterialsRef.current = edgeMaterials;
            originalMaterialsRef.current = originalMaterials;
        }

        const scrollTriggerRoot: HTMLElement | string =
            heroScrollContainerRef?.current ?? ".scroll-container";

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: scrollTriggerRoot,
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
                                    },
                                });
                            } else {
                                if (cameraTween.current) cameraTween.current.kill();
                            }
                        }
                    },
                },
            });

            tl.to(groupRef.current!.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1 }, 0).to(
                groupRef.current!.position,
                { y: 1.5, z: 3, duration: 1 },
                0,
            );

            if ("backgroundIntensity" in scene) tl.to(scene, { backgroundIntensity: 0, duration: 1 }, 0);
            if (fogRef.current) {
                tl.to(fogRef.current.color, { r: 0, g: 0, b: 0, duration: 1 }, 0);
                tl.to(fogRef.current, { near: 15, far: 40, duration: 1 }, 0);
            }
            if (gridRef.current && gridRef.current.material) {
                tl.to(gridRef.current.material.uniforms.sectionColor.value, { r: 0, g: 0, b: 0, duration: 1 }, 0);
                tl.to(gridRef.current.material.uniforms.cellColor.value, { r: 0, g: 0, b: 0, duration: 1 }, 0);
                if (gridRef.current.material.uniforms.opacity)
                    tl.to(gridRef.current.material.uniforms.opacity, { value: 0, duration: 1 }, 0);
            }

            tl.to(groupRef.current!.rotation, { y: -Math.PI / 4, duration: 1 }, 1);

            edgeMaterialsRef.current.forEach((mat) => {
                tl.to(mat, { opacity: 1, duration: 1 }, 1);
            });
            originalMaterialsRef.current.forEach((mat) => {
                tl.to(mat, { opacity: 0, duration: 1 }, 1);
            });

            tl.to({}, { duration: 1 }, 2);
        });

        return () => {
            if (cameraTween.current) {
                cameraTween.current.kill();
                cameraTween.current = null;
            }
            ctx.revert();
        };
    }, [setIsAutoRotate, controlsRef, scene, fogRef, gridRef, heroScrollContainerRef]);

    return <group ref={groupRef}>{children}</group>;
}
