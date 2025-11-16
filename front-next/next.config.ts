import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Desabilitar otimização para evitar timeouts com serviços externos instáveis
    unoptimized: true,
  },
};

export default nextConfig;
