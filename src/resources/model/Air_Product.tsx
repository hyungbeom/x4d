

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function AirProduct(props:any) {
    const { nodes, materials }:any = useGLTF('/model/bdtec/Air_Product.glb')
    return (
        <group {...props} dispose={null}>
            <mesh castShadow receiveShadow geometry={nodes.Case.geometry} material={materials.Cab} />
            <mesh castShadow receiveShadow geometry={nodes.Valve.geometry} material={materials.Metal} />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Front.geometry}
                material={materials.De_texture_a}
                position={[1.807, 0, 0.742]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Cover.geometry}
                material={materials.transparency}
                position={[2.103, 0, 0.978]}
            />
            <mesh castShadow receiveShadow geometry={nodes.Clip.geometry} material={materials.Metal} />
            <mesh castShadow receiveShadow geometry={nodes.Panel.geometry} material={materials.Cab} />
            <mesh castShadow receiveShadow geometry={nodes.screw.geometry} material={materials.Metal_Y} />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Black_Cover.geometry}
                material={materials.De_texture_b}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.circuit_board.geometry}
                material={materials.D_Green}
            />
            <mesh castShadow receiveShadow geometry={nodes.Socket_a.geometry} material={materials.Cab} />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Black_Box.geometry}
                material={materials.Black_P}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Socket_b.geometry}
                material={materials.Green}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.metal_box.geometry}
                material={materials.Metal}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Pin_Socket.geometry}
                material={materials.Red}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Black_screw.geometry}
                material={materials.Metal_B}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Black_Line.geometry}
                material={materials.Black_P}
            />
            <mesh castShadow receiveShadow geometry={nodes.Red_Line.geometry} material={materials.Red} />
            <mesh castShadow receiveShadow geometry={nodes.Mesh010.geometry} material={materials.Cab} />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Mesh010_1.geometry}
                material={materials.Gray}
            />
        </group>
    )
}

useGLTF.preload('/model/bdtec/Air_Product.glb')


