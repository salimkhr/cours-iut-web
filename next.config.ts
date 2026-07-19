// next.config.ts
import {execSync} from 'node:child_process';
import createMDX from '@next/mdx';
import type {NextConfig} from 'next';

// Hash du commit + date, figés AU BUILD (le serveur standalone n'a pas de .git au runtime).
// Priorité à une variable fournie par la CI/Dokploy, repli sur git local, sinon "dev".
function resolveCommitSha(): string {
    const fromEnv = process.env.COMMIT_SHA ?? process.env.SOURCE_COMMIT ?? process.env.GIT_COMMIT_SHA;
    if (fromEnv) return fromEnv.slice(0, 7);
    try {
        return execSync('git rev-parse --short HEAD', {stdio: ['ignore', 'pipe', 'ignore']}).toString().trim();
    } catch {
        return 'dev';
    }
}

const commitSha = resolveCommitSha();
const buildDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Configuration de base
const baseConfig: NextConfig = {
    output: 'standalone', // garde la sortie standalone pour déploiement
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

    env: {
        NEXT_PUBLIC_COMMIT_SHA: commitSha,
        NEXT_PUBLIC_BUILD_DATE: buildDate,
    },

    // Gestion des images distantes
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'picsum.photos' },
            { protocol: 'https', hostname: 'placehold.co' },
            { protocol: 'https', hostname: 'lesjoiesducode.fr' },
            { protocol: 'https', hostname: 'developer.mozilla.org' },
            { protocol: 'https', hostname: 'media0.giphy.com' },
            { protocol: 'https', hostname: 'media1.giphy.com' },
            { protocol: 'https', hostname: 'media2.giphy.com' },
            { protocol: 'https', hostname: 'media3.giphy.com' },
            { protocol: 'https', hostname: 'media4.giphy.com' },
            { protocol: 'https', hostname: 'media5.giphy.com' },
            { protocol: 'https', hostname: 'salimkhraimeche.dev' },
            { protocol: 'https', hostname: 'img.clerk.com' },
        ],
        formats: ['image/avif', 'image/webp'],
    },

    experimental: {
        authInterrupts: true,
    },

    turbopack: {
        resolveAlias: {
            '@components': 'src/components', // alias pratique pour les imports
            '@lib': 'src/lib',
        },
        resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx'],
        rules: {
            '*.svg': { loaders: ['@svgr/webpack'], as: '*.js' },
            '*.mdx': { loaders: ['@mdx-js/loader'], as: '*.js' },
        },
    },
};

// Plugins typés
const withMDX = createMDX({}) as (config: NextConfig) => NextConfig;

// Export de la configuration finale
export default withMDX(baseConfig);
