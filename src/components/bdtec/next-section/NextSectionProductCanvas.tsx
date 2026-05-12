"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Center, ContactShadows, Environment, OrbitControls, RoundedBox } from "@react-three/drei";
import { AirProduct } from "@/resources/model/Air_Product";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ChimneySmoke } from "@/utils/ChimneySmoke";
import ModelAnimator from "@/components/bdtec/animators/ModelAnimator";
import BrochureR3fCanvas from "@/components/bdtec/next-section/BrochureR3fCanvas";

type Props = {
    canvasRef: React.RefObject<HTMLDivElement | null>;
    controlsRef: React.MutableRefObject<any>;
    fogRef: React.RefObject<THREE.Fog | null>;
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
    sectionRef: React.RefObject<HTMLDivElement | null>;
    textIntroRef: React.RefObject<HTMLDivElement | null>;
    textFactoryRef: React.RefObject<HTMLDivElement | null>;
    textTankRef: React.RefObject<HTMLDivElement | null>;
    textWifiRef: React.RefObject<HTMLDivElement | null>;
    textBoxRef: React.RefObject<HTMLDivElement | null>;
};

export default function NextSectionProductCanvas({
    canvasRef,
    controlsRef,
    fogRef,
    scrollAreaRef,
    sectionRef,
    textIntroRef,
    textFactoryRef,
    textTankRef,
    textWifiRef,
    textBoxRef,
}: Props) {
    return (
        <div ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
            <BrochureR3fCanvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
                <directionalLight position={[-10, 5, -10]} intensity={0.2} color="#ffffff" />
                <fog ref={fogRef} attach="fog" args={["#ffffff", 30, 90]} />

                <Environment preset="city" />

                <Suspense fallback={null}>
                    <ModelAnimator
                        controlsRef={controlsRef}
                        scrollAreaRef={scrollAreaRef}
                        sectionRef={sectionRef}
                        textRefs={[textIntroRef, textFactoryRef, textTankRef, textWifiRef, textBoxRef]}
                    >
                        <Center>
                            <group>
                                <RoundedBox
                                    args={[35, 35, 0.5]}
                                    position={[0, -0.5, 0]}
                                    rotation={[-Math.PI / 2, 0, 0]}
                                    radius={0.5}
                                    smoothness={4}
                                    receiveShadow
                                >
                                    <meshStandardMaterial color="#f0f0f5" roughness={0.4} metalness={0.1} />
                                </RoundedBox>
                                <AirProduct />
                                <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={15} blur={2.5} far={4} />
                            </group>
                        </Center>

                        <group position={[16, -3, 0]} scale={[1.5, 1.5, 1.5]}>
                            <ChimneySmoke />
                        </group>
                    </ModelAnimator>
                    <EffectComposer enableNormalPass={false}>
                        <Bloom luminanceThreshold={3} mipmapBlur intensity={1.2} />
                        <ToneMapping />
                    </EffectComposer>
                </Suspense>

                <OrbitControls
                    ref={controlsRef}
                    autoRotateSpeed={1.5}
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false}
                    makeDefault
                    target={[0, 2, 0]}
                    minPolarAngle={Math.PI / 2 - 0.15}
                    maxPolarAngle={Math.PI / 2}
                />
            </BrochureR3fCanvas>
        </div>
    );
}
