type Vec3 = { x: number; y: number; z: number };

export function formatMapPosition(
    point: Vec3,
    decimals = 1,
): [string, string, string] {
    return [
        point.x.toFixed(decimals),
        point.y.toFixed(decimals),
        point.z.toFixed(decimals),
    ];
}

/** markPosition / 클릭 좌표용 `[x, y, z]` */
export function formatMapPositionArray(point: Vec3, decimals = 1): string {
    const [x, y, z] = formatMapPosition(point, decimals);
    return `[${x}, ${y}, ${z}]`;
}

/** mapCameraOverrides.json 붙여넣기용 */
export function formatMapMarkPositionJson(point: Vec3, booth?: string, decimals = 1): string {
    const [x, y, z] = formatMapPosition(point, decimals);
    const boothComment = booth ? `  // booth ${booth}` : '';
    return `"markPosition": [${x}, ${y}, ${z}]${boothComment}`;
}

export async function copyTextToClipboard(text: string): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

export async function copyMapClickPosition(
    point: Vec3,
    options?: { booth?: string; decimals?: number; asJsonField?: boolean },
): Promise<string> {
    const decimals = options?.decimals ?? 1;
    const text = options?.asJsonField
        ? formatMapMarkPositionJson(point, options.booth, decimals)
        : formatMapPositionArray(point, decimals);

    await copyTextToClipboard(text);
    return text;
}
