import {redirect} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import AuthLayout from "@/components/login/AuthLayout";
import LoginForm from "@/components/login/LoginForm";

export const metadata = {
    title: "Connexion | Développement Web",
};

export default async function LoginPage() {
    const session = await getServerSession();
    if (session) redirect("/");
    return (
        <AuthLayout
            title="Connexion"
            description="Connectez-vous avec le même compte que l'intranet."
        >
            <LoginForm/>
        </AuthLayout>
    );
}
