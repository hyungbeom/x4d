import React from 'react';
import {useGLTF} from '@react-three/drei';

export function SensorB(props: any) {
    const {nodes, materials} = useGLTF('/model/bdtec/Sensor_B.glb') as any;

    return (
        <group {...props} dispose={null}>
            <group name="Sensor_B" userData={{name: 'Sensor_B'}}>
                <mesh castShadow receiveShadow geometry={nodes.Mesh.geometry} material={materials.Cab}/>
                <mesh castShadow receiveShadow geometry={nodes.Mesh_1.geometry} material={materials.Gray_n}/>
                <mesh castShadow receiveShadow geometry={nodes.Mesh_2.geometry} material={materials.Metal}/>
                <mesh castShadow receiveShadow geometry={nodes.Mesh_3.geometry} material={materials.Green}/>
                <mesh castShadow receiveShadow geometry={nodes.Mesh_4.geometry} material={materials.Blue_G}/>
                <mesh castShadow receiveShadow geometry={nodes.Mesh_5.geometry} material={materials.Yellow}/>
            </group>
        </group>
    );
}

useGLTF.preload('/model/bdtec/Sensor_B.glb');
