'use client';

import React, {useEffect, useRef, useState} from 'react';

import ScrollIndicator from "@/utils/ScrollIndicator";
import Overlay1 from "@/components/bdtec/overlay/OverLay1";

import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

// 🚀 1. Three.js 라이브러리 불러오기 (좌표 계산용)
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    // 로딩 중일 때 보여줄 UI도 여기서 바로 설정할 수 있어요! (기존 Suspense 역할 대체)
    loading: () => <div
        style={{height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>3D 로딩
        중...</div>
});


export default function Home() {

    const [intro, setIntro] = useState(false);
    const splineApp = useRef(null);
    const mainContainerRef = useRef(null);


    // 🚀 1. 슬라이드되어 나타날 UI 도화지 Ref
    const uiPanelRef = useRef<HTMLDivElement>(null);
    // 🚀 2. 변수 값 변화를 감지하기 위한 이전 상태 저장소
    const prevState = useRef<number | null>(null);


    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            // 컴포넌트가 언마운트될 때 GSAP ticker에서도 제거해주면 완벽해!
            // gsap.ticker.remove(trackPosition);
        };
    }, []);


    const trackSplineVariable = () => {
        const app: any = splineApp.current;
        if (!app) return;

        // Spline에서 현재 변수 값을 가져옴 (이름이 Product_State 인지 하나로 통일한 Camera_State 인지 꼭 확인하세요!)
        const currentState = app.getVariable('Product_State');

        // 변수 값이 이전과 다를 때만(상태가 변했을 때만) 애니메이션 실행
        if (currentState !== prevState.current) {
            console.log(`🔄 변수 변경 감지! 현재 값: ${currentState}`);

            if (currentState === 1) {
                // 변수가 1이면 -> 오른쪽 화면 밖(x: 100%)에 있던 UI를 원래 자리(x: 0)로 슬라이드!
                gsap.to(uiPanelRef.current, {
                    x: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power3.out"
                });
            } else {
                // 변수가 1이 아니면 -> 다시 오른쪽 화면 밖으로 숨기기
                gsap.to(uiPanelRef.current, {
                    x: '100%',
                    opacity: 0,
                    duration: 0.6,
                    ease: "power3.in"
                });
            }

            // 비교를 위해 현재 값을 이전 값으로 저장
            prevState.current = currentState;
        }
    };


    // =========================================================
    // 🚀 [추가됨] React 버튼을 눌렀을 때 Spline 변수를 바꾸는 함수
    // =========================================================
    const handleVariableChange = (newValue: number) => {
        const app = splineApp.current;
        if (!app) return;

        // 🎯 Spline의 'Product_State' 변수를 내가 원하는 숫자(newValue)로 강제 변경!
        app.setVariable('Product_State', newValue);
        console.log(`✅ React에서 Spline 변수를 ${newValue}로 변경했습니다!`);
    };

    const onLoad = (app: any) => {
        splineApp.current = app;

        // 🚀 4. 로딩이 완료되면 GSAP ticker를 이용해 매 프레임마다 변수 추적 시작!
        gsap.ticker.add(trackSplineVariable);
    };


    function getStart() {
        setIntro(true)
    }

    return (
        <>


            <main ref={mainContainerRef}
                  style={{position: 'relative', height: '300vh', width: '100vw', backgroundColor: '#e5e5e5'}}>

                <div style={{position: 'sticky', top: 0, height: '100vh', overflow: 'hidden'}}>
                    {!intro ? <Overlay1/> : <></>}


                    <div style={{position: 'absolute', bottom: 0, right: 0, zIndex: 12, padding: 50}}>

                        {!intro ? <span style={{backgroundColor: 'blue', color: 'white', padding: '10px 20px', borderRadius: 10}}
                               onClick={getStart}>
                    비디텍 브로슈어 시작하기
                </span> : <></>}
                    </div>




                    <div
                        ref={uiPanelRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0, // 오른쪽에 붙임
                            width: '400px', // 도화지 너비
                            height: '100vh',
                            backgroundColor: 'white',
                            boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
                            zIndex: 20,
                            padding: '40px',
                            // 초기 상태: 화면 오른쪽 바깥(100%)으로 밀어두고 투명하게 만듦
                            transform: 'translateX(100%)',
                            opacity: 0,
                        }}
                    >
                        <h2>Product 정보 도화지 🎨</h2>
                        <p>변수가 1이 되어서 짜잔! 하고 나타났습니다.</p>
                        <p>여기서 HTML/React로 원하는 내용을 마음껏 꾸미세요!</p>
                    </div>
                    <div style={{width: '100%', height: '100%', filter: `blur(${intro ?0:5}px)`}}>
                        <Spline
                            scene={`https://prod.spline.design/TYUnZBzHQ8Pfrt24/scene.splinecode?v=${Date.now()}`}
                            onLoad={onLoad}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}