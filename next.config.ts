import path from "node:path";
import type { NextConfig } from "next";

/** Webpack이 `exports`의 `import`만 있는 패키지를 거부할 때를 대비해 엔트리를 직접 지정 */
const reactSplineMain = path.join(
  process.cwd(),
  "node_modules/@splinetool/react-spline/dist/react-spline.js"
);

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  /** Spline 런타임만 트랜스파일 (react-spline은 alias로 dist 직접 로드) */
  transpilePackages: ["@splinetool/runtime"],
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string | string[] | false | undefined>),
      "@splinetool/react-spline": reactSplineMain,
    };
    return config;
  },
};

export default nextConfig;
