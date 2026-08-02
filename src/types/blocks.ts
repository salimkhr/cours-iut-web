import type { ReactNode } from "react";

/**
 * Props transmises au composant de rendu d'un bloc. Défini dans un module de types
 * dédié pour que les éditeurs du builder puissent se typer sans importer
 * blockRegistry — ce qui créait un cycle d'import.
 */
export interface BlockRenderProps {
    children?: ReactNode;
    [key: string]: unknown;
}

export interface BlockEditorProps {
    props: Record<string, unknown>;
    onChange: (props: Record<string, unknown>) => void;
}
