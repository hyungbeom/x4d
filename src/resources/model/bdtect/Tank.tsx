
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Tank(props:any) {
        const { nodes, materials }:any = useGLTF('/model/bdtec/Tank.glb')
        return (
            <group {...props} dispose={null}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Tank.geometry}
                        material={materials.White}
                        userData={{ name: 'Tank' }}
                    />
            </group>
        )
}

useGLTF.preload('/model/bdtec/Tank.glb')
