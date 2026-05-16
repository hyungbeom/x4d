import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {useGLTF} from "@react-three/drei";


export function SystemModel(props:any) {


    const { nodes, materials }:any = useGLTF('/model/bdtec/system.glb')
    return (
        <group {...props} dispose={null}>
            <group scale={0.01}>
                <group position={[12.623, -110.893, 156.094]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Ellipse.geometry}
                        material={nodes.Ellipse.material}
                        position={[25.099, 0.495, 0]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Rectangle003.geometry}
                        material={nodes.Rectangle003.material}
                        position={[-7.599, -0.495, 0]}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube.geometry}
                    material={nodes.Cube.material}
                    position={[-43.939, -100.314, 46.05]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[1.203, 1.203, 0.179]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube001.geometry}
                    material={nodes.Cube001.material}
                    position={[-47.266, -78.853, 46.388]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[1.203, 1.203, 0.18]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube002.geometry}

                    position={[-47.266, 0.937, 47.255]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[-1.203, -1.203, -0.704]}
                >
                    <meshPhysicalMaterial
                        color="#ffffff"
                        transmission={1}      // 빛 100% 통과 (유지)
                        transparent={true}
                        opacity={1}           // 유지
                        roughness={0}         // 🚀 금속 광택 제거를 위해 가장 매끄럽게 (0)
                        metalness={0}         // 🚀 명시적으로 금속성 0!
                        ior={1.5}             // 유지
                        thickness={0.1}       // 🚀 두께를 아주 얇게 잡아야 덜 단단해 보입니다 (1 -> 0.1)
                        clearcoat={0}         // 🚀 쨍한 주범! 코팅 제거 (1 -> 0)
                        side={THREE.DoubleSide}
                    />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube003.geometry}

                    position={[-47.266, -47.497, 47.255]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[-1.203, -1.203, -1.342]}
                >
                    <meshPhysicalMaterial
                        color="#ffffff"
                        transmission={1}      // 빛 100% 통과 (유지)
                        transparent={true}
                        opacity={1}           // 유지
                        roughness={0}         // 🚀 금속 광택 제거를 위해 가장 매끄럽게 (0)
                        metalness={0}         // 🚀 명시적으로 금속성 0!
                        ior={1.5}             // 유지
                        thickness={0.1}       // 🚀 두께를 아주 얇게 잡아야 덜 단단해 보입니다 (1 -> 0.1)
                        clearcoat={0}         // 🚀 쨍한 주범! 코팅 제거 (1 -> 0)
                        side={THREE.DoubleSide}
                    />
                </mesh>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube004.geometry}
                    material={nodes.Cube004.material}
                    position={[-47.266, -87.001, 46.276]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[1.203, 1.203, 0.18]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube005.geometry}
                    material={nodes.Cube005.material}
                    position={[-47.183, -157.118, 45.717]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[1.507, 1.565, 0.098]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube006.geometry}
                    material={nodes.Cube006.material}
                    position={[-47.183, -118.125, 45.717]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[1.38, 1.38, 0.388]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube007.geometry}
                    material={nodes.Cube007.material}
                    position={[-43.939, -13.86, 47.61]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[0.697, 0.652, 0.589]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cube008.geometry}
                    material={nodes.Cube008.material}
                    position={[-43.939, -31.946, 47.581]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[0.856, 0.832, 0.759]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Cylinder.geometry}
                    material={nodes.Cylinder.material}
                    position={[-43.939, -13.86, 47.581]}
                    scale={[1.57, 0.528, 1]}
                />
                <group position={[454.784, -23.759, 38.256]} scale={0}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Quick_and_Safe_transactions.geometry}
                        material={nodes.Quick_and_Safe_transactions.material}
                        position={[32, 2, 0]}
                        scale={0}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Quick_and_Safe_transactions_2.geometry}
                        material={nodes.Quick_and_Safe_transactions_2.material}
                        position={[32, 2, 0]}
                        scale={0}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Quick_and_Safe_transactions001.geometry}
                        material={nodes.Quick_and_Safe_transactions001.material}
                        position={[32, 2, 0]}
                        scale={0}
                    />
                </group>
                <group position={[-157.954, -116.426, 52.003]} rotation={[0, -1.571, 0]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Lock002.geometry}
                        material={nodes.Lock002.material}
                        position={[0, 0, -2.14]}
                        rotation={[Math.PI / 2, 0, 0]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Torus_2002.geometry}
                        material={nodes.Torus_2002.material}
                        position={[0, 0.008, 10]}
                        rotation={[0.017, 0, 0]}
                    />
                </group>
                <group position={[56.601, -137.242, 86.326]} rotation={[0, 1.571, 0]} scale={0.5}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Lock.geometry}
                        material={nodes.Lock.material}
                        position={[0, 0, -2.14]}
                        rotation={[Math.PI / 2, 0, 0]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Torus_2.geometry}
                        material={nodes.Torus_2.material}
                        position={[0, 0.008, 10]}
                        rotation={[0.017, 0, 0]}
                    />
                </group>
                <group position={[56.601, -102.316, 86.326]} rotation={[0, 1.571, 0]} scale={0.5}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Lock001.geometry}
                        material={nodes.Lock001.material}
                        position={[0, 0, -2.14]}
                        rotation={[Math.PI / 2, 0, 0]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Torus_2001.geometry}
                        material={nodes.Torus_2001.material}
                        position={[0, 0.008, 10]}
                        rotation={[0.017, 0, 0]}
                    />
                </group>
                <group position={[-50.478, -112.745, 157.124]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Lock003.geometry}
                        material={nodes.Lock003.material}
                        position={[0, 0, -2.14]}
                        rotation={[Math.PI / 2, 0, 0]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Torus_2003.geometry}
                        material={nodes.Torus_2003.material}
                        position={[0, 0.008, 10]}
                        rotation={[0.017, 0, 0]}
                    />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Lock004.geometry}
                    material={nodes.Lock004.material}
                    position={[-357.058, -119.253, 54.455]}
                    rotation={[Math.PI / 2, 0, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Lock005.geometry}
                    material={nodes.Lock005.material}
                    position={[-51.422, -112.745, 301.094]}
                    rotation={[Math.PI / 2, 0, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Lock006.geometry}
                    material={nodes.Lock006.material}
                    position={[540.496, -96.652, -135.521]}
                    rotation={[Math.PI / 2, 0, Math.PI / 2]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Main_Pipe_Line_Gasket.geometry}
                    material={nodes.Main_Pipe_Line_Gasket.material}
                    position={[526.495, -96.652, -135.521]}
                    rotation={[Math.PI, Math.PI / 2, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Main_Pipe_Line_Gasket001.geometry}
                    material={nodes.Main_Pipe_Line_Gasket001.material}
                    position={[-41.219, -48.997, -45.066]}
                    rotation={[-Math.PI, 0, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Path.geometry}
                    material={nodes.Path.material}
                    position={[33.342, -103.896, 86.326]}
                    rotation={[0, 0, -Math.PI]}
                />
                {/*<mesh*/}
                {/*    castShadow*/}
                {/*    receiveShadow*/}
                {/*    geometry={nodes.Path_for_Laser.geometry}*/}
                {/*    material={nodes.Path_for_Laser.material}*/}
                {/*    position={[-148.376, -118.397, 50.708]}*/}
                {/*    rotation={[-Math.PI / 2, 0, Math.PI / 2]}*/}
                {/*/>*/}

                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Pipe_Line_5_Path.geometry}
                    material={nodes.Pipe_Line_5_Path.material}
                    position={[57.053, -102.286, 50.708]}
                    rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Pipe_Line_path.geometry}
                    material={nodes.Pipe_Line_path.material}
                    position={[-49.518, -112.402, 157.601]}
                    rotation={[-1.553, 0, 0]}
                />

                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Rectangle.geometry}
                    material={nodes.Rectangle.material}
                    position={[58.508, -118.672, 106.652]}
                    rotation={[-Math.PI / 2, Math.PI / 2, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Rectangle001.geometry}
                    material={nodes.Rectangle001.material}
                    position={[58.508, -118.672, 117.449]}
                    rotation={[-Math.PI / 2, Math.PI / 2, 0]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Rectangle002.geometry}
                    material={nodes.Rectangle002.material}
                    position={[58.508, -118.672, 127.094]}
                    rotation={[-Math.PI / 2, Math.PI / 2, 0]}
                />
                <group position={[-38.676, -96.426, -76.602]} rotation={[0, -1.571, 0]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Lock_4002.geometry}
                        material={nodes.Lock_4002.material}
                        position={[3.001, 0, 0]}
                        rotation={[Math.PI / 2, 0, Math.PI / 2]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Main_Pipe_Line_Gasket_6001.geometry}
                        material={nodes.Main_Pipe_Line_Gasket_6001.material}
                        position={[-11, 0, 0]}
                        rotation={[-Math.PI, Math.PI / 2, 0]}
                    />
                </group>
                <group position={[265.782, -101.867, 19.717]} rotation={[0, -1.571, 0]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Lock_4.geometry}
                        material={nodes.Lock_4.material}
                        position={[3, 0, 0]}
                        rotation={[Math.PI / 2, 0, Math.PI / 2]}
                    />
                </group>
                <group position={[60.243, -100.314, 48.256]} rotation={[-Math.PI, 0, -Math.PI]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Lock_4001.geometry}
                        material={nodes.Lock_4001.material}
                        position={[3, 0, 0]}
                        rotation={[Math.PI / 2, 0, Math.PI / 2]}
                    />
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Main_Pipe_Line_Gasket_6.geometry}
                        material={nodes.Main_Pipe_Line_Gasket_6.material}
                        position={[-11, 0, 0]}
                        rotation={[-Math.PI, Math.PI / 2, 0]}
                    />
                </group>
            </group>
        </group>
    )
}

useGLTF.preload('/model/bdtec/system.glb')
