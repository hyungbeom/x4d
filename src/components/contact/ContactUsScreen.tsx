'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import TransitionLink from '@/utils/ui/TransitionLink';
import { gsap } from '@/lib/brochureGsap';
import styles from './ContactUsScreen.module.css';

export type ContactRowIcon = 'phone' | 'mail' | 'clock' | 'pin';

export type ContactRow = {
    key: string;
    icon: ContactRowIcon;
    primary: string;
    href?: string;
    secondary: string;
};

export type ContactUsScreenProps = {
    backHref: string;
    backAriaLabel: string;
    phoneHref: string;
    lead: ReactNode;
    rows: ContactRow[];
};

function ContactIcon({ type }: { type: ContactRowIcon }) {
    const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true as const };
    switch (type) {
        case 'phone':
            return (
                <svg {...common}>
                    <path
                        d="M6.6 3.5h2.2l1.1 4.6-1.8 1.1a11.5 11.5 0 005.8 5.8l1.1-1.8 4.6 1.1v2.2c0 .6-.4 1-1 1.1-8.2.9-14.8-6.4-13.9-13.9.1-.6.5-1 1.1-1z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                </svg>
            );
        case 'mail':
            return (
                <svg {...common}>
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            );
        case 'clock':
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            );
        default:
            return (
                <svg {...common}>
                    <path
                        d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.6" />
                </svg>
            );
    }
}

export default function ContactUsScreen({
    backHref,
    backAriaLabel,
    phoneHref,
    lead,
    rows,
}: ContactUsScreenProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        gsap.fromTo(
            card,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.15 },
        );
    }, []);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <TransitionLink
                    href={backHref}
                    className={styles.backBtn}
                    type="blinds"
                    aria-label={backAriaLabel}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                            d="M14.5 5.5L8 12l6.5 6.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </TransitionLink>
                <h1 className={styles.headerTitle}>문의 안내</h1>
            </header>

            <main className={styles.main}>
                <div ref={cardRef} className={styles.card}>
                    <p className={styles.lead}>{lead}</p>

                    <hr className={styles.divider} />

                    <ul className={styles.contactList}>
                        {rows.map((row) => (
                            <li key={row.key} className={styles.contactRow}>
                                <span className={styles.contactIcon}>
                                    <ContactIcon type={row.icon} />
                                </span>
                                <div className={styles.contactText}>
                                    {row.href ? (
                                        <a href={row.href} className={styles.contactPrimary}>
                                            {row.primary}
                                        </a>
                                    ) : (
                                        <span className={styles.contactPrimary}>{row.primary}</span>
                                    )}
                                    <span className={styles.contactMeta}>
                                        <span className={styles.contactPipe} aria-hidden>
                                            |
                                        </span>
                                        {row.secondary}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>

            <div className={styles.bottomBar}>
                <a href={phoneHref} className={styles.primaryBtn}>
                    전화 문의하기
                </a>
            </div>
        </div>
    );
}
