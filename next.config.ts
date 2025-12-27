import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: process.platform === "win32" ? undefined : "standalone",
  allowedDevOrigins: ["*.devhong.cc"],
  images: {
    remotePatterns: [
      new URL("https://marketplace.canva.com/**"),
      new URL("https://ticketimage.interpark.com/Play/image/**"),
      new URL("https://image6.yanolja.com/**"),
    ],
  },
};

export default nextConfig;
