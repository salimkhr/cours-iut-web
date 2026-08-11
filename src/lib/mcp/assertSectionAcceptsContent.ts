/**
 * Garde d'intégrité des écritures de contenu MCP.
 *
 * La source de vérité des sections est `modules.sections[]` : c'est elle que
 * lisent `list_sections`, le front et `get_migration_status`. Un document
 * `course_content` écrit pour un couple (module, section) absent de ce tableau
 * est orphelin — invisible partout — et bloque ensuite `create_section` avec un
 * `E11000 duplicate key` sur l'index unique
 * `{moduleSlug, sectionSlug, contentType}`. Toute écriture doit donc passer par
 * cette vérification avant l'upsert.
 */

export interface SectionOwnerDoc {
    path: string;
    sections?: Array<{
        path: string;
        contents?: Array<{ type: string }>;
    }>;
}

export interface ContentTarget {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
}

export function assertSectionAcceptsContent(
    moduleDoc: SectionOwnerDoc | null | undefined,
    target: ContentTarget
): void {
    const { moduleSlug, sectionSlug, contentType } = target;

    if (!moduleDoc) {
        throw new Error(`Module "${moduleSlug}" introuvable.`);
    }

    const section = (moduleDoc.sections ?? []).find((s) => s.path === sectionSlug);
    if (!section) {
        throw new Error(
            `Section "${sectionSlug}" introuvable dans le module "${moduleSlug}". ` +
            `Créez-la d'abord avec create_section.`
        );
    }

    if (!(section.contents ?? []).some((c) => c.type === contentType)) {
        throw new Error(
            `Type de contenu "${contentType}" non déclaré sur la section "${sectionSlug}" ` +
            `du module "${moduleSlug}". Ajoutez-le d'abord avec edit_section (addContentTypes).`
        );
    }
}
