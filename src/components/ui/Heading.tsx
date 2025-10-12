import {cn} from '@/lib/utils';
import {JSX} from "react";
import {Film} from 'lucide-react';
import Text from "./Text";

type HeadingProps = {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    children: React.ReactNode;
    netflex?: boolean;
};

export default function Heading({ level = 2, className = '', children, netflex = false }: HeadingProps) {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const styles = {
        1: 'text-5xl font-bold my-6 dark:brightness-130',
        2: 'text-3xl font-bold mt-5 mb-2 dark:brightness-130',
        3: 'text-2xl font-bold mt-4 mb-2 dark:brightness-130',
        4: 'text-xl font-semibold mt-3 mb-2 text-gray-700 dark:text-gray-300',
        5: 'text-lg font-semibold my-2 text-gray-700 dark:text-gray-300',
        6: 'text-base font-medium my-2 text-gray-700 dark:text-gray-300',
    };

    return (
        <Tag className={cn(styles[level], className)}>
            {children}
            {netflex && (
                <Text title="À réaliser dans le projet Netflex" className="inline-block">
                    <Film className="inline-block ml-2" />
                </Text>
            )}
        </Tag>
    );
}