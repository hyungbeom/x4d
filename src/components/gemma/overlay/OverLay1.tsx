'use client';

import React, { type RefObject } from 'react';

const GEMMA_LOGO_SRC = '/model/gemma/gemma_logo.png';

type Overlay1Props = {
    showProductDetail?: boolean;
    hidden?: boolean;
    productDetailRef?: RefObject<HTMLButtonElement | null>;
    onProductDetailClick?: () => void;
};

export default function Overlay1({
    showProductDetail = false,
    hidden = false,
    productDetailRef,
    onProductDetailClick,
}: Overlay1Props) {
    return (
        <>
            <style>
                {`
                    .gemma-overlay-root {
                        position: fixed;
                        inset: 0;
                        z-index: 10;
                        pointer-events: none;
                        opacity: 1;
                        visibility: visible;
                        transition: opacity 0.45s ease, visibility 0.45s ease;
                    }

                    .gemma-overlay-root--hidden {
                        opacity: 0;
                        visibility: hidden;
                    }

                    .overlay-header {
                        color: #123d52;
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 10;
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                        max-width: min(92vw, 520px);
                    }

                    .overlay-header__brand {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                    }

                    .overlay-text {
                        padding: 10px 15px;
                        font-weight: 600;
                        font-size: 16px;
                        line-height: 1.4;
                    }

                    .overlay-logo {
                        width: auto;
                        height: 28px;
                        margin: 0;
                        display: block;
                        object-fit: contain;
                        flex-shrink: 0;
                    }

                    .product-detail-btn {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        margin-top: 2px;
                        margin-left: 0;
                        padding: 10px 20px;
                        border-radius: 999px;
                        border: 1.5px solid rgba(72, 168, 154, 0.65);
                        background: linear-gradient(
                            180deg,
                            rgba(255, 255, 255, 0.92) 0%,
                            rgba(228, 245, 242, 0.88) 100%
                        );
                        color: #0f3d42;
                        font-size: 13px;
                        font-weight: 700;
                        letter-spacing: -0.02em;
                        line-height: 1;
                        white-space: nowrap;
                        cursor: pointer;
                        pointer-events: auto;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
                        transition:
                            background-color 0.2s ease,
                            border-color 0.2s ease,
                            transform 0.12s ease;
                    }

                    .product-detail-btn:hover {
                        background: #ffffff;
                        border-color: #48a89a;
                        transform: translateY(-1px);
                    }

                    .product-detail-btn:active {
                        transform: scale(0.97);
                    }

                    .product-detail-btn--hidden {
                        opacity: 0;
                        pointer-events: none;
                    }

                    .info-card {
                        position: absolute;
                        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
                        left: 15px;
                        width: min(260px, 72vw);
                        max-width: 320px;
                        padding: 12px 14px;
                        z-index: 10;
                        isolation: isolate;
                        background: transparent;
                        border: 1px solid rgba(255, 255, 255, 0.28);
                        box-shadow:
                            0 6px 20px rgba(0, 0, 0, 0.08),
                            inset 0 1px 0 rgba(255, 255, 255, 0.35);
                        border-radius: 12px;
                        word-break: keep-all;
                        will-change: transform, opacity;
                        pointer-events: none;
                    }

                    .info-card::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        border-radius: inherit;
                        background: rgba(255, 255, 255, 0.16);
                        backdrop-filter: blur(6px) saturate(1.05);
                        -webkit-backdrop-filter: blur(6px) saturate(1.05);
                        z-index: 0;
                        pointer-events: none;
                    }

                    .info-card-title,
                    .info-card-desc {
                        position: relative;
                        z-index: 1;
                        color: #ffffff;
                    }

                    .info-card-title {
                        font-size: 14px;
                        font-weight: 800;
                        margin-bottom: 12px;
                    }

                    .info-card-desc {
                        font-size: 11px;
                        font-weight: 500;
                        white-space: normal;
                    }

                    @media (min-width: 768px) {
                        .overlay-header {
                            padding: 30px;
                        }

                        .overlay-text {
                            padding: 20px 30px;
                            font-size: 20px;
                        }

                        .overlay-logo {
                            height: 36px;
                        }

                        .product-detail-btn {
                            margin-top: 4px;
                            padding: 12px 24px;
                            font-size: 14px;
                        }

                        .info-card {
                            bottom: calc(24px + env(safe-area-inset-bottom, 0px));
                            left: 30px;
                            width: min(500px, 52vw);
                            max-width: 500px;
                            padding: 20px;
                        }

                        .info-card-title {
                            font-size: 16px;
                            margin-bottom: 16px;
                        }

                        .info-card-desc {
                            font-size: 12px;
                        }
                    }

                    @media (min-width: 1024px) {
                        .info-card {
                            bottom: calc(30px + env(safe-area-inset-bottom, 0px));
                            left: 50px;
                            width: min(700px, 58vw);
                            max-width: 60%;
                            padding: 25px;
                        }

                        .info-card-title {
                            font-size: 18px;
                            margin-bottom: 20px;
                        }

                        .info-card-desc {
                            font-size: 14px;
                            line-height: 1.5;
                        }

                        .overlay-logo {
                            height: 44px;
                        }

                        .product-detail-btn {
                            margin-top: 8px;
                            padding: 12px 28px;
                            font-size: 15px;
                        }
                    }
                `}
            </style>

            <div
                className={`gemma-overlay-root${hidden ? ' gemma-overlay-root--hidden' : ''}`}
                aria-hidden={hidden}
            >
                <div className="overlay-header">
                    <div className="overlay-header__brand">
                        <img className="overlay-logo" src={GEMMA_LOGO_SRC} alt={'\uC810\uB9C8 \uB85C\uACE0'} />
                        <div className="overlay-text" style={{ textAlign: 'left' }}>
                            <div>Environmental Iot</div>
                            <div>Total Technology Company</div>
                        </div>
                    </div>
                    <button
                        ref={productDetailRef}
                        type="button"
                        className={`product-detail-btn ${showProductDetail ? '' : 'product-detail-btn--hidden'}`}
                        onClick={onProductDetailClick}
                        aria-label={'\uC81C\uD488 \uC790\uC138\uD788 \uBCF4\uAE30'}
                    >
                        {'\uC81C\uD488 \uC790\uC138\uD788 \uBCF4\uAE30'}
                    </button>
                </div>

                <div className="info-card">
                    <div className="info-card-title">
                        {'\uC218\uC9C8\u00B7\uD658\uACBD \uBAA8\uB2C8\uD130\uB9C1 \uC194\uB8E8\uC158'}
                    </div>
                    <div className="info-card-desc">
                        {
                            '\uD558\u00B7\uD3D0\uC218 \uCC98\uB9AC\uC640 \uC218\uC9C8 \uC815\uD654 \uBD84\uC57C\uC758 \uAE30\uC220\uB825\uC73C\uB85C \uD604\uC7A5 \uB9DE\uCDA4\uD615 \uD658\uACBD \uC194\uB8E8\uC158\uC744 \uC81C\uACF5\uD569\uB2C8\uB2E4.'
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
