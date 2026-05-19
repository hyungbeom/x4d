import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function HouseModel(props:any) {
    const { nodes, materials } :any= useGLTF('/model/duon/House.glb')
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.House.geometry}
                material={materials.White}
                position={[2.602, 5.225, -1.411]}
                rotation={[0, 1.571, 0]}
            />
        </group>
    )
}

useGLTF.preload('/model/duon/House.glb')