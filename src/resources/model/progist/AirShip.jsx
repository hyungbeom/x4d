import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** 비행선 스크린 — public/video/screen_video.mp4 추가 시 VideoMaterial 로 교체 가능 */
function ScreenMaterial() {
    return (
        <meshBasicMaterial
            color="#1a2a38"
            emissive="#0d7ea8"
            emissiveIntensity={0.35}
            toneMapped={false}
            side={THREE.DoubleSide}
        />
    )
}

export function AirShip(props) {
    const { nodes, materials } = useGLTF('/model/progist/Airship.glb')
    const shipRef = useRef()

    const initialY = props.position ? props.position[1] : 250

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        const yOffset = ((Math.sin(time * 1) + 1) / 2) * 20
        shipRef.current.position.y = initialY + yOffset
    })

    return (
        <group ref={shipRef} {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Airship_Body.geometry}
                material={materials.All_Texture}
                position={[0, -25.622, 0]}
            >
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Airship_Screen.geometry}
                    position={[1.736, 9.672, 0.231]}
                >
                    <ScreenMaterial />
                </mesh>
            </mesh>
        </group>
    )
}

useGLTF.preload('/model/progist/Airship.glb')
