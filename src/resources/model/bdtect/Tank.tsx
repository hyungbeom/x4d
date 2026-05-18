import {useGLTF} from "@react-three/drei";

export function Tank(props:any) {
        const { nodes, materials }:any = useGLTF('/model/bdtec/Tank.glb')
        return (
            <group {...props} dispose={null}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001.geometry}
                        material={materials['Tank.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001_1.geometry}
                        material={materials['Material #152.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001_2.geometry}
                        material={materials['Material #153.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001_3.geometry}
                        material={materials['Material #154.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001_4.geometry}
                        material={materials['Material #155.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001_5.geometry}
                        material={materials['Material #156.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001_6.geometry}
                        material={materials['Material #157.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001_7.geometry}
                        material={materials['Material #158.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001_8.geometry}
                        material={materials['Material #159.001']}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Mesh001_9.geometry}
                        material={materials['Material #160.001']}
                    />
            </group>
        )
}

useGLTF.preload('/model/bdtec/Tank.glb')
