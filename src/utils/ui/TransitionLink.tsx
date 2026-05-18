'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { getPageBlindsColumns, showPageBlindsContainer } from '@/utils/ui/pageBlinds';
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
            const columns = getPageBlindsColumns();
            if (!columns || !showPageBlindsContainer()) {
                router.push(href);
                return;
            }
            gsap.fromTo(
                columns,
                { scaleY: 0, transformOrigin: 'bottom' },
                {
                    scaleY: 1,
                    duration: 0.6,
                    stagger: 0.05,
                    ease: 'power3.inOut',
                    onComplete: () => router.push(href),
                },
            );
            return;
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