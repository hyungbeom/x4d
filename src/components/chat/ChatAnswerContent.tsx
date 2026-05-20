'use client';

import { useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { prepareChatHtml } from '@/utils/prepareChatHtml';
import { usePageTransition } from '@/utils/ui/usePageTransition';
import styles from './EnvexCompanyCard.module.css';

type ChatAnswerContentProps = {
    raw: string;
    streaming?: boolean;
};

export default function ChatAnswerContent({ raw, streaming = false }: ChatAnswerContentProps) {
    const navigate = usePageTransition();
    const answerRef = useRef<HTMLDivElement>(null);

    const html = useMemo(() => prepareChatHtml(raw, streaming), [raw, streaming]);

    useEffect(() => {
        const host = answerRef.current;
        if (!host) return;

        const onClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest('a');
            if (!anchor || !host.contains(anchor)) return;
            const href = anchor.getAttribute('href');
            if (!href || /^https?:\/\//i.test(href)) return;
            e.preventDefault();
            navigate(href, 'blinds');
        };

        host.addEventListener('click', onClick);
        return () => host.removeEventListener('click', onClick);
    }, [html, navigate]);

    if (!html) return null;

    return (
        <div ref={answerRef} className={styles.answer}>
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                    a: ({ href, children, ...props }) => {
                        const isMap =
                            typeof href === 'string' &&
                            (href.includes('/map') || href.includes('booth='));
                        if (isMap) {
                            return (
                                <a
                                    {...props}
                                    href={href}
                                    className="envex-chat-map-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (href) navigate(href, 'blinds');
                                    }}
                                >
                                    {children}
                                </a>
                            );
                        }
                        return (
                            <a {...props} href={href} target="_blank" rel="noopener noreferrer">
                                {children}
                            </a>
                        );
                    },
                    img: ({ src, alt, ...props }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img {...props} src={src} alt={alt ?? ''} loading="lazy" />
                    ),
                }}
            >
                {html}
            </ReactMarkdown>
        </div>
    );
}
