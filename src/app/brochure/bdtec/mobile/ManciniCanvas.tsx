'use client';

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { ResizeHandler } from "@/utils/three/ResizeHandler";
import { BdtecSceneLoadingReporter } from "@/app/brochure/bdtec/mobile/BdtecSceneLoadingReporter";
import { useBdtecSceneLoadingActions } from "@/app/brochure/bdtec/BdtecSceneLoadingContext";

export function ManciniCanvas({ quality, children }: { quality: string; children: React.ReactNode }) {
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const { setWebgpuReady } = useBdtecSceneLoadingActions();
    const [clientReady, setClientReady] = useState(false);


    useEffect(() => {

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
                near: -1000,
                far: 3000,
                fov: 25,
            }}
            shadows
            gl={{
                powerPreference: "high-performance",
                antialias: true,
                alpha: true,
            }}
            onCreated={({ gl }) => {
                rendererRef.current = gl;
                setWebgpuReady(true);
            }}
        >
            <BdtecSceneLoadingReporter />
            {children}
            <ResizeHandler quality={quality} rendererRef={rendererRef} />
        </Canvas>
    );
}
