// src/lib/validateBlockTree.ts
// Validation serveur de l'arbre de blocs avant écriture en base.
// Importable depuis les Route Handlers (aucun JSX, cf. blockSchemas).
import {
    blockPropsSchemas,
    containerRules,
    canDrop,
    isContainer,
    MAX_DEPTH,
} from "@/lib/blockSchemas";

export interface ValidationError {
    path: string;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

export function validateBlockTree(input: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(input)) {
        return { valid: false, errors: [{ path: "blocks", message: "blocks doit être un tableau" }] };
    }

    const seenIds = new Set<string>();

    function visit(node: unknown, path: string, parentType: string | null, depth: number): void {
        if (depth > MAX_DEPTH) {
            errors.push({ path, message: `Profondeur maximale dépassée (${MAX_DEPTH})` });
            return;
        }
        if (typeof node !== "object" || node === null) {
            errors.push({ path, message: "Bloc invalide (objet attendu)" });
            return;
        }
        const block = node as Record<string, unknown>;

        if (typeof block.id !== "string" || block.id.length === 0
            || typeof block.type !== "string"
            || typeof block.props !== "object" || block.props === null) {
            errors.push({ path, message: "Chaque bloc doit avoir id, type et props" });
            return;
        }

        if (seenIds.has(block.id)) {
            errors.push({ path, message: `id dupliqué : ${block.id}` });
            return;
        }
        seenIds.add(block.id);

        const schema = blockPropsSchemas[block.type];
        if (!schema) {
            errors.push({ path, message: `Type de bloc inconnu : ${block.type}` });
            return;
        }

        if (!canDrop(block.type, parentType)) {
            errors.push({
                path,
                message: `Le type ${block.type} n'est pas autorisé dans ${parentType ?? "la racine"}`,
            });
            return;
        }

        const parsed = schema.safeParse(block.props);
        if (!parsed.success) {
            errors.push({
                path,
                message: `props invalides : ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join(" ; ")}`,
            });
        }

        const children = block.children as unknown;
        if (children !== undefined) {
            if (!isContainer(block.type)) {
                errors.push({ path, message: `Le type ${block.type} n'accepte pas d'enfants` });
                return;
            }
            if (!Array.isArray(children)) {
                errors.push({ path, message: "children doit être un tableau" });
                return;
            }
            if (block.type === "columns") {
                if (children.length < 2 || children.length > 4) {
                    errors.push({ path, message: "columns doit avoir entre 2 et 4 colonnes" });
                }
                const sum = children.reduce((acc: number, c) => {
                    const span = (c as { props?: { span?: unknown } })?.props?.span;
                    return acc + (typeof span === "number" ? span : 0);
                }, 0);
                if (sum !== 12) {
                    errors.push({ path, message: `La somme des spans doit faire 12 (actuel : ${sum})` });
                }
            }
            children.forEach((child, i) => {
                visit(child, `${path}.children[${i}]`, block.type as string, depth + 1);
            });
        } else if (containerRules[block.type]?.allowedChildren !== undefined
            && (block.type === "columns" || block.type === "list")) {
            // columns et list sans children : structurellement invalides
            errors.push({ path, message: `${block.type} doit avoir des children` });
        }
    }

    input.forEach((node, i) => visit(node, `blocks[${i}]`, null, 1));

    return { valid: errors.length === 0, errors };
}
