// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('cheerio');

const coursDir = 'src/cours';                     // ← chemin vers ton dossier de cours
const outputDir = './rag/corpus';               // ← dossier de sortie JSON

function getAllTSXFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir, {withFileTypes: true});
    for (const file of list) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results = results.concat(getAllTSXFiles(fullPath));
        } else if (file.isFile() && file.name.endsWith('.tsx')) {
            results.push(fullPath);
        }
    }
    return results;
}

function extractTextWithInlineCode($, $elem) {
    let texts = [];

    function recurse(node) {
        if (node.type === 'text') {
            texts.push(node.data);
        } else if (node.type === 'tag') {
            if (node.name === 'Code') {
                const codeText = $(node).text().trim();
                texts.push(`[CODE:${codeText}]`);
            } else {
                node.children.forEach(recurse);
            }
        }
    }

    $elem.contents().each((i, el) => recurse(el));
    return texts.join(' ').replace(/\s+/g, ' ').trim();
}

function extractFromFile(filePath) {
    const tsx = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(tsx, {xmlMode: true});

    const blocks = [];

    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        $(tag).each((_, el) => {
            const text = extractTextWithInlineCode($, $(el));
            if (text) blocks.push({type: 'title', content: text});
        });
    });

    $('p').each((_, el) => {
        const text = extractTextWithInlineCode($, $(el));
        if (text) blocks.push({type: 'paragraph', content: text});
    });

    $('List').each((_, list) => {
        const items = [];
        $(list).find('ListItem').each((_, li) => {
            const text = extractTextWithInlineCode($, $(li));
            if (text) items.push(text);
        });
        if (items.length) blocks.push({type: 'list', items});
    });

    $('Table').each((_, table) => {
        const rows = [];
        $(table).find('TableRow').each((_, row) => {
            const cells = [];
            $(row).find('TableCell, TableHead').each((_, cell) => {
                const text = extractTextWithInlineCode($, $(cell));
                cells.push(text);
            });
            rows.push(cells);
        });
        if (rows.length) blocks.push({type: 'table', rows});
    });

    $('CodeCard').each((_, card) => {
        const raw = $(card).html();
        const match = raw && raw.match(/{`([\s\S]*?)`}/);
        if (match) {
            blocks.push({type: 'code', content: match[1].trim()});
        }
    });

    return {
        file: path.relative(coursDir, filePath),
        blocks
    };
}

function saveToFile(data, relativePath) {
    const baseName = relativePath.replace(/\\/g, '/').replace(/\.tsx$/, '.json');
    const outputPath = path.join(outputDir, baseName);

    fs.mkdirSync(path.dirname(outputPath), {recursive: true});
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ Généré :', outputPath);
}

function extractAllToMultipleJSON() {
    if (!fs.existsSync(coursDir)) {
        console.error('❌ Le dossier "cours/" est introuvable.');
        process.exit(1);
    }

    const files = getAllTSXFiles(coursDir).filter((file) => !file.endsWith('Tp.tsx'));
    files.forEach(file => {
        const data = extractFromFile(file);
        const relativePath = path.relative(coursDir, file);
        saveToFile(data, relativePath);
    });
}

extractAllToMultipleJSON();
