export default function Code({ className = '', ...props }: React.HTMLAttributes<HTMLElement>) {
    return <code className={`bg-gray-100 text-sm px-1 rounded font-mono ${className}`} {...props} />;
}
