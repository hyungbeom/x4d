"use client";

import { Suspense } from "react";
import Link from "next/link";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, Grid, OrbitControls, Stage } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { Robot } from "@/resources/model/bdtect/Robot";

const gridSectionColor = new THREE.Color(0.5, 0.5, 10);

function HomeOverlay() {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 10,
            }}
        >
            <a
                href="https://pmnd.rs/"
                style={{
                    position: "absolute",
                    bottom: 40,
                    left: 90,
                    fontSize: "13px",
                    pointerEvents: "auto",
                }}
            >
                pmnd.rs
                <br />
                dev collective
            </a>
            <div
                style={{
                    position: "absolute",
                    top: 40,
                    left: 40,
                    fontSize: "13px",
                    fontFamily: "Meslo",
                    lineHeight: "1.6em",
                    whiteSpace: "pre",
                    pointerEvents: "auto",
                }}
            >
                &gt; <Link href="/brochure/bdtec">Dashboard</Link>
                <br />
                &gt; ll
                <br />
                {`-rw-r--r-- 1 ph  94M model.glb`}
                <br />
                {`-rw-r--r-- 1 ph 406K model-transformed.glb`}
            </div>
            <div style={{ position: "absolute", bottom: 40, right: 40, fontSize: "13px" }}>29/12/2022</div>
        </div>
    );
}

export default function HomeRobotLanding() {
    return (
        <div style={{ position: "relative", width: "100dvw", height: "100dvh" }}>
            <HomeOverlay />

            <Canvas flat shadows camera={{ position: [-15, 0, 10], fov: 25 }}>
                <fog attach="fog" args={["black", 15, 22.5]} />

                <Suspense fallback={null}>
                    <Environment background preset="sunset" blur={20} />
                    <Stage
                        intensity={0.5}
                        environment="studio"
                        shadows={{ type: "accumulative", bias: -0.001, intensity: Math.PI }}
                        adjustCamera={false}
                    >
                        <Robot rotation={[0, Math.PI, 0]} />
                    </Stage>
                </Suspense>

                <Grid
                    renderOrder={-1}
                    position={[0, -1.85, 0]}
                    infiniteGrid
                    cellSize={0.6}
                    cellThickness={0.6}
                    sectionSize={3.3}
                    sectionThickness={1.5}
                    sectionColor={gridSectionColor}
                    fadeDistance={30}
                />
                <OrbitControls
                    autoRotate
                    autoRotateSpeed={0.05}
                    enableZoom={false}
                    makeDefault
                    minPolarAngle={Math.PI / 2}
                    maxPolarAngle={Math.PI / 2}
                />

                <EffectComposer enableNormalPass={false}>
                    <Bloom luminanceThreshold={2} mipmapBlur />
                    <ToneMapping />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
