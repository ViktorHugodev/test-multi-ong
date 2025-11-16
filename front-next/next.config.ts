import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permitir dominios remotos realmente usados pelas imagens dos produtos
    domains: ['loremflickr.com', 'example.com'],
  },
};

export default nextConfig;
