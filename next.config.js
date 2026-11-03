/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Temporary public page: the Generators Report (static file in /public).
  async rewrites() {
    return [{ source: "/generators-report", destination: "/generators-report.html" }];
  },
};

module.exports = nextConfig;
