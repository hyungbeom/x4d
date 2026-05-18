import React, { useEffect, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const SCREEN_VIDEO_SRC = '/movie.mp4'

const VIDEO_READY_STATE = typeof HTMLMediaElement !== 'undefined'
    ? HTMLMediaElement.HAVE_CURRENT_DATA
    : 2

export function AirShip({ onScreenClick, screenVideoPaused = false, ...props }) {
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
                    <AirshipScreenMaterial
                        videoUrl={SCREEN_VIDEO_SRC}
                        paused={screenVideoPaused}
                    />
                </mesh>
            </mesh>
        </group>
    )
}

function AirshipScreenMaterial({ videoUrl, paused }) {
    const gl = useThree((state) => state.gl)
    const [texture, setTexture] = useState(null)
    const videoRef = useRef(null)
    const textureRef = useRef(null)

    useEffect(() => {
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.loop = true
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'
        video.src = videoUrl
        videoRef.current = video

        const attachTexture = () => {
            if (video.readyState < VIDEO_READY_STATE) return

            const nextTexture = new THREE.VideoTexture(video)
            nextTexture.colorSpace = gl.outputColorSpace
            textureRef.current = nextTexture
            setTexture(nextTexture)

            if (!paused) {
                void video.play().catch(() => {})
            }
        }

        video.addEventListener('loadeddata', attachTexture)
        if (video.readyState >= VIDEO_READY_STATE) attachTexture()
        video.load()

        return () => {
            video.removeEventListener('loadeddata', attachTexture)
            video.pause()
            video.removeAttribute('src')
            video.load()
            textureRef.current?.dispose()
            textureRef.current = null
            videoRef.current = null
            setTexture(null)
        }
    }, [videoUrl, gl.outputColorSpace])

    useEffect(() => {
        const video = videoRef.current
        if (!video || video.readyState < VIDEO_READY_STATE) return

        if (paused) {
            video.pause()
            return
        }

        void video.play().catch(() => {})
    }, [paused])

    if (!texture) {
        return <meshBasicMaterial color="#1a2a3a" toneMapped />
    }

    return <meshBasicMaterial map={texture} toneMapped />
}

useGLTF.preload('/model/progist/Airship.glb')
