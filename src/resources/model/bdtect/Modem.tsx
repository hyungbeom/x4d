import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Modem(props:any) {
    const { nodes, materials }:any = useGLTF('/model/bdtec/modem.glb')
    return (
        <group {...props} dispose={null}>
            <group scale={0.01}>
                <group rotation={[-0.25, -0.183, 0.359]} scale={0.2}>
                    <group position={[-3.462, 94.612, 48.04]} rotation={[0.305, 0.07, -0.383]} scale={1.051}>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Boolean_2.geometry}
                            material={nodes.Boolean_2.material}
                            position={[62.113, -46.655, -65.529]}
                        >
                            <meshStandardMaterial color="#3A3F55" />
                        </mesh>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Cylinder_5.geometry}
                            material={nodes.Cylinder_5.material}
                            position={[-71.612, 6.247, -146.481]}
                            rotation={[0, 0, 0.262]}
                            scale={1.353}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Cylinder_6.geometry}
                            material={nodes.Cylinder_6.material}
                            position={[76.607, 6.247, -146.481]}
                            rotation={[0, 0, -0.262]}
                            scale={1.353}
                        />
                        <group position={[-128.379, -95.428, 152.302]} scale={[0.051, 0.051, 54.167]}>
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.Shape_0001.geometry}
                                material={nodes.Shape_0001.material}
                                position={[-39.383, 256, -0.005]}
                            />
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.Shape_1001.geometry}
                                material={nodes.Shape_1001.material}
                                position={[-236.304, 176.612, 0.005]}
                            />
                        </group>
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes['Light-02'].geometry}
                            material={nodes['Light-02'].material}
                            position={[124.481, -95.428, 129.494]}
                            scale={0.571}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes['Light-02_2'].geometry}
                            material={nodes['Light-02_2'].material}
                            position={[76.733, -95.428, 129.494]}
                            scale={0.571}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes['Light-02_3'].geometry}
                            material={nodes['Light-02_3'].material}
                            position={[-128.379, -95.428, 120.503]}
                            scale={0.833}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes['Light-02_4'].geometry}
                            material={nodes['Light-02_4'].material}
                            position={[28.986, -95.428, 129.494]}
                            scale={0.571}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                            geometry={nodes.Rectangle.geometry}
                            material={nodes.Rectangle.material}
                            position={[0, -134.928, -0.349]}
                            rotation={[-Math.PI / 2, 0, 0]}
                        >
                            <meshStandardMaterial color="#3A3F55" />
                        </mesh>
                        <group position={[0, -51.838, -0.349]}>
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.Ellipse.geometry}
                                material={nodes.Ellipse.material}
                                position={[-154.504, -7.677, 106.11]}
                                rotation={[-Math.PI / 2, 0, 0]}
                            />
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.Ellipse_2.geometry}
                                material={nodes.Ellipse_2.material}
                                position={[154.504, -7.677, 106.11]}
                                rotation={[-Math.PI / 2, 0, 0]}
                            />
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.Ellipse_2001.geometry}
                                material={nodes.Ellipse_2001.material}
                                position={[154.504, -7.677, -106.11]}
                                rotation={[-Math.PI / 2, 0, 0]}
                            />
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.Ellipse001.geometry}
                                material={nodes.Ellipse001.material}
                                position={[-154.504, -7.677, -106.11]}
                                rotation={[-Math.PI / 2, 0, 0]}
                            />
                        </group>
                        <group position={[3.996, 84.105, 77.455]}>
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.Shape_0.geometry}
                                material={nodes.Shape_0.material}
                                position={[-27.471, -64.63, -15.01]}
                                rotation={[0, 0, Math.PI / 4]}
                            />
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.Shape_1.geometry}
                                material={nodes.Shape_1.material}
                                position={[-59.362, -31.891, -15]}
                                rotation={[0, 0, Math.PI / 4]}
                            />
                            <mesh
                                castShadow
                                receiveShadow
                                geometry={nodes.Shape_2.geometry}
                                material={nodes.Shape_2.material}
                                position={[-91.676, 0.424, -14.99]}
                                rotation={[0, 0, Math.PI / 4]}
                            />
                        </group>
                    </group>
                </group>
            </group>
        </group>
    )
}

useGLTF.preload('/model/bdtec/modem.glb')
