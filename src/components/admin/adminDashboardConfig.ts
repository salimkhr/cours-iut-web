export type AdminNavIconId = "users" | "tools" | "calibrage" | "vacations" | "veille";
export type AdminToolActionId = "migration" | "export-import" | "slide-repair" | "indexes";

export interface AdminNavItem {
    href: string;
    label: string;
    icon: AdminNavIconId;
    /** Actif uniquement si le pathname correspond exactement (pour /admin). */
    exact?: boolean;
}

export interface AdminNavGroup {
    label: string;
    items: readonly AdminNavItem[];
}

export interface AdminToolAction {
    id: AdminToolActionId;
    title: string;
    description: string;
}

export const ADMIN_NAV_GROUPS = [
    {
        label: "Administration",
        items: [
            {href: "/admin/utilisateurs", label: "Utilisateurs", icon: "users"},
            {href: "/admin/calibrage", label: "Calibrage", icon: "calibrage"},
            {href: "/admin/outils", label: "Outils", icon: "tools"},
            {href: "/admin/vacations", label: "Vacations", icon: "vacations"},
            {href: "/admin/veille", label: "Veille", icon: "veille"},
        ],
    },
] as const satisfies readonly AdminNavGroup[];

export const ADMIN_TOOL_ACTIONS = [
    {
        id: "migration",
        title: "Migration",
        description: "Migrer les anciens contenus fichier vers MongoDB.",
    },
    {
        id: "export-import",
        title: "Exporter / importer",
        description: "Transférer les modules et sections entre environnements.",
    },
    {
        id: "slide-repair",
        title: "Réparer les slides",
        description: "Convertit les présentations dont les blocs racine sont restés au format cours (`section`) au lieu du format slide.",
    },
    {
        id: "indexes",
        title: "Index MongoDB",
        description: "Crée les index manquants de la base de cet environnement (modules, contenus, signatures, veille). Sans risque : ne touche pas aux données.",
    },
] as const satisfies readonly AdminToolAction[];
