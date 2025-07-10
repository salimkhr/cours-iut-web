// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

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

const courseDirectory = path.join(process.cwd(), 'src', 'cours');

function scanMdxDirectory(modulePath) {
    const moduleDir = path.join(courseDirectory, modulePath);

    if (!fs.existsSync(moduleDir)) {
        console.warn(`⚠️  Le dossier ${moduleDir} n'existe pas`);
        return new Map();
    }

    const sectionFiles = new Map();

    function scanRecursive(currentDir, relativePath = '') {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });

        items.forEach(item => {
            if (item.isDirectory()) {
                const subDir = path.join(currentDir, item.name);
                const newRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;
                scanRecursive(subDir, newRelativePath);
            } else if (item.name.endsWith('.tsx') || item.name.endsWith('.jsx')) {
                const sectionKey = relativePath || 'root';
                if (!sectionFiles.has(sectionKey)) {
                    sectionFiles.set(sectionKey, []);
                }
                sectionFiles.get(sectionKey).push({
                    filePath: path.join(currentDir, item.name),
                    relativePath,
                    fileName: item.name
                });
            }
        });
    }

    scanRecursive(moduleDir);
    return sectionFiles;
}

function loadSectionMeta(directory) {
    const metaPath = path.join(directory, 'config.meta.json');
    if (!fs.existsSync(metaPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch (err) {
        console.warn(`⚠️ Erreur de lecture de ${metaPath}: ${err.message}`);
        return {};
    }
}

function createContentFromComponent(filePath, modulePath, relativePath, fileName, metaFromFolder) {
    const slug = path.basename(fileName, path.extname(fileName));
    const baseFileName = path.basename(fileName, path.extname(fileName));
    const fullRelativePath = relativePath ? `${relativePath}/${baseFileName}` : baseFileName;
    const pathParts = relativePath ? relativePath.split('/') : [];
    const idParts = [modulePath, ...pathParts, slug].join('-');

    const frontMatter = metaFromFolder || {};

    return {
        id: idParts,
        title: frontMatter.title || formatTitle(slug),
        slug,
        description: frontMatter.description || `Contenu ${formatTitle(slug)}`,
        duration: frontMatter.duration || 30,
        type: frontMatter.type || inferTypeFromFilename(fileName),
        componentPath: `${modulePath}/${fullRelativePath}`,
        order: frontMatter.order || 999,
        ...(frontMatter.tags && { tags: frontMatter.tags }),
        ...(frontMatter.difficulty && { difficulty: frontMatter.difficulty }),
        ...(frontMatter.prerequisites && { prerequisites: frontMatter.prerequisites })
    };
}

function createSectionFromFiles(sectionPath, files, modulePath) {
    const contents = [];
    const folderPath = path.join(courseDirectory, modulePath, sectionPath || '');
    const metaFromFolder = loadSectionMeta(folderPath);

    files.forEach(({ filePath, relativePath, fileName }) => {
        const content = createContentFromComponent(
            filePath,
            modulePath,
            relativePath,
            fileName,
            metaFromFolder
        );
        if (content) contents.push(content);
    });

    contents.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

    const sectionId = sectionPath === 'root'
        ? `${modulePath}-root`
        : `${modulePath}-${sectionPath.replace(/\//g, '-')}`;

    const sectionTitle = sectionPath === 'root'
        ? 'Introduction'
        : formatSectionTitle(sectionPath);

    const totalDuration = contents.reduce((sum, c) => sum + (c.duration || 0), 0);
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

function formatTitle(slug) {
    return slug
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatSectionTitle(sectionPath) {
    const lastPart = sectionPath.split('/').pop();
    return formatTitle(lastPart);
}

function inferSectionOrder(sectionPath, contents) {
    const sectionOrders = contents
        .map(c => c.sectionOrder)
        .filter(order => order !== undefined);
    if (sectionOrders.length > 0) return Math.min(...sectionOrders);

    const path = sectionPath.toLowerCase();
    if (path === 'root' || path.includes('intro')) return 1;
    if (path.includes('basic') || path.includes('fondamental')) return 2;
    if (path.includes('intermediate') || path.includes('intermediaire')) return 5;
    if (path.includes('advanced') || path.includes('avance')) return 8;
    if (path.includes('project') || path.includes('projet')) return 9;
    return 5;
}

function inferTypeFromFilename(fileName) {

    const name = fileName.toLowerCase();

    console.log(name);
    if (name.endsWith('projet.tsx')) return 'projet';
    if (name.endsWith('tp.tsx')) return 'tp';
    return 'cours';
}

function generateModuleSections(moduleConfig) {
    const sectionFiles = scanMdxDirectory(moduleConfig.path);
    const sections = [];

    sectionFiles.forEach((files, sectionPath) => {
        const section = createSectionFromFiles(sectionPath, files, moduleConfig.path);
        if (section && section.contents.length > 0) {
            sections.push(section);
        }
    });

    sections.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    return sections;
}

function generateModulesData() {
    console.log('> Génération des données ...');

    const modules = MODULES_BASE_CONFIG.map(moduleConfig => {
        const sections = generateModuleSections(moduleConfig);
        const totalContents = sections.reduce((sum, section) => sum + section.contentsCount, 0);
        const totalDuration = sections.reduce((sum, section) => sum + section.totalDuration, 0);

        return {
            ...moduleConfig,
            sections,
            sectionsCount: sections.length,
            totalContents,
            totalDuration,
            contentTypes: [...new Set(sections.flatMap(s => s.contentTypes))]
        };
    });

    const output = `// 🤖 Ce fichier est généré automatiquement par scripts/generate-contents.js
import { Module } from '@/types/module';

const modules: Module[] = ${JSON.stringify(modules, null, 2)};

export default modules;
`;

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, 'modules.ts'), output);

    const totalSections = modules.reduce((sum, m) => sum + m.sectionsCount, 0);
    const totalContents = modules.reduce((sum, m) => sum + m.totalContents, 0);

    const metaOutput = `// 🤖 Métadonnées de génération
export const generationMeta = {
  timestamp: "${new Date().toISOString()}",
  totalModules: ${modules.length},
  totalSections: ${totalSections},
  totalContents: ${totalContents},
  moduleStats: ${JSON.stringify(modules.map(m => ({
        id: m.id,
        sectionsCount: m.sectionsCount,
        contentsCount: m.totalContents,
        duration: m.totalDuration,
        types: m.contentTypes
    })), null, 2)}
};
`;

    fs.writeFileSync(path.join(dataDir, 'generation-meta.ts'), metaOutput);
    return modules;
}

// Exécution
try {
    generateModulesData();
} catch (error) {
    console.error('💥 Erreur lors de la génération:', error);
    process.exit(1);
}