import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import getModules from "@/lib/getModules";
import {isE2EBypass} from "@/lib/e2eBypass";
import NavBarClient from "./NavBarClient";

export default async function NavBar() {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({headers: requestHeaders});
    const isAdmin = session?.user.role === 'admin';
    const modules = session
        ? (await getModules()).filter(m => !m.isExtra && (isAdmin || m.isVisible !== false))
        : [];

    const safeUser = session
        ? {
            id: session.user.id,
            username: session.user.name ?? null,
            imageUrl: session.user.image ?? null,
            email: session.user.email ?? null,
        }
        : null;

    return (
        <NavBarClient
            userId={session?.user.id ?? null}
            role={session?.user.role ?? ""}
            user={safeUser}
            modules={modules}
            e2eBypass={isE2EBypass(requestHeaders)}
        />
    );
}
