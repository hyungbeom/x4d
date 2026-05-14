'use client';

import React, {Suspense, useEffect, useRef} from 'react';
import Spline from '@splinetool/react-spline';
import ScrollIndicator from "@/utils/ScrollIndicator";
import Overlay1 from "@/components/duon/overlay/OverLay1";

import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

export default function Home() {
    const splineApp = useRef(null);
    const paintCaseRef = useRef(null);
    const mainContainerRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    const onLoad = (app: any) => {
        splineApp.current = app;
        // 🚀 디버깅: 스플라인이 현재 인식하고 있는 모든 변수 목록 출력!
        console.log("🧐 현재 로드된 스플라인 변수 목록:", app.getVariables());


        const obj = app.findObjectByName('main_paint');
        const camera = app.findObjectByName('Camera');

        if (obj) {
            paintCaseRef.current = obj;
            console.log("🎉 주인공 로드 성공!");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: mainContainerRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                }
            });

            // 🎬 [주인공 액션]
            tl.to(obj.rotation, { x: (178.7 - 360) * (Math.PI / 180), ease: "none" }, 0);
            tl.to(obj.position, { y: -38.3, z: 1866, ease: "none" }, 0);
            if (camera) {
                tl.to(camera.position, { z: camera.position.z - 3000, ease: "none" }, 0);
            }

            // =========================================================
            // 🚀 [최종 해결책] 스플라인 변수(junkOpacity)를 GSAP로 조종!
            // =========================================================

            // GSAP가 조종할 가짜 객체 (초기값 100%)
            const fadeProxy = { val: 100 };

            tl.to(fadeProxy, {
                val: 0, // 스크롤 내리면 0으로!
                ease: "none",
                onUpdate: () => {
                    // 스플라인 변수에 실시간으로 값을 꽂아 넣음!
                    if (app.setVariable) {
                        app.setVariable('junkOpacity', fadeProxy.val);
                    }
                }
            }, 0);

        } else {
            console.warn("⚠️ main_paint를 찾을 수 없습니다!");
        }
    };
    return (
        <>
            <Overlay1/>
            <ScrollIndicator/>

            {/* 💡 초기 배경색 지정! 원래 화면과 비슷한 밝은 회색(#f0f0f0 등)으로 세팅해 둬야 검은색으로 자연스럽게 변해 */}
            <main ref={mainContainerRef} style={{ position: 'relative', height: '300vh', width: '100vw', backgroundColor: '#e5e5e5' }}>
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