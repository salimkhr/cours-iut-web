import { redirect } from "next/navigation";
import { Metadata } from "next";
import AuthLayout from "@/components/login/AuthLayout";
import ResetPasswordForm from "@/components/login/ResetPasswordForm";

export const metadata: Metadata = {
    title: "Réinitialisation du mot de passe | Développement Web",
};

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const { token } = await searchParams;

    if (!token) redirect("/login");

    return (
        <AuthLayout
            title="Nouveau mot de passe"
            description="Choisissez un nouveau mot de passe pour votre compte. Il doit contenir au moins 7 caractères."
        >
            <ResetPasswordForm token={token} />
        </AuthLayout>
    );
}
