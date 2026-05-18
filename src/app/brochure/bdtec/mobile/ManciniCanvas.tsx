'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { ResizeHandler } from '@/utils/three/ResizeHandler';
import { SceneLoadingReporter } from '@/utils/three/SceneLoadingReporter';
import { useBdtecSceneLoadingActions } from '@/utils/three/SceneLoadingContext';

export function ManciniCanvas({
    quality,
    children,
    backgroundColor = '#0a0a0a',
}: {
    quality: string;
    children: React.ReactNode;
    backgroundColor?: string;
}) {
    const rendererRef = useRef<WebGPURenderer | null>(null);
    const backgroundColorRef = useRef(backgroundColor);
    backgroundColorRef.current = backgroundColor;

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
            style={{ width: '100vw', height: '100vh', display: 'block', touchAction: 'none' }}
            dpr={dpr}
            camera={{
                position: [0, 200, 800],
                zoom: 1,
                near: -1000,
                far: 500000,
                fov: 25,
            }}
            shadows
            gl={async (props) => {
                const { powerPreference: _ignored, ...rest } = props as Record<string, unknown>;
                const renderer = new WebGPURenderer({
                    ...rest,
                    antialias: true,
                    alpha: true,
                    stencil: false,
                });

                await renderer.init();
                rendererRef.current = renderer;
                return renderer;
            }}
            onCreated={({ scene, gl }) => {
                scene.background = new THREE.Color(backgroundColorRef.current);
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.1;
                setWebgpuReady(true);
            }}
        >
            <SceneLoadingReporter />
            {children}
            <ResizeHandler quality={quality} rendererRef={rendererRef} />
        </Canvas>
    );
}
