// tests/lib/blockTextUtils.export.test.ts
// Fidélité de l'export compact (export_content_compact) : aucun contenu perdu,
// un marqueur <!--id--> par bloc. Les agents du pipeline de relecture lisent les
// supports par cet export (get_content dépasse la limite de sortie des gros supports).
import { describe, it, expect } from "bun:test";
import type { Block } from "@/types/CourseContent";
import { blocksToMarkdown, walkBlocks } from "@/lib/blockTextUtils";

/** Ids des marqueurs : une ligne qui ne contient que <!--id-->, indentation tolérée. */
function marqueurs(md: string): string[] {
    return md.split("\n").flatMap((l) => {
        const m = /^\s*<!--([^\s>][^>]*?)-->\s*$/.exec(l);
        return m ? [m[1]] : [];
    });
}

function idsDeLArbre(blocks: Block[]): string[] {
    const ids: string[] = [];
    walkBlocks(blocks, (bl) => {
        ids.push(bl.id);
    });
    return ids;
}

describe("blocksToMarkdown — fidélité", () => {
    it("sous-liste d'un list-item : rendue et indentée", () => {
        const blocks: Block[] = [{
            id: "l", type: "list", props: { ordered: true }, children: [{
                id: "li1", type: "list-item", props: { text: "Créez la classe" }, children: [{
                    id: "sl", type: "list", props: { ordered: false }, children: [
                        { id: "sli1", type: "list-item", props: { text: "propriété `titre`" } },
                        { id: "sli2", type: "list-item", props: { text: "propriété `annee`" } },
                    ],
                }],
            }],
        }];
        const md = blocksToMarkdown(blocks, true);
        expect(md).toContain("<!--li1-->\n1. Créez la classe");
        expect(md).toContain("   <!--sli1-->\n   - propriété `titre`");
        expect(md).toContain("   <!--sli2-->\n   - propriété `annee`");
        expect(md).not.toContain("aplatis");
    });

    it("liste à trois niveaux : chaque niveau ajoute son indentation", () => {
        const blocks: Block[] = [{
            id: "l", type: "list", props: { ordered: false }, children: [{
                id: "a", type: "list-item", props: { text: "niveau 1" }, children: [{
                    id: "l2", type: "list", props: { ordered: false }, children: [{
                        id: "b", type: "list-item", props: { text: "niveau 2" }, children: [{
                            id: "l3", type: "list", props: { ordered: false }, children: [
                                { id: "c", type: "list-item", props: { text: "niveau 3" } },
                            ],
                        }],
                    }],
                }],
            }],
        }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("\n- niveau 1");
        expect(md).toContain("\n  - niveau 2");
        expect(md).toContain("\n    - niveau 3");
    });

    it("slide-list-item avec enfants : rendus comme pour list-item", () => {
        const blocks: Block[] = [{
            id: "sl", type: "slide-list", props: { ordered: false }, children: [{
                id: "sli", type: "slide-list-item", props: { text: "Point" }, children: [
                    { id: "sli-t", type: "slide-text", props: { content: "détail du point" } },
                ],
            }],
        }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("<!--sli-->\n- Point");
        expect(md).toContain("  <!--sli-t-->\n  détail du point");
    });

    it("code imbriqué dans un list-item : rendu avec son nom de fichier", () => {
        const blocks: Block[] = [{
            id: "l", type: "list", props: { ordered: true }, children: [{
                id: "li", type: "list-item", props: { text: "Ajoutez la fonction" }, children: [
                    { id: "li-code", type: "code", props: { language: "php", filename: "src/a.php", code: "<?php\necho 1;" } },
                ],
            }],
        }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("   <!--li-code-->\n   _src/a.php_\n   ```php\n   <?php\n   echo 1;\n   ```");
    });

    it("collapsible dans une liste : marquage repliable conservé à la bonne indentation", () => {
        const blocks: Block[] = [{
            id: "l", type: "list", props: { ordered: false }, children: [{
                id: "li", type: "list-item", props: { text: "Étape" }, children: [{
                    id: "c", type: "collapsible", props: { title: "Indice" }, children: [
                        { id: "c-t", type: "text", props: { content: "Pensez à `??`." } },
                    ],
                }],
            }],
        }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("  <!--c-->\n  > [repliable] Indice");
        expect(md).toContain("    <!--c-t-->\n    Pensez à `??`.");
        expect(md).toContain("  > [fin du repliable]");
    });

    it("download-file : nom du fichier puis contenu dans un bloc de code", () => {
        const blocks: Block[] = [{
            id: "dl", type: "download-file",
            props: { filename: "albums.php", language: "php", code: "<?php\n$albums = [];" },
        }];
        const md = blocksToMarkdown(blocks, true);
        expect(md).toContain("<!--dl-->");
        expect(md).toContain("`albums.php`");
        expect(md).toContain("```php\n<?php\n$albums = [];\n```");
        expect(md).not.toContain("**Limitations de cet export :**");
    });

    it("download-file trop long : tronqué avec mention", () => {
        const code = Array.from({ length: 1000 }, (_, i) => `ligne ${i + 1}`).join("\n");
        const blocks: Block[] = [{ id: "dl", type: "download-file", props: { filename: "gros.txt", language: "text", code } }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("ligne 1\n");
        expect(md).not.toContain("ligne 1000");
        expect(md).toMatch(/tronqué : \d+ lignes affichées sur 1000/);
    });

    it("bloc de code qui contient ``` : la clôture est allongée", () => {
        const blocks: Block[] = [{
            id: "dl", type: "download-file",
            props: { filename: "README.md", language: "markdown", code: "# Titre\n```bash\nls\n```" },
        }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("````markdown\n# Titre\n```bash\nls\n```\n````");
    });

    it("file-tree : titre et chemins", () => {
        const blocks: Block[] = [{
            id: "ft", type: "file-tree",
            props: { title: "Projet Onzer", paths: "public/index.php\nsrc/Album.php\nvendor/" },
        }];
        const md = blocksToMarkdown(blocks, true);
        expect(md).toContain("<!--ft-->");
        expect(md).toContain("Projet Onzer");
        expect(md).toContain("public/index.php\nsrc/Album.php\nvendor/");
        expect(md).not.toContain("_(bloc file-tree)_");
    });

    it("input-card : titre, description et code", () => {
        const blocks: Block[] = [{
            id: "ic", type: "input-card",
            props: { title: "Saisie", description: "Collez ceci", language: "bash", code: "php -S localhost:8000" },
        }];
        const md = blocksToMarkdown(blocks);
        expect(md).toContain("Saisie");
        expect(md).toContain("Collez ceci");
        expect(md).toContain("```bash\nphp -S localhost:8000\n```");
    });

    it("un marqueur par bloc, vides compris : mêmes ids que l'arbre, code HTML commenté compris", () => {
        const blocks: Block[] = [{
            id: "s", type: "section", props: { title: "" }, children: [
                { id: "t-vide", type: "text", props: { content: "" } },
                { id: "note-vide", type: "slide-note", props: { content: "" } },
                { id: "lst-vide", type: "list", props: { ordered: false }, children: [] },
                { id: "tbl-vide", type: "table", props: {} },
                { id: "html", type: "code", props: { language: "html", code: "<!-- commentaire -->\n<p>x</p>" } },
                {
                    id: "col", type: "collapsible", props: { title: "Solution" }, children: [
                        { id: "col-code", type: "code", props: { language: "php", code: "" } },
                    ],
                },
                {
                    id: "co", type: "callout", props: { variant: "tip" }, children: [
                        {
                            id: "co-l", type: "list", props: { ordered: false }, children: [{
                                id: "co-li", type: "list-item", props: { text: "" }, children: [
                                    { id: "co-li-t", type: "text", props: { content: "détail" } },
                                ],
                            }],
                        },
                    ],
                },
                { id: "ft", type: "file-tree", props: { paths: "" } },
                { id: "inconnu", type: "type-inconnu", props: {} },
            ],
        }];
        const md = blocksToMarkdown(blocks);
        expect(marqueurs(md)).toEqual(idsDeLArbre(blocks));
    });
});
