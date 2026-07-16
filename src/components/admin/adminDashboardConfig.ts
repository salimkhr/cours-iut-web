export type AdminNavIconId = "overview" | "modules" | "users" | "tools" | "calibrage" | "pedagogie";
export type AdminToolActionId = "migration" | "export-import";

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
        label: "Pilotage",
        items: [
            {href: "/admin", label: "Vue d'ensemble", icon: "overview", exact: true},
            {href: "/admin/modules", label: "Modules & sections", icon: "modules"},
            {href: "/admin/utilisateurs", label: "Utilisateurs", icon: "users"},
        ],
    },
    {
        label: "Outils",
        items: [
            {href: "/admin/outils", label: "Outils techniques", icon: "tools"},
            {href: "/admin/calibrage", label: "Calibrage", icon: "calibrage"},
            {href: "/admin/pedagogie", label: "Pédagogie", icon: "pedagogie"},
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
] as const satisfies readonly AdminToolAction[];
