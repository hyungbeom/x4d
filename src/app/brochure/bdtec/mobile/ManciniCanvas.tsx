'use client';

import { Canvas, extend } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { ResizeHandler } from "@/utils/three/ResizeHandler";
import { SceneLoadingReporter } from "@/utils/three/SceneLoadingReporter";
import { useBdtecSceneLoadingActions } from "@/utils/three/SceneLoadingContext";

// @ts-ignore
extend(THREE);

export function ManciniCanvas({
    quality,
    children,
    backgroundColor = '#0a0a0a',
}: {
    quality: string;
    children: React.ReactNode;
    /** Canvas clear color — 로딩·투명 영역용 */
    backgroundColor?: string;
}) {
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
            orthographic
            style={{ width: "100vw", height: "100vh", display: "block", touchAction: "none" }}
            dpr={dpr}
            camera={{
                position: [0, 200, 800],
                zoom: 1,
                near: -1000,
                far: 500000,
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
            onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.1;
                setWebgpuReady(true);
            }}
        >
            <color attach="background" args={[backgroundColor]} />
            <SceneLoadingReporter />
            {children}
            <ResizeHandler quality={quality} rendererRef={rendererRef} />
        </Canvas>
    );
}
