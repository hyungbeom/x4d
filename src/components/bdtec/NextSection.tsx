"use client";

import { useRef } from "react";
import * as THREE from "three";
import MiddleBoxSection from "@/components/bdtec/MiddleBoxSection";
import { useNextSectionScrollAnimations } from "@/hooks/useNextSectionScrollAnimations";
import NextSectionTextLayers from "@/components/bdtec/next-section/NextSectionTextLayers";
import NextSectionProductCanvas from "@/components/bdtec/next-section/NextSectionProductCanvas";
import BdtecSpecificationsSection from "@/components/bdtec/next-section/BdtecSpecificationsSection";
import BdtecDataConnectivitySection from "@/components/bdtec/next-section/BdtecDataConnectivitySection";

export default function NextSection() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<any>(null);
    const fogRef = useRef<THREE.Fog>(null);

    const textWrapperRef = useRef<HTMLDivElement>(null);
    const textIntroRef = useRef<HTMLDivElement>(null);
    const textFactoryRef = useRef<HTMLDivElement>(null);
    const textTankRef = useRef<HTMLDivElement>(null);
    const textWifiRef = useRef<HTMLDivElement>(null);
    const textBoxRef = useRef<HTMLDivElement>(null);

    const finalPageRef = useRef<HTMLDivElement>(null);
    const middleCanvasWrapperRef = useRef<HTMLDivElement>(null);
    const secondCanvasWrapperRef = useRef<HTMLDivElement>(null);
    const secondCanvasTextRef = useRef<HTMLDivElement>(null);
    const secondCanvasMeshRef = useRef<THREE.Mesh>(null);

    useNextSectionScrollAnimations({
        wrapperRef,
        sectionRef,
        canvasRef,
        textWrapperRef,
        finalPageRef,
        middleCanvasWrapperRef,
        secondCanvasWrapperRef,
        secondCanvasTextRef,
    });

    return (
        <>
            <div id="next-section-scroll-area" ref={wrapperRef} style={{ position: "relative", width: "100%", minHeight: "1050vh" }}>
                <div
                    id="next-section"
                    ref={sectionRef}
                    style={{
                        position: "sticky",
                        top: 0,
                        width: "100%",
                        height: "100vh",
                        backgroundColor: "#ffffff",
                        zIndex: 10,
                        overflow: "hidden",
                        willChange: "clip-path, filter",
                    }}
                >
                    <NextSectionTextLayers
                        textWrapperRef={textWrapperRef}
                        textIntroRef={textIntroRef}
                        textFactoryRef={textFactoryRef}
                        textTankRef={textTankRef}
                        textWifiRef={textWifiRef}
                        textBoxRef={textBoxRef}
                    />

                    <NextSectionProductCanvas
                        canvasRef={canvasRef}
                        controlsRef={controlsRef}
                        fogRef={fogRef}
                        scrollAreaRef={wrapperRef}
                        sectionRef={sectionRef}
                        textIntroRef={textIntroRef}
                        textFactoryRef={textFactoryRef}
                        textTankRef={textTankRef}
                        textWifiRef={textWifiRef}
                        textBoxRef={textBoxRef}
                    />
                </div>
            </div>

            <div style={{ marginTop: "-100vh", position: "relative", zIndex: 25 }}>
                <MiddleBoxSection ref={middleCanvasWrapperRef} />
            </div>

            <BdtecSpecificationsSection rootRef={finalPageRef} />

            <BdtecDataConnectivitySection
                rootRef={secondCanvasWrapperRef}
                textRef={secondCanvasTextRef}
                meshRef={secondCanvasMeshRef}
            />
        </>
    );
}
