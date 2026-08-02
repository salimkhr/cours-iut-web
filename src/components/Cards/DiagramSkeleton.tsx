/**
 * Squelette de chargement du DiagramCard. Volontairement dans son propre fichier :
 * il sert de `loading:` au `next/dynamic` qui charge DiagramCard, il ne doit donc
 * surtout pas dépendre de Mermaid.
 */
export default function DiagramSkeleton() {
    return (
        <div
            className="h-48 w-full flex items-center justify-center gap-6 px-8 animate-pulse"
            role="status"
            aria-label="Chargement du diagramme"
        >
            <div className="h-12 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/50"/>
            <div className="h-px w-8 bg-bridge-400/50 dark:bg-bridge-600/50"/>
            <div className="h-12 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/50"/>
            <div className="h-px w-8 bg-bridge-400/50 dark:bg-bridge-600/50"/>
            <div className="h-12 w-20 rounded bg-bridge-300/50 dark:bg-bridge-700/50"/>
        </div>
    );
}
