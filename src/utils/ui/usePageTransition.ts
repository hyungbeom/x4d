'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import gsap from 'gsap';
import { getPageBlindsColumns, showPageBlindsContainer } from '@/utils/ui/pageBlinds';
import type { TransitionType } from './PageWrapper';

export function usePageTransition() {
    const router = useRouter();

    return useCallback(
        (href: string, type: TransitionType = 'blinds') => {
            const target = document.getElementById('page-wrapper');

            if (!target) {
                router.push(href);
                return;
            }

            const duration = 0.5;
            const ease = 'power3.inOut';

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

            const animationProps: gsap.TweenVars = {
                opacity: 0,
                duration,
                ease,
                onComplete: () => router.push(href),
            };

            switch (type) {
                case 'slideUp':
                    animationProps.y = -30;
                    break;
                case 'scale':
                    animationProps.scale = 1.05;
                    break;
                case 'slideLeft':
                    animationProps.x = -50;
                    break;
                default:
                    break;
            }

            gsap.to(target, animationProps);
        },
        [router],
    );
}
