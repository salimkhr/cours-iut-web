import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure `pageExtensions` to include markdown and MDX files
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    // Optionally, add any other Next.js config below
    images: {
        domains: ['picsum.photos', 'developer.mozilla.org', 'media0.giphy.com', 'media1.giphy.com', 'media2.giphy.com', 'media3.giphy.com', 'media4.giphy.com', 'media5.giphy.com'],
    },
}

const withMDX = createMDX({
    // Add markdown plugins here, as desired
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)