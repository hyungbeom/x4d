import React, {useEffect, useRef, useState} from 'react'
import {useGLTF} from '@react-three/drei'
import * as THREE from 'three';
import {useFrame} from "@react-three/fiber";

export function AirProduct(props: any) {
    const {nodes, materials}: any = useGLTF('/model/bdtec/Air_Product.glb');


    // 🚀 1. Front와 Cover를 직접 조종하기 위한 이름표(ref) 생성
    const frontRef = useRef<THREE.Mesh>(null)
    const coverRef = useRef<THREE.Mesh>(null)

    // 🚀 2. 열림/닫힘 상태를 관리하는 스위치
    const [isOpen, setIsOpen] = useState(false)

    // 🚀 3. 3초(이동 약 1초 + 멈춤 2초)마다 스위치를 딸깍! 바꿔주는 타이머
    useEffect(() => {
        const interval = setInterval(() => {
            setIsOpen((prev) => !prev)
        }, 7000) // 3000ms = 3초 주기로 반복

        return () => clearInterval(interval)
    }, [])

    // 🚀 4. 매 프레임마다 목표 각도를 향해 부드럽게 회전시키는 애니메이션
    useFrame((state, delta) => {
        if (!frontRef.current || !coverRef.current) return

        // 120도를 라디안 값으로 변환 (열리면 120도, 닫히면 0도)
        const targetRotation = isOpen ? THREE.MathUtils.degToRad(120) : 0

        // 현재 각도에서 목표 각도까지 스무스하게 보간(damp)하여 회전시킵니다.
        // 숫자 4는 움직이는 속도입니다. (크면 빨라지고 작으면 느려짐)
        frontRef.current.rotation.y = THREE.MathUtils.damp(
            frontRef.current.rotation.y,
            targetRotation,
            0.5,
            delta
        )

        coverRef.current.rotation.y = THREE.MathUtils.damp(
            coverRef.current.rotation.y,
            targetRotation,
            0.5,
            delta
        )
    })

    return (
        <group {...props} dispose={null}>
            <mesh castShadow receiveShadow geometry={nodes.Case.geometry} material={materials.Cab}/>
            <mesh castShadow receiveShadow geometry={nodes.Valve.geometry} material={materials.Metal}/>

            {/* 🚀 Front 노드에 ref 달아주기 */}
            <mesh
                ref={frontRef}
                castShadow
                receiveShadow
                geometry={nodes.Front.geometry}
                material={materials.De_texture_a}
                position={[1.807, 0, 0.742]}
            />

            {/* 🚀 Cover 노드에 ref 달아주기 */}
            <mesh
                ref={coverRef}
                castShadow
                receiveShadow
                geometry={nodes.Cover.geometry}
                material={materials.transparency}
                position={[2.103, 0, 0.978]}
            />

            <mesh castShadow receiveShadow geometry={nodes.Clip.geometry} material={materials.Metal}/>
            <mesh castShadow receiveShadow geometry={nodes.Panel.geometry} material={materials.Cab}/>
            <mesh castShadow receiveShadow geometry={nodes.screw.geometry} material={materials.Metal_Y}/>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Black_Cover.geometry}
                material={materials.De_texture_b}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.circuit_board.geometry}
                material={materials.D_Green}
            />
            <mesh castShadow receiveShadow geometry={nodes.Socket_a.geometry} material={materials.Cab}/>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Black_Box.geometry}
                material={materials.Black_P}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Socket_b.geometry}
                material={materials.Green}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.metal_box.geometry}
                material={materials.Metal}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Pin_Socket.geometry}
                material={materials.Red}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Black_screw.geometry}
                material={materials.Metal_B}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Black_Line.geometry}
                material={materials.Black_P}
            />
            <mesh castShadow receiveShadow geometry={nodes.Red_Line.geometry} material={materials.Red}/>
            <mesh castShadow receiveShadow geometry={nodes.Mesh010.geometry} material={materials.Cab}/>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Mesh010_1.geometry}
                material={materials.Gray}
            />
        </group>
    )
}

useGLTF.preload('/model/bdtec/Air_Product.glb')


