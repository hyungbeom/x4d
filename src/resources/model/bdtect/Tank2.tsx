import { useGLTF } from '@react-three/drei';

export function Tank2(props: Record<string, unknown>) {
    const { nodes, materials }: { nodes: any; materials: any } = useGLTF('/model/bdtec/Tank2.glb');

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Tank.geometry}
                material={materials.White_object}
                position={[1.916, 0.607, 0.793]}
            />
        </group>
    );
}

useGLTF.preload('/model/bdtec/Tank2.glb');
