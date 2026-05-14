"use client";

import React, {useEffect, useRef} from 'react';
import { gsap } from "@/lib/brochureGsap";

export default function Overlay2() {
    const helloRef = useRef<HTMLDivElement>(null);
    const bdtecRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {

            // 💡 1. 좌측 상단 타이틀 타임라인 (등장 👉 대기 👉 왼쪽으로 퇴장)
            const tlHello = gsap.timeline({
                scrollTrigger: {
                    trigger: ".scroll-container",
                    start: "40% top", // 등장 시작점
                    end: "80% top",   // 완전히 사라지는 끝점 (Section 3 진입 시점)
                    scrub: 1,
                }
            });

            tlHello.to(helloRef.current, { x: 0, opacity: 1, duration: 1 })     // ① 스르륵 나타나기
                .to(helloRef.current, { x: 0, opacity: 1, duration: 1.5 })   // ② 화면에 머무르기
                .to(helloRef.current, { x: -100, opacity: 0, duration: 1 }); // ③ 다시 왼쪽으로 빠지기

            // 💡 2. 우측 하단 설명 타임라인 (등장 👉 대기 👉 오른쪽으로 퇴장)
            const tlBdtec = gsap.timeline({
                scrollTrigger: {
                    trigger: ".scroll-container",
                    start: "40% top",
                    end: "80% top",
                    scrub: 1,
                }
            });

            tlBdtec.to(bdtecRef.current, { x: 0, opacity: 1, duration: 1 })     // ① 스르륵 나타나기
                .to(bdtecRef.current, { x: 0, opacity: 1, duration: 1.5 })   // ② 화면에 머무르기
                .to(bdtecRef.current, { x: 100, opacity: 0, duration: 1 });  // ③ 다시 오른쪽으로 빠지기

        });
        return () => ctx.revert();
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
        }}>
            {/* 좌측 상단 타이틀 */}
            <div ref={helloRef} style={{
                position: 'absolute', top: '15%', left: '5%',
                fontSize: '7vw', fontWeight: 900, color: 'rgba(255,255,255,0.9)',
                opacity: 0, transform: 'translateX(-100px)', willChange: 'transform, opacity'
            }}>
                What is BDTEC's IoT<br/> Real-time Monitoring System?
            </div>

            {/* 우측 하단 설명 */}
            <div ref={bdtecRef} style={{
                position: 'absolute', bottom: 0, right: 0, textAlign: 'right',
                fontSize: '4vw', fontWeight: 900, color: 'white',
                opacity: 0, transform: 'translateX(100px)', willChange: 'transform, opacity',
                padding : 20
            }}>
                24시간 지속적인 모니터링으로 <br/>집진상태 진단과 측정 시스템 제공

                <div style={{fontSize: 11, fontWeight: 400, paddingTop : 7}}>
                    This system monitors the operational status of pollution prevention facilities in real-time, 24
                    hours a day, and securely transmits collected operational data—such as temperature, differential
                    pressure, and current—as secured data to the Korea Environment Corporation server
                    (www.greenlink.or.kr).
                </div>
            </div>
        </div>
    );
}