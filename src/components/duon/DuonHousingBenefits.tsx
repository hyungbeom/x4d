'use client';

import styles from './DuonHousingBenefits.module.css';

const BENEFITS = [
    {
        title: '전기세 절감',
        desc: '시원해진 실내로 인해 에어컨 사용이 줄어들어 전기세 절감이 가능합니다.',
        icon: (
            <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden>
                <circle cx="24" cy="24" r="20" fill="currentColor" opacity="0.15" />
                <text x="24" y="30" textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor">
                    ₩
                </text>
            </svg>
        ),
    },
    {
        title: '뛰어난 내구성',
        desc: '내구연한이 길어 아파트 재도장 시기를 늦출 수 있습니다. 이는 아파트 관리 비용 및 유지비 감소에도 영향을 미칩니다.',
        icon: (
            <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden>
                <ellipse cx="24" cy="30" rx="14" ry="5" fill="currentColor" opacity="0.2" />
                <ellipse cx="24" cy="24" rx="12" ry="4" fill="currentColor" opacity="0.45" />
                <ellipse cx="24" cy="18" rx="10" ry="3.5" fill="currentColor" />
            </svg>
        ),
    },
    {
        title: '시공비 절약',
        desc: '하도 1회, 상도 2회로 끝나는 간편한 시공으로 인해 시공비를 절약할 수 있습니다.',
        icon: (
            <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden>
                <rect x="10" y="22" width="22" height="8" rx="2" fill="currentColor" opacity="0.35" />
                <rect x="28" y="14" width="8" height="22" rx="2" fill="currentColor" />
            </svg>
        ),
    },
    {
        title: '열섬현상 감소',
        desc: '빛을 반사시켜 열에너지 전환을 막음으로써 도심 열대야 현상을 줄어들게 합니다.',
        icon: (
            <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden>
                <circle cx="24" cy="26" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
                <rect x="22" y="10" width="4" height="10" rx="2" fill="currentColor" />
            </svg>
        ),
    },
    {
        title: '세금 감면',
        desc: '녹색건축인증 가점 획득으로, 조건 충족 시 세금감면 등의 혜택이 가능합니다.',
        icon: (
            <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden>
                <text x="24" y="32" textAnchor="middle" fontSize="26" fontWeight="900" fill="currentColor">
                    ₩
                </text>
            </svg>
        ),
    },
];

type Props = {
    embedded?: boolean;
};

export default function DuonHousingBenefits({ embedded = false }: Props) {
    return (
        <section className={embedded ? styles.sectionEmbedded : styles.section}>
            <div className={styles.inner}>
                <header className={`${styles.header} benefits-header-anim`}>
                    <h2 className={styles.title}>공동주택 시공 시 좋은 점!</h2>
                    <p className={styles.lead}>
                        <span className={styles.leadBar} aria-hidden />
                        <span>
                            폭염 시 발생하는 문제점들이 어드그린코트를 통해 어떻게 해결되는지, 그리고 또
                            어떠한 좋은 점들이 있는지 자세히 알려드립니다.
                        </span>
                    </p>
                </header>

                <div className={styles.grid}>
                    {BENEFITS.map((item) => (
                        <article key={item.title} className={`${styles.card} benefit-card`}>
                            <div className={styles.iconWrap}>{item.icon}</div>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDesc}>{item.desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
