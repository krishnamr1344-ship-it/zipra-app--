/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    const target = (
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://zipra-api-583825347591.asia-south1.run.app"
    ).replace(/\/$/, "");
    return [
      // Proxy API calls to the production FastAPI backend (avoids CORS,
      // since the backend's allowlist does not include this origin).
      { source: "/api/:path*", destination: `${target}/api/:path*` },
    ];
  },
};

export default nextConfig;
