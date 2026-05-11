"use client";

import * as THREE from "three";
import { Sampler } from "@react-three/drei";

export default function PlanetScene() {
    // 💡 흩뿌려질 각각의 물체(인스턴스)들의 위치, 회전, 크기를 계산하는 함수입니다.
    const transformItems = ({ position, normal, dummy: object }: any) => {
        // 1. 위치: 샘플링된 표면의 위치(position)로 이동시킵니다.
        object.position.copy(position);

        // 2. 회전: 표면의 바깥쪽(normal) 방향을 바라보게 각도를 맞춥니다. (수직으로 꽂히게 됨)
        object.lookAt(position.clone().add(normal));

        // 3. 크기: 랜덤으로 크기를 살짝씩 다르게 주어 자연스러움을 살립니다.
        object.scale.setScalar(Math.random() * 0.5 + 0.5);

        // 4. 변형된 값을 실제 인스턴스에 적용하기 위해 업데이트합니다.
        object.updateMatrix();
        return object;
    };

    return (
        <group>
            {/* 💡 Sampler가 감싸고 있는 두 가지 요소의 순서에 주목하세요 */}
            <Sampler
                count={500}             // 총 몇 개를 뿌릴 것인가?
                transform={transformItems} // 어떻게 배치할 것인가? (위에서 만든 함수)
            >
                {/* 1. 타겟 메쉬 (이 표면 위에 흩뿌려집니다) */}
                <mesh>
                    <sphereGeometry args={[2, 32, 32]} />
                    <meshStandardMaterial color="#2d8a4e" /> {/* 초록색 행성 본체 */}
                </mesh>

                {/* 2. 복제될 메쉬 (이 모델이 count 개수만큼 찍혀 나옵니다) */}
                {/* args의 세 번째 인자에 count와 동일한 숫자를 꼭 넣어주어야 합니다. */}
                <instancedMesh args={[undefined, undefined, 500]}>
                    <boxGeometry args={[0.1, 0.1, 0.5]} />
                    <meshStandardMaterial color="#8a5a2d" /> {/* 갈색 나무 기둥 */}
                </instancedMesh>
            </Sampler>
        </group>
    );
}