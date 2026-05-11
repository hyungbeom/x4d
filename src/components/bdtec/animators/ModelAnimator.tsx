import React, {useEffect, useRef} from "react";
import * as THREE from "three";
import {useThree} from "@react-three/fiber";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

export default function ModelAnimator({children, controlsRef, textRefs}: {
    children: React.ReactNode,
    controlsRef: any,
    textRefs: any[]
}) {
    const groupRef = useRef<THREE.Group>(null);
    const {camera} = useThree();

    useEffect(() => {
        if (!groupRef.current) return;

        let ctx = gsap.context(() => {
            gsap.from(groupRef.current!.scale, {
                scrollTrigger: {trigger: "#next-section", start: "top 50%", toggleActions: "play none none reverse"},
                x: 0.7, y: 0.7, z: 0.7, duration: 1.5, ease: "expo.out", delay: 0.2
            });

            gsap.from(groupRef.current!.position, {
                scrollTrigger: {trigger: "#next-section", start: "top 50%", toggleActions: "play none none reverse"},
                y: -2, duration: 1.5, ease: "expo.out", delay: 0.2
            });

            setTimeout(() => {
                const coverNode = groupRef.current?.getObjectByName("Cover");
                const frontNode = groupRef.current?.getObjectByName("Front");

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#next-section-scroll-area",
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1,
                    },
                });

                if (coverNode && frontNode) {
                    tl.to(coverNode.rotation, {y: "+=" + THREE.MathUtils.degToRad(110), duration: 1, ease: "none"}, 0);
                    tl.to(frontNode.rotation, {
                        y: "+=" + THREE.MathUtils.degToRad(110),
                        duration: 0.7,
                        ease: "none"
                    }, 0.3);
                }

                if (controlsRef.current) {
                    const [intro, factory, tank, wifi, box] = textRefs;

                    tl.to(intro.current, {opacity: 0, y: -20, duration: 0.5}, 1);
                    tl.fromTo(factory.current, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.5}, 1);
                    tl.to(camera.position, { x: 4,z : 0, duration: 3, ease: "power2.inOut" }, 1);
                    tl.to(controlsRef.current.target, { x: "16", duration: 3, ease: "power2.inOut" }, 1);


                    tl.to(factory.current, {opacity: 0, y: -20, duration: 0.5}, 2.5);
                    tl.fromTo(tank.current, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.5}, 2.5);
                    tl.to(camera.position, { x: 2, z: -7, duration: 3, ease: "power2.inOut" }, 4);
                    tl.to(controlsRef.current.target, { x: 11,y: -1, z: -15, duration: 3, ease: "power2.inOut" }, 4);



                    tl.to(camera.position, {x: -2, z: -6, duration: 3, ease: "power2.inOut"}, 7.0);
                    tl.to(controlsRef.current.target, {x: -8, y:1,z: -12, duration: 3, ease: "power2.inOut"}, 7.0);



                    tl.to(camera.position, {x: -1, z: 2.5, duration: 3, ease: "power2.inOut"}, 10.0);
                    tl.to(controlsRef.current.target, {x: -45, y: 1, z: -8, duration: 3, ease: "power2.inOut"}, 10.0);
                }

                ScrollTrigger.refresh();
            }, 100);
        });

        return () => ctx.revert();
    }, []);

    return <group ref={groupRef}>{children}</group>;
}