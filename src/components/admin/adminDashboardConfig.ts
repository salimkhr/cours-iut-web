export type AdminTabValue = "modules" | "users" | "tools";
export type AdminToolActionId = "migration" | "export-import" | "calibrage" | "pedagogie";

export interface AdminToolAction {
    id: AdminToolActionId;
    title: string;
    description: string;
    href?: string;
}

export const ADMIN_DEFAULT_TAB: AdminTabValue = "modules";

export const ADMIN_TABS = [
    {
        value: "modules",
        label: "Modules & sections",
        description: "Pilotez les modules, les sections, les verrous et les contenus.",
    },
    {
        value: "users",
        label: "Utilisateurs",
        description: "Gerez les comptes, les groupes, les roles et les bannissements.",
    },
    {
        value: "tools",
        label: "Outils",
        description: "Accedez aux actions techniques et aux vues pedagogiques.",
    },
] as const satisfies readonly {
    value: AdminTabValue;
    label: string;
    description: string;
}[];

export const ADMIN_TOOL_ACTIONS = [
    {
        id: "migration",
        title: "Migration",
        description: "Migrer les anciens contenus fichier vers MongoDB.",
    },
    {
        id: "export-import",
        title: "Exporter / importer",
        description: "Transferer les modules et sections entre environnements.",
    },
    {
        id: "calibrage",
        title: "Calibrage pedagogique",
        description: "Ajuster les verdicts et exemplaires utilises par les skills.",
        href: "/admin/calibrage",
    },
    {
        id: "pedagogie",
        title: "Pedagogie",
        description: "Consulter les briefs et curriculums des sections.",
        href: "/admin/pedagogie",
    },
] as const satisfies readonly AdminToolAction[];
