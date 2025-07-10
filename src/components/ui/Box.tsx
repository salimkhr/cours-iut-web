export default function Box({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`p-4 ${className}`} {...props} />;
}