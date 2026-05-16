import ErrorLayout from "@/components/error/ErrorLayout";

export default function NotFound() {
    return (
        <ErrorLayout
            code="404"
            description="Cette page n'existe pas ou a été déplacée."
            gifTag="404 not found"
        />
    );
}
