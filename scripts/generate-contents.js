// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const matter = require('gray-matter');

/**
 * Configuration des modules (directement dans le script)
 */
const MODULES_BASE_CONFIG = [
    {
        id: 'html-css',
        title: 'HTML & CSS',
        path: 'html-css',
        iconName: 'CodeXml',
        description: 'Créez des interfaces web responsives avec HTML, CSS et Bootstrap',
        color: '#E34F26'
    },
    {
        id: 'php',
        title: 'PHP',
        path: 'php',
        iconName: 'ServerCog',
        description: 'Maîtrisez la programmation côté serveur et la gestion des données',
        color: '#777BB4'
    },
    {
        id: 'javascript',
        title: 'JavaScript',
        path: 'javascript',
        iconName: 'BracesIcon',
        description: 'Créez des expériences web dynamiques et réactives',
        color: '#F7DF1E'
    }
];

// Chemin vers le dossier MDX
const mdxDirectory = path.join(process.cwd(), 'src', 'mdx');

/**
 * Scanne récursivement un dossier et retourne tous les fichiers MDX organisés par section
 */
function scanMdxDirectory(modulePath) {
    const moduleDir = path.join(mdxDirectory, modulePath);

    if (!fs.existsSync(moduleDir)) {
        console.warn(`⚠️  Le dossier ${moduleDir} n'existe pas`);
        return new Map();
    }

    const sectionFiles = new Map(); // Map<sectionPath, files[]>

    function scanRecursive(currentDir, relativePath = '') {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });

        items.forEach(item => {
            if (item.isDirectory()) {
                const subDir = path.join(currentDir, item.name);
                const newRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;
                scanRecursive(subDir, newRelativePath);
            } else if (item.name.endsWith('.md') || item.name.endsWith('.mdx')) {
                // Utiliser le chemin relatif comme clé de section (ou 'root' si à la racine)
                const sectionKey = relativePath || 'root';

                if (!sectionFiles.has(sectionKey)) {
                    sectionFiles.set(sectionKey, []);
                }

                sectionFiles.get(sectionKey).push({
                    filePath: path.join(currentDir, item.name),
                    relativePath: relativePath,
                    fileName: item.name
                });
            }
        });
    }

    scanRecursive(moduleDir);
    return sectionFiles;
}

/**
 * Génère un objet Content à partir d'un fichier MDX
 */
function createContentFromMdx(filePath, modulePath, relativePath, fileName) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontMatter } = matter(fileContent);

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
            mdxPath: `${modulePath}/${fullRelativePath}`,
            order: frontMatter.order || 999,
            // Métadonnées additionnelles
            ...(frontMatter.tags && { tags: frontMatter.tags }),
            ...(frontMatter.difficulty && { difficulty: frontMatter.difficulty }),
            ...(frontMatter.prerequisites && { prerequisites: frontMatter.prerequisites })
        };
    } catch (error) {
        console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Crée un objet Section à partir des fichiers d'un dossier
 */
function createSectionFromFiles(sectionPath, files, modulePath) {
    const contents = [];

    files.forEach(({ filePath, relativePath, fileName }) => {
        const content = createContentFromMdx(
            filePath,
            modulePath,
            relativePath,
            fileName
        );

        if (content) {
            contents.push(content);
        }
    });

    // Trier par ordre puis par titre
    contents.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.title.localeCompare(b.title);
    });

    // Générer l'ID et le titre de la section
    const sectionId = sectionPath === 'root'
        ? `${modulePath}-root`
        : `${modulePath}-${sectionPath.replace(/\//g, '-')}`;

    const sectionTitle = sectionPath === 'root'
        ? 'Introduction'
        : formatSectionTitle(sectionPath);

    // Calculer la durée totale et les statistiques
    const totalDuration = contents.reduce((sum, content) => sum + (content.duration || 0), 0);
    const contentTypes = [...new Set(contents.map(c => c.type))];

    return {
        id: sectionId,
        title: sectionTitle,
        path: sectionPath === 'root' ? '' : sectionPath,
        description: `Section ${sectionTitle} avec ${contents.length} éléments`,
        totalDuration,
        contentTypes,
        contentsCount: contents.length,
        contents,
        order: inferSectionOrder(sectionPath, contents)
    };
}

