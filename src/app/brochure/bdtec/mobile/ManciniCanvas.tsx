import { Canvas, extend } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three/webgpu";
import { ResizeHandler } from "@/utils/three/ResizeHandler";

// @ts-ignore
extend(THREE);

export function ManciniCanvas({ quality, children }: any) {
    const rendererRef = useRef(null);

    // ❌ [삭제됨] frameloop 상태 관리는 이제 필요 없습니다!

    return (
        <Canvas
            orthographic
            // 🚀 [추가됨] 화면이 0px로 쪼그라드는 것을 막는 필수 CSS
            style={{ width: "100vw", height: "100vh", display: "block", touchAction: "none" }}

            // ❌ [삭제됨] onCreated의 강제 setSize 삭제 (반응형 충돌 방지)
            // ❌ [삭제됨] frameloop={frameloop} 삭제 (기본값인 "always"로 자동 작동)

            dpr={window.devicePixelRatio}
            camera={{
                position: [0, 200, 800],
                zoom: 1,
                near: -1000,
                far: 3000,
            }}
            shadows={"variance"}
            gl={async (props:any) => {
                const renderer = new THREE.WebGPURenderer({
                    ...props,
                    powerPreference: "high-performance",
                    antialias: true,
                    alpha: true,
                    stencil: false,
                });

                // 엔진 초기화가 끝날 때까지 대기
                await renderer.init();

                console.log("🔥 R3F v9 WebGPU 엔진 가동 완료 (Orthographic 모드)");

                // ResizeHandler에서 쓸 수 있게 ref에 연결
                rendererRef.current = renderer as any;
                return renderer;
            }}
        >
            <color attach="background" args={['#0a0a0a']} />
            {children}
            {/*<ResizeHandler quality={quality} rendererRef={rendererRef} />*/}
        </Canvas>
    );
}