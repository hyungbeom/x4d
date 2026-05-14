"use client";

import React, {useLayoutEffect, useRef} from 'react';
import {Center} from '@react-three/drei';
import {SensorA} from '@/resources/model/bdtect/SensorA';
import {SensorB} from '@/resources/model/bdtect/SensorB';
import {SensorC} from '@/resources/model/bdtect/SensorC';
import {SensorD} from '@/resources/model/bdtect/SensorD';
import { gsap, ScrollTrigger } from "@/lib/brochureGsap";
import * as THREE from 'three';

/** 슬라이드 간 X 간격 (카메라·모델 크기에 맞게 조정) */
const SLIDE_GAP = 4.75;

export function SensorCarouselTrack() {
    const trackRef = useRef<THREE.Group>(null);

    useLayoutEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                track.position,
                {x: 0},
                {
                    x: -3 * SLIDE_GAP,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#middle-box-scroll-area',
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 1,
                    },
                }
            );
        });

        const refresh = () => ScrollTrigger.refresh();
        requestAnimationFrame(refresh);

        return () => {
            ctx.revert();
            refresh();
        };
    }, []);

    const y = -0.35;
    const s = 0.9;

    return (
        <group ref={trackRef}>
            <group position={[0, 0, 0]}>
                <Center position={[0, y, 0]}>
                    <SensorA scale={s}/>
                </Center>
            </group>
            <group position={[SLIDE_GAP, 0, 0]}>
                <Center position={[0, y, 0]}>
                    <SensorB scale={s}/>
                </Center>
            </group>
            <group position={[2 * SLIDE_GAP, 0, 0]}>
                <Center position={[0, y, 0]}>
                    <SensorC scale={1.5}/>
                </Center>
            </group>
            <group position={[3 * SLIDE_GAP, 0, 0]}>
                <Center position={[0, y, 0]}>
                    <SensorD scale={3}/>
                </Center>
            </group>
        </group>
    );
}
