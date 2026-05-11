import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// 🌟 1. 회로 라인 애니메이션을 담당하는 하위 컴포넌트 추가
function CircuitPart({ name, geometry, position }: any) {
        const stripe:any = useRef<any>(null);
        const light:any = useRef<any>(null);

        useFrame((state) => {
                // 빛의 깜빡임/색상 변화 계산
                const t = (1 + Math.sin(state.clock.elapsedTime * 2)) / 2;

                if (stripe.current) {
                        stripe.current.color.setRGB(2 + t * 20, 2, 20 + t * 50);
                }
                // if (light.current) {
                //         light.current.intensity = 1 + t * 3;
                // }
        });

        return (
            <mesh
                name={name}
                castShadow
                receiveShadow
                geometry={geometry}
                position={position}
                userData={{ name }}
            >
                    <meshBasicMaterial ref={stripe} toneMapped={false} />
                    {/* 거리(distance)와 감쇠율(decay)을 조절하여 빛 반경 최적화 */}
                    {/*<pointLight ref={light} intensity={0.5} color={[10, 2, 5]} distance={3} decay={2} />*/}
            </mesh>
        );
}

// 🌟 2. 메인 AirProduct 컴포넌트
export function AirProduct(props: any) {
        const { nodes, materials }: any = useGLTF('/model/bdtec/Air_Product_All.glb');

        // 💡 nodes 객체에서 이름이 'electronic_circuit_'으로 시작하는 하위 회로 노드들을 필터링
        const circuitNodes = Object.values(nodes).filter((node: any) =>
            node.name && node.name.startsWith('electronic_circuit_')
        );

        return (
            <group {...props} dispose={null}>
                    <mesh
                        name="Product"
                        castShadow
                        receiveShadow
                        geometry={nodes.Product.geometry}
                        material={materials.Cab}
                        position={[0, 2.933, -0.118]}
                        userData={{ name: 'Product' }}
                    >
                            {/* 기존 자식 요소들 유지 */}
                            <mesh name="Black_Box" geometry={nodes.Black_Box.geometry} material={materials.Black_P} position={[0.762, 1.257, 0.354]} />
                            <mesh name="Black_Cover" geometry={nodes.Black_Cover.geometry} material={materials.De_texture_b} position={[-0.046, -0.993, 0.482]} />
                            <mesh name="Black_Line" geometry={nodes.Black_Line.geometry} material={materials.Black_P} position={[-0.858, 1.993, 0.296]} rotation={[Math.PI / 2, 0, 0]} scale={0.904} />
                            <mesh name="Black_screw" geometry={nodes.Black_screw.geometry} material={materials.Metal_B} position={[-0.179, 0.043, 0.3]} scale={0.286} />
                            <mesh name="circuit_board" geometry={nodes.circuit_board.geometry} material={materials.D_Green} position={[-0.046, -0.997, 0.287]} />
                            <mesh name="Clip" geometry={nodes.Clip.geometry} material={materials.Metal} position={[-2.109, 0.1, 0.662]} />
                            <mesh name="Cover" geometry={nodes.Cover.geometry} material={materials.transparency} position={[2.056, -0.167, 1.068]} />
                            <mesh name="Front" geometry={nodes.Front.geometry} material={materials.De_texture_a} position={[1.772, 0.004, 0.722]} />
                            <mesh name="metal_box" geometry={nodes.metal_box.geometry} material={materials.Metal} position={[-1.072, 1.483, 0.332]} scale={0.904} />
                            <mesh name="Panel" geometry={nodes.Panel.geometry} material={materials.Cab} position={[-0.046, 0.032, -2.827]} rotation={[Math.PI / 2, 0, 0]} scale={[0.949, 1, 0.973]} />
                            <mesh name="Pin_Socket" geometry={nodes.Pin_Socket.geometry} material={materials.Red} position={[-1.12, 1.68, 0.273]} scale={0.779} />
                            <mesh name="Red_Line" geometry={nodes.Red_Line.geometry} material={materials.Red} position={[-0.858, 1.993, 0.296]} rotation={[Math.PI / 2, 0, 0]} scale={0.904} />
                            <mesh name="screw" geometry={nodes.screw.geometry} material={materials.Metal_Y} position={[-0.046, 0.047, 0.284]} />
                            <mesh name="Socket_a" geometry={nodes.Socket_a.geometry} material={materials.Cab} position={[-0.926, -0.141, 0.281]} rotation={[Math.PI / 2, 0, 0]} />
                            <mesh name="Socket_b" geometry={nodes.Socket_b.geometry} material={materials.Green} position={[0.023, -0.056, 0.33]} />
                            <group name="Swich" position={[-0.313, 1.282, 0.351]}>
                                    <mesh name="Mesh009" geometry={nodes.Mesh009.geometry} material={materials.Cab} />
                                    <mesh name="Mesh009_1" geometry={nodes.Mesh009_1.geometry} material={materials.Gray} />
                            </group>
                            <mesh name="Valve" geometry={nodes.Valve.geometry} material={materials.Metal} position={[-0.046, -2.76, -0.086]} />
                    </mesh>

                    <mesh name="Tank" geometry={nodes.Tank.geometry} material={materials.White_object} position={[8.155, 0, -12.588]} />
                    <mesh name="Wifi" geometry={nodes.Wifi.geometry} material={materials.White_object} position={[-8.155, 0, -12.588]} />

                    <group name="DB_disk" position={[-15.241, 0, -0.281]}>
                            <mesh name="DB_disk_A" geometry={nodes.DB_disk_A.geometry} material={materials.White_object} position={[0, 0.021, -0.015]} />
                            <mesh name="DB_Lamp_A" geometry={nodes.DB_Lamp_A.geometry} material={materials.White_object} position={[-0.202, 1.64, 0.771]} />
                            <mesh name="DB_Lamp_B" geometry={nodes.DB_Lamp_B.geometry} material={materials.White_object} position={[0, 1.64, 0.802]} />
                            <mesh name="DB_Lamp_C" geometry={nodes.DB_Lamp_C.geometry} material={materials.White_object} position={[0.202, 1.64, 0.771]} />
                    </group>

                    <group name="Factory" position={[15.241, 1.727, 0.069]}>
                            <mesh name="Factory_A" geometry={nodes.Factory_A.geometry} material={materials.White_object} position={[-0.069, 0.531, -1.585]} />
                            <mesh name="Factory_B" geometry={nodes.Factory_B.geometry} material={materials.White_object} position={[-0.001, -1.699, 2.194]} />
                            <mesh name="Factory_C" geometry={nodes.Factory_C.geometry} material={materials.White_object} position={[0, -1.699, -0.839]} />
                    </group>

                    {/* 🌟 3. 회로 부분 (electronic_circuit) */}
                    <group name="electronic_circuit" position={[-0.01, 0.05, -1.618]}>
                            {circuitNodes.map((node: any, index: number) => {
                                console.log(node.name,'node.name:')
                                    // 회로 요소들에만 애니메이션 파트 적용
                                    return (
                                        <CircuitPart
                                            key={index}
                                            name={node.name}
                                            geometry={node.geometry}
                                            // 기존 코드에 있던 공통 position 적용
                                            position={[-2.159, 0, -1.464]}
                                        />
                                    );
                            })}
                    </group>
            </group>
        );
}

useGLTF.preload('/model/bdtec/Air_Product_All.glb');