import { useEffect } from "react";
import type { RefObject } from "react";
import { gsap } from "@/lib/brochureGsap";

export type NextSectionScrollRefs = {
    wrapperRef: RefObject<HTMLDivElement | null>;
    sectionRef: RefObject<HTMLDivElement | null>;
    canvasRef: RefObject<HTMLDivElement | null>;
    textWrapperRef: RefObject<HTMLDivElement | null>;
    finalPageRef: RefObject<HTMLDivElement | null>;
    middleCanvasWrapperRef: RefObject<HTMLDivElement | null>;
    secondCanvasWrapperRef: RefObject<HTMLDivElement | null>;
    secondCanvasTextRef: RefObject<HTMLDivElement | null>;
};

const FINAL_TEXT_SELECTOR = "[data-bdtec-final-text]";

/** MiddleBox 클립 전환: 스크롤 거리를 넓혀 천천히 열리게 함 */
const MIDDLE_CLIP_START = "top bottom";
const MIDDLE_CLIP_END = "top -32%";
const MIDDLE_SCRUB = 1.6;

/**
 * NextSection 스크롤 연동 GSAP (트리거는 ref 기준, 스펙 블록은 스코프 내 querySelector)
 */
export function useNextSectionScrollAnimations(refs: NextSectionScrollRefs) {
    const {
        wrapperRef,
        sectionRef,
        canvasRef,
        textWrapperRef,
        finalPageRef,
        middleCanvasWrapperRef,
        secondCanvasWrapperRef,
        secondCanvasTextRef,
    } = refs;

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const section = sectionRef.current;
        const canvas = canvasRef.current;
        const textWrapper = textWrapperRef.current;
        const finalPage = finalPageRef.current;
        const middle = middleCanvasWrapperRef.current;
        const secondWrap = secondCanvasWrapperRef.current;
        const secondText = secondCanvasTextRef.current;

        if (!wrapper || !section || !canvas || !textWrapper || !finalPage || !secondWrap || !secondText) {
            return;
        }

        const finalTextNodes = finalPage.querySelectorAll<HTMLElement>(FINAL_TEXT_SELECTOR);

        const ctx = gsap.context(() => {
            gsap.fromTo(
                section,
                { clipPath: "inset(15% 15% 15% 15% round 60px)", filter: "brightness(0.3)" },
                {
                    scrollTrigger: { trigger: wrapper, start: "top bottom", end: "top 20%", scrub: 1 },
                    clipPath: "inset(0% 0% 0% 0% round 0px)",
                    filter: "brightness(1)",
                    ease: "none",
                },
            );

            gsap.from(textWrapper, {
                scrollTrigger: { trigger: wrapper, start: "top 30%", toggleActions: "play none none reverse" },
                y: 80,
                opacity: 0,
                duration: 1.2,
                ease: "power4.out",
            });

            gsap.from(canvas, {
                scrollTrigger: { trigger: wrapper, start: "top 30%", toggleActions: "play none none reverse" },
                opacity: 0,
                duration: 1.5,
                ease: "expo.out",
                delay: 0.2,
            });

            if (finalTextNodes.length) {
                gsap.from(finalTextNodes, {
                    scrollTrigger: {
                        trigger: finalPage,
                        start: "top 75%",
                        toggleActions: "play none none reverse",
                    },
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.2,
                    ease: "power3.out",
                });
            }

            gsap.from(secondText, {
                scrollTrigger: {
                    trigger: secondWrap,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                },
                y: 60,
                opacity: 0,
                duration: 1.2,
                ease: "expo.out",
            });

            if (middle) {
                gsap.fromTo(
                    middle,
                    {
                        clipPath: "inset(30% 20% 30% 20% round 150px)",
                        filter: "brightness(0)",
                    },
                    {
                        scrollTrigger: {
                            trigger: middle,
                            start: MIDDLE_CLIP_START,
                            end: MIDDLE_CLIP_END,
                            scrub: MIDDLE_SCRUB,
                        },
                        clipPath: "inset(0% 0% 0% 0% round 0px)",
                        filter: "brightness(1)",
                        ease: "power2.inOut",
                    },
                );
            }
        });

        return () => ctx.revert();
    }, [
        wrapperRef,
        sectionRef,
        canvasRef,
        textWrapperRef,
        finalPageRef,
        middleCanvasWrapperRef,
        secondCanvasWrapperRef,
        secondCanvasTextRef,
    ]);
}
