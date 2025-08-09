const fs = require('fs').promises;
const path = require('path');

async function generateContentImports() {
    const baseDir = path.resolve(process.cwd(), 'src', 'cours');

    const modules = await fs.readdir(baseDir);

    const importsObj = {};

    for (const moduleSlug of modules) {
        const modulePath = path.join(baseDir, moduleSlug);
        const statModule = await fs.stat(modulePath);
        if (!statModule.isDirectory()) continue;

        importsObj[moduleSlug] = {};

        const sections = await fs.readdir(modulePath);
        for (const sectionSlug of sections) {
            const sectionPath = path.join(modulePath, sectionSlug);
            const statSection = await fs.stat(sectionPath);
            if (!statSection.isDirectory()) continue;

            importsObj[moduleSlug][sectionSlug] = {};

            const contentFiles = await fs.readdir(sectionPath);
            for (const file of contentFiles) {
                if (file.endsWith('.tsx')) {
                    const contentSlug = file.replace(/\.tsx$/, '');
                    const importPath = `@/cours/${moduleSlug}/${sectionSlug}/${contentSlug}`;
                    importsObj[moduleSlug][sectionSlug][contentSlug] = `() => import('${importPath}')`;
                }
            }
        }
    }

    let tsContent = `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY\n\n`;
    tsContent += `import React from 'react';\n\n`;
    tsContent += `export type ContentImportsType = {\n`;
    tsContent += `  [moduleSlug: string]: {\n`;
    tsContent += `    [sectionSlug: string]: {\n`;
    tsContent += `      [contentSlug: string]: () => Promise<{ default: React.ComponentType<any> }>;\n`;
    tsContent += `    }\n`;
    tsContent += `  }\n`;
    tsContent += `};\n\n`;
    tsContent += `export const contentImports: ContentImportsType = {\n`;

    for (const moduleSlug in importsObj) {
        tsContent += `  '${moduleSlug}': {\n`;
        const sections = importsObj[moduleSlug];
        for (const sectionSlug in sections) {
            tsContent += `    '${sectionSlug}': {\n`;
            const contents = sections[sectionSlug];
            for (const contentSlug in contents) {
                tsContent += `      '${contentSlug}': ${contents[contentSlug]},\n`;
            }
            tsContent += `    },\n`;
        }
        tsContent += `  },\n`;
    }

    tsContent += `};\n`;

    const outputPath = path.resolve(process.cwd(), 'src', 'lib', 'contentImports.ts');
    await fs.writeFile(outputPath, tsContent, 'utf8');

    console.log(`Generated contentImports.ts with modules: ${Object.keys(importsObj).join(', ')}`);
}

generateContentImports().catch(console.error);
