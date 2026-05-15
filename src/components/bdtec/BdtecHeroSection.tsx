"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useOptionalBdtecHeroScrollContainerRef } from "@/components/bdtec/BdtecHeroScrollContainer";
import { Center, Environment, Grid, OrbitControls, Stage } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { AirProduct } from "@/resources/model/Air_Product";
import * as THREE from "three";
import Overlay1 from "@/components/bdtec/Overlay1";
import Overlay2 from "@/components/bdtec/Overlay2";
import Overlay3 from "@/components/bdtec/Overlay3";
import GsapModelWrapper from "@/components/bdtec/GsapModelWrapper";

const gridSectionColor = new THREE.Color(0.5, 0.5, 1);

export default function BdtecHeroSection() {
    const [isAutoRotate, setIsAutoRotate] = useState(true);
    const controlsRef = useRef<any>(null);
    const fogRef = useRef<THREE.Fog>(null);
    const gridRef = useRef<any>(null);
    const contextScrollRef = useOptionalBdtecHeroScrollContainerRef();
    const fallbackScrollRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = contextScrollRef ?? fallbackScrollRef;

    return (
        <div
            ref={scrollContainerRef}
            className="scroll-container"
            style={{
                position: "relative",
                width: "100dvw",
                height: "700vh",
                backgroundColor: "black",
                touchAction: "pan-y",
            }}
        >
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100dvw",
                    height: "100dvh",
                    pointerEvents: "none",
                }}
            >
                <Overlay1 />
                <Overlay2 />
                <Overlay3 />

                <Canvas
                    flat
                    shadows
                    style={{ pointerEvents: "none", touchAction: "pan-y" }}
                    camera={{ position: [-15, 0, 10], fov: 55 }}
                >
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                    <directionalLight position={[-10, 5, -10]} intensity={0.5} color="#ffffff" />

                    <fog ref={fogRef} attach="fog" args={["#d8d8dc", 25, 80]} />
                    <Environment background preset="sunset" blur={12} />

                    <Stage
                        intensity={8.5}
                        environment={"city"}
                        shadows={{ type: "accumulative", bias: -0.001, intensity: Math.PI }}
                        adjustCamera={false}
                    >
                        <GsapModelWrapper
                            setIsAutoRotate={setIsAutoRotate}
                            controlsRef={controlsRef}
                            fogRef={fogRef}
                            gridRef={gridRef}
                        >
                            <Center>
                                <AirProduct />
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
                        sectionColor={gridSectionColor}
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
                        <Bloom luminanceThreshold={2} mipmapBlur />
                        <ToneMapping />
                    </EffectComposer>
                </Canvas>
            </div>
        </div>
    );
}
