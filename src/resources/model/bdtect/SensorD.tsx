import React from 'react';
import {useGLTF} from '@react-three/drei';

const NODE = 'tripo_node_b961efe2-86a3-4639-af6a-cabdb034c05b';
const MAT = 'tripo_node_b961efe2-86a3-4639-af6a-cabdb034c05b_material';

export function SensorD(props: any) {
    const {nodes, materials} = useGLTF('/model/bdtec/Sensor_D.glb') as any;

    return (
        <group {...props} dispose={null}>
            <group name="Sensor_D" userData={{name: 'Sensor_D'}}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes[NODE].geometry}
                    material={materials[MAT]}
                />
            </group>
        </group>
    );
}

useGLTF.preload('/model/bdtec/Sensor_D.glb');
