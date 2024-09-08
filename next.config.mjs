/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    // Excluir archivos .map de la compilación
    config.module.rules.push({
      test: /\.map$/,
      use: "null-loader",
    });

    return config;
  },
};
export default nextConfig;
