"use client";

import React, {forwardRef, Suspense, useEffect, useLayoutEffect, useRef} from 'react';
import {Canvas, useThree} from '@react-three/fiber';
import {Environment} from "@react-three/drei";
import {SensorCarouselTrack} from "@/components/bdtec/SensorCarouselTrack";
import {Bloom, EffectComposer, ToneMapping} from "@react-three/postprocessing";
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

/** 캐러셀 중심을 ~45° 올려다보는 시점(카메라 낮게 + 약간 Yaw) */
function ObliqueCarouselCamera() {
    const {camera} = useThree();

    useLayoutEffect(() => {
        if (!camera || !(camera instanceof THREE.PerspectiveCamera)) return;

        camera.fov = 40;
        camera.near = 0.35;
        camera.far = 100;
        camera.updateProjectionMatrix();

        const targetY = -0.28;
        const target = new THREE.Vector3(0, targetY, 0);

        const horizDist = 9.2;
        const elevRad = THREE.MathUtils.degToRad(45);
        const dy = horizDist * Math.tan(elevRad);
        const yawRad = THREE.MathUtils.degToRad(22);

        const camX = horizDist * Math.sin(yawRad);
        const camZ = horizDist * Math.cos(yawRad);
        const camY = targetY - dy;
        camera.position.set(camX, camY, camZ);
        camera.lookAt(target);
    }, [camera]);

    return null;
}

const MiddleBoxSection = forwardRef<HTMLDivElement>((props, ref) => {
    const textRef = useRef<HTMLDivElement>(null);
    const fogRef = useRef<THREE.Fog>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (textRef.current) {
                gsap.from(textRef.current, {
                    scrollTrigger: {
                        trigger: "#middle-box-section",
                        start: "top 60%",
                        toggleActions: "play none none reverse"
                    },
                    y: 60,
                    opacity: 0,
                    duration: 1.2,
                    ease: "expo.out"
                });
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <div
            id="middle-box-scroll-area"
            style={{
                position: 'relative',
                width: '100%',
                minHeight: '400vh',
            }}
        >
            <div
                id="middle-box-section"
                ref={ref}
                style={{
                    position: 'sticky',
                    top: 0,
                    width: '100%',
                    height: '100vh',
                    backgroundColor: '#ececf2',
                    overflow: 'hidden',
                    zIndex: 25,
                    boxSizing: 'border-box',
                }}
            >
                <div
                    ref={textRef}
                    style={{
                        position: 'absolute',
                        top: '15%',
                        left: '0',
                        width: '100%',
                        textAlign: 'center',
                        zIndex: 30,
                        pointerEvents: 'none',
                        color: '#111'
                    }}
                >
                    <h2 style={{fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, color: '#111'}}>4 Core Modules</h2>
                    <p style={{color: '#555', marginTop: '10px'}}>각 모듈의 역할을 확인해 보세요.</p>
                </div>

                <div style={{position: 'absolute', inset: 0, zIndex: 35, pointerEvents: 'auto'}}/>

                <div style={{position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none'}}>
                    <Canvas style={{pointerEvents: 'none'}} gl={{alpha: false}} camera={{fov: 40, near: 0.35, far: 100}}>
                        <color attach="background" args={['#ececf2']}/>
                        <ObliqueCarouselCamera/>

                        <ambientLight intensity={1.85}/>
                        <directionalLight position={[12, 18, 8]} intensity={1.35} color="#ffffff"/>
                        <directionalLight position={[-8, 6, -6]} intensity={0.45} color="#dde8ff"/>

                        <fog ref={fogRef} attach="fog" args={['#ececf2', 14, 52]}/>
                        <Environment preset="city" environmentIntensity={0.85}/>

                        <Suspense fallback={null}>
                            <SensorCarouselTrack/>

                            <EffectComposer>
                                <Bloom luminanceThreshold={0.5} mipmapBlur/>
                                <ToneMapping/>
                            </EffectComposer>
                        </Suspense>
                    </Canvas>
                </div>
            </div>
        </div>
    );
});

MiddleBoxSection.displayName = 'MiddleBoxSection';

export default MiddleBoxSection;
