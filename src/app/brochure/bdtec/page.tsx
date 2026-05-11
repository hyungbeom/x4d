// app/page.tsx (또는 Home.tsx)
"use client";

import {useEffect, useRef, useState} from 'react';
import {Canvas} from '@react-three/fiber'
import {Center, Environment, Grid, OrbitControls, Stage} from '@react-three/drei'
import {Bloom, EffectComposer, ToneMapping} from '@react-three/postprocessing'
import {AirProduct} from "@/resources/model/Air_Product";
import * as THREE from 'three';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

import Overlay1 from "@/components/bdtec/Overlay1";
import Overlay2 from "@/components/bdtec/Overlay2";
import Overlay3 from "@/components/bdtec/Overlay3";
import GsapModelWrapper from "@/components/bdtec/GsapModelWrapper";

// 💡 방금 만든 새 컴포넌트 불러오기!
import NextSection from "@/components/bdtec/NextSection";

import DynamicIsland from "@/utils/DynamicIsland";
import BdtecBrochureLoader from "@/components/bdtec/BdtecBrochureLoader";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
    const [isAutoRotate, setIsAutoRotate] = useState(true);
    const controlsRef = useRef<any>(null);
    const fogRef = useRef<THREE.Fog>(null);
    const gridRef = useRef<any>(null);

    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <BdtecBrochureLoader/>
            <main style={{ backgroundColor: 'white' }}>
            <DynamicIsland/>
            {/* =======================================================
                [섹션 A] 기존 3D 홀로그램 스크롤 영역 (z-index: 1)
            ======================================================= */}
            <div
                className="scroll-container"
                style={{
                    position: 'relative',
                    width: '100vw',
                    height: '700vh',
                    backgroundColor: 'black',
                    touchAction: 'pan-y',
                }}
            >
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        pointerEvents: 'none',
                    }}
                >
                    <Overlay1/>
                    <Overlay2/>
                    <Overlay3/>

                    <Canvas
                        flat
                        shadows
                        style={{pointerEvents: 'none', touchAction: 'pan-y'}}
                        camera={{position: [-15, 0, 10], fov: 55}}
                    >
                        <ambientLight intensity={1.5}/>
                        <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff"/>
                        <directionalLight position={[-10, 5, -10]} intensity={0.5} color="#ffffff"/>

                        <fog ref={fogRef} attach="fog" args={['#d8d8dc', 25, 80]}/>
                        <Environment background preset="sunset" blur={12}/>

                        <Stage intensity={8.5} environment={'city'} shadows={{type: 'accumulative', bias: -0.001, intensity: Math.PI}} adjustCamera={false}>
                            <GsapModelWrapper
                                setIsAutoRotate={setIsAutoRotate}
                                controlsRef={controlsRef}
                                fogRef={fogRef}
                                gridRef={gridRef}
                            >
                                <Center>
                                    <AirProduct/>
                                </Center>
                            </GsapModelWrapper>
                        </Stage>

                        <Grid
                            ref={gridRef}
                            renderOrder={-1}
                            position={[0, -3.2, 0]}
                            infiniteGrid
                            cellSize={0.5}
                            cellThickness={1}
                            sectionSize={1}
                            sectionThickness={1.5}
                            sectionColor={new THREE.Color(0.5, 0.5, 1)}
                            fadeDistance={35}
                        />

                        <OrbitControls
                            ref={controlsRef}
                            autoRotate={isAutoRotate}
                            autoRotateSpeed={1.5}
                            enableZoom={false}
                            enablePan={false}
                            enableRotate={false}
                            makeDefault
                            target={[0, 2, 0]}
                            minPolarAngle={Math.PI / 2 - 0.15}
                            maxPolarAngle={Math.PI / 2}
                        />

                        <EffectComposer>
                            <Bloom luminanceThreshold={2} mipmapBlur/>
                            <ToneMapping/>
                        </EffectComposer>
                    </Canvas>
                </div>
            </div>

            {/* =======================================================
                [섹션 B] 분리된 컴포넌트로 깔끔하게 렌더링!
            ======================================================= */}
            <NextSection />

        </main>
        </>
    );
}