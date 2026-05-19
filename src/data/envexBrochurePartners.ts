import { buildEnvexLogoUrl } from '@/data/map/envexCompanies';

export type EnvexBrochurePartner = {
    id: string;
    name: string;
    href: string;
    logoSrc: string;
    logoAlt: string;
};

export const ENVEX_BROCHURE_PARTNERS: EnvexBrochurePartner[] = [
    {
        id: 'bdtec',
        name: '비디텍',
        href: '/brochure/bdtec',
        logoSrc: '/model/bdtec/logo.svg',
        logoAlt: '비디텍',
    },
    {
        id: 'duon',
        name: '두온',
        href: '/brochure/duon',
        logoSrc: buildEnvexLogoUrl('duonenergy1.png') ?? '/model/duon/logo.png',
        logoAlt: '두온',
    },
    {
        id: 'gemma',
        name: '젬마',
        href: '/brochure/gemma',
        logoSrc: buildEnvexLogoUrl('회사 로고(젬마).jpg') ?? '',
        logoAlt: '젬마',
    },
];
