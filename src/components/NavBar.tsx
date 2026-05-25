import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import getModules from "@/lib/getModules";
import NavBarClient from "./NavBarClient";

export default async function NavBar() {
    const session = await auth.api.getSession({headers: await headers()});
    const modules = (await getModules()).filter(m => !m.isExtra);

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
        />
    );
}
