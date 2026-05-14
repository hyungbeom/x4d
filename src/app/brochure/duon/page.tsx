'use client';

import React, {Suspense, useEffect, useRef} from 'react';
import Spline from '@splinetool/react-spline';
import ScrollIndicator from "@/utils/ScrollIndicator";
import Overlay1 from "@/components/duon/overlay/OverLay1";

import gsap from 'gsap';
// 🚀 1. ScrollTrigger 임포트 추가! (이게 있어야 에러가 안 나)
import {ScrollTrigger} from 'gsap/ScrollTrigger';

export default function Home() {
    const splineApp = useRef(null);
    const paintCaseRef = useRef(null);
    const mainContainerRef = useRef(null);

    useEffect(() => {
        // 브라우저 환경에서 안전하게 GSAP 플러그인 등록
        gsap.registerPlugin(ScrollTrigger);

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    const onLoad = (app: any) => {
        splineApp.current = app;
        const obj = app.findObjectByName('main_paint');

        if (obj) {
            paintCaseRef.current = obj;
            console.log("🎉 [1단계] main_paint 로드 성공!", obj);

            // 🚀 GSAP 타임라인 생성 (스크롤에 맞춰 여러 애니메이션을 동시에 실행)
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: mainContainerRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                }
            });

            // 1. 회전(Rotation) 변환: X축 178.7도로 세팅
            tl.to(obj.rotation, {

                // 👇 최종 도달 각도는 같지만, 회전 방향을 반대로 강제함!
                // (178.7도 도달은 같지만 반대 방향으로 회전)
                x: (178.7 - 360) * (Math.PI / 180),

                ease: "none"
            }, 0);

            // 2. 위치(Position) 변환 (이건 그대로 유지!)
            tl.to(obj.position, {
                y: -38.3,
                z: 1866,
                ease: "none"
            }, 0);
        } else {
            // 혹시라도 오타가 났을 때를 대비한 에러 메시지
            console.warn("⚠️ main_paint를 찾을 수 없습니다!");
        }

    };

    return (
        <>
            <Overlay1/>
            <ScrollIndicator/>

            {/* 🚀 2 & 3. ref 연결 + height를 300vh로 늘려서 스크롤 공간 확보! (overflow: hidden 제거) */}
            <main ref={mainContainerRef} style={{ position: 'relative', height: '300vh', width: '100vw' }}>

                {/* 🚀 3. 스플라인 캔버스는 화면에 딱 고정되도록 (sticky) 설정 */}
                <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
                    <Suspense fallback={<div>로딩 중...</div>}>
                        <Spline
                            scene="https://prod.spline.design/nTfQzR2xEoTXa0sT/scene.splinecode"
                            onLoad={onLoad}
                        />
                    </Suspense>
                </div>
            </main>
        </>
    );
}