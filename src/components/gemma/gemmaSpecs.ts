export type GemmaSpecRow = { label: string; value: string };

/** 젬마 제품사양 (제공 자료 기준) */
export const GEMMA_PRODUCT_SPECS: GemmaSpecRow[] = [
    {
        label: '세척',
        value: '시료 분석 전 세정 기능 수행\n[증류수 or 세정액 사용]',
    },
    {
        label: '분석 보정',
        value: '온도 보정\n바탕시료 보정\nLED 전류 보정',
    },
    {
        label: '시약 주입 시스템',
        value: '스텝 모터로 구동되는 주사기\n정확도 : 0.015 ml',
    },
    {
        label: '유체 시스템',
        value:
            '실린지 보호를 위한 Loop 설계\n' +
            '고내화학성 Kalrez 밸브 사용\n' +
            '고내화학성 Tygon 2375 튜빙 사용\n' +
            '피팅(연결부)이 없는 일체형 시스템',
    },
    {
        label: '반응조',
        value:
            '저용량 유리 반응조(17ml)\n' +
            '오버플로우 방지 자동 시스템\n' +
            '드레인 효율을 높인 특수 설계',
    },
    {
        label: '패스트 루프 · 샘플 채취',
        value:
            '주입구(Inlet) : 6mm 튜브\n' +
            '배출구(Outlet) : 8mm 튜브\n' +
            '패스트 루프 주입구\n' +
            '샘플 수위 감지기\n' +
            '오버플로우 방지 시스템\n' +
            '수동 세척시 드레인을 위한 수동 밸브',
    },
    {
        label: '환경 조건',
        value: '0°C ~ 45°C',
    },
    {
        label: '전원',
        value: '입력 : AC100-240V - 50Hz\n최대 소비전력 : 288W',
    },
    {
        label: '설치',
        value: '스틸 프레임',
    },
    {
        label: '크기',
        value: '스틸 프레임 : 65×40×15 cm\n외함 : 100×55×30 cm (변경 될 수 있음)',
    },
    {
        label: '사용자 인터페이스',
        value: '키패드 4개, 상태표시용 LED 4개',
    },
    {
        label: '지원 언어',
        value: '영어, 스페인어, 프랑스어\n(요청시 다른 언어 추가 가능)',
    },
    {
        label: '통신',
        value:
            '4-20 mA 신호\n' +
            'RS-485 통신\n' +
            'RS485 MODBUS 또는 PROFIBUS',
    },
    {
        label: '릴레이',
        value: '4개 릴레이 (24V), 사용자 지정 가능',
    },
    {
        label: '진단 메뉴',
        value: '분석기 상태 자가 진단 가능',
    },
    {
        label: '교정 & 분석',
        value: '수동 또는 자동',
    },
];
