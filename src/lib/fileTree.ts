export interface FileTreeNode {
    name: string;
    path: string;
    directory: boolean;
    children: FileTreeNode[];
}

/** Chemins relatifs, un par ligne. Les parents sont créés automatiquement.
 * Un slash final permet de représenter un dossier vide. */
export function parseFileTree(paths: string): FileTreeNode[] {
    const roots: FileTreeNode[] = [];
    const byPath = new Map<string, FileTreeNode>();
    for (const line of paths.split(/\r?\n/)) {
        const normalized = line.trim().replace(/\\/g, "/");
        const parts = normalized.split("/").filter((part) => part && part !== ".");
        let siblings = roots;
        let path = "";
        for (let index = 0; index < parts.length; index++) {
            const name = parts[index];
            path = path ? `${path}/${name}` : name;
            const directory = index < parts.length - 1 || normalized.endsWith("/");
            let node = byPath.get(path);
            if (!node) {
                node = { name, path, directory, children: [] };
                byPath.set(path, node);
                siblings.push(node);
            } else if (directory) {
                node.directory = true;
            }
            siblings = node.children;
        }
    }
    return roots;
}
