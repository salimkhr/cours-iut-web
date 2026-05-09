import {auth, currentUser} from "@clerk/nextjs/server";
import getModules from "@/lib/getModules";
import NavBarClient from "./NavBarClient";

export default async function NavBar() {
    const { userId } = await auth();
    const user = await currentUser();
    const modules = await getModules();

    const safeUser = user
        ? {
            id: user.id,
            username: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email: user.emailAddresses?.[0]?.emailAddress ?? null,
        }
        : null;

    return (
        <NavBarClient
            userId={userId}
            role={(user?.publicMetadata?.role as string) ?? ""}
            user={safeUser}
            modules={modules}
        />
    );
}