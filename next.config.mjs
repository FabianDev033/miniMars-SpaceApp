/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (webpackConfig, { dev }) => {
    if (dev) {
      // Evita bloqueos de archivos ENOENT en carpetas sincronizadas con OneDrive en Windows
      webpackConfig.cache = false;
    }
    return webpackConfig;
  },
};

export default config;
