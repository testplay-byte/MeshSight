import type { NextConfig } from "next";

const config: NextConfig = {
  // Static export: GitHub Pages serves plain files from site/out.
  output: "export",
  basePath: "/MeshSight",
  assetPrefix: "/MeshSight",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default config;
