interface NotesRendererProps {
    notes: string;
    variant?: "mobile" | "desktop";
}

export const NotesRenderer = ({notes, variant = "desktop"}: NotesRendererProps) => {
    const base =
        variant === "mobile"
            ? "text-xl md:text-2xl leading-relaxed"
            : "text-sm leading-relaxed";

    return (
        <div className={`${base} space-y-3`}>
            {notes.split("\n").map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-2"/>;

                if (trimmed.startsWith("-")) {
                    return (
                        <div key={i} className="flex gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>{trimmed.slice(1).trim()}</span>
                        </div>
                    );
                }

                return <p key={i} className="italic">{line}</p>;
            })}
        </div>
    );
};
