import fs from 'fs';
import path from 'path';

const mdxDirectory = path.join(process.cwd(), 'src/mdx');

export function getAllMdxFiles() {
    return fs.readdirSync(mdxDirectory).map(file => file.replace('.mdx', ''));
}

export function getMdxFile(slug: string) {
    return path.join(mdxDirectory, `${slug}.mdx`);
}