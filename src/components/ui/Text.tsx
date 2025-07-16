export default function Text({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={`text-gray-700 ${className}`} {...props} />;
}