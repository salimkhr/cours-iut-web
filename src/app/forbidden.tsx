import ErrorLayout from "@/components/error/ErrorLayout";

export default function Forbidden() {
    return (
        <ErrorLayout
            code="403"
            description="Vous n'avez pas les droits pour accéder à cette ressource."
            gifTag="access denied"
        />
    );
}
