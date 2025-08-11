// next.config.ts
import createMDX from '@next/mdx';
import withPWAInit from 'next-pwa';
import type {NextConfig} from 'next';

// Configuration Next.js de base
const nextConfig: NextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    images: {
        domains: [
            'picsum.photos',
            'developer.mozilla.org',
            'media0.giphy.com',
            'media1.giphy.com',
            'media2.giphy.com',
            'media3.giphy.com',
            'media4.giphy.com',
            'media5.giphy.com'
        ]
    }
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