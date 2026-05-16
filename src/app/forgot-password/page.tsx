import { Metadata } from "next";
import AuthLayout from "@/components/login/AuthLayout";
import ForgotPasswordForm from "@/components/login/ForgotPasswordForm";

export const metadata: Metadata = {
    title: "Mot de passe oublié | Développement Web",
};

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            title="Mot de passe oublié"
            description="Renseignez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe."
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
