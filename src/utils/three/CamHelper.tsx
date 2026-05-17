import React, {useEffect} from "react";
import type CameraControlsImpl from "camera-controls";
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function CameraHelper({
                          controlsRef,
                          activePanelId,
                          deviceType,
                      }: {
    controlsRef: React.RefObject<CameraControlsImpl | null>;
    activePanelId: number;
    deviceType: DeviceType;
}) {
    useEffect(() => {
        // 전체 컨테이너
        const container = document.createElement('div');
        container.id = 'camera-helper-ui';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.left = '20px';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        container.style.color = '#00FF00';
        container.style.padding = '15px';
        container.style.fontFamily = 'monospace';
        container.style.fontSize = '14px';
        container.style.zIndex = '99999';
        container.style.borderRadius = '8px';
        container.style.border = '1px solid #00FF00';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';

        // 텍스트가 표시될 영역
        const textDiv = document.createElement('div');
        textDiv.id = 'camera-helper-text';
        textDiv.style.whiteSpace = 'pre';

        // 복사 버튼
        const copyBtn = document.createElement('button');
        copyBtn.innerText = '📋 코드 복사하기';
        copyBtn.style.padding = '8px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.backgroundColor = '#00FF00';
        copyBtn.style.color = '#000';
        copyBtn.style.border = 'none';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.fontWeight = 'bold';

        // 복사 버튼 클릭 이벤트
        copyBtn.onclick = () => {
            const textToCopy = textDiv.dataset.copyString;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    copyBtn.innerText = '✅ 복사 완료!';
                    copyBtn.style.backgroundColor = '#00cc00';
                    copyBtn.style.color = '#fff';
                    setTimeout(() => {
                        copyBtn.innerText = '📋 코드 복사하기';
                        copyBtn.style.backgroundColor = '#00FF00';
                        copyBtn.style.color = '#000';
                    }, 1500);
                });
            }
        };

        container.appendChild(textDiv);
        container.appendChild(copyBtn);
        document.body.appendChild(container);

        return () => {
            document.body.removeChild(container);
        };
    }, []);

    useFrame((state) => {
        const textDiv = document.getElementById('camera-helper-text');
        if (textDiv && controlsRef.current) {
            const c = state.camera.position;
            const z = state.camera.zoom;

            const t = new THREE.Vector3();
            controlsRef.current.getTarget(t);

            textDiv.innerText =
                `[ panel ${activePanelId} · ${deviceType} ]\n` +
                `c: [${c.x.toFixed(1)}, ${c.y.toFixed(1)}, ${c.z.toFixed(1)}],\n` +
                `t: [${t.x.toFixed(1)}, ${t.y.toFixed(1)}, ${t.z.toFixed(1)}],\n` +
                `z: ${z.toFixed(2)}`;

            textDiv.dataset.copyString =
                `{ c: [${c.x.toFixed(1)}, ${c.y.toFixed(1)}, ${c.z.toFixed(1)}], t: [${t.x.toFixed(1)}, ${t.y.toFixed(1)}, ${t.z.toFixed(1)}], z: ${z.toFixed(2)} }`;
        }
    });

    return null;
}