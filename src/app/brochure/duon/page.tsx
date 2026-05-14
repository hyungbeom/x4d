'use client';

import React, {Suspense, useEffect, useRef} from 'react';

import ScrollIndicator from "@/utils/ScrollIndicator";
import Overlay1 from "@/components/duon/overlay/OverLay1";

import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

import dynamic from 'next/dynamic';
const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    // 로딩 중일 때 보여줄 UI도 여기서 바로 설정할 수 있어요! (기존 Suspense 역할 대체)
    loading: () => <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3D 로딩 중...</div>
});

export default function Home() {
    const splineApp = useRef(null);
    const paintCaseRef = useRef(null);
    const mainContainerRef = useRef(null);

    // 🚀 텍스트 요소를 위한 Ref들
    const textTlRef = useRef(null);
    const textBrRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    const onLoad = (app: any) => {
        splineApp.current = app;
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

            // =========================================================
// 🚀 [새로 추가] 스크롤 인디케이터 페이드 아웃
// =========================================================
            tl.to('.scroll-indicator-wrapper', {
                opacity: 0,           // 투명하게
                pointerEvents: 'none', // 완전히 사라진 후 클릭 방해 방지
                ease: "none"
            }, 0); // 0 지점부터 스크롤에 따라 점점 사라짐

            // =========================================================
            // 🚀 [새로 추가] 오버레이(Overlay1) UI 스크롤 애니메이션!
            // =========================================================

            // 1. Overlay1의 텍스트와 카드들: 뿌옇게(blur) 변하면서 투명해짐
            tl.to('.fade-out-target', {
                opacity: 0,
                filter: 'blur(15px)', // 안개처럼 사라지는 효과
                y: -30,               // 살짝 위로 밀려 올라감
                ease: "power2.inOut"
            }, 0); // 👈 '0'은 스크롤 시작과 동시에 발동한다는 뜻!

            // 2. Overlay1의 로고: 지정된 크기로 작아지며 좌측 상단으로 이동
            tl.to('.overlay-logo', {
                top: '20px',    // 💡 네비게이션 바 위치에 맞게 Y값 조절하세요
                left: '20px',   // 💡 네비게이션 바 위치에 맞게 X값 조절하세요
                width: '120px', // 💡 최종적으로 작아질 로고의 너비 조절하세요
                ease: "power2.inOut"
            }, 0);


            // =========================================================
            // 🎬 [주인공 액션] - 메인 박스 회전 및 이동
            // =========================================================
            tl.to(obj.rotation, { x: (178.7 - 360) * (Math.PI / 180), ease: "none" }, 0);
            tl.to(obj.position, { y: -38.3, z: 1866, ease: "none" }, 0);
            if (camera) {
                tl.to(camera.position, { z: camera.position.z - 3000, ease: "none" }, 0);
            }

            // =========================================================
            // 🚀 [스플라인 변수] (junkOpacity) 조종
            // =========================================================
            const fadeProxy = { val: 100 };
            tl.to(fadeProxy, {
                val: 0,
                ease: "none",
                onUpdate: () => {
                    if (app.setVariable) {
                        app.setVariable('junkOpacity', fadeProxy.val);
                    }
                }
            }, 0);

            // =========================================================
            // 🚀 [기존 유지] GSAP 텍스트 애니메이션 로직 (우측/좌측 등장 텍스트)
            // =========================================================
            gsap.set([textTlRef.current, textBrRef.current], { opacity: 0 });

            tl.addLabel("boxAnimDone");

            tl.fromTo(textTlRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
                "boxAnimDone+=0.5"
            );

            tl.fromTo(textBrRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
                "+=0.2"
            );


            // =========================================================
            // 🚀 [새로 추가] 스크롤 더 내릴 때: 텍스트 사라짐 & 페인트통 축소
            // =========================================================

            // 1. 텍스트 요소들 부드럽게 사라지게 (위로 살짝 올라가며 페이드 아웃)
            tl.to([textTlRef.current, textBrRef.current], {
                opacity: 0,
                y: -30,
                duration: 1,
                ease: "power2.inOut"
            }, "+=0.5"); // 앞의 애니메이션이 끝난 후 약간의 딜레이(0.5) 후 실행

            // 2. 메인 페인트 통(main_paint) 크기(Scale) 0으로 줄어들기
            tl.to(obj.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.5,
                ease: "power3.inOut" // 부드럽고 자연스러운 축소 효과
            }, "-=0.5"); // 텍스트가 사라지는 애니메이션과 살짝 겹쳐서(0.5초 먼저) 시작
        } else {
            console.warn("⚠️ main_paint를 찾을 수 없습니다!");
        }
    };
    return (
        <>
            {/* 💡 Overlay1 안에 .fade-out-target 과 .overlay-logo 클래스가 잘 적용되어 있어야 합니다 */}
            <Overlay1/>
            <div className="scroll-indicator-wrapper">
                <ScrollIndicator/>
            </div>

            <main ref={mainContainerRef} style={{ position: 'relative', height: '300vh', width: '100vw', backgroundColor: '#e5e5e5' }}>
                <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

                    {/* 좌측 상단 텍스트 */}
                    <div ref={textTlRef} style={{ position: 'absolute', top: '100px', left: '20px', zIndex: 10, color: '#333' }} className="flex flex-col gap-1 p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                        <h1 className="text-3xl font-extrabold text-green-700 tracking-tight">에코그린코트는?</h1>
                        <p className="text-xl font-bold">에코그린콘트는 외벽, 옥상 방수, 바닥 등 어디에나 사용할 수 있도록 다양한 제품군을<br/>
                        가지고 있습니다. 외벽에서 차열 성능이 필요한 곳을 W, 차열 및 옥상 방수가 필요한 곳에서R, 바닥 차열 성능이 필요한 곳에서는 L <br/>
                            신내외 선택에 따라 외부 차열, 실내 단열 + 광촉매 기능이 있는 P 등 차열페인트 브랜드 중 유일하게 다양한 제품을 보유하고 있어 <br/>
                            필요한 곳에 맞는 제품을 선택해서 사용할 수 있습니다.
                        </p>
                    </div>

                    {/* 우측 하단 텍스트 */}
                    <div ref={textBrRef} style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10, textAlign: 'left', color: '#333' }} className="flex flex-col gap-1 p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                        <h1 className="text-3xl font-extrabold text-green-700 tracking-tight">에코그린코트 특징</h1>
                        <p className="text-lg font-semibold text-green-800">친환경 수용성 차열페인트로 차열성능 발휘
                            <br/><br/>
                            에너지 냉방 23% 이상 절감
                            <br/><br/>
                            어드그린코트는 가시광선과 적외선을 모두 반사 혹은 산란하는 제품으로 <br/> 더 높은 차열 효과가 있음
                            <br/><br/>
                            뛰어난 열차단 성능과 노후방지기능으로 도막의 내구성을 향상시켜줌
                            <br/><br/>
                            차열페인트중 세계 최다 다양한 색상이 있어 원하는 색상으로 시공 가능
                        </p>

                    </div>

                        <Spline
                            scene="https://prod.spline.design/nTfQzR2xEoTXa0sT/scene.splinecode"
                            onLoad={onLoad}
                        />

                </div>
            </main>
        </>
    );
}