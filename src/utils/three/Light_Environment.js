/** bdtec 대형 씬용 조명 (모델 좌표가 수백 단위) */
export function Light_Environment() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <hemisphereLight
        color="#e8eeff"
        groundColor="#3a3a48"
        intensity={0.65}
        position={[0, 400, 0]}
      />
      <directionalLight
        position={[320, 520, 280]}
        intensity={1.8}
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
    </>
  );
}
