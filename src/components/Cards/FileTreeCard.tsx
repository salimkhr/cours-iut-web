import { File, Folder, FolderTree } from "lucide-react";
import { parseFileTree, type FileTreeNode } from "@/lib/fileTree";
import { cn } from "@/lib/utils";

interface FileTreeCardProps {
    paths: string;
    title?: string;
    presentation?: boolean;
}

function FileTreeList({ nodes, nested = false }: { nodes: FileTreeNode[]; nested?: boolean }) {
    return (
        <ul className={cn("m-0 list-none space-y-1", nested ? "ml-2.5 border-l border-bridge-500/50 pl-5" : "p-0")}>
            {nodes.map((node) => {
                const Icon = node.directory ? Folder : File;
                return (
                    <li key={node.path} className="relative">
                        {nested && <span aria-hidden="true" className="absolute -left-5 top-[1em] w-4 border-t border-bridge-500/50" />}
                        <div className="flex items-start gap-2 py-0.5">
                            <Icon aria-hidden="true" className={cn("mt-[0.2em] size-[1em] shrink-0", node.directory && "text-brand-primary")} />
                            <span className={cn("break-all", node.directory && "font-semibold")}>
                                <span className="sr-only">{node.directory ? "Dossier : " : "Fichier : "}</span>
                                {node.name}{node.directory ? "/" : ""}
                            </span>
                        </div>
                        {node.children.length > 0 && <FileTreeList nodes={node.children} nested />}
                    </li>
                );
            })}
        </ul>
    );
}

/** Même arborescence dans le cours, le builder et le lecteur de slides. */
export default function FileTreeCard({ paths, title, presentation = false }: FileTreeCardProps) {
    const nodes = parseFileTree(paths);
    const label = title?.trim() || "Arborescence";
    return (
        <figure aria-label={label} className={cn(
            "m-0 w-full min-w-0 rounded-xl border border-bridge-500/40 bg-bridge-50 text-bridge-900 dark:bg-bridge-800 dark:text-bridge-100",
            "shadow-[0_2px_12px_-6px_rgba(147,97,58,0.35)] dark:shadow-[0_2px_14px_-6px_rgba(0,0,0,0.6)]",
        )}>
            <figcaption className="flex items-center gap-2 border-b border-bridge-500/30 px-4 py-3 font-semibold">
                <FolderTree aria-hidden="true" className="size-5 shrink-0 text-brand-primary" />
                {label}
            </figcaption>
            <div className={cn("overflow-auto p-4 font-mono leading-relaxed", presentation ? "text-lg lg:text-2xl" : "text-sm sm:text-base")}>
                {nodes.length > 0 ? <FileTreeList nodes={nodes} /> : <span className="font-sans">Aucun fichier ni dossier.</span>}
            </div>
        </figure>
    );
}
