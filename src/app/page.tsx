'use client'


import dynamic from "next/dynamic";
import React from "react";

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3D 로딩 중...</div>
});


export default function Home() {
    return (
        <main>
            <Spline
                scene="https://prod.spline.design/UbexGr1CFJhPJV7l/scene.splinecode"
            />
        </main>
    );
}
