import React, { useEffect, useRef, useState } from 'react'
import {useGLTF, useVideoTexture} from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SCREEN_VIDEO_SRC = '/movie.mp4'

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
                    <AirshipScreenMaterial videoUrl={SCREEN_VIDEO_SRC} />
                </mesh>
            </mesh>
        </group>
    )
}

// 1. 비디오 텍스처를 처리할 Material 컴포넌트 생성
function AirshipScreenMaterial({ videoUrl }) {
    // 비디오 텍스처 로드 (기본적으로 자동 재생, 반복 재생, 음소거가 적용됩니다)
    const videoTexture = useVideoTexture(videoUrl);

    return (
        // meshBasicMaterial을 사용하면 빛의 영향을 받지 않아 화면이 밝게 보입니다.
        // 빛의 영향을 받게 하려면 meshStandardMaterial로 변경하세요.
        <meshBasicMaterial map={videoTexture} toneMapped={true} />
    );
}


useGLTF.preload('/model/progist/Airship.glb')
