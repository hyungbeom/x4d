import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  /** 빌드 시 `tsc` 검사 생략 (배포 전에는 끄는 것을 권장) */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
