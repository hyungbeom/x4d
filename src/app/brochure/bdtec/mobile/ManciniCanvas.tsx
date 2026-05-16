import { Canvas, extend } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three/webgpu";
import { ResizeHandler } from "@/utils/three/ResizeHandler";

// @ts-ignore
extend(THREE);

export function ManciniCanvas({ quality, children }: any) {
    const rendererRef = useRef();

    // ❌ [삭제됨] frameloop 상태 관리는 이제 필요 없습니다!

    return (
        <Canvas
            orthographic
            // 🚀 [추가됨] 화면이 0px로 쪼그라드는 것을 막는 필수 CSS
            style={{ width: "100vw", height: "100vh", display: "block", touchAction: "none" }}

            // ❌ [삭제됨] onCreated의 강제 setSize 삭제 (반응형 충돌 방지)
            // ❌ [삭제됨] frameloop={frameloop} 삭제 (기본값인 "always"로 자동 작동)

            dpr={quality === "default" ? 1 : [1, 1.5]}
            // XZ 바닥 그리드가 선이 아니라 면으로 보이도록 +Z 정면이 아닌 비스듬한 시점
            onCreated={({ camera }) => {
                camera.lookAt(2, -0.6, 0);
                camera.updateProjectionMatrix();
            }}
            camera={{
                position: [175, 105, 238],
                zoom: 2,
                near: -600,
                far: 2600,
            }}
            shadows={"variance"}
            gl={async (props) => {
                const renderer = new THREE.WebGPURenderer({
                    ...props,
                    powerPreference: "high-performance",
                    antialias: false,
                    alpha: false,
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
            {children}
            <ResizeHandler quality={quality} rendererRef={rendererRef} />
        </Canvas>
    );
}