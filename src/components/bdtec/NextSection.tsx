"use client";

import React, {Suspense, useEffect, useRef} from 'react';
import * as THREE from 'three';
import {Canvas} from '@react-three/fiber';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {Center, ContactShadows, Environment, Float, OrbitControls, RoundedBox} from "@react-three/drei";
import {AirProduct} from "@/resources/model/Air_Product";
import {Bloom, EffectComposer, ToneMapping} from "@react-three/postprocessing";
import {ChimneySmoke} from "@/utils/ChimneySmoke";
import DynamicIsland from "@/utils/DynamicIsland";
import ModelAnimator from "@/components/bdtec/animators/ModelAnimator";
import MiddleBoxSection from "@/components/bdtec/MiddleBoxSection";

gsap.registerPlugin(ScrollTrigger);


export default function NextSection() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<any>(null);
    const fogRef = useRef<THREE.Fog>(null);

    const textWrapperRef = useRef<HTMLDivElement>(null);
    const textIntroRef = useRef<HTMLDivElement>(null);
    const textFactoryRef = useRef<HTMLDivElement>(null);
    const textTankRef = useRef<HTMLDivElement>(null);
    const textWifiRef = useRef<HTMLDivElement>(null);
    const textBoxRef = useRef<HTMLDivElement>(null);

    const finalPageRef = useRef<HTMLDivElement>(null);
    const middleCanvasWrapperRef = useRef<HTMLDivElement>(null);
    const secondCanvasWrapperRef = useRef<HTMLDivElement>(null);
    const secondCanvasTextRef = useRef<HTMLDivElement>(null);
    const secondCanvasMeshRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo(sectionRef.current,
                {clipPath: "inset(15% 15% 15% 15% round 60px)", filter: "brightness(0.3)"},
                {
                    scrollTrigger: {trigger: wrapperRef.current, start: "top bottom", end: "top 20%", scrub: 1},
                    clipPath: "inset(0% 0% 0% 0% round 0px)", filter: "brightness(1)", ease: "none"
                }
            );

            gsap.from(textWrapperRef.current, {
                scrollTrigger: {trigger: wrapperRef.current, start: "top 30%", toggleActions: "play none none reverse"},
                y: 80, opacity: 0, duration: 1.2, ease: "power4.out"
            });

            gsap.from(canvasRef.current, {
                scrollTrigger: {trigger: wrapperRef.current, start: "top 30%", toggleActions: "play none none reverse"},
                opacity: 0, duration: 1.5, ease: "expo.out", delay: 0.2
            });

            gsap.from(".final-page-text", {
                scrollTrigger: {
                    trigger: finalPageRef.current,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                },
                y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out"
            });



            // ... 기존 코드 위쪽 생략 ...
            gsap.from(secondCanvasTextRef.current, {
                scrollTrigger: {
                    trigger: secondCanvasWrapperRef.current,
                    start: "top 60%",
                    toggleActions: "play none none reverse"
                },
                y: 60, opacity: 0, duration: 1.2, ease: "expo.out"
            });

            // 🌟🌟🌟 여기에 섹션 3 화면 전환 애니메이션을 추가합니다! 🌟🌟🌟
            if (middleCanvasWrapperRef.current) {
                gsap.fromTo(middleCanvasWrapperRef.current,
                    {
                        // 시작: 작고 둥글며 어두운 상태
                        clipPath: "inset(30% 20% 30% 20% round 150px)",
                        filter: "brightness(0)"
                    },
                    {
                        scrollTrigger: {
                            trigger: middleCanvasWrapperRef.current,
                            start: "top 90%", // 섹션 3이 아래에서 살짝 보일 때 시작
                            end: "top 10%",   // 섹션 3이 위쪽에 거의 닿을 때 끝
                            scrub: 1,         // 스크롤에 맞춰 부드럽게 펴짐
                        },
                        // 끝: 꽉 찬 네모 모양, 원래 밝기
                        clipPath: "inset(0% 0% 0% 0% round 0px)",
                        filter: "brightness(1)",
                        ease: "power2.inOut"
                    }
                );
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        // 🌟 1. 이전에 감쌌던 <div style={{ overflowX: 'hidden' }}> 최상위 태그를 완전히 제거했습니다. (sticky 고장 원인)
        <>
            <DynamicIsland/>

            {/* --- 첫 번째 3D 스크롤텔링 영역 --- */}
            {/* minHeight 800vh: sticky(100vh)가 마지막 100vh에서 풀리기 전에 Middle이 z-index로 덮도록 여유 */}
            <div id="next-section-scroll-area" ref={wrapperRef}
                 style={{position: 'relative', width: '100%', minHeight: '800vh'}}>
                <div
                    id="next-section"
                    ref={sectionRef}
                    style={{
                        position: 'sticky',
                        top: 0,
                        width: '100%',
                        height: '100vh', // 🌟 100vh로 복구하여 안전성 확보
                        backgroundColor: '#ffffff',
                        zIndex: 10,
                        overflow: 'hidden',
                        willChange: 'clip-path, filter'
                    }}
                >
                    {/* 텍스트 영역 */}
                    <div ref={textWrapperRef}
                         style={{
                             position: 'absolute',
                             top: '5%',
                             left: '10%',
                             zIndex: 20,
                             width: '80%',
                             pointerEvents: 'none'
                         }}>

                        <div ref={textIntroRef} style={{position: 'absolute', top: 0, left: 0}}>
                            <h1 style={{fontSize: '7vw', color: '#111', fontWeight: 900, marginBottom: '10px'}}>
                                IoT Real-time<br/> Monitoring System<br/> Architecture Diagram
                            </h1>
                            <p style={{fontSize: '3vw', color: '#555', fontWeight: 500}}>
                                비디텍의 차원이 다른 관리를 경험하세요
                            </p>
                        </div>
                        <div ref={textFactoryRef}
                             style={{position: 'absolute', top: 0, left: 0, opacity: 0, transform: 'translateY(20px)'}}>
                            <h1 style={{fontSize: '7vw', color: 'white', fontWeight: 900, marginBottom: '10px'}}>
                                IoT Sensors for Emission Facilities
                            </h1>
                            <p style={{fontSize: '3vw', color: 'white', fontWeight: 500}}>
                                Sensors are attached to emission facilities (equipment and machinery) to transmit
                                operation data of both the emission and prevention facilities to the IoT Gateway via a
                                wired connection.
                            </p>
                        </div>
                        <div ref={textTankRef}
                             style={{position: 'absolute', top: 0, left: 0, opacity: 0, transform: 'translateY(20px)'}}>
                            <h1 style={{fontSize: '7vw', color: '#111', fontWeight: 900, marginBottom: '10px'}}>
                                IoT Gateway
                            </h1>
                            <p style={{fontSize: '3vw', color: '#555', fontWeight: 500}}>
                                Collects data measured by the sensors and transmits the securely processed data to the
                                Korea Environment Corporation server through wired and wireless networks.
                            </p>
                        </div>
                        <div ref={textWifiRef}
                             style={{position: 'absolute', top: 0, left: 0, opacity: 0, transform: 'translateY(20px)'}}>
                            <h1 style={{fontSize: '7vw', color: '#111', fontWeight: 900, marginBottom: '10px'}}>
                                IoT Sensors for Prevention Facilities
                            </h1>
                            <p style={{fontSize: '3vw', color: '#555', fontWeight: 500}}>
                                Utilizes various types of measuring instruments to collect relevant data (current,
                                differential pressure, pH, temperature, etc.) to monitor the operational status and
                                detailed metrics of the prevention facilities.
                            </p>
                        </div>
                        <div ref={textBoxRef}
                             style={{position: 'absolute', top: 0, left: 0, opacity: 0, transform: 'translateY(20px)'}}>
                            <h1 style={{fontSize: '7vw', color: '#111', fontWeight: 900, marginBottom: '10px'}}>
                                04. Edge Device
                            </h1>
                            <p style={{fontSize: '3vw', color: '#555', fontWeight: 500}}>
                                현장 센서 데이터 수집 및 클라우드 동기화
                            </p>
                        </div>
                    </div>

                    {/* 🌟 2. 3D 캔버스 영역 (터치 이벤트를 아예 원천 차단하여 모바일 스크롤 완벽 보장) */}
                    <div ref={canvasRef} style={{
                        position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none'
                    }}>
                        <Canvas style={{pointerEvents: 'none', touchAction: 'auto'}} shadows
                                camera={{position: [0, 0, 15], fov: 50}}>
                            <ambientLight intensity={0.2}/>
                            <directionalLight position={[10, 10, 10]} intensity={0.5} color="#ffffff"/>
                            <directionalLight position={[-10, 5, -10]} intensity={0.2} color="#ffffff"/>
                            <fog ref={fogRef} attach="fog" args={['#ffffff', 30, 90]}/>


                            <Environment preset="city"/>


                            <Suspense fallback={null}>
                                <ModelAnimator controlsRef={controlsRef}
                                               textRefs={[textIntroRef, textFactoryRef, textTankRef, textWifiRef, textBoxRef]}>

                                    <Center>
                                        <group>
                                            {/* 🌟 [수정된 패널] 뒤에 있던 패널을 바닥으로 눕혀서 무대(쇼룸)처럼 만듭니다 */}
                                            <RoundedBox
                                                args={[35, 35, 0.5]}               // 💡 바닥답게 가로/세로를 16으로 넓게 키웠습니다.
                                                position={[0, -0.5, 0]}           // 💡 제품의 발밑(바닥)으로 위치를 내렸습니다.
                                                rotation={[-Math.PI / 2, 0, 0]}    // 💡 X축으로 90도(-90도) 회전시켜 평평하게 눕힙니다!
                                                radius={0.5}
                                                smoothness={4}
                                                receiveShadow
                                            >
                                                {/* 재질은 대리석이나 고급 매트 질감이 나도록 유지 */}
                                                <meshStandardMaterial color="#f0f0f5" roughness={0.4} metalness={0.1}/>
                                            </RoundedBox>
                                            <AirProduct/>
                                            {/* 🌟 기존에 있던 그림자도 패널(바닥) 표면 위치에 딱 맞게 세팅! */}
                                            <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={15} blur={2.5}
                                                            far={4}/>
                                        </group>
                                    </Center>

                                    {/*<ChimneySmoke/>*/}
                                    <group position={[16, -3, 0]} scale={[1.5, 1.5, 1.5]}>
                                        <ChimneySmoke/>
                                    </group>


                                </ModelAnimator>
                                {/*@ts-ignored*/}
                                <EffectComposer disableNormalPass>
                                    <Bloom luminanceThreshold={3} mipmapBlur intensity={1.2}/>
                                    <ToneMapping/>
                                </EffectComposer>
                            </Suspense>

                            <OrbitControls
                                ref={controlsRef}
                                autoRotateSpeed={1.5}
                                enableZoom={false}
                                enablePan={false}
                                enableRotate={false}
                                makeDefault
                                target={[0, 2, 0]}
                                minPolarAngle={Math.PI / 2 - 0.15}
                                maxPolarAngle={Math.PI / 2}
                            />
                        </Canvas>
                    </div>
                </div>
            </div>


            {/* --- [섹션 3] 4개의 Box 애니메이션 캔버스 영역 (음수 마진으로 이전 sticky 구간과 겹쳐 올라오는 레이어) --- */}
            <div style={{marginTop: '-100vh', position: 'relative', zIndex: 25}}>
                <MiddleBoxSection ref={middleCanvasWrapperRef}/>
            </div>

            {/* --- 스펙 시트 영역 --- */}
            <div
                ref={finalPageRef}
                style={{
                    position: 'relative',
                    zIndex: 30,
                    width: '100%',
                    minHeight: '100vh',
                    backgroundColor: '#111111',
                    borderTopLeftRadius: '40px',
                    borderTopRightRadius: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8vh 5%',
                    boxShadow: '0 -20px 50px rgba(0,0,0,0.15)',
                    color: '#ffffff'
                }}
            >
                <div className="final-page-text" style={{textAlign: 'center', marginBottom: '40px'}}>
                    <p style={{
                        fontSize: 'clamp(10px, 1.5vw, 14px)',
                        color: '#0ae448',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        marginBottom: '10px'
                    }}>
                        SPECIFICATIONS
                    </p>
                    <h1 style={{
                        fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, marginBottom: '16px', wordBreak: 'keep-all'
                    }}>
                        IoT Gateway 제품 사양
                    </h1>
                    <p style={{
                        fontSize: 'clamp(12px, 2vw, 16px)', color: '#aaaaaa', fontWeight: 500, wordBreak: 'keep-all'
                    }}>
                        주식회사 비디텍의 강력한 BDI-100 시리즈 스펙을 확인하세요.
                    </p>
                </div>

                {/* 사양표(Grid) 영역 */}
                <div
                    className="final-page-text"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '10px',
                        width: '100%',
                        maxWidth: '1200px'
                    }}
                >
                    {[
                        {label: '품명', value: 'IoT Gateway'},
                        {label: '모델명', value: 'BDI-100(단수) / BDI-100D(복수) / 다채널'},
                        {label: 'Size', value: '300 x 400 x 180'},
                        {label: 'CPU', value: 'Intel Quad-Core'},
                        {label: '운영체제', value: 'Windows 10'},
                        {label: '통신방식', value: 'LTE SSL VPN'},
                        {label: 'Memory', value: '4G RAM'},
                        {label: 'Storage', value: '64G eMMC'},
                        {label: 'Display', value: '7inch IPS touch panel'},
                        {label: 'I/O', value: '4~20mA Sensor'},
                        {label: 'Power', value: 'AC 220V'},
                        {label: '제조사', value: '주식회사 비디텍 (대한민국)'}
                    ].map((spec, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', gap: '12px'
                            }}
                        >
                            <span style={{
                                color: '#888888',
                                fontSize: 'clamp(12px, 1vw, 15px)',
                                fontWeight: 600,
                                flexShrink: 0,
                                wordBreak: 'keep-all'
                            }}>
                                {spec.label}
                            </span>
                            <span style={{
                                color: '#ffffff',
                                fontSize: 'clamp(12px, 1.1vw, 15px)',
                                fontWeight: 500,
                                textAlign: 'right',
                                wordBreak: 'keep-all'
                            }}>
                                {spec.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>


            {/* --- 새로운 하단 3D 캔버스 영역 --- */}
            <div
                ref={secondCanvasWrapperRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    backgroundColor: '#050505',
                    overflow: 'hidden',
                    zIndex: 20
                }}
            >
                {/* 텍스트 오버레이 */}
                <div
                    ref={secondCanvasTextRef}
                    style={{
                        position: 'absolute', top: '50%', left: '10%', transform: 'translateY(-50%)',
                        zIndex: 30, pointerEvents: 'none', color: '#fff'
                    }}
                >
                    <h2 style={{fontSize: 'clamp(30px, 4vw, 60px)', fontWeight: 900, margin: 0, lineHeight: 1.1}}>
                        Data <br/> <span style={{color: '#0ae448'}}>Connectivity.</span>
                    </h2>
                    <p style={{
                        fontSize: 'clamp(14px, 1.5vw, 20px)',
                        color: '#888',
                        marginTop: '20px',
                        maxWidth: '400px',
                        wordBreak: 'keep-all'
                    }}>
                        수집된 데이터는 안전하고 빠르게 클라우드로 동기화되어 끊김 없는 모니터링 환경을 제공합니다.
                    </p>
                </div>

                {/* 🌟 3. 두 번째 3D 캔버스도 동일하게 터치 이벤트 완전 차단 */}
                <div style={{position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none'}}>
                    <Canvas style={{pointerEvents: 'none', touchAction: 'auto'}}
                            camera={{position: [0, 0, 5], fov: 50}}>
                        <ambientLight intensity={0.5}/>
                        <directionalLight position={[10, 10, 10]} intensity={1} color="#0ae448"/>
                        <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#5ea2e6"/>

                        <Suspense fallback={null}>
                            <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                                <mesh ref={secondCanvasMeshRef} position={[2, 0, 0]}>
                                    <icosahedronGeometry args={[1.5, 1]}/>
                                    <meshStandardMaterial color="#0ae448" wireframe={true} transparent opacity={0.8}/>
                                </mesh>
                            </Float>

                            {/*<EffectComposer disableNormalPass>*/}
                            {/*    <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} opacity={1.5}/>*/}
                            {/*</EffectComposer>*/}
                        </Suspense>

                        <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} autoRotate
                                       autoRotateSpeed={0.5}/>
                    </Canvas>
                </div>
            </div>
        </>
    );
}