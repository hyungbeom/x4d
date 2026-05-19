'use client';

import styles from './GemmaSceneHeroCopy.module.css';

const DEFAULT_BODY = [
    '하·폐수 처리와 수질 정화 현장의 핵심 데이터를 한눈에 확인할 수 있습니다.',
    '수질·환경 모니터링 구성과 원격 관제 흐름을 단계별로 살펴볼 수 있습니다.',
    '하단 메뉴에서 항목을 선택하면 해당 솔루션 설명을 확인할 수 있습니다.',
];

type GemmaSceneHeroCopyProps = {
    visible: boolean;
    title?: string;
    subtitle?: string;
    body?: string[];
};

export default function GemmaSceneHeroCopy({
    visible,
    title = '수질·환경 모니터링',
    subtitle = '솔루션 소개입니다',
    body = DEFAULT_BODY,
}: GemmaSceneHeroCopyProps) {
    return (
        <div
            className={`${styles.hero} ${visible ? styles.heroVisible : styles.heroHidden}`}
            aria-hidden={!visible}
        >
            <div className={styles.heroCard}>
                <h1 className={styles.title}>
                    <span className={styles.titleMain}>{title}</span>
                    <span className={styles.titleSub}>{subtitle}</span>
                </h1>
                <div className={styles.body}>
                    {body.map((line) => (
                        <p key={line} className={styles.paragraph}>
                            {line}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}
