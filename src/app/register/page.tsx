import {redirect} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import AuthLayout from "@/components/login/AuthLayout";
import RegisterForm from "@/components/login/RegisterForm";

export const metadata = {
    title: "Créer un compte | Développement Web",
};

export default async function RegisterPage() {
    const session = await getServerSession();
    if (session) redirect("/");
    return (
        <AuthLayout
            title="Inscription"
            description="Rejoignez la plateforme pédagogique. Accès complet aux cours, TP, slides et examens en HTML/CSS, JavaScript, PHP et plus."
        >
            <RegisterForm/>
        </AuthLayout>
    );
}
