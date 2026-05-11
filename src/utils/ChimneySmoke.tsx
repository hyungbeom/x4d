import { Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";

export function ChimneySmoke({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
    return (
        <group position={position}>
            {/* MeshBasicMaterial을 유지하여 렌더링 최적화 */}
            <Clouds material={THREE.MeshBasicMaterial}>
                <Cloud
                    seed={1}
                    position={[0, 8, 0]}
                    bounds={[3, 5, 3]}
                    volume={15}
                    // 💡 색상을 흰색보다는 아주 약간 어두운 회색으로 변경하여 배경과 대비를 줍니다.
                    color="#aaaaaa"
                    // 🌟 1. 투명도를 대폭 높여서 확실히 보이게 만듭니다 (기존에 0.1~0.15로 낮았을 수 있음)
                    opacity={0.5}
                    speed={0.4}
                    scale={0.5}
                />
                <Cloud
                    seed={2}
                    position={[0, 12, 0]}
                    bounds={[5, 5, 5]}
                    volume={10}
                    // 두 번째 구름은 조금 더 밝은 회색으로
                    color="#cccccc"
                    // 🌟 2. 두 번째 구름도 투명도를 확 높여 풍성함을 더합니다.
                    opacity={0.4}
                    speed={0.6}
                    scale={1.5}
                />
            </Clouds>
        </group>
    );
}