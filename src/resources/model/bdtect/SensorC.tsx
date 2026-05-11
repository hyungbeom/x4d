import React from 'react';
import {useGLTF} from '@react-three/drei';

export function SensorC(props: any) {
    const {nodes, materials} = useGLTF('/model/bdtec/Sensor_C.glb') as any;

    return (
        <group {...props} dispose={null}>
            <group name="Sensor_C" userData={{name: 'Sensor_C'}} position={[0, 0.761, 0]}>
                <mesh castShadow receiveShadow geometry={nodes.Mesh.geometry} material={materials['17 - Default']}/>
                <mesh castShadow receiveShadow geometry={nodes.Mesh_1.geometry} material={materials['Material #113']}/>
                <mesh castShadow receiveShadow geometry={nodes.Mesh_2.geometry} material={materials['Material #112']}/>
                <mesh castShadow receiveShadow geometry={nodes.Mesh_3.geometry} material={materials.Metal}/>
            </group>
        </group>
    );
}

useGLTF.preload('/model/bdtec/Sensor_C.glb');
