import React from 'react'
import {useGLTF} from '@react-three/drei'

export function Factory(props:any) {
    const { nodes, materials }:any = useGLTF('/model/bdtec/Factory.glb')
    return (
        <group {...props} dispose={null}>
            <group position={[0, 1.727, 0]}>
                <group position={[-0.069, 2.23, -1.585]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh005.geometry}
                        material={materials['1']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh005_1.geometry}
                        material={materials['Material #204.001']}
                    />
                </group>
                <group position={[-0.001, 0, 2.194]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh003.geometry}
                        material={materials['1']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh003_1.geometry}
                        material={materials['Material #203.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh003_2.geometry}
                        material={materials['Material #204.001']}
                    />
                </group>
                <group position={[0, 0, -0.839]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh004.geometry}
                        material={materials['Material #199.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh004_1.geometry}
                        material={materials['Material #200.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh004_2.geometry}
                        material={materials['Material #201.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh004_3.geometry}
                        material={materials['Material #203.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh004_4.geometry}
                        material={materials['Material #205.001']}
                    />
                </group>
            </group>
        </group>
    )
}
useGLTF.preload('/model/bdtec/Factory.glb')
