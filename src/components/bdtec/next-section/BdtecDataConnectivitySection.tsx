"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Float, OrbitControls } from "@react-three/drei";
import BrochureR3fCanvas from "@/components/bdtec/next-section/BrochureR3fCanvas";

type Props = {
    rootRef: React.RefObject<HTMLDivElement | null>;
    textRef: React.RefObject<HTMLDivElement | null>;
    meshRef: React.RefObject<THREE.Mesh | null>;
};

export default function BdtecDataConnectivitySection({ rootRef, textRef, meshRef }: Props) {
    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100dvh",
                backgroundColor: "#050505",
                overflow: "hidden",
                zIndex: 20,
            }}
        >
            <div
                ref={textRef}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "10%",
                    transform: "translateY(-50%)",
                    zIndex: 30,
                    pointerEvents: "none",
                    color: "#fff",
                }}
            >
                <h2 style={{ fontSize: "clamp(30px, 4vw, 60px)", fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
                    Data <br /> <span style={{ color: "#0ae448" }}>Connectivity.</span>
                </h2>
                <p
                    style={{
                        fontSize: "clamp(14px, 1.5vw, 20px)",
                        color: "#888",
                        marginTop: "20px",
                        maxWidth: "400px",
                        wordBreak: "keep-all",
                    }}
                >
                    수집된 데이터는 안전하고 빠르게 클라우드로 동기화되어 끊김 없는 모니터링 환경을 제공합니다.
                </p>
            </div>

            <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
                <BrochureR3fCanvas shadows={false} camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 10]} intensity={1} color="#0ae448" />
                    <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#5ea2e6" />

                    <Suspense fallback={null}>
                        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                            <mesh ref={meshRef} position={[2, 0, 0]}>
                                <icosahedronGeometry args={[1.5, 1]} />
                                <meshStandardMaterial color="#0ae448" wireframe transparent opacity={0.8} />
                            </mesh>
                        </Float>
                    </Suspense>

                    <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} autoRotate autoRotateSpeed={0.5} />
                </BrochureR3fCanvas>
            </div>
        </div>
    );
}
