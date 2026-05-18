'use client';

/** BDTEC 브로슈어 3D — 유리 바닥 하이라이트 포함 */
export function BdtecLightEnvironment() {
    return (
        <>
            <ambientLight intensity={0.65} />
            <hemisphereLight
                color="#d0e8f8"
                groundColor="#243040"
                intensity={0.5}
                position={[0, 400, 0]}
            />
            <directionalLight
                position={[320, 520, 280]}
                intensity={3.2}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-near={10}
                shadow-camera-far={2000}
                shadow-camera-top={800}
                shadow-camera-right={800}
                shadow-camera-bottom={-800}
                shadow-camera-left={-800}
                shadow-bias={-0.0005}
            />
            <directionalLight
                position={[-280, 180, -220]}
                intensity={0.85}
                color="#b8d0f0"
            />
            {/* 바닥 유리·거울 스펙큘러 */}
            <directionalLight position={[120, 280, 180]} intensity={1.1} color="#e8f4ff" />
            <pointLight position={[0, 120, 0]} intensity={0.35} color="#6ec8e8" distance={1200} decay={2} />
            {/* 시스템 유리관 하이라이트 */}
            <directionalLight position={[120, 280, 160]} intensity={1.1} color="#c8ecff" />
        </>
    );
}
