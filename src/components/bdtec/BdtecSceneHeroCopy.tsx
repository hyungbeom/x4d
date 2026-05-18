'use client';

import styles from './BdtecSceneHeroCopy.module.css';

const DEFAULT_BODY = [
    '현장의 센서·설비 데이터를 하나의 게이트웨이로 수집·전송하는 구성을 한눈에 보여 줍니다.',
    '배출·방지 시설과 통신망이 어떻게 연결되는지 단계별로 확인할 수 있습니다.',
    '하단 메뉴에서 항목을 선택하면 해당 구역으로 카메라가 이동합니다.',
];

type BdtecSceneHeroCopyProps = {
    visible: boolean;
    title?: string;
    subtitle?: string;
    body?: string[];
};

export default function BdtecSceneHeroCopy({
                                               visible,
                                               title = 'IoT Gateway',
                                               subtitle = '구성도 입니다',
                                               body = DEFAULT_BODY,
                                           }: BdtecSceneHeroCopyProps) {
    return (
        <div

            className={`${styles.hero} ${visible ? styles.heroVisible : styles.heroHidden}`}
            aria-hidden={!visible}
        >
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
    );
}
