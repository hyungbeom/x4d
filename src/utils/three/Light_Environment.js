/** bdtec 대형 씬용 조명 (모델 좌표가 수백 단위) */
export function Light_Environment() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <hemisphereLight
        color="#e8eeff"
        groundColor="#444450"
        intensity={0.28}
        position={[0, 400, 0]}
      />
      <directionalLight
        position={[320, 520, 280]}
        intensity={3.6}
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
        intensity={0.7}
        color="#c8d0e8"
      />
    </>
  );
}
