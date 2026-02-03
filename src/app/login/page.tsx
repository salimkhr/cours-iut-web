import LoginForm from "@/components/login/LoginForm";

export default async function LoginPage() {

    return (
        <div className="flex items-center justify-center p-4 lg:pt-20 header-login">
            <LoginForm/>
        </div>
    );
}