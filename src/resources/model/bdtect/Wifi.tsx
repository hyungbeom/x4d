import React from 'react'
import {useGLTF} from '@react-three/drei'

export function Wifi(props:any) {
        const { nodes, materials }:any = useGLTF('/model/bdtec/Wifi.glb')
        return (
            <group {...props} dispose={null}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Wifi.geometry}
                    material={materials.White}
                    userData={{ name: 'Wifi' }}
                />
            </group>
        )
}

useGLTF.preload('/model/bdtec/Wifi.glb')
