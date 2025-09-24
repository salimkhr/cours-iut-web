type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
    ordered?: boolean; // true pour <ol>, false ou undefined pour <ul>
    className?: string;
    type?: undefined | 'square' | 'decimal' | 'disc';
    start?: number;
};

export function List({ordered = false, className = '', type, ...props}: ListProps) {
    const baseClasses = type !== undefined ? `list-[${type}]  pl-6` : (ordered ? 'list-decimal pl-6' : 'list-disc pl-6');
    const Component = ordered ? 'ol' : 'ul';

    return <Component className={`${baseClasses} ${className}`} {...props} />;
}

export function ListItem({className = '', ...props}: React.LiHTMLAttributes<HTMLLIElement>) {
    return <li className={`mb-2 text-gray-700 ${className}`} {...props} />;
}
