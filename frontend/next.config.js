/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      assert: false,
      http: false,
      https: false,
      zlib: false,
      net: false,
      tls: false,
      'rpc-websockets': false,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  reactStrictMode: true,
}

module.exports = nextConfig 