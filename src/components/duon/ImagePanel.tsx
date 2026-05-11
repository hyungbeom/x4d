import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// 💡 새로운 배경 패널 컴포넌트
export default function ImagePanel() {
    // public 폴더 안에 있는 이미지 파일의 경로를 적어주세요. (예: public/bg.jpg)
    const texture = useTexture("/concreat.png");

    // 이미지가 sRGB 색상 공간에 맞게 선명하게 나오도록 설정
    texture.colorSpace = THREE.SRGBColorSpace;

    return (
        <mesh
            // 👉 바닥에 까는 경우 (Roller의 Y값이 -1이므로 그보다 살짝 아래인 -1.01에 배치)
            position={[0, -1.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]} // X축으로 -90도 회전해서 바닥에 눕힘

            // 👉 만약 뒤쪽 벽으로 세우고 싶다면 아래 설정 사용:
            // position={[0, 0, -5]}
            // rotation={[0, 0, 0]}
        >
            {/* 패널의 크기 [가로, 세로] */}
            <planeGeometry args={[12, 12]} />

            {/* 💡 meshBasicMaterial: 빛과 그림자 영향 없이 이미지 원본 그대로 보여줌
              💡 meshStandardMaterial: 조명과 그림자의 영향을 받아 입체적으로 보여줌
            */}
            <meshBasicMaterial map={texture} transparent={true} opacity={1} />
        </mesh>
    );
}