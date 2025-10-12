import {cn} from '@/lib/utils';

export default function Text({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-gray-700 dark:text-gray-300', className)} {...props} />;
}