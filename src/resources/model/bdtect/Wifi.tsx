import React from 'react'
import {useGLTF} from '@react-three/drei'

export function Wifi(props:any) {
        const { nodes, materials }:any = useGLTF('/model/bdtec/Wifi.glb')
        return (
            <group {...props} dispose={null}>
                    <mesh castShadow receiveShadow geometry={nodes.Mesh.geometry} material={materials.metal} />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh_1.geometry}
                        material={materials['Material #137']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh_2.geometry}
                        material={materials['Material #138']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh_3.geometry}
                        material={materials['Material #139']}
                    />
            </group>
        )
}

useGLTF.preload('/model/bdtec/Wifi.glb')
