interface QuizProgressProps {
    current: number;
    total: number;
    modulePath: string;
}

export default function QuizProgress({current, total, modulePath}: QuizProgressProps) {
    const pct = total > 0 ? (current / total) * 100 : 0;
    const moduleColor = `var(--color-${modulePath})`;

    return (
        <div className="w-full h-1.5 bg-bridge-200 dark:bg-bridge-700 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-300"
                style={{width: `${pct}%`, backgroundColor: moduleColor}}
            />
        </div>
    );
}
