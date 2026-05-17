import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Cloud(props) {
    const { nodes, materials } = useGLTF('/model/progist/cloud_All.glb')



    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.cloud_A.geometry}
                material={materials.cloud}
                position={[-15.711, 9.16, -0.625]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.cloud_B.geometry}
                material={materials.cloud}
                position={[-2.027, 11.733, -13.209]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.cloud_C.geometry}
                material={materials.cloud}
                position={[-2.56, 7.013, 3.468]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.cloud_D.geometry}
                material={materials.cloud}
                position={[4.971, 11.545, 4.156]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.cloud_E.geometry}
                material={materials.cloud}
                position={[6.277, 8.267, -6.275]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.cloud_F.geometry}
                material={materials.cloud}
                position={[11.778, 9.742, -0.482]}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.cloud_G.geometry}
                material={materials.cloud}
                position={[15.609, -1.532, 12.423]}
            />
        </group>
    )
}

useGLTF.preload('/model/progist/cloud_All.glb')
