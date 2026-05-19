import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Congratulatory(props:any) {
    const { nodes, materials }:any = useGLTF('\'/model/duon/Congratulatory_speech.glb')
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Congratulatory_speech.geometry}
                material={materials.White}
            />
        </group>
    )
}

useGLTF.preload('\'/model/duon/Congratulatory_speech.glb')
