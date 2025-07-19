type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
    ordered?: boolean; // true pour <ol>, false ou undefined pour <ul>
    className?: string;
};

export function List({ordered = false, className = '', ...props}: ListProps) {
    const baseClasses = ordered ? 'list-decimal pl-6' : 'list-disc pl-6';
    const Component = ordered ? 'ol' : 'ul';

    return <Component className={`${baseClasses} ${className}`} {...props} />;
}

export function ListItem({className = '', ...props}: React.LiHTMLAttributes<HTMLLIElement>) {
    return <li className={`mb-2 ${className}`} {...props} />;
}
