'use client';

import type { CompanyListItem } from '@/data/progist/sampleCompanies';
import { usePageTransition } from '@/utils/ui/usePageTransition';
import styles from './CompanyList.module.css';

type CompanyListProps = {
    companies: CompanyListItem[];
};

export default function CompanyList({ companies }: CompanyListProps) {
    const navigate = usePageTransition();

    return (
        <ul className={styles.list}>
            {companies.map((company) => (
                <li key={company.id} className={styles.card}>
                    <div
                        className={styles.logo}
                        style={{ backgroundColor: company.logoColor }}
                        aria-hidden
                    >
                        {company.logoInitials}
                    </div>
                    <div className={styles.body}>
                        <p className={styles.nameEn}>{company.nameEn}</p>
                        <p className={styles.nameKo}>{company.nameKo}</p>
                    </div>
                    <div className={styles.badges}>
                        <button
                            type="button"
                            className={styles.booth}
                            onClick={() =>
                                navigate(`/map?booth=${encodeURIComponent(company.booth)}`, 'blinds')
                            }
                        >
                            {company.booth}
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
