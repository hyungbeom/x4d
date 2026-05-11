// components/GlobalCanvas.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import {EffectComposer, Noise} from "@react-three/postprocessing";
import { NodeToyTick } from '@nodetoy/react-nodetoy';
export default function GlobalCanvas() {

    return (
        <Canvas
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none", // DOM 요소(버튼 등) 클릭을 방해하지 않도록 설정
                zIndex: 1, // 배경으로 보냄
            }}
            // @ts-ignore
            eventSource={typeof window !== 'undefined' ? document.getElementById('root') : undefined}
        >

            {/* 💡 전역 포스트 프로세싱 효과 추가 */}
            <EffectComposer>
                <Noise opacity={0.03} />
            </EffectComposer>

            <View.Port />

            <NodeToyTick />
        </Canvas>
    );
}