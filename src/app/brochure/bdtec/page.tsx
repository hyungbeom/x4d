'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import ScrollIndicator from "@/utils/ScrollIndicator";
import Overlay1 from "@/components/bdtec/overlay/OverLay1";

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 🚀 1. Three.js 라이브러리 불러오기 (좌표 계산용)
import * as THREE from 'three';

export default function Home() {
    const splineApp = useRef(null);
    const paintCaseRef = useRef(null);
    const mainContainerRef = useRef(null);

    // 🚀 2. 따라다닐 HTML 요소를 위한 Ref 추가
    const htmlRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            // 컴포넌트가 언마운트될 때 GSAP ticker에서도 제거해주면 완벽해!
            gsap.ticker.remove(trackPosition);
        };
    }, []);

    // 매 프레임마다 위치를 추적할 함수를 밖으로 살짝 빼줌 (클린업을 위해)
    let trackPosition = () => {};

    const onLoad = (app: any) => {
        splineApp.current = app;

        console.log("🧐 현재 로드된 변수 목록:", app.getVariables());

        const obj = app.findObjectByName('main_paint');
        const camera = app.findObjectByName('Camera');

        // =========================================================
        // 🚀 3. 3D 좌표 -> 2D HTML 좌표 변환 (핵심 로직!)
        // =========================================================
        const threeScene = app._scene;
        const threeCamera = app._camera; // 찐 Three.js 카메라

        if (threeCamera && htmlRef.current) {
            // 네가 캡처해준 바로 그 좌표!
            const targetPos = new THREE.Vector3(-155, 350, -261.1);
            const tempV = new THREE.Vector3();

            trackPosition = () => {
                if (!htmlRef.current || !threeCamera) return;

                // 1. 타겟 좌표 복사 및 카메라 기준으로 정규화(-1 ~ 1)
                tempV.copy(targetPos);
                tempV.project(threeCamera);

                // 2. 만약 카메라 뒤로 객체가 넘어갔다면 HTML 숨기기
                if (tempV.z > 1) {
                    htmlRef.current.style.opacity = '0';
                    return;
                }

                // 3. 정규화된 좌표를 브라우저의 실제 픽셀(px) 좌표로 변환
                htmlRef.current.style.opacity = '1';
                const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;

                // 4. HTML 요소 이동시키기
                htmlRef.current.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0)`;
            };

            // GSAP의 ticker(매 프레임 실행)에 추적 함수를 달아줌!
            gsap.ticker.add(trackPosition);
        }

        if (obj) {
            paintCaseRef.current = obj;
            console.log("🎉 주인공 로드 성공!");

            const glbMaterials: any[] = [];

            if (threeScene) {
                const junkGroup = threeScene.getObjectByName('junk_group');
                if (junkGroup) {
                    junkGroup.traverse((child: any) => {
                        if (child.isMesh && child.material) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            mats.forEach((mat: any) => {
                                mat.transparent = true;
                                mat.needsUpdate = true;
                                mat.depthWrite = false;
                                glbMaterials.push(mat);
                            });
                        }
                    });
                }
            }

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: mainContainerRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                }
            });

            tl.to(obj.rotation, { x: (178.7 - 360) * (Math.PI / 180), ease: "none" }, 0);
            tl.to(obj.position, { y: -38.3, z: 1866, ease: "none" }, 0);
            if (camera) {
                tl.to(camera.position, { z: camera.position.z - 3000, ease: "none" }, 0);
            }

            const fadeProxy = { val: 100 };
            tl.to(fadeProxy, {
                val: 0,
                ease: "none",
                onUpdate: () => {
                    if (app.setVariable) {
                        app.setVariable('junkOpacity', fadeProxy.val);
                    }
                    const targetOpacity = fadeProxy.val / 100;
                    glbMaterials.forEach(mat => {
                        mat.opacity = targetOpacity;
                    });
                }
            }, 0);

        } else {
            console.warn("⚠️ main_paint를 찾을 수 없습니다! Spline 에디터에서 이름을 확인하세요.");
        }
    };


    // 🎯 마커 클릭 시 지정된 스플라인 뷰포인트로 이동
    const handleMarkerClick = () => {
        const app = splineApp.current;
        if (!app) return;

        const realCamera = app._scene?.getObjectByName('Camera');

        if (realCamera) {
            // 1. 캡처 이미지의 Position 수치
            const targetX = -240;
            const targetY = 327.3;
            const targetZ = 301.4;

            // 2. 캡처 이미지의 Rotation 수치
            // (스플라인은 각도(Degree)를 쓰지만, Three.js는 라디안(Radian)을 쓰므로 변환해줍니다)
            const rotX = -8.48 * (Math.PI / 180);
            const rotY = -29 * (Math.PI / 180);
            const rotZ = -5.29 * (Math.PI / 180);

            // 3. 캡처 이미지의 Zoom 수치
            const targetZoom = 2.80;

            // 🎬 A. 위치(Position) 애니메이션
            gsap.to(realCamera.position, {
                x: targetX,
                y: targetY,
                z: targetZ,
                duration: 1.5,
                ease: "power3.inOut"
            });

            // 🎬 B. 회전(Rotation) 애니메이션
            gsap.to(realCamera.rotation, {
                x: rotX,
                y: rotY,
                z: rotZ,
                duration: 1.5,
                ease: "power3.inOut"
            });

            // 🎬 C. 줌(Zoom) 애니메이션
            gsap.to(realCamera, {
                zoom: targetZoom,
                duration: 1.5,
                ease: "power3.inOut",
                onUpdate: () => {
                    // 🚨 주의: lookAt()은 삭제했습니다!
                    // 대신 직교 카메라(Orthographic)의 줌이 변하므로 아래 렌더링 업데이트 코드는 꼭 남겨둬야 합니다.
                    realCamera.updateProjectionMatrix();
                }
            });

            console.log("📸 세팅된 뷰포인트로 완벽 이동 완료!");
        }
    };

    return (
        <>
            <Overlay1 />
            <ScrollIndicator color={'white'} />

            <main ref={mainContainerRef} style={{ position: 'relative', height: '300vh', width: '100vw', backgroundColor: '#e5e5e5' }}>
                <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

                    {/* ========================================================= */}
                    {/* 🚀 4. 3D 좌표를 찰떡같이 따라다닐 HTML UI! */}
                    {/* ========================================================= */}
                    <div
                        ref={htmlRef}
                        onClick={handleMarkerClick} // 👈 클릭 이벤트 추가!
                        style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            color: 'white',
                            cursor: 'pointer',       // 👈 마우스 올리면 손가락 모양
                            pointerEvents: 'auto',   // 👈 이제 클릭을 인식함!
                            padding: '10px',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: '8px'
                        }}
                    >
                         BDI - 100
                    </div>

                    <Suspense fallback={<div>로딩 중...</div>}>
                        <Spline
                            scene="https://prod.spline.design/TYUnZBzHQ8Pfrt24/scene.splinecode"
                            onLoad={onLoad}
                        />
                    </Suspense>
                </div>
            </main>
        </>
    );
}