'use client';

import { Canvas, extend } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { ResizeHandler } from "@/utils/three/ResizeHandler";
import { BdtecSceneLoadingReporter } from "@/app/brochure/bdtec/mobile/BdtecSceneLoadingReporter";
import { useBdtecSceneLoadingActions } from "@/app/brochure/bdtec/BdtecSceneLoadingContext";

// @ts-ignore
extend(THREE);

export function ManciniCanvas({ quality, children }: { quality: string; children: React.ReactNode }) {
    const rendererRef = useRef<THREE.WebGPURenderer | null>(null);
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
            dpr={dpr}
            camera={{
                position: [0, 200, 800],
                zoom: 1,
                near: -1000,
                far: 3000,
                fov: 25
            }}
            shadows={"variance"}
            gl={async (props: Record<string, unknown>) => {
                const renderer = new THREE.WebGPURenderer({
                    ...props,
                    powerPreference: "high-performance",
                    antialias: true,
                    alpha: true,
                    stencil: false,
                });

                await renderer.init();
                rendererRef.current = renderer as never;
                return renderer;
            }}
            onCreated={() => {
                setWebgpuReady(true);
            }}
        >
            <color attach="background" args={['#0a0a0a']} />
            <BdtecSceneLoadingReporter />
            {children}
            <ResizeHandler quality={quality} rendererRef={rendererRef} />
        </Canvas>
    );
}
