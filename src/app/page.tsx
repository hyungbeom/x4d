'use client'

import dynamic from "next/dynamic";
import React from "react";

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3D 로딩 중...</div>
});

export default function Home() {
    return (
        // 🚀 여기에 스타일을 추가해서 화면을 100% 꽉 채워줍니다!
        <main style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Spline
                scene="https://prod.spline.design/UbexGr1CFJhPJV7l/scene.splinecode"
                style={{ width: '100%', height: '100%' }}
            />
        </main>
    );
}