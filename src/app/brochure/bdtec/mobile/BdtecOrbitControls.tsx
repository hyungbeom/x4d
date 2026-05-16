'use client';

import type { ComponentProps } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

/** R3F/drei 기본과 동일하지만 Orbit이 붙는 DOM을 gl.domElement로 고정 (이벤트 타깃 혼선 방지) */
export function BdtecOrbitControls(props: Omit<ComponentProps<typeof OrbitControls>, 'domElement'>) {
    const domElement = useThree((s) => s.gl.domElement);
    return <OrbitControls {...props} domElement={domElement} />;
}
