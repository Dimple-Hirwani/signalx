/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In production (Render), NEXT_PUBLIC_API_URL points to the backend service.
    // Locally it falls back to localhost:8000.
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
