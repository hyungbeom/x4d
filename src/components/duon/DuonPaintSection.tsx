'use client';

import styles from './DuonPaintSection.module.css';

const DUON_HOMEPAGE_URL = 'https://ecogreencoat.com/';

export default function DuonPaintSection() {
    return (
        <div className={styles.section} aria-label="차별성 소개">
            <div className={styles.inner}>
                <p className={`${styles.lead} paint-anim`}>
                    믿을 수 있는 우수한 제품을 만들기 위해 우리는 많은 시간을 연구개발에 투자했습니다.
                    그러한 노력으로 뛰어난 성능과 기술력을 인정받게 되었습니다.
                    두온에너지원은 이미 국내외 다수의 특허로 보호받고 있는 압도적인 성능의 차열 기술을 보유하고 있으며,
                    조달 혁신제품 및 국토교통부 지정 혁신신기술인증 등으로 그 기술력을 확인할 수 있습니다.
                    최상의 제품력과 성능을 보장합니다.
                </p>

                <h2 className={`${styles.headline} paint-anim`}>
                    <span>국내/외 공인기관들도 인정한</span>
                    <strong>우수한 차열성능!</strong>
                </h2>

                <a
                    href={DUON_HOMEPAGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.homeButton} paint-anim`}
                >
                    홈페이지 바로가기
                </a>
            </div>
        </div>
    );
}
