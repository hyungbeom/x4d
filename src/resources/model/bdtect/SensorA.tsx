import React from 'react';
import {useGLTF} from '@react-three/drei';

export function SensorA(props: any) {
    const { nodes, materials } =  useGLTF('/model/bdtec/Sensor_A.glb') as any;
    return (
        <group {...props} dispose={null}>
            <group name="Sensor_A" userData={{ name: 'Sensor_A' }}>
                <mesh
                    name="Mesh"
                    castShadow
                    receiveShadow
                    geometry={nodes.Mesh.geometry}
                    material={materials.Sensor_A}
                />
                <mesh
                    name="Mesh_1"
                    castShadow
                    receiveShadow
                    geometry={nodes.Mesh_1.geometry}
                    material={materials.Black_P}
                />
                <mesh
                    name="Mesh_2"
                    castShadow
                    receiveShadow
                    geometry={nodes.Mesh_2.geometry}
                    material={materials.Metal}
                />
            </group>
        </group>
    )
}

useGLTF.preload('/model/bdtec/Sensor_A.glb');
