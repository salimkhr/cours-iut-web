import {Metadata} from "next";
import {redirect} from "next/navigation";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import {getServerSession} from "@/lib/auth";
import AuthLayout from "@/components/login/AuthLayout";
import AccountTabs from "@/components/login/AccountTabs";
import {Group} from "@/lib/schemas/register.schema";

export const metadata: Metadata = generatePageMetadata({
    defaultTitle: "Mon compte — Cours Web",
    noIndex: true,
});

export default async function AccountPage() {
    const session = await getServerSession();
    if (!session) redirect("/login?redirect_to=/account");
    if (session.user.email.endsWith("@salimkhraimeche.dev")) redirect("/");

    const {name, email, image} = session.user;
    const [firstName = "", ...rest] = (name ?? "").split(" ");
    const lastName = rest.join(" ");
    const group = (session.user as Record<string, unknown>).group as Group | null ?? null;

    return (
        <AuthLayout
            title="Mon compte"
            description="Gérez vos informations personnelles et votre sécurité."
            wide
        >
            <AccountTabs
                initialFirstName={firstName}
                initialLastName={lastName}
                email={email}
                imageUrl={image ?? null}
                group={group}
            />
        </AuthLayout>
    );
}
