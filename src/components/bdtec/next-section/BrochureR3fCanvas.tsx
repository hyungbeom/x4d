"use client";

import type { CSSProperties, ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Stats } from "@react-three/drei";

const baseStyle: CSSProperties = { pointerEvents: "none", touchAction: "auto" };

type Props = Omit<CanvasProps, "style"> & {
    style?: CSSProperties;
    children?: ReactNode;
};

/** 브로처용: 스크롤을 막지 않는 읽기 전용 R3F Canvas 공통 스타일 */
export default function BrochureR3fCanvas({ style, shadows = true, children, ...rest }: Props) {
    return (
        <Canvas shadows={shadows} style={{ ...baseStyle, ...style }} {...rest}>
            {process.env.NODE_ENV === 'development' && <Stats />}
            {children}
        </Canvas>
    );
}
