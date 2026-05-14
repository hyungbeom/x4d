import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { gsap, ScrollTrigger } from "@/lib/brochureGsap";

export default function ModelAnimator({
    children,
    controlsRef,
    textRefs,
    scrollAreaRef,
    sectionRef,
}: {
    children: React.ReactNode;
    controlsRef: React.MutableRefObject<any>;
    textRefs: React.RefObject<HTMLDivElement | null>[];
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
    sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useEffect(() => {
        const group = groupRef.current;
        if (!group) return;

        let delayedCtx: gsap.Context | null = null;
        const timerId = window.setTimeout(() => {
            if (!groupRef.current) return;

            const sectionEl = sectionRef.current;
            const scrollAreaEl = scrollAreaRef.current;
            if (!sectionEl || !scrollAreaEl) return;

            delayedCtx = gsap.context(() => {
                gsap.from(groupRef.current!.scale, {
                    scrollTrigger: {
                        trigger: sectionEl,
                        start: "top 50%",
                        toggleActions: "play none none reverse",
                    },
                    x: 0.7,
                    y: 0.7,
                    z: 0.7,
                    duration: 1.5,
                    ease: "expo.out",
                    delay: 0.2,
                });

                gsap.from(groupRef.current!.position, {
                    scrollTrigger: {
                        trigger: sectionEl,
                        start: "top 50%",
                        toggleActions: "play none none reverse",
                    },
                    y: -2,
                    duration: 1.5,
                    ease: "expo.out",
                    delay: 0.2,
                });

                const coverNode = groupRef.current?.getObjectByName("Cover");
                const frontNode = groupRef.current?.getObjectByName("Front");

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: scrollAreaEl,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1.35,
                    },
                });

                if (coverNode && frontNode) {
                    tl.to(coverNode.rotation, { y: "+=" + THREE.MathUtils.degToRad(110), duration: 1, ease: "none" }, 0);
                    tl.to(
                        frontNode.rotation,
                        {
                            y: "+=" + THREE.MathUtils.degToRad(110),
                            duration: 0.7,
                            ease: "none",
                        },
                        0.3,
                    );
                }

                if (controlsRef.current) {
                    const [intro, factory, tank, wifi, box] = textRefs;

                    tl.to(intro.current, { opacity: 0, y: -20, duration: 0.5 }, 1);
                    tl.fromTo(factory.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 1);
                    tl.to(camera.position, { x: 4, z: 0, duration: 3, ease: "power2.inOut" }, 1);
                    tl.to(controlsRef.current.target, { x: "16", duration: 3, ease: "power2.inOut" }, 1);

                    tl.to(factory.current, { opacity: 0, y: -20, duration: 0.5 }, 2.5);
                    tl.fromTo(tank.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 2.5);
                    tl.to(camera.position, { x: 2, z: -7, duration: 3, ease: "power2.inOut" }, 4);
                    tl.to(controlsRef.current.target, { x: 11, y: -1, z: -15, duration: 3, ease: "power2.inOut" }, 4);

                    tl.to(camera.position, { x: -2, z: -6, duration: 3, ease: "power2.inOut" }, 7.0);
                    tl.to(controlsRef.current.target, { x: -8, y: 1, z: -12, duration: 3, ease: "power2.inOut" }, 7.0);

                    tl.to(camera.position, { x: -1, z: 2.5, duration: 3, ease: "power2.inOut" }, 10.0);
                    tl.to(controlsRef.current.target, { x: -45, y: 1, z: -8, duration: 3, ease: "power2.inOut" }, 10.0);

                    // 마지막 샷 완료(t=13) 이후: scrub 구간에서 스크롤만 소비·화면 유지 (다음 섹션 전 1~2초 체감)
                    const endShotHold = 2.1;
                    tl.to({}, { duration: endShotHold, ease: "none" }, 13);
                }

                ScrollTrigger.refresh();
            });
        }, 100);

        return () => {
            window.clearTimeout(timerId);
            delayedCtx?.revert();
        };
    }, [camera, controlsRef, textRefs, scrollAreaRef, sectionRef]);

    return <group ref={groupRef}>{children}</group>;
}
