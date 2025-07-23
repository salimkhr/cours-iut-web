const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const babelParser = require('@babel/parser');
const generate = require('@babel/generator').default;

const coursDir = 'src/cours';
const outputDir = './rag/markdown';

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
    let result = '';

    function recurse(node) {
        if (node.type === 'text') {
            result += node.data;
        } else if (node.type === 'tag') {
            if (node.name === 'Code') {
                let codeText = $(node).text().trim();
                const codeMatch = codeText.match(/\{`([\s\S]*?)`\}/);
                if (codeMatch && codeMatch[1]) {
                    codeText = codeMatch[1].trim();
                }
                result += '`' + codeText + '`';
            } else {
                node.children.forEach(recurse);
            }
        }
    }

    $elem.contents().each((_, node) => recurse(node));
    return result.replace(/\s+/g, ' ').trim();
}


function extractList($, $list, level = 0) {
    let md = '';
    $list.children('ListItem').each((_, li) => {
        const $li = $(li);
        const text = extractTextWithInlineCode($, $li.clone().children('List').remove().end());
        md += `${'  '.repeat(level)}- ${text}\n`;
        const nested = $li.children('List');
        if (nested.length) {
            md += extractList($, nested, level + 1);
        }
    });
    return md + '\n';
}

function extractTable($, tableEl) {
    const rows = [];

    $(tableEl).find('TableRow').each((_, row) => {
        const cells = [];
        $(row)
            .find('TableCell, TableHead')
            .each((_, cell) => {
                const text = extractTextWithInlineCode($, $(cell));
                cells.push(text);
            });
        rows.push(cells);
    });

    if (rows.length === 0) return '';

    const header = rows[0];
    const separator = header.map(() => '---');
    const body = rows.slice(1);

    const formatRow = (cols) => `| ${cols.join(' | ')} |`;

    const mdTable = [
        formatRow(header),
        formatRow(separator),
        ...body.map(formatRow),
    ].join('\n');

    return mdTable + '\n\n';
}

function extractMarkdown(filePath) {
    const fullContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse le fichier TSX avec Babel
    let ast;
    try {
        ast = babelParser.parse(fullContent, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx']
        });
    } catch (err) {
        console.error('❌ Erreur de parsing Babel :', err);
        return '';
    }

    // Cherche le JSX retourné dans la fonction composant
    let jsxNode = null;

    // Fonction pour extraire le JSX retourné
    const {types: t} = require('@babel/core'); // utile pour tests de types

    // Parcours simple de l'AST pour trouver un ReturnStatement avec un argument JSX
    const traverse = require('@babel/traverse').default;

    traverse(ast, {
        ReturnStatement(path) {
            const arg = path.node.argument;
            // On cherche un JSXElement ou JSXFragment dans le return
            if (arg && (arg.type === 'JSXElement' || arg.type === 'JSXFragment')) {
                jsxNode = arg;
                path.stop(); // stoppe la traversée dès qu'on trouve le premier return JSX
            }
        }
    });

    if (!jsxNode) {
        console.warn(`❌ Aucun JSX trouvé dans le return de ${filePath}`);
        return '';
    }

    // Génère le code JSX à partir du noeud AST récupéré
    const {code: jsxCode} = generate(jsxNode, {concise: true});

    // Le code généré est du JSX, mais pas du HTML
    // Cheerio attend du HTML ou XML
    // On va charger ce JSX « pseudo-HTML » dans cheerio avec xmlMode pour parser nos balises personnalisées

    const $ = cheerio.load(jsxCode, {xmlMode: true});

    let md = '';

    function processChildren($parentEl) {
        $parentEl.children().each((idx, el) => {
            const $el = $(el);
            const tagName = el.tagName;

            switch (tagName) {
                case 'Heading':
                    const levelAttr = $el.attr('level');
                    const level = parseInt(levelAttr?.replace(/[{}]/g, '') || '1', 10);
                    const headingText = extractTextWithInlineCode($, $el);
                    if (headingText) {
                        md += `${'#'.repeat(level)} ${headingText}\n\n`;
                    }
                    break;
                case 'Text':
                    const text = extractTextWithInlineCode($, $el);
                    if (text) {
                        md += `${text}\n\n`;
                    }
                    break;
                case 'List':
                    md += extractList($, $el);
                    break;
                case 'CodePanel':
                    const rawCodeContent = $el.html();
                    const codeMatch = rawCodeContent && rawCodeContent.match(/\{`([\s\S]*?)`\}/);
                    if (codeMatch && codeMatch[1]) {
                        md += '```html\n' + codeMatch[1].trim() + '\n```\n\n';
                    } else {
                        console.warn(`    ⚠️ Contenu CodePanel inattendu pour ${filePath}.`);
                    }
                    break;
                case 'CodeCard': {
                    const language = $el.attr('language') || ''; // récupérer l’attribut language
                    let rawCodeContent = $el.html(); // récupérer le contenu HTML brut

                    // La regex pour capturer le contenu entre `{`` et ``}` :
                    // On cherche une string qui ressemble à : {`...`} ou {`...`}, sur plusieurs lignes.
                    const codeMatch = rawCodeContent.match(/\{\s*`([\s\S]*?)`\s*\}/);

                    if (codeMatch && codeMatch[1]) {
                        const code = codeMatch[1].trim();
                        md += '```' + language + '\n' + code + '\n```\n\n';
                    } else {
                        console.warn(`    ⚠️ Contenu CodeCard inattendu ou vide dans ${filePath}.`);
                    }
                    break;
                }
                case 'Table':
                    md += extractTable($, $el);
                    break;
                case 'Link':
                    const href = $el.attr('href');
                    const linkText = extractTextWithInlineCode($, $el);
                    if (linkText && href) {
                        md += `[${linkText}](${href})\n\n`;
                    } else if (linkText) {
                        md += `${linkText}\n\n`;
                    }
                    break;
                default:
                    processChildren($el);
                    break;
            }
        });
    }

    // Appel initial
    processChildren($.root());

    return md.trim();
}

function saveMarkdown(filePath, mdContent) {
    const relative = path.relative(coursDir, filePath).replace(/\.tsx$/, '.md');
    const outPath = path.join(outputDir, relative);
    fs.mkdirSync(path.dirname(outPath), {recursive: true});
    fs.writeFileSync(outPath, mdContent, 'utf-8');
    console.log('✅ Markdown généré :', outPath);
}

function extractAllToMarkdown() {
    if (!fs.existsSync(coursDir)) {
        console.error('❌ Le dossier source est introuvable :', coursDir);
        process.exit(1);
    }

    const files = getAllTSXFiles(coursDir);
    if (files.length === 0) {
        console.warn(`⚠️ Aucun fichier .tsx trouvé dans '${coursDir}'.`);
        return;
    }

    files.forEach(file => {
        const md = extractMarkdown(file);
        saveMarkdown(file, md);
    });
    console.log('\n--- Processus d\'extraction terminé ---');
}

// Lancement du processus
extractAllToMarkdown();