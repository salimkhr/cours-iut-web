import {Metadata} from "next";
import AuthLayout from "@/components/login/AuthLayout";
import ResendVerificationForm from "@/components/login/ResendVerificationForm";
import {isCaptchaRequired} from "@/lib/auth";

export const metadata: Metadata = {
    title: "Renvoyer la confirmation | Développement Web",
};

export default async function ResendVerificationPage() {
    return (
        <AuthLayout
            title="Confirmer votre email"
            description="Renseignez votre adresse email et nous vous renverrons le lien de confirmation de compte."
        >
            <ResendVerificationForm captchaRequired={await isCaptchaRequired()}/>
        </AuthLayout>
    );
}
