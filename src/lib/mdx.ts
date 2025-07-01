import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Content } from '@/types/content';

const mdxDirectory = path.join(process.cwd(), 'src/mdx');

/**
 * Récupère tous les fichiers MDX d'un répertoire
 */
export function getAllMdxFiles(subPath: string = ''): string[] {
    const targetDir = subPath ? path.join(mdxDirectory, subPath) : mdxDirectory;

    if (!fs.existsSync(targetDir)) {
        return [];
    }

    return fs.readdirSync(targetDir)
        .filter(file => file.endsWith('.mdx') || file.endsWith('.md'))
        .map(file => file.replace(/\.(mdx|md)$/, ''));
}

/**
 * Récupère le chemin complet d'un fichier MDX
 */
export function getMdxFile(slug: string, subPath: string = ''): string {
    const basePath = subPath ? path.join(mdxDirectory, subPath) : mdxDirectory;

    // Essayer d'abord .mdx puis .md
    const mdxPath = path.join(basePath, `${slug}.mdx`);
    const mdPath = path.join(basePath, `${slug}.md`);

    if (fs.existsSync(mdxPath)) return mdxPath;
    if (fs.existsSync(mdPath)) return mdPath;

    throw new Error(`Fichier MDX non trouvé: ${slug} dans ${basePath}`);
}

/**
 * Lit et parse un fichier MDX avec son frontmatter
 */
export function readMdxFile(filePath: string) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontMatter, content } = matter(fileContent);
        return { frontMatter, content };
    } catch (error) {
        throw new Error(`Erreur lors de la lecture du fichier ${filePath}: ${error}`);
    }
}

/**
 * Scanne récursivement un dossier et retourne tous les fichiers MDX
 */
export function scanMdxDirectory(modulePath: string): Array<{
    filePath: string;
    relativePath: string;
    fileName: string;
}> {
    const moduleDir = path.join(mdxDirectory, modulePath);

    if (!fs.existsSync(moduleDir)) {
        return [];
    }

    const files: Array<{filePath: string, relativePath: string, fileName: string}> = [];

    function scanRecursive(currentDir: string, relativePath: string = '') {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });

        items.forEach(item => {
            if (item.isDirectory()) {
                const subDir = path.join(currentDir, item.name);
                const newRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;
                scanRecursive(subDir, newRelativePath);
            } else if (item.name.endsWith('.md') || item.name.endsWith('.mdx')) {
                files.push({
                    filePath: path.join(currentDir, item.name),
                    relativePath: relativePath,
                    fileName: item.name
                });
            }
        });
    }

    scanRecursive(moduleDir);
    return files;
}

/**
 * Génère un objet Content à partir d'un fichier MDX
 */
export function createContentFromMdx(
    filePath: string,
    modulePath: string,
    relativePath: string,
    fileName: string
): Content | null {
    try {
        const { frontMatter } = readMdxFile(filePath);

        const slug = path.basename(fileName, path.extname(fileName));
        const fullRelativePath = relativePath ? `${relativePath}/${fileName}` : fileName;

        // Générer un ID unique basé sur le chemin
        const pathParts = relativePath ? relativePath.split('/') : [];
        const idParts = [modulePath, ...pathParts, slug].join('-');

        return {
            id: idParts,
            title: frontMatter.title || formatTitle(slug),
            slug: slug,
            description: frontMatter.description || `Contenu ${formatTitle(slug)}`,
            duration: frontMatter.duration || 30,
            type: frontMatter.type || inferTypeFromFilename(fileName),
            mdxPath: `src/mdx/${modulePath}/${fullRelativePath}`,
            order: frontMatter.order || 999,
            // Métadonnées additionnelles
            ...(frontMatter.tags && { tags: frontMatter.tags }),
            ...(frontMatter.difficulty && { difficulty: frontMatter.difficulty }),
            ...(frontMatter.prerequisites && { prerequisites: frontMatter.prerequisites })
        };
    } catch (error) {
        console.error(`Erreur lors du traitement de ${filePath}:`, error);
        return null;
    }
}

/**
 * Formate un titre à partir d'un slug
 */
export function formatTitle(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Déduit le type de contenu à partir du nom du fichier
 */
export function inferTypeFromFilename(fileName: string): 'lesson' | 'exercise' | 'project' {
    const name = fileName.toLowerCase();
    if (name.includes('exercice') || name.includes('exercise')) return 'exercise';
    if (name.includes('projet') || name.includes('project')) return 'project';
    if (name.includes('tp') || name.includes('lab')) return 'exercise';
    return 'lesson';
}

/**
 * Vérifie si un fichier MDX existe
 */
export function mdxFileExists(slug: string, subPath: string = ''): boolean {
    try {
        getMdxFile(slug, subPath);
        return true;
    } catch {
        return false;
    }
}