import React, { useRef, useEffect, Suspense } from 'react'
import { useGLTF, useVideoTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 1. 비디오 텍스처를 불러오는 부분만 따로 분리합니다.
// 이렇게 하면 비디오 파일이 덜 읽혔을 때 이 컴포넌트만 대기하고, 전체 모델이 사라지지 않습니다.
function VideoMaterial() {
    const texture = useVideoTexture('/video/screen_video.mp4', {
        unsuspend: 'canplay',
        crossOrigin: 'Anonymous',
        muted: true,
        loop: true,
        start: true,
    })

    useEffect(() => {
        if (texture && texture.image) {
            const startVideo = () => {
                texture.image.play().catch((err) => console.log("재생 대기 중...", err))
            }
            window.addEventListener('click', startVideo)
            window.addEventListener('touchstart', startVideo)

            startVideo()

            return () => {
                window.removeEventListener('click', startVideo)
                window.removeEventListener('touchstart', startVideo)
            }
        }
    }, [texture])

    return <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
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
                position={[0, -25.622, 0]}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Airship_Screen.geometry}
                    position={[1.736, 9.672, 0.231]}
                >
                    {/* 2. 비디오를 로딩하는 동안은 임시로 검은색 화면을 보여주도록 안전장치(Suspense)를 겁니다. */}
                    <Suspense fallback={<meshBasicMaterial color="#111111" />}>
                        <VideoMaterial />
                    </Suspense>
                </mesh>
            </mesh>
        </group>
    )
}

useGLTF.preload('/model/progist/Airship.glb')