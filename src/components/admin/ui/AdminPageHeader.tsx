import Eyebrow from "@/components/admin/ui/Eyebrow";

interface AdminPageHeaderProps {
    eyebrow: string;
    title: string;
    description?: string;
}

export default function AdminPageHeader({eyebrow, title, description}: AdminPageHeaderProps) {
    return (
        <div className="mb-6">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-1 text-2xl font-bold text-brand-dark dark:text-bridge-100">
                {title}
            </h1>
            {description && (
                <p className="mt-1 max-w-2xl text-sm text-bridge-600 dark:text-bridge-300">
                    {description}
                </p>
            )}
        </div>
    );
}
