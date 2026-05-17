'use client';

import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ResizeHandler } from "@/utils/three/ResizeHandler";
import { BdtecSceneLoadingReporter } from "@/app/brochure/bdtec/mobile/BdtecSceneLoadingReporter";
import { useBdtecSceneLoadingActions } from "@/app/brochure/bdtec/BdtecSceneLoadingContext";

export function ManciniCanvas({ quality, children }: { quality: string; children: React.ReactNode }) {
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const { setWebgpuReady } = useBdtecSceneLoadingActions();
    const [clientReady, setClientReady] = useState(false);
    const [dpr, setDpr] = useState(1);

    useEffect(() => {
        setDpr(window.devicePixelRatio);
        setClientReady(true);
    }, []);

    useEffect(() => {
        return () => {
            setWebgpuReady(false);
            const renderer = rendererRef.current;
            if (renderer) {
                renderer.dispose();
                rendererRef.current = null;
            }
        };
    }, [setWebgpuReady]);

    if (!clientReady) return null;

    return (
        <Canvas
            flat
            orthographic
            style={{ width: "100vw", height: "100vh", display: "block", touchAction: "none" }}
            dpr={window.devicePixelRatio}
            camera={{
                position: [0, 200, 800],
                zoom: 1,
                near: -25000,
                far: 25000,
            }}
            shadows
            gl={{
                powerPreference: "high-performance",
                antialias: true,
                alpha: false,
            }}
            onCreated={({ gl }) => {
                gl.toneMappingExposure = 1.1;
                gl.setClearColor(0x1a2030, 1);
                rendererRef.current = gl;
                setWebgpuReady(true);
            }}
        >
            <BdtecSceneLoadingReporter />
            {children}
            {/*@ts-ignored*/}
            <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={2} mipmapBlur />
                <ToneMapping />
            </EffectComposer>
            <ResizeHandler quality={quality} rendererRef={rendererRef} />
        </Canvas>
    );
}