/**
 * Formate un titre à partir d'un slug
 */
function formatTitle(slug) {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Formate un titre de section à partir du chemin
 */
function formatSectionTitle(sectionPath) {
    const lastPart = sectionPath.split('/').pop();
    return formatTitle(lastPart);
}

/**
 * Déduit l'ordre d'une section
 */
function inferSectionOrder(sectionPath, contents) {
    // Si un contenu de la section a un sectionOrder dans le frontmatter, l'utiliser
    const sectionOrders = contents
        .map(c => c.sectionOrder)
        .filter(order => order !== undefined);

    if (sectionOrders.length > 0) {
        return Math.min(...sectionOrders);
    }

    // Sinon, déduire de la structure du chemin
    const path = sectionPath.toLowerCase();
    if (path === 'root' || path.includes('intro') || path.includes('getting-started')) return 1;
    if (path.includes('basic') || path.includes('fondamental')) return 2;
    if (path.includes('intermediate') || path.includes('intermediaire')) return 5;
    if (path.includes('advanced') || path.includes('avance')) return 8;
    if (path.includes('project') || path.includes('projet')) return 9;

    return 5; // Ordre par défaut
}

/**
 * Déduit le type de contenu à partir du nom du fichier
 */
function inferTypeFromFilename(fileName) {
    const name = fileName.toLowerCase();
    if (name.includes('exercice') || name.includes('exercise')) return 'exercise';
    if (name.includes('projet') || name.includes('project')) return 'project';
    if (name.includes('tp') || name.includes('lab')) return 'exercise';
    return 'lesson';
}

/**
 * Génère les sections d'un module
 */
function generateModuleSections(moduleConfig) {
    const sectionFiles = scanMdxDirectory(moduleConfig.path);
    const sections = [];

    sectionFiles.forEach((files, sectionPath) => {
        const section = createSectionFromFiles(sectionPath, files, moduleConfig.path);
        if (section && section.contents.length > 0) {
            sections.push(section);
        }
    });

    // Trier les sections par ordre
    sections.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.title.localeCompare(b.title);
    });

    return sections;
}

/**
 * Génère le fichier de données des modules
 */
function generateModulesData() {
    console.log('> Génération des données ...');

    const modules = MODULES_BASE_CONFIG.map(moduleConfig => {
        const sections = generateModuleSections(moduleConfig);
        const totalContents = sections.reduce((sum, section) => sum + section.contentsCount, 0);
        const totalDuration = sections.reduce((sum, section) => sum + section.totalDuration, 0);

        return {
            ...moduleConfig,
            sections,
            // Statistiques du module
            sectionsCount: sections.length,
            totalContents,
            totalDuration,
            contentTypes: [...new Set(sections.flatMap(s => s.contentTypes))]
        };
    });

    const output = `// 🤖 Ce fichier est généré automatiquement par scripts/generate-contents.js
// Ne pas modifier manuellement !
// Pour régénérer : npm run generate:contents

import { Module } from '@/types/module';

const modules: Module[] = ${JSON.stringify(modules, null, 2)};

export default modules;
`;

    // Créer le dossier data s'il n'existe pas
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(path.join(dataDir, 'modules.ts'), output);

    // Générer les métadonnées
    const totalSections = modules.reduce((sum, m) => sum + m.sectionsCount, 0);
    const totalContents = modules.reduce((sum, m) => sum + m.totalContents, 0);
    const metaOutput = `// 🤖 Métadonnées de génération
export const generationMeta = {
    timestamp: "${new Date().toISOString()}",
    totalModules: ${modules.length},
    totalSections: ${totalSections},
    totalContents: ${totalContents},
    moduleStats: ${JSON.stringify(
        modules.map(m => ({
            id: m.id,
            sectionsCount: m.sectionsCount,
            contentsCount: m.totalContents,
            duration: m.totalDuration,
            types: m.contentTypes
        })),
        null,
        2
    )}
};
`;

    fs.writeFileSync(path.join(dataDir, 'generation-meta.ts'), metaOutput);

    return modules;
}

// Exécution du script
try {
    generateModulesData();
} catch (error) {
    console.error('💥 Erreur lors de la génération:', error);
    process.exit(1);
}