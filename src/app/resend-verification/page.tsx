import {Metadata} from "next";
import AuthLayout from "@/components/login/AuthLayout";
import ResendVerificationForm from "@/components/login/ResendVerificationForm";

export const metadata: Metadata = {
    title: "Renvoyer la confirmation | Développement Web",
};

export default function ResendVerificationPage() {
    return (
        <AuthLayout
            title="Confirmer votre email"
            description="Renseignez votre adresse email et nous vous renverrons le lien de confirmation de compte."
        >
            <ResendVerificationForm/>
        </AuthLayout>
    );
}
