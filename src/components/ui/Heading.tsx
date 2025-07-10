import { cn } from "@/lib/utils";

type HeadingProps = {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    children: React.ReactNode;
};

export default function Heading({ level = 2, className = '', children }: HeadingProps) {
    const styles = {
        1: 'text-4xl font-bold',
        2: 'text-3xl font-bold',
        3: 'text-2xl font-bold',
        4: 'text-xl font-semibold',
        5: 'text-lg font-semibold',
        6: 'text-base font-medium',
    };

    return (
        <div className={cn(styles[level], 'text-gray-900', className)}>
            {children}
        </div>
    );
}
