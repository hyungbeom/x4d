// components/bdtec/animators/MiddleBoxAnimator.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProgressBox() {
    const boxGroupRef = useRef<THREE.Group>(null);
    const boxRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];

    useEffect(() => {
        if (!boxGroupRef.current) return;

        let ctx = gsap.context(() => {
            boxRefs.forEach((ref, index) => {
                if (ref.current) {
                    gsap.fromTo(ref.current.position,
                        { y: -10 },
                        {
                            scrollTrigger: {
                                trigger: "#middle-box-section",
                                start: "top 60%",
                                toggleActions: "play none none reverse"
                            },
                            y: 0, duration: 1.2, ease: "back.out(1.5)", delay: index * 0.15
                        }
                    );
                    gsap.fromTo(ref.current.rotation,
                        { x: Math.PI, y: Math.PI },
                        {
                            scrollTrigger: { trigger: "#middle-box-section", start: "top 60%", toggleActions: "play none none reverse" },
                            x: 0, y: 0, duration: 1.5, ease: "power3.out", delay: index * 0.15
                        }
                    )
                }
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <group ref={boxGroupRef}>
            <mesh ref={boxRefs[0]} position={[-4, 0, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#5ea2e6" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh ref={boxRefs[1]} position={[-1.3, 0, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#0ae448" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh ref={boxRefs[2]} position={[1.3, 0, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#f04a4a" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh ref={boxRefs[3]} position={[4, 0, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#e6a25e" roughness={0.2} metalness={0.8} />
            </mesh>
        </group>
    );
}