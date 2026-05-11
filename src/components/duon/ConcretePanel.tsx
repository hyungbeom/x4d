// ConcretePanel.tsx 수정본
"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// 💡 1. 괄호 안에 props: any 를 꼭 넣어주세요!
export function ConcretePanel(props: any) {

    // 💡 2. 변수 이름을 props 대신 textureProps 로 바꿔서 헷갈리지 않게 합니다.
    const textureProps = useTexture({
        map: "/model/duon/textures/color.jpg",
        normalMap: "/model/duon/textures/normal.jpg",
        roughnessMap: "/model/duon/textures/rough.jpg",
        aoMap: "/model/duon/textures/ao.jpg",
    });

    const repeatX = 20;
    const repeatY = 20;

    [textureProps.map, textureProps.normalMap, textureProps.roughnessMap, textureProps.aoMap].forEach((tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
    });

    return (
        // 💡 3. 여기에는 외부에서 받아온 props(position, rotation, scale 등)를 넣습니다.
        <mesh {...props}>
            <planeGeometry args={[20, 20]} />

            <meshStandardMaterial
                {...textureProps} // 💡 4. 여기에는 텍스처 맵들을 넣습니다.
                normalScale={new THREE.Vector2(1.5, 1.5)}
                roughness={1}
                // 💡 핵심 추가: 환경광(Environment) 반사를 0으로 꺼버립니다!
                envMapIntensity={0}
            />
        </mesh>
    );
}