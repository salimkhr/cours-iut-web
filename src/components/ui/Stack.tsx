type StackProps = {
    children: React.ReactNode;
    gap?: string; // Tailwind spacing unit (e.g. '4', '6')
    className?: string;
};

export function Stack({ children, gap = '4', className = '' }: StackProps) {
    return <div className={`flex flex-col gap-${gap} ${className}`}>{children}</div>;
}

export function HStack({ children, gap = '4', className = '' }: StackProps) {
    return <div className={`flex flex-row gap-${gap} ${className}`}>{children}</div>;
}

export function VStack({ children, gap = '4', className = '' }: StackProps) {
    return <div className={`flex flex-col gap-${gap} ${className}`}>{children}</div>;
}