/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com'
            }
        ],
        unoptimized: true
    },
    reactStrictMode: false,
    eslint: {
        ignoreDuringBuilds: true
    },
    experimental: {
        serverComponentsExternalPackages: ['sharp']
    }
};

export default nextConfig;
