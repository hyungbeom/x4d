import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: ReactNode }) {
    return (
        <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            {...props}
        >
            {children}
        </svg>
    );
}

/** 수질 */
export function WaterIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M12 2.5c-3.5 5.5-6 9.2-6 12.8a6 6 0 0 0 12 0c0-3.6-2.5-7.3-6-12.8z" />
        </IconBase>
    );
}

/** 대기 */
export function AirIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M3 8c2.5-2 5.5-2 8 0s5.5 2 8 0" />
            <path d="M3 14c2.5-2 5.5-2 8 0s5.5 2 8 0" />
            <path d="M3 20c2.5-2 5.5-2 8 0s5.5 2 8 0" />
        </IconBase>
    );
}

/** 측정분석 */
export function AnalysisIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M4 19V5" />
            <path d="M10 19V9" />
            <path d="M16 19v-5" />
            <path d="M22 19V3" />
        </IconBase>
    );
}

/** 탈탄소 */
export function CarbonIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M12 21c-4-2.5-6-6-6-9a6 6 0 0 1 12 0c0 3-1.5 6-6 9z" />
            <path d="M12 11v-2" />
            <path d="M9 13c1 .8 2 .8 3 0s2-.8 3 0" />
        </IconBase>
    );
}

/** 외국관 */
export function PavilionIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a14 14 0 0 1 0 18" />
            <path d="M12 3a14 14 0 0 0 0 18" />
        </IconBase>
    );
}

/** 기관 및 단체 */
export function InstitutionIcon(props: IconProps) {
    return (
        <IconBase {...props}>
            <path d="M4 20V9l8-5 8 5v11" />
            <path d="M9 20v-5h6v5" />
            <path d="M9 12h6" />
        </IconBase>
    );
}
