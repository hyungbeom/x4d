'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { TransitionType } from './PageWrapper';

interface TransitionLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    type?: TransitionType;
}

export default function TransitionLink({ href, children, className, type = 'slideUp' }: TransitionLinkProps) {
    const router = useRouter();

    const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const target = document.getElementById('page-wrapper');

        if (!target) {
            router.push(href);
            return;
        }

        const duration = 0.5;
        const ease = "power3.inOut";

        if (type === 'blinds') {
            // 🎯 Blinds 타입: 15개의 하얀색 기둥이 아래에서 위로 차르륵 올라오며 화면을 덮음
            gsap.set('#blinds-container', { visibility: 'visible' });
            gsap.fromTo('.blind-column',
                { scaleY: 0, transformOrigin: 'bottom' }, // 바닥에서부터
                {
                    scaleY: 1, // 화면 끝까지 채움
                    duration: 0.6,
                    stagger: 0.05, // 0.05초 간격으로 순차적 실행 (웨이브 효과)
                    ease: "power3.inOut",
                    onComplete: () => router.push(href) // 화면이 다 덮이면 다음 페이지로 이동!
                }
            );
            return; // 👈 아래의 기존 애니메이션은 실행하지 않고 여기서 함수 종료
        }

        // 🎯 기존 애니메이션 속성 세팅
        const animationProps: gsap.TweenVars = {
            opacity: 0, duration, ease, onComplete: () => router.push(href)
        };

        switch (type) {
            case 'slideUp': animationProps.y = -30; break;
            case 'fade': break;
            case 'scale': animationProps.scale = 1.05; break;
            case 'slideLeft': animationProps.x = -50; break;
        }

        gsap.to(target, animationProps);
    };

    return (
        <a href={href} onClick={handleTransition} className={className}>
            {children}
        </a>
    );
}