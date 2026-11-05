/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Temporary public pages (static files in /public): Generators Report, Qiddiya Workforce map.
  async rewrites() {
    return [
      { source: "/generators-report", destination: "/generators-report.html" },
      { source: "/qiddiya-workforce", destination: "/qiddiya-workforce.html" },
    ];
  },
};

module.exports = nextConfig;
