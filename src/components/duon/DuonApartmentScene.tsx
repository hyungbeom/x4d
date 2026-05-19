'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Center } from '@react-three/drei';
import { Apartment } from '@/resources/model/duon/Apartment';

function ApartmentModel() {
    return (
        <Center position={[0, -0.6, 0]}>
            <Apartment scale={0.2} />
        </Center>
    );
}

export default function DuonApartmentScene() {
    return (
        <Canvas
            camera={{ position: [0, 2.4, 8], fov: 38, near: 0.1, far: 100 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
        >
            <ambientLight intensity={0.65} />
            <directionalLight position={[6, 10, 4]} intensity={1.1} castShadow />
            <directionalLight position={[-4, 6, -2]} intensity={0.35} />
            <Suspense fallback={null}>
                <Environment preset="city" />
                <ApartmentModel />
            </Suspense>
        </Canvas>
    );
}
