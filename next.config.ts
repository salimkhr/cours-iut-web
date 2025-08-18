// next.config.ts
import createMDX from '@next/mdx';
import withPWAInit from 'next-pwa';
import type {NextConfig} from 'next';

// Configuration Next.js de base
const nextConfig: NextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    images: {
        remotePatterns: [
            {protocol: 'https', hostname: 'picsum.photos'},
            {protocol: 'https', hostname: 'placehold.co'},
            {protocol: 'https', hostname: 'developer.mozilla.org'},
            {protocol: 'https', hostname: 'media0.giphy.com'},
            {protocol: 'https', hostname: 'media1.giphy.com'},
            {protocol: 'https', hostname: 'media2.giphy.com'},
            {protocol: 'https', hostname: 'media3.giphy.com'},
            {protocol: 'https', hostname: 'media4.giphy.com'},
            {protocol: 'https', hostname: 'media5.giphy.com'},
        ],
        formats: ['image/avif', 'image/webp'],
    },
};

// Forcer les types génériques pour éviter le conflit TS2345
const withMDX = createMDX({}) as (config: NextConfig) => NextConfig;
const withPWA = withPWAInit({
    dest: 'public',
    register: true,
    skipWaiting: true
}) as (config: NextConfig) => NextConfig;

// Application des plugins à la config
export default withPWA(withMDX(nextConfig));