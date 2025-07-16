import {cn} from '@/lib/utils';
import {JSX} from "react";

type HeadingProps = {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    children: React.ReactNode;
};

export default function Heading({level = 2, className = '', children}: HeadingProps) {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const styles = {
        1: 'text-4xl font-bold my-6',
        2: 'text-3xl font-bold my-5',
        3: 'text-2xl font-bold my-4',
        4: 'text-xl font-semibold my-3',
        5: 'text-lg font-semibold my-2',
        6: 'text-base font-medium my-2',
    };

    return (
        <Tag className={cn(styles[level], className)}>
            {children}
        </Tag>
    );
}
