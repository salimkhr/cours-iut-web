import AuthLayout from "@/components/login/AuthLayout";
import LoginForm from "@/components/login/LoginForm";

export const metadata = {
    title: "Connexion | Développement Web",
};

export default function LoginPage() {
    return (
        <AuthLayout
            title="Connexion"
            description="Retrouvez l'accès à vos cours, TP, slides et examens. Connectez-vous avec le même compte que l'intranet."
        >
            <LoginForm/>
        </AuthLayout>
    );
}
