
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import {useFrame} from "@react-three/fiber";
import { easing } from 'maath'

export function Robot(props:any) {

    const head = useRef(null)
    const stripe = useRef(null)
    const light = useRef(null)

    const { nodes, materials }:any = useGLTF('/model/progist/robot.glb');

    useFrame((state:any, delta:number) => {
        const t = (1 + Math.sin(state.clock.elapsedTime * 2)) / 2
        stripe.current.color.setRGB(2 + t * 20, 2, 20 + t * 50)
        easing.dampE(head.current.rotation, [0, state.pointer.x * (state.camera.position.z > 1 ? 1 : -1), 0], 0.4, delta)
        light.current.intensity = 1 + t * 4
    })

    return (
        <group {...props} dispose={null}>
            <mesh castShadow receiveShadow geometry={nodes.body001.geometry} material={materials.Body} />
            <group ref={head}>
                <mesh castShadow receiveShadow geometry={nodes.head001.geometry} material={materials.Head}  />
                <mesh castShadow receiveShadow geometry={nodes.stripe001.geometry}>
                    {/* transparent와 opacity 속성 추가 */}
                    <meshBasicMaterial
                        ref={stripe}
                        toneMapped={false}
                        transparent={true}
                        opacity={1}
                    />
                    <pointLight ref={light} intensity={1} color={[10, 2, 5]} distance={2.5} />
                </mesh>
            </group>
        </group>
    )
}

useGLTF.preload('/model/progist/robot.glb')
