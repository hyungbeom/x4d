'use client';

import { getMapBoothMarkPlacements } from '@/utils/map/mapCameraPoints';
import { MapBoothMark } from '@/resources/model/MapBoothMark';

export function MapBoothMarks({ booth = '' }: { booth?: string }) {
    const placements = getMapBoothMarkPlacements(booth || null);

    return (
        <>
            {placements.map((placement) => (
                <MapBoothMark
                    key={placement.booth}
                    position={placement.position}
                    scale={placement.scale}
                />
            ))}
        </>
    );
}
