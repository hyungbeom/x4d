// Paint.tsx 수정

import React, {useRef} from 'react'
import {useGLTF} from '@react-three/drei'
// 수정된 재질 컴포넌트 불러오기
import {ThermalEffectMaterial} from "@/components/ThermalShaderMaterial";

// 💡 colorBottom, colorTop props 추가
export function Paint({...props}: any) {
    const {nodes, materials}: any = useGLTF('/model/Paint_Case.glb')

    // 모델의 원래 재질 이미지 추출
    const originalTexture = materials.De_texture?.map;

    return (
        <group {...props} dispose={null}>
            {/* Mesh (페인트통 몸통) */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Mesh.geometry}
                material={materials.De_texture}
           />
                {/* 💡 여기에 파라미터로 받은 그라데이션 색상을 넘겨줍니다! */}


            {/* Mesh_1 (페인트통 입구 띠) - 몸통과 구분되게 원래 재질 사용 */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Mesh_1.geometry}
                material={materials.Cab}
            />


            {/* Mesh_2 (페인트통 손잡이) - 금속 재질이라 원래 Metal 재질 사용 */}
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Mesh_2.geometry}
                material={materials.Metal}
            />

        </group>
    )
}

useGLTF.preload('/model/Paint_Case.glb')


// Paint.tsx 수정

// import React, { useRef } from 'react'
// import { useGLTF } from '@react-three/drei'
// // 수정된 재질 컴포넌트 불러오기
// import {ThermalEffectMaterial} from "@/components/ThermalShaderMaterial";
//
// // 💡 colorBottom, colorTop props 추가
// export function Paint({  ...props }:any) {
//     const { nodes, materials }:any = useGLTF('/model/Paint_Case.glb')
//
//     // 모델의 원래 재질 이미지 추출
//     const originalTexture = materials.De_texture?.map;
//
//     return (
//         <group {...props} dispose={null}>
//             {/* Mesh (페인트통 몸통) */}
//             <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.Mesh.geometry}
//             >
//                 {/* 💡 여기에 파라미터로 받은 그라데이션 색상을 넘겨줍니다! */}
//                 <ThermalEffectMaterial  colorBottom={'orange'} colorTop={'yellow'} />
//             </mesh>
//
//             {/* Mesh_1 (페인트통 입구 띠) - 몸통과 구분되게 원래 재질 사용 */}
//             <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.Mesh_1.geometry}
//                 material={materials.Cab}
//             >
//                 <ThermalEffectMaterial texture={originalTexture} colorBottom={'yellow'} colorTop={'yellow'} />
//
//             </mesh>
//
//             {/* Mesh_2 (페인트통 손잡이) - 금속 재질이라 원래 Metal 재질 사용 */}
//             <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.Mesh_2.geometry}
//                 material={materials.Metal}
//             >
//                 <ThermalEffectMaterial texture={originalTexture} colorBottom={'yellow'} colorTop={'white'} />
//             </mesh>
//         </group>
//     )
// }
//
// useGLTF.preload('/model/Paint_Case.glb')