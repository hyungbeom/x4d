import React from 'react'
import {useGLTF} from '@react-three/drei'

export function Factory(props: any) {
    const {nodes, materials}: any = useGLTF('/model/bdtec/Factory.glb')
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Factory.geometry}
                material={materials.White}
                userData={{name: 'Factory'}}
            />
        </group>
    )
}

useGLTF.preload('/model/bdtec/Factory.glb')
