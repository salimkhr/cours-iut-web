import {redirect} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import AuthLayout from "@/components/login/AuthLayout";
import LoginForm from "@/components/login/LoginForm";
import {safeRedirectPath} from "@/lib/safeRedirect";

export const metadata = {
    title: "Connexion | Développement Web",
};

export default async function LoginPage({searchParams}: {searchParams: Promise<{redirect_to?: string | string[]}>}) {
    const redirectTo = safeRedirectPath((await searchParams).redirect_to);
    const session = await getServerSession();
    if (session) redirect(redirectTo);
    return (
        <AuthLayout
            title="Connexion"
            // « le même compte que l'intranet » laissait croire qu'il n'y avait
            // rien à créer, alors que l'inscription fait choisir un mot de passe.
            // Les deux entrées sont valables : on les nomme toutes les deux.
            description="Votre compte de cette plateforme (identifiant IUT ou email universitaire), ou le compte générique de l'intranet."
        >
            <LoginForm redirectTo={redirectTo}/>
        </AuthLayout>
    );
}
