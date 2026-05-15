export default function Eyebrow({children}: {children: React.ReactNode}) {
    return (
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-dark/55 dark:text-bridge-200/55">
            {children}
        </p>
    );
}
