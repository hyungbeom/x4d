'use client';

import { openCompanyHomepage, type CompanyListItem } from '@/data/map/envexCompanies';
import { usePageTransition } from '@/utils/ui/usePageTransition';
import styles from './CompanyList.module.css';

type CompanyListProps = {
    companies: CompanyListItem[];
};

export default function CompanyList({ companies }: CompanyListProps) {
    const navigate = usePageTransition();

    return (
        <ul className={styles.list}>
            {companies.map((company) => {
                const hasHomepage = Boolean(company.homepage);
                return (
                <li
                    key={company.id}
                    className={[styles.card, hasHomepage ? styles.cardClickable : ''].filter(Boolean).join(' ')}
                    onClick={hasHomepage ? () => openCompanyHomepage(company.homepage) : undefined}
                    onKeyDown={
                        hasHomepage
                            ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      openCompanyHomepage(company.homepage);
                                  }
                              }
                            : undefined
                    }
                    role={hasHomepage ? 'button' : undefined}
                    tabIndex={hasHomepage ? 0 : undefined}
                >
                    <div
                        className={styles.logo}
                        style={company.logoUrl ? undefined : { backgroundColor: company.logoColor }}
                    >
                        {company.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={company.logoUrl}
                                alt=""
                                className={styles.logoImg}
                                loading="lazy"
                                decoding="async"
                            />
                        ) : (
                            <span className={styles.logoFallback} aria-hidden>
                                {company.logoInitials}
                            </span>
                        )}
                    </div>
                    <div className={styles.body}>
                        <p className={styles.nameEn}>{company.nameEn}</p>
                        <p className={styles.nameKo}>{company.nameKo}</p>
                    </div>
                    <div className={styles.badges}>
                        <button
                            type="button"
                            className={styles.booth}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/map?booth=${encodeURIComponent(company.booth)}`, 'blinds');
                            }}
                        >
                            {company.booth}
                        </button>
                    </div>
                </li>
                );
            })}
        </ul>
    );
}
