import React, { useRef } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export const AIRSHIP_YOUTUBE_URL = 'https://www.youtube.com/watch?v=alV3wILz3Os'
const SCREEN_THUMBNAIL_SRC = '/thumbnail.png'

function ScreenThumbnailMaterial() {
    const texture = useTexture(SCREEN_THUMBNAIL_SRC)
    texture.flipY = false

    return <meshBasicMaterial map={texture} toneMapped={false} />
}

export function AirShip({ onScreenClick, ...props }) {
    const { nodes, materials } = useGLTF('/model/progist/Airship.glb')
    const shipRef = useRef()

    const initialY = props.position ? props.position[1] : 300

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
                    onClick={(e) => {
                        e.stopPropagation()
                        onScreenClick?.()
                    }}
                    onPointerOver={(e) => {
                        if (!onScreenClick) return
                        e.stopPropagation()
                        document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={() => {
                        document.body.style.cursor = ''
                    }}
                >
                    <ScreenThumbnailMaterial />
                </mesh>
            </mesh>
        </group>
    )
}

useGLTF.preload('/model/progist/Airship.glb')
