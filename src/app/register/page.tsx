import AuthLayout from "@/components/login/AuthLayout";
import RegisterForm from "@/components/login/RegisterForm";

export const metadata = {
    title: "Créer un compte | Développement Web",
};

export default function RegisterPage() {
    return (
        <AuthLayout
            title="Inscription"
            description="Rejoignez la plateforme pédagogique. Accès complet aux cours, TP, slides et examens en HTML/CSS, JavaScript, PHP et plus."
        >
            <RegisterForm/>
        </AuthLayout>
    );
}
